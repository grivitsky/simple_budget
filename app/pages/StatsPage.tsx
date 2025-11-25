import { useState, useEffect } from 'react';
import { Button } from '../../src/components/Blocks/Button/Button';
import { TabsList } from '../../src/components/Navigation/TabsList/TabsList';
import { SegmentedControl } from '../../src/components/Navigation/SegmentedControl/SegmentedControl';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { Text } from '../../src/components/Typography/Text/Text';
import { Icon24Guard } from '../../src/icons/24/guard';
import { Divider } from '../../src/components/Misc/Divider/Divider';
import { Spinner } from '../../src/components/Feedback/Spinner/Spinner';
import { Modal } from '../../src/components/Overlays/Modal/Modal';
import { Section } from '../../src/components/Blocks/Section/Section';
import { Subheadline } from '../../src/components/Typography/Subheadline/Subheadline';
import { getUserSpendingsByDateRange, getPeriodStartDate, getPeriodEndDate, type Spending } from '../lib/spendingService';
import { getUserEarningsByDateRange, type Earning } from '../lib/earningsService';
import { getCurrencyByCode } from '../lib/currencyService';
import { getAllCategories, type Category } from '../lib/categoryService';
import { getAllEarningsCategories, type EarningsCategory } from '../lib/earningsCategoryService';
import { getCategoryColor, getCategoryTextColor } from '../lib/themeUtils';
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

// Transaction Circle Component (for modal)
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

// Skeleton Component
const Skeleton = ({ 
  width, 
  height, 
  borderRadius = '4px',
  style,
  delay = 0
}: { 
  width?: string | number; 
  height?: string | number; 
  borderRadius?: string;
  style?: React.CSSProperties;
  delay?: number;
}) => {
  const skeletonStyle: React.CSSProperties = {
    width: width || '100%',
    height: height || '16px',
    borderRadius,
    backgroundColor: 'var(--tgui--secondary_bg_color)',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  const shimmerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(128, 128, 128, 0.2), transparent)',
    animation: 'shimmer 1.5s infinite',
    animationDelay: `${delay}s`,
  };

  return (
    <div style={skeletonStyle}>
      <div style={shimmerStyle} />
      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

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
 * Convert amount to user's default currency (for spending)
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

/**
 * Convert amount to user's default currency (for earning)
 */
async function convertEarningToUserCurrency(
  earning: Earning,
  userDefaultCurrency: string,
  userCurrencyRate: number
): Promise<number> {
  // If transaction currency matches user's default currency, return earning_amount
  if (earning.currency_code === userDefaultCurrency) {
    return earning.earning_amount;
  }

  // Otherwise, convert from base currency (USD) to user's default currency
  return earning.amount_in_base_currency * userCurrencyRate;
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
  onOpenEditor?: (spendingId?: string) => void;
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

const StatsPage = ({ user, refreshTrigger, onOpenEditor }: StatsPageProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [viewType, setViewType] = useState<'expenses' | 'income'>('expenses');
  // categoryStats contains all converted transactions and percentages - stored for later use
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [userCurrency, setUserCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);
  const [spendingsData, setSpendingsData] = useState<Spending[]>([]);
  const [earningsData, setEarningsData] = useState<Earning[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [earningsCategories, setEarningsCategories] = useState<EarningsCategory[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<DailyTransaction[]>([]);
  const [loadingCategoryTransactions, setLoadingCategoryTransactions] = useState(false);

  // Fetch both expenses and income data when period or user changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch both categories and earnings categories
        const cats = await getAllCategories();
        setCategories(cats);
        const earningsCats = await getAllEarningsCategories();
        setEarningsCategories(earningsCats);

        // Get user's default currency
        const defaultCurrency = user.default_currency || 'USD';
        setUserCurrency(defaultCurrency);

        // Get period dates
        const startDate = getPeriodStartDate(selectedPeriod);
        const endDate = getPeriodEndDate();

        // Fetch both spendings and earnings for period
        const spendingsData = await getUserSpendingsByDateRange(user.id, startDate, endDate);
        setSpendingsData(spendingsData);
        const earningsData = await getUserEarningsByDateRange(user.id, startDate, endDate);
        setEarningsData(earningsData);

        // Get user's currency exchange rate
        const userCurrencyData = await getCurrencyByCode(defaultCurrency);
        const userCurrencyRate = userCurrencyData?.exchange_rate_to_usd || 1;

        // Calculate statistics based on viewType
        if (viewType === 'expenses') {
          // Calculate expenses statistics by category
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
          const timestamp = new Date().toISOString();
          const stats: CategoryStats[] = Array.from(categoryMap.values())
            .map(({ category, total: catTotal }) => ({
              categoryId: category.id,
              categoryName: category.name,
              emoji: category.emoji,
              color: getCategoryColor(category),
              textColor: getCategoryTextColor(category),
              amount: catTotal,
              percentage: total > 0 ? (catTotal / total) * 100 : 0,
              timestamp: timestamp,
            }))
            .sort((a, b) => b.amount - a.amount);

          setCategoryStats(stats);
        } else {
          // Calculate income statistics by category
          const categoryMap = new Map<string, { category: EarningsCategory; total: number }>();

          // Convert all earnings to user's currency and group by category
          for (const earning of earningsData) {
            const convertedAmount = await convertEarningToUserCurrency(
              earning,
              defaultCurrency,
              userCurrencyRate
            );

            const categoryId = earning.category_id || 'undefined';
            const category = earningsCats.find(cat => cat.id === categoryId) || 
                            earningsCats.find(cat => cat.name === 'Undefined');

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
          const timestamp = new Date().toISOString();
          const stats: CategoryStats[] = Array.from(categoryMap.values())
            .map(({ category, total: catTotal }) => ({
              categoryId: category.id,
              categoryName: category.name,
              emoji: category.emoji,
              color: getCategoryColor(category),
              textColor: getCategoryTextColor(category),
              amount: catTotal,
              percentage: total > 0 ? (catTotal / total) * 100 : 0,
              timestamp: timestamp,
            }))
            .sort((a, b) => b.amount - a.amount);

          setCategoryStats(stats);
        }
      } catch (error) {
        console.error('Error fetching stats data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, user, refreshTrigger, viewType]);

  // Handle category click - open modal and load transactions
  const handleCategoryClick = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsCategoryModalOpen(true);
    setLoadingCategoryTransactions(true);

    try {
      // Get user's currency exchange rate
      const userCurrencyData = await getCurrencyByCode(userCurrency);
      const userCurrencyRate = userCurrencyData?.exchange_rate_to_usd || 1;

      if (viewType === 'expenses') {
        // Filter spendings for this category
        const categorySpendings = spendingsData.filter(
          spending => spending.category_id === categoryId
        );

        // Get category info
        const category = categories.find(cat => cat.id === categoryId);

        // Group by day
        const dayMap = new Map<string, Spending[]>();
        
        for (const spending of categorySpendings) {
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
                color: category ? getCategoryColor(category) : '#9E9E9E',
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
            categorySpendings.find(s => s.id === a.transactions[0].id)?.created_at || '' : '');
          const dateB = new Date(b.transactions[0] ? 
            categorySpendings.find(s => s.id === b.transactions[0].id)?.created_at || '' : '');
          return dateB.getTime() - dateA.getTime();
        });

        setCategoryTransactions(dailyTransactions);
      } else {
        // Filter earnings for this category
        const categoryEarnings = earningsData.filter(
          earning => earning.category_id === categoryId
        );

        // Get category info
        const category = earningsCategories.find(cat => cat.id === categoryId);

        // Group by day
        const dayMap = new Map<string, Earning[]>();
        
        for (const earning of categoryEarnings) {
          const date = new Date(earning.created_at);
          const dayKey = date.toDateString();
          
          if (!dayMap.has(dayKey)) {
            dayMap.set(dayKey, []);
          }
          dayMap.get(dayKey)!.push(earning);
        }

        // Convert to daily transactions
        const dailyTransactions: DailyTransaction[] = [];
        
        for (const [dayKey, dayEarnings] of dayMap.entries()) {
          const date = new Date(dayKey);
          let dayTotal = 0;

          const transactions = await Promise.all(
            dayEarnings.map(async (earning) => {
              // Convert amount to user's currency
              const convertedAmount = await convertEarningToUserCurrency(
                earning,
                userCurrency,
                userCurrencyRate
              );
              
              dayTotal += convertedAmount;

              return {
                id: earning.id,
                emoji: category?.emoji || '❔',
                name: earning.earning_name,
                time: formatTime(new Date(earning.created_at)),
                amount: convertedAmount,
                type: 'Earned',
                color: category ? getCategoryColor(category) : '#9E9E9E',
              };
            })
          );

          dailyTransactions.push({
            date: formatDate(date),
            total: dayTotal,
            transactions: transactions.sort((a, b) => 
              new Date(dayEarnings.find(e => e.id === b.id)!.created_at).getTime() - 
              new Date(dayEarnings.find(e => e.id === a.id)!.created_at).getTime()
            ),
          });
        }

        // Sort by date (newest first)
        dailyTransactions.sort((a, b) => {
          const dateA = new Date(a.transactions[0] ? 
            categoryEarnings.find(e => e.id === a.transactions[0].id)?.created_at || '' : '');
          const dateB = new Date(b.transactions[0] ? 
            categoryEarnings.find(e => e.id === b.transactions[0].id)?.created_at || '' : '');
          return dateB.getTime() - dateA.getTime();
        });

        setCategoryTransactions(dailyTransactions);
      }
    } catch (error) {
      console.error('Error loading category transactions:', error);
      setCategoryTransactions([]);
    } finally {
      setLoadingCategoryTransactions(false);
    }
  };

  // Handle Analyze button click
  const handleAnalyze = async () => {
    const dataToAnalyze = viewType === 'expenses' ? spendingsData : earningsData;
    if (!user || dataToAnalyze.length === 0 || categoryStats.length === 0) {
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
        (viewType === 'expenses' ? spendingsData : earningsData).map(async (item) => {
          // Convert to user's currency
          const convertedAmount = viewType === 'expenses'
            ? await convertToUserCurrency(item as Spending, userCurrency, userCurrencyRate)
            : await convertEarningToUserCurrency(item as Earning, userCurrency, userCurrencyRate);

          // Get category name
          const category = viewType === 'expenses'
            ? categories.find(cat => cat.id === (item as Spending).category_id) ||
              categories.find(cat => cat.name === 'Undefined')
            : earningsCategories.find(cat => cat.id === (item as Earning).category_id) ||
              earningsCategories.find(cat => cat.name === 'Undefined');

          // Format date as YYYY-MM-DD
          const date = new Date(item.created_at);
          const dateStr = date.toISOString().split('T')[0];

          return {
            date: dateStr,
            amount: viewType === 'expenses' 
              ? -Math.abs(convertedAmount) // Negative for spending
              : Math.abs(convertedAmount), // Positive for income
            currency: userCurrency,
            category: category?.name || 'Undefined',
            merchant: viewType === 'expenses' 
              ? (item as Spending).spending_name 
              : (item as Earning).earning_name,
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
          totalSpent: viewType === 'expenses' ? totalAmount : -totalAmount, // Negative for income analysis
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
      }}>
        {/* Period and Amount Header Skeleton */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '32px 0px 24px 0px',
        }}>
          {/* Date Skeleton */}
          <Skeleton width="120px" height="20px" borderRadius="4px" style={{ marginBottom: '4px' }} delay={0} />
          
          {/* Amount with Currency Skeleton */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
          }}>
            <div style={{ paddingBottom: '2px' }}>
              <Skeleton width="60px" height="28px" borderRadius="4px" delay={0.04} />
            </div>
            <Skeleton width="140px" height="44px" borderRadius="4px" delay={0.08} />
          </div>
        </div>

        {/* Analyze Button Skeleton */}
        <Skeleton width="100%" height="48px" borderRadius="12px" style={{ marginBottom: '24px' }} delay={0.12} />

        {/* Period Tabs Skeleton */}
        <div style={{ marginBottom: '0px' }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
          }}>
            <Skeleton width="60px" height="36px" borderRadius="8px" delay={0.16} />
            <Skeleton width="60px" height="36px" borderRadius="8px" delay={0.2} />
            <Skeleton width="60px" height="36px" borderRadius="8px" delay={0.24} />
          </div>
        </div>

        {/* Divider Skeleton */}
        <div style={{
          marginLeft: '-16px',
          marginRight: '-16px',
          marginBottom: '16px',
          marginTop: '16px',
        }}>
          <Skeleton width="100%" height="1px" borderRadius="0px" delay={0.28} />
        </div>

        {/* Category Section Skeleton */}
        <div>
          {/* Section Header Skeleton */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0px 12px 8px 12px',
          }}>
            <Skeleton width="100px" height="13px" borderRadius="4px" delay={0.32} />
            <Skeleton width="100px" height="20px" borderRadius="4px" delay={0.36} />
          </div>

          {/* Category List Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((index) => {
              const delay = 0.4 + (index - 1) * 0.06;
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'var(--tgui--bg_color)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Skeleton width="40px" height="40px" borderRadius="50%" delay={delay} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="50%" height="16px" borderRadius="4px" style={{ marginBottom: '4px' }} delay={delay + 0.02} />
                    <Skeleton width="30%" height="14px" borderRadius="4px" delay={delay + 0.04} />
                  </div>
                  <Skeleton width="50px" height="16px" borderRadius="4px" delay={delay + 0.02} />
                </div>
              );
            })}
          </div>
        </div>
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
              {viewType === 'expenses' ? '-' : '+'}{userCurrency}
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

      {/* Segmented Control for Expenses/Income */}
      <div style={{ marginBottom: '8px' }}>
        <SegmentedControl>
          <SegmentedControl.Item
            selected={viewType === 'expenses'}
            onClick={() => setViewType('expenses')}
            style={{ paddingTop: '8px', paddingBottom: '12px' }}
          >
            Expenses
          </SegmentedControl.Item>
          <SegmentedControl.Item
            selected={viewType === 'income'}
            onClick={() => setViewType('income')}
            style={{ paddingTop: '8px', paddingBottom: '12px' }}
          >
            Income
          </SegmentedControl.Item>
        </SegmentedControl>
      </div>

      {/* 1. Analyze Button */}
      <Button
        mode="bezeled"
        size="l"
        stretched
        before={<Icon24Guard />}
        style={{ marginBottom: '24px' }}
        onClick={handleAnalyze}
        disabled={analyzing || (viewType === 'expenses' ? spendingsData.length === 0 : earningsData.length === 0)}
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
                onClick={() => handleCategoryClick(stat.categoryId)}
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

      {/* Category Transactions Modal */}
      <Modal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        header={
          <Modal.Header>
            {(() => {
              if (!selectedCategoryId) return 'Category Transactions';
              const category = viewType === 'expenses'
                ? categories.find(cat => cat.id === selectedCategoryId)
                : earningsCategories.find(cat => cat.id === selectedCategoryId);
              return category ? `${category.emoji} ${category.name}` : 'Category Transactions';
            })()}
          </Modal.Header>
        }
      >
        <div style={{ padding: '16px 16px 32px 16px' }}>
          {loadingCategoryTransactions ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px 0',
            }}>
              <Spinner size="l" />
            </div>
          ) : categoryTransactions.length === 0 ? (
            <div style={{
              padding: '40px 16px',
              textAlign: 'center',
              color: 'var(--tgui--hint_color)',
            }}>
              <Text>No transactions for this category</Text>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {categoryTransactions.map((day, dayIndex) => (
                <Section
                  key={dayIndex}
                  header={
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0px 16px',
                      marginBottom: '8px',
                      marginTop: dayIndex === 0 ? '0px' : '0px',
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
                      onClick={() => {
                        setIsCategoryModalOpen(false);
                        onOpenEditor?.(transaction.id);
                      }}
                      style={{
                        backgroundColor: 'var(--tgui--secondary_bg_color)',
                      }}
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
      </Modal>
    </div>
  );
};

export default StatsPage;
