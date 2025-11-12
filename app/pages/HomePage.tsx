import { useState, useEffect } from 'react';
import { Text } from '../../src/components/Typography/Text/Text';
import { TabsList } from '../../src/components/Navigation/TabsList/TabsList';
import { Button } from '../../src/components/Blocks/Button/Button';
import { Section } from '../../src/components/Blocks/Section/Section';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { Subheadline } from '../../src/components/Typography/Subheadline/Subheadline';
import { Spinner } from '../../src/components/Feedback/Spinner/Spinner';
import { getUserSpendingsByDateRange, getPeriodStartDate, getPeriodEndDate, type Spending } from '../lib/spendingService';
import { getCurrencyByCode } from '../lib/currencyService';
import { getAllCategories, type Category } from '../lib/categoryService';
import type { User } from '../lib/supabase';

// Transaction Circle Component
const TransactionCircle = ({ emoji, color }: { emoji: string; color: string }) => (
  <div style={{
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  }}>
    {emoji}
  </div>
);

/**
 * Format date as "Day, DD MON" (e.g., "Tue, 5 NOV")
 */
function formatDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const day = days[date.getDay()];
  const dayNum = date.getDate();
  const month = months[date.getMonth()];
  return `${day}, ${dayNum} ${month}`;
}

/**
 * Format time as "HH:MM AM/PM"
 */
function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
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
  // amount_in_base_currency is in USD
  // Convert: USD -> user's currency
  // Formula: amount_in_base_currency * userCurrencyRate
  return spending.amount_in_base_currency * userCurrencyRate;
}

interface HomePageProps {
  onOpenEditor?: (spendingId: string) => void;
  user?: User | null;
  refreshTrigger?: number;
}

interface DailyTransaction {
  date: string;
  total: number;
  transactions: Array<{
    id: string;
    emoji: string;
    name: string;
    time: string;
    amount: number;
    type: string;
    color: string;
  }>;
}

const HomePage = ({ onOpenEditor, user, refreshTrigger }: HomePageProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userCurrency, setUserCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);

  // Update userCurrency when user changes
  useEffect(() => {
    if (user?.default_currency) {
      setUserCurrency(user.default_currency);
    }
  }, [user?.default_currency]);

  // Fetch spendings and categories when period or user changes
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
        setSpendings(spendingsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, user, refreshTrigger]);

  // Process spendings into daily transactions
  const processDailyTransactions = async (): Promise<DailyTransaction[]> => {
    if (!user?.id || spendings.length === 0) return [];

    // Get user's currency exchange rate
    const userCurrencyData = await getCurrencyByCode(userCurrency);
    const userCurrencyRate = userCurrencyData?.exchange_rate_to_usd || 1;

    // Group by day
    const dayMap = new Map<string, Spending[]>();
    
    for (const spending of spendings) {
      const date = new Date(spending.created_at);
      const dayKey = date.toDateString();
      
      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, []);
      }
      dayMap.get(dayKey)!.push(spending);
    }

    // Convert to daily transactions
    const dailyTransactions: DailyTransaction[] = [];
    
    for (const [dayKey, daySpendings] of dayMap.entries()) {
      const date = new Date(dayKey);
      let dayTotal = 0;

      const transactions = await Promise.all(
        daySpendings.map(async (spending) => {
          // Get category
          const category = categories.find(cat => cat.id === spending.category_id) || 
                          categories.find(cat => cat.name === 'Undefined');
          
          // Convert amount to user's currency
          const convertedAmount = await convertToUserCurrency(
            spending,
            userCurrency,
            userCurrencyRate
          );
          
          dayTotal += convertedAmount;

          return {
            id: spending.id,
            emoji: category?.emoji || '❔',
            name: spending.spending_name,
            time: formatTime(new Date(spending.created_at)),
            amount: convertedAmount,
            type: 'Spent',
            color: category?.color || '#9E9E9E',
          };
        })
      );

      dailyTransactions.push({
        date: formatDate(date),
        total: dayTotal,
        transactions: transactions.sort((a, b) => 
          new Date(daySpendings.find(s => s.id === b.id)!.created_at).getTime() - 
          new Date(daySpendings.find(s => s.id === a.id)!.created_at).getTime()
        ),
      });
    }

    // Sort by date (newest first)
    dailyTransactions.sort((a, b) => {
      const dateA = new Date(a.transactions[0] ? 
        spendings.find(s => s.id === a.transactions[0].id)?.created_at || '' : '');
      const dateB = new Date(b.transactions[0] ? 
        spendings.find(s => s.id === b.transactions[0].id)?.created_at || '' : '');
      return dateB.getTime() - dateA.getTime();
    });

    return dailyTransactions;
  };

  const [dailyTransactions, setDailyTransactions] = useState<DailyTransaction[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Process transactions when data changes
  useEffect(() => {
    const processData = async () => {
      if (spendings.length > 0 && categories.length > 0 && user) {
        const processed = await processDailyTransactions();
        setDailyTransactions(processed);
        
        // Calculate total
        const total = processed.reduce((sum, day) => sum + day.total, 0);
        setTotalAmount(total);
      } else {
        setDailyTransactions([]);
        setTotalAmount(0);
      }
    };

    processData();
  }, [spendings, categories, user, userCurrency]);

  // Get period label
  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
    }
  };

  // Format currency symbol (will be enhanced to fetch from currencyService)
  const getCurrencySymbol = () => {
    return `-${userCurrency}`;
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
      {/* Section 1: Period and Amount Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '32px 0px 24px 0px',
      }}>
        {/* Period Label */}
        <Text weight="2" style={{
          color: 'var(--tgui--text_color)',
          marginBottom: '4px',
        }}>
          {getPeriodLabel()}
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
              {getCurrencySymbol()}
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

      {/* Section 2: Period Tabs */}
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

      {/* Section 3: Daily Summary Wrapper */}
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
        {dailyTransactions.length === 0 ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: 'var(--tgui--hint_color)',
          }}>
            <Text>No transactions for this period</Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {dailyTransactions.map((day, dayIndex) => (
          <Section
            key={dayIndex}
            header={
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0px 16px',
                marginBottom: '8px',
                marginTop: dayIndex === 0 ? '16px' : '0px',
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  color: 'var(--tgui--section_header_text_color)',
                  letterSpacing: '-0.08px',
                }}>
                  {day.date}
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
                  {formatNumber(day.total)} {userCurrency}
                </Button>
              </div>
            }
          >
            {day.transactions.map((transaction, transactionIndex) => (
              <Cell
                key={transactionIndex}
                onClick={() => onOpenEditor?.(transaction.id)}
                before={<TransactionCircle emoji={transaction.emoji} color={transaction.color} />}
                subtitle={
                  <Subheadline level="2" weight="3" style={{ color: 'var(--tgui--subtitle_text_color)' }}>
                    {transaction.time}
                  </Subheadline>
                }
                after={
                  <div style={{ textAlign: 'right' }}>
                    <Text weight="1" style={{ color: 'var(--tgui--text_color)', display: 'block' }}>
                      {formatNumber(transaction.amount)} {userCurrency}
                    </Text>
                    <Subheadline level="2" weight="3" style={{ color: 'var(--tgui--subtitle_text_color)' }}>
                      {transaction.type}
                    </Subheadline>
                  </div>
                }
              >
                <Text weight="3">{transaction.name}</Text>
              </Cell>
            ))}
          </Section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

