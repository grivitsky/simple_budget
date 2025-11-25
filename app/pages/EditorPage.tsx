import { useState, useEffect } from 'react';
import { IconButton } from '../../src/components/Blocks/IconButton/IconButton';
import { Input } from '../../src/components/Form/Input/Input';
import { Select } from '../../src/components/Form/Select/Select';
import { Card } from '../../src/components/Blocks/Card/Card';
import { Text } from '../../src/components/Typography/Text/Text';
import { Icon28Check } from '../../src/icons/28/check';
import { Icon28Bin } from '../../src/icons/28/bin';
import { updateSpending, deleteSpending, getSpendingById, type Spending } from '../lib/spendingService';
import { updateEarning, deleteEarning, getEarningById, type Earning } from '../lib/earningsService';
import { getAllCategories, type Category } from '../lib/categoryService';
import { getAllEarningsCategories, type EarningsCategory } from '../lib/earningsCategoryService';
import type { User } from '../lib/supabase';

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

interface EditorPageProps {
  onClose: () => void;
  spendingId?: string | null;
  earningId?: string | null;
  user?: User | null;
  onSave?: () => void;
  onDelete?: () => void;
}

const EditorPage = ({ onClose, spendingId, earningId, user, onSave, onDelete }: EditorPageProps) => {
  const [spending, setSpending] = useState<Spending | null>(null);
  const [earning, setEarning] = useState<Earning | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [earningsCategories, setEarningsCategories] = useState<EarningsCategory[]>([]);
  const [amount, setAmount] = useState('');
  const [storeName, setStoreName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const isEarning = !!earningId;
  const transaction = spending || earning;

  // Load transaction and categories
  useEffect(() => {
    const loadData = async () => {
      if (!spendingId && !earningId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        if (earningId) {
          // Load earnings categories
          const earningsCats = await getAllEarningsCategories();
          setEarningsCategories(earningsCats);

          // Load earning
          const earningData = await getEarningById(earningId);
          if (earningData) {
            setEarning(earningData);
            setAmount(earningData.earning_amount.toString());
            setStoreName(earningData.earning_name);
            setSelectedCategoryId(earningData.category_id);
            setCurrencyCode(earningData.currency_code);
          }
        } else if (spendingId) {
          // Load categories
          const cats = await getAllCategories();
          setCategories(cats);

          // Load spending
          const spendingData = await getSpendingById(spendingId);
          if (spendingData) {
            setSpending(spendingData);
            setAmount(spendingData.spending_amount.toString());
            setStoreName(spendingData.spending_name);
            setSelectedCategoryId(spendingData.category_id);
            setCurrencyCode(spendingData.currency_code);
          }
        }
      } catch (error) {
        console.error('Error loading transaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [spendingId, earningId]);

  // Handle amount input - allow only numbers, comma, and period
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits, comma, and period
    if (/^[\d.,]*$/.test(value)) {
      setAmount(value);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!transaction || !user) return;

    setSaving(true);
    try {
      // Parse amount (handle comma as decimal separator)
      const amountValue = parseFloat(amount.replace(',', '.'));
      if (isNaN(amountValue) || amountValue <= 0) {
        alert('Please enter a valid amount');
        setSaving(false);
        return;
      }

      if (isEarning && earning) {
        // Use existing exchange rate (currency is not editable)
        const exchangeRate = earning.exchange_rate;
        
        // Recalculate amount in base currency if amount changed
        let amountInBaseCurrency = earning.amount_in_base_currency;
        if (amountValue !== earning.earning_amount) {
          // Recalculate: new_amount / exchange_rate = new_amount_in_base_currency
          amountInBaseCurrency = amountValue / exchangeRate;
        }

        // Update earning
        const updated = await updateEarning(earning.id, {
          earning_name: storeName.trim(),
          earning_amount: amountValue,
          category_id: selectedCategoryId,
          amount_in_base_currency: parseFloat(amountInBaseCurrency.toFixed(2)),
        });

        if (updated) {
          // Haptic feedback for success
          if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          }
          
          if (onSave) {
            onSave();
          }
          onClose();
        } else {
          alert('Failed to save changes');
        }
      } else if (!isEarning && spending) {
        // Use existing exchange rate (currency is not editable)
        const exchangeRate = spending.exchange_rate;
        
        // Recalculate amount in base currency if amount changed
        let amountInBaseCurrency = spending.amount_in_base_currency;
        if (amountValue !== spending.spending_amount) {
          // Recalculate: new_amount / exchange_rate = new_amount_in_base_currency
          amountInBaseCurrency = amountValue / exchangeRate;
        }

        // Update spending
        const updated = await updateSpending(spending.id, {
          spending_name: storeName.trim(),
          spending_amount: amountValue,
          category_id: selectedCategoryId,
          amount_in_base_currency: parseFloat(amountInBaseCurrency.toFixed(2)),
        });

        if (updated) {
          // Haptic feedback for success
          if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          }
          
          if (onSave) {
            onSave();
          }
          onClose();
        } else {
          alert('Failed to save changes');
        }
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!transaction) return;

    // Native confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (!confirmed) return;

    try {
      let success = false;
      if (isEarning && earning) {
        success = await deleteEarning(earning.id);
      } else if (!isEarning && spending) {
        success = await deleteSpending(spending.id);
      }

      if (success) {
        if (onDelete) {
          onDelete();
        }
        onClose();
      } else {
        alert('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction');
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--tgui--secondary_bg_color)',
        minHeight: '100vh',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Section 1: Header with Buttons Skeleton */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <Skeleton width="40px" height="40px" borderRadius="12px" delay={0} />
          <Skeleton width="40px" height="40px" borderRadius="12px" delay={0.04} />
        </div>

        {/* Section 2: Amount and Store Name Card Skeleton */}
        <Card style={{
          backgroundColor: 'var(--tgui--bg_color)',
          borderRadius: '12px',
          margin: '0 0 24px 0',
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}>
          {/* Amount Input Skeleton */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '4px',
            marginRight: '-24px',
          }}>
            <div style={{ paddingBottom: '6px' }}>
              <Skeleton width="60px" height="28px" borderRadius="4px" delay={0.08} />
            </div>
            <Skeleton width="140px" height="44px" borderRadius="4px" delay={0.12} />
          </div>

          {/* Store Name Input Skeleton */}
          <Skeleton width="240px" height="48px" borderRadius="12px" delay={0.16} />
        </Card>

        {/* Section 3: Category Select Skeleton */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Skeleton width="100%" height="48px" borderRadius="12px" delay={0.2} />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div style={{
        backgroundColor: 'var(--tgui--secondary_bg_color)',
        minHeight: '100vh',
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text>Transaction not found</Text>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--tgui--secondary_bg_color)',
      minHeight: '100vh',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Section 1: Header with Check and Delete buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <IconButton
          mode="bezeled"
          size="s"
          onClick={handleSave}
          disabled={saving}
        >
          <Icon28Check />
        </IconButton>
        <IconButton
          mode="bezeled"
          size="s"
          onClick={handleDelete}
          style={{
            color: '#FF383C',
            backgroundColor: 'rgba(255, 56, 60, 0.14)',
          }}
        >
          <Icon28Bin />
        </IconButton>
      </div>

      {/* Section 2: Amount and Store Name */}
      <Card style={{
        backgroundColor: 'var(--tgui--bg_color)',
        borderRadius: '12px',
        margin: '0 0 24px 0',
        padding: '40px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}>
        {/* Amount Input */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '4px',
          marginRight: '-24px',
        }}>
          <div style={{ paddingBottom: '6px' }}>
            <span style={{
              fontFamily: '"SF Pro Rounded", "SF Rounded", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-0.4px',
              color: 'var(--tgui--hint_color)',
              lineHeight: '1',
            }}>
              {isEarning ? '+' : '-'}{currencyCode}
            </span>
          </div>
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={handleAmountChange}
            size={amount.length || 1}
            style={{
              fontFamily: '"SF Pro Rounded", "SF Rounded", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '44px',
              fontWeight: '700',
              letterSpacing: '-0.4px',
              color: 'var(--tgui--text_color)',
              lineHeight: '1',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              width: `${(amount.length || 1) * 1}ch`,
              minWidth: '40px',
              maxWidth: '260px',
              padding: '0',
              textAlign: 'left',
            }}
          />
        </div>

        {/* Store Name Input */}
        <Input
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          style={{ 
            width: '240px', 
            textAlign: 'center', 
            backgroundColor: 'var(--tgui--secondary_bg_color)',
            padding: '14px 16px',
            borderRadius: '12px'
          }}
        />
      </Card>

      {/* Section 3: Category Select */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <Select
          value={selectedCategoryId || ''}
          onChange={(e) => setSelectedCategoryId(e.target.value || null)}
          style={{ paddingTop: '14px', paddingBottom: '14px', width: '100%' }}
        >
          {(isEarning ? earningsCategories : categories).map((category) => (
            <option key={category.id} value={category.id}>
              {category.emoji} {category.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default EditorPage;

