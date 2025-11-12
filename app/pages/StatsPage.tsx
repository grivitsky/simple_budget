import { useState, useEffect } from 'react';
import { Button } from '../../src/components/Blocks/Button/Button';
import { TabsList } from '../../src/components/Navigation/TabsList/TabsList';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { Text } from '../../src/components/Typography/Text/Text';
import { Icon24Guard } from '../../src/icons/24/guard';
import { Divider } from '../../src/components/Misc/Divider/Divider';
import { Spinner } from '../../src/components/Feedback/Spinner/Spinner';
import { getUserSpendingsByDateRange, getPeriodStartDate, getPeriodEndDate, type Spending } from '../lib/spendingService';
import { getCurrencyByCode } from '../lib/currencyService';
import { getAllCategories, type Category } from '../lib/categoryService';
import type { User } from '../lib/supabase';

// Category Circle Component
const CategoryCircle = ({ emoji, color }: { emoji: string; color: string }) => (
  <div style={{
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  }}>
    {emoji}
  </div>
);

/**
 * Format date as "Month YYYY" (e.g., "November 2025") or "DD Mon - DD Mon" for week
 */
function formatPeriodDate(period: 'week' | 'month' | 'year'): string {
  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  switch (period) {
    case 'week': {
      const start = getPeriodStartDate('week');
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // Week ends 6 days after start
      
      const startDay = start.getDate().toString().padStart(2, '0');
      const startMonth = monthAbbr[start.getMonth()];
      const endDay = end.getDate().toString().padStart(2, '0');
      const endMonth = monthAbbr[end.getMonth()];
      
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    }
    case 'month': {
      return `${months[now.getMonth()]} ${now.getFullYear()}`;
    }
    case 'year': {
      return `${now.getFullYear()}`;
    }
  }
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

interface CategoryStats {
  categoryId: string;
  categoryName: string;
  emoji: string;
  color: string;
  textColor: string;
  amount: number;
  percentage: number;
  timestamp: string; // ISO timestamp when statistics were calculated
}

interface StatsPageProps {
  user?: User | null;
  refreshTrigger?: number;
}

const StatsPage = ({ user, refreshTrigger }: StatsPageProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  // categoryStats contains all converted transactions and percentages - stored for later use
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [userCurrency, setUserCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);
  const [spendingsData, setSpendingsData] = useState<Spending[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch spendings and calculate statistics when period or user changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch categories
        const cats = await getAllCategories();
        setCategories(cats);

        // Get user's default currency
        const defaultCurrency = user.default_currency || 'USD';
        setUserCurrency(defaultCurrency);

        // Get period dates
        const startDate = getPeriodStartDate(selectedPeriod);
        const endDate = getPeriodEndDate();

        // Fetch spendings for period
        const spendingsData = await getUserSpendingsByDateRange(user.id, startDate, endDate);
        setSpendingsData(spendingsData);

        // Get user's currency exchange rate
        const userCurrencyData = await getCurrencyByCode(defaultCurrency);
        const userCurrencyRate = userCurrencyData?.exchange_rate_to_usd || 1;

        // Calculate statistics by category
        const categoryMap = new Map<string, { category: Category; total: number }>();

        // Convert all spendings to user's currency and group by category
        for (const spending of spendingsData) {
          const convertedAmount = await convertToUserCurrency(
            spending,
            defaultCurrency,
            userCurrencyRate
          );

          const categoryId = spending.category_id || 'undefined';
          const category = cats.find(cat => cat.id === categoryId) || 
                          cats.find(cat => cat.name === 'Undefined');

          if (category) {
            const existing = categoryMap.get(categoryId);
            if (existing) {
              existing.total += convertedAmount;
            } else {
              categoryMap.set(categoryId, {
                category,
                total: convertedAmount,
              });
            }
          }
        }

        // Calculate total
        let total = 0;
        for (const { total: catTotal } of categoryMap.values()) {
          total += catTotal;
        }
        setTotalAmount(total);

        // Convert to array and calculate percentages
        const timestamp = new Date().toISOString(); // Timestamp for when stats were calculated
        const stats: CategoryStats[] = Array.from(categoryMap.values())
          .map(({ category, total: catTotal }) => ({
            categoryId: category.id,
            categoryName: category.name,
            emoji: category.emoji,
            color: category.color,
            textColor: category.text_color,
            amount: catTotal,
            percentage: total > 0 ? (catTotal / total) * 100 : 0,
            timestamp: timestamp,
          }))
          .sort((a, b) => b.amount - a.amount); // Sort by amount descending

        setCategoryStats(stats);
      } catch (error) {
        console.error('Error fetching stats data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, user, refreshTrigger]);

  // Handle Analyze button click
  const handleAnalyze = async () => {
    if (!user || spendingsData.length === 0 || categoryStats.length === 0) {
      alert('No data available for analysis');
      return;
    }

    setAnalyzing(true);
    try {
      // Get user's currency exchange rate
      const userCurrencyData = await getCurrencyByCode(userCurrency);
      const userCurrencyRate = userCurrencyData?.exchange_rate_to_usd || 1;

      // Format transactions for OpenAI
      const transactions = await Promise.all(
        spendingsData.map(async (spending) => {
          // Convert to user's currency
          const convertedAmount = await convertToUserCurrency(
            spending,
            userCurrency,
            userCurrencyRate
          );

          // Get category name
          const category = categories.find(cat => cat.id === spending.category_id) ||
                          categories.find(cat => cat.name === 'Undefined');

          // Format date as YYYY-MM-DD
          const date = new Date(spending.created_at);
          const dateStr = date.toISOString().split('T')[0];

          return {
            date: dateStr,
            amount: -Math.abs(convertedAmount), // Negative for spending
            currency: userCurrency,
            category: category?.name || 'Undefined',
            merchant: spending.spending_name,
            notes: undefined,
            is_recurring: false, // We don't track this yet
          };
        })
      );

      // Format category stats
      const categoryTotals = categoryStats.map(stat => ({
        category: stat.categoryName,
        total: stat.amount,
        percentage: stat.percentage,
      }));

      // Get date range string
      const dateRange = formatPeriodDate(selectedPeriod);

      // Call analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          categoryStats: categoryTotals,
          totalSpent: totalAmount,
          period: selectedPeriod,
          dateRange,
          userTelegramId: user.telegram_id,
          userCurrency,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || error.details || 'Failed to generate analysis';
        console.error('Analysis API error:', errorMessage);
        throw new Error(errorMessage);
      }

      await response.json();
      
      // Show success message
      alert('Analysis sent to your Telegram chat! 📊');
    } catch (error) {
      console.error('Error analyzing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate analysis. Please try again.';
      alert(errorMessage);
    } finally {
      setAnalyzing(false);
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

  return (
    <div style={{ 
      backgroundColor: 'var(--tgui--secondary_bg_color)',
      minHeight: '100vh',
      padding: '16px',
    }}>
      {/* Period and Amount Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '32px 0px 24px 0px',
      }}>
        {/* Date */}
        <Text weight="2" style={{ 
          color: 'var(--tgui--text_color)',
          marginBottom: '4px',
        }}>
          {formatPeriodDate(selectedPeriod)}
        </Text>
        
        {/* Amount with Currency */}
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
            {formatNumber(totalAmount)}
          </span>
        </div>
      </div>

      {/* 1. Analyze Button */}
      <Button
        mode="bezeled"
        size="l"
        stretched
        before={<Icon24Guard />}
        style={{ marginBottom: '24px' }}
        onClick={handleAnalyze}
        disabled={analyzing || spendingsData.length === 0}
      >
        {analyzing ? 'Analyzing...' : 'Analyze'}
      </Button>

      {/* 2. Period Tabs */}
      <TabsList style={{ marginBottom: '0px' }}>
        <TabsList.Item
          selected={selectedPeriod === 'week'}
          onClick={() => setSelectedPeriod('week')}
        >
          Week
        </TabsList.Item>
        <TabsList.Item
          selected={selectedPeriod === 'month'}
          onClick={() => setSelectedPeriod('month')}
        >
          Month
        </TabsList.Item>
        <TabsList.Item
          selected={selectedPeriod === 'year'}
          onClick={() => setSelectedPeriod('year')}
        >
          Year
        </TabsList.Item>
      </TabsList>

      {/* Edge-to-Edge Divider */}
      <Divider
        style={{
          marginLeft: '-16px',
          marginRight: '-16px',
          marginBottom: '16px',
        }}
      />

      {/* 3. Category Section with Custom Header */}
      <div>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0px 12px 8px 12px',
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 400,
            textTransform: 'uppercase',
            color: 'var(--tgui--section_header_text_color)',
            letterSpacing: '-0.08px',
          }}>
            By Category
          </span>
          <Button
            mode="plain"
            size="s"
            style={{
              minWidth: 'auto',
              height: 'auto',
              padding: "0px 0px 8px 0px",
            }}
          >
            {categoryStats.length} {categoryStats.length === 1 ? 'Category' : 'Categories'}
          </Button>
        </div>

        {/* Category List */}
        {categoryStats.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categoryStats.map((stat) => (
              <Cell
                key={stat.categoryId}
                style={{
                  backgroundColor: 'var(--tgui--bg_color)',
                  borderRadius: '16px',
                }}
                before={<CategoryCircle emoji={stat.emoji} color={stat.color} />}
                subtitle={`${formatNumber(stat.amount)} ${userCurrency}`}
                after={
                  <Text weight="1" style={{ color: 'var(--tgui--text_color)' }}>
                    {formatNumber(stat.percentage)}%
                  </Text>
                }
              >
                <Text weight="3" style={{ color: stat.textColor }}>
                  {stat.categoryName}
                </Text>
              </Cell>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: 'var(--tgui--hint_color)',
          }}>
            <Text>No transactions for this period</Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
