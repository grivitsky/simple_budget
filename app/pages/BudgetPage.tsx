import { useState, useEffect } from 'react';
import { Title } from '../../src/components/Typography/Title/Title';
import { Button } from '../../src/components/Blocks/Button/Button';
import { Card } from '../../src/components/Blocks/Card/Card';
import { Subheadline } from '../../src/components/Typography/Subheadline/Subheadline';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { Text } from '../../src/components/Typography/Text/Text';
import { Spinner } from '../../src/components/Feedback/Spinner/Spinner';
import { getUserSpendings, updateSpending, type Spending } from '../lib/spendingService';
import { getAllCategories, getUndefinedCategory, type Category } from '../lib/categoryService';
import { getCurrencyByCode } from '../lib/currencyService';
import { getCategoryColor, getCategoryTextColor } from '../lib/themeUtils';
import type { User } from '../lib/supabase';

// Category Circle Component
const CategoryCircle = ({ emoji, color }: { emoji: string; color: string }) => (
  <div style={{
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  }}>
    {emoji}
  </div>
);

/**
 * Format date as "DD MON, HH:MM" (e.g., "4 Nov, 15:54")
 */
function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month}, ${hours}:${minutes}`;
}

/**
 * Format number with commas
 */
function formatNumber(num: number): string {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Convert amount to user's default currency
 */
async function convertToUserCurrency(
  spending: Spending,
  userDefaultCurrency: string,
  userCurrencyRate: number
): Promise<number> {
  // If transaction currency matches user's default currency, return spending_amount
  if (spending.currency_code === userDefaultCurrency) {
    return spending.spending_amount;
  }

  // Otherwise, convert from base currency (USD) to user's default currency
  return spending.amount_in_base_currency * userCurrencyRate;
}

interface BudgetPageProps {
  user?: User | null;
  refreshTrigger?: number;
}

const BudgetPage = ({ user, refreshTrigger }: BudgetPageProps) => {
  const [uncategorizedSpendings, setUncategorizedSpendings] = useState<Spending[]>([]);
  const [currentSpending, setCurrentSpending] = useState<Spending | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userCurrency, setUserCurrency] = useState<string>('USD');
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Load uncategorized spendings and categories
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Load categories
        const cats = await getAllCategories();
        setCategories(cats);
        
        // Get undefined category
        const undefinedCat = await getUndefinedCategory();

        // Get user's default currency
        const defaultCurrency = user.default_currency || 'USD';
        setUserCurrency(defaultCurrency);

        // Get all spendings
        const allSpendings = await getUserSpendings(user.id);
        
        // Filter uncategorized spendings (category_id is null or points to "Undefined")
        const undefinedCategoryId = undefinedCat?.id;
        const uncategorized = allSpendings.filter(spending => 
          !spending.category_id || spending.category_id === undefinedCategoryId
        );
        
        setUncategorizedSpendings(uncategorized);
        
        // Set first uncategorized spending as current
        if (uncategorized.length > 0) {
          const first = uncategorized[0];
          setCurrentSpending(first);
          
          // Calculate amount in user's currency
          const userCurrencyData = await getCurrencyByCode(defaultCurrency);
          const userCurrencyRate = userCurrencyData?.exchange_rate_to_usd || 1;
          const convertedAmount = await convertToUserCurrency(first, defaultCurrency, userCurrencyRate);
          setCurrentAmount(convertedAmount);
        } else {
          setCurrentSpending(null);
          setCurrentAmount(0);
        }
      } catch (error) {
        console.error('Error loading budget data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, refreshTrigger]);

  // Handle category selection
  const handleCategorySelect = async (categoryId: string) => {
    if (!currentSpending) return;

    try {
      // Update spending category
      const updated = await updateSpending(currentSpending.id, {
        category_id: categoryId,
      });

      if (updated) {
        // Haptic feedback for success
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }

        // Remove current spending from uncategorized list
        const remaining = uncategorizedSpendings.filter(s => s.id !== currentSpending.id);
        setUncategorizedSpendings(remaining);

        // Set next uncategorized spending as current
        if (remaining.length > 0) {
          const next = remaining[0];
          setCurrentSpending(next);
          
          // Calculate amount in user's currency
          const userCurrencyData = await getCurrencyByCode(userCurrency);
          const userCurrencyRate = userCurrencyData?.exchange_rate_to_usd || 1;
          const convertedAmount = await convertToUserCurrency(next, userCurrency, userCurrencyRate);
          setCurrentAmount(convertedAmount);
        } else {
          setCurrentSpending(null);
          setCurrentAmount(0);
        }
      } else {
        alert('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category');
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--tgui--secondary_bg_color)',
        minHeight: '100vh',
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Spinner size="l" />
      </div>
    );
  }

  // Filter out "Undefined" category from display
  const displayCategories = categories.filter(cat => cat.name !== 'Undefined');

  return (
    <div style={{ 
      backgroundColor: 'var(--tgui--secondary_bg_color)',
      minHeight: '100vh',
      padding: '16px',
    }}>
      {/* Section 1: Header with Title and Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <Title level="2" weight="1" style={{ color: 'var(--tgui--text_color)' }}>
          Organize
        </Title>
        <Button mode="plain" size="s">
          {uncategorizedSpendings.length} {uncategorizedSpendings.length === 1 ? 'Item' : 'Items'} Left
        </Button>
      </div>

      {/* Section 2: Transaction Card */}
      {currentSpending ? (
        <Card style={{
          backgroundColor: 'var(--tgui--bg_color)',
          borderRadius: '12px',
          margin: '0 0 24px 0',
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}>
          {/* Amount Wrapper */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
          }}>
            <div style={{ paddingBottom: '2px' }}>
              <span style={{
                fontFamily: '"SF Pro Rounded", "SF Rounded", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '28px',
                fontWeight: '700',
                letterSpacing: '-0.4px',
                color: 'var(--tgui--hint_color)',
                lineHeight: '1',
              }}>
                -{userCurrency}
              </span>
            </div>
            <span style={{
              fontFamily: '"SF Pro Rounded", "SF Rounded", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '44px',
              fontWeight: '700',
              letterSpacing: '-0.4px',
              color: 'var(--tgui--text_color)',
              lineHeight: '1',
            }}>
              {formatNumber(currentAmount)}
            </span>
          </div>

          {/* Info Wrapper with Store Name, Divider, and Date */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <Subheadline level="2" weight="3" style={{ color: 'var(--tgui--hint_color)' }}>
              {currentSpending.spending_name}
            </Subheadline>
            <div style={{
              width: '1px',
              height: '12px',
              backgroundColor: 'var(--tgui--secondary_bg_color)',
            }} />
            <Subheadline level="2" weight="3" style={{ color: 'var(--tgui--hint_color)' }}>
              {formatDate(new Date(currentSpending.created_at))}
            </Subheadline>
          </div>
        </Card>
      ) : (
        <Card style={{
          backgroundColor: 'var(--tgui--bg_color)',
          borderRadius: '12px',
          margin: '0 0 24px 0',
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Text style={{ color: 'var(--tgui--hint_color)' }}>
            All transactions are organized! 🎉
          </Text>
        </Card>
      )}

      {/* Section 3: Category Selection */}
      <div style={{
        backgroundColor: 'var(--tgui--bg_color)',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        borderBottomLeftRadius: '0px',
        borderBottomRightRadius: '0px',
        padding: '16px',
        marginLeft: '-16px',
        marginRight: '-16px',
        marginBottom: '-20px',
      }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '0px 12px',
          minHeight: '100%',
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 400,
            textTransform: 'uppercase',
            color: 'var(--tgui--section_header_text_color)',
            letterSpacing: '-0.08px',
          }}>
            Select Category
          </span>
          <Button
            mode="plain"
            size="s"
            style={{
              minWidth: 'auto',
              height: 'auto',
              padding: 0,
            }}
          >
            {displayCategories.length} {displayCategories.length === 1 ? 'Category' : 'Categories'}
          </Button>
        </div>

        {/* Categories List */}
        {currentSpending ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayCategories.map((category) => {
              const categoryColor = getCategoryColor(category);
              const categoryTextColor = getCategoryTextColor(category);
              return (
                <Cell
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  style={{
                    backgroundColor: `${categoryColor}33`, // 20% opacity
                    borderRadius: '16px',
                    padding: '6px 16px',
                  }}
                  before={<CategoryCircle emoji={category.emoji} color={categoryColor} />}
                >
                  <Text weight="3" style={{ color: categoryTextColor }}>
                    {category.name}
                  </Text>
                </Cell>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: 'var(--tgui--hint_color)',
          }}>
            <Text>No transactions to organize</Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPage;
