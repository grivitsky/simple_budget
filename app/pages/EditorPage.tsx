import { useState, useEffect } from 'react';
import { IconButton } from '../../src/components/Blocks/IconButton/IconButton';
import { Input } from '../../src/components/Form/Input/Input';
import { Select } from '../../src/components/Form/Select/Select';
import { Card } from '../../src/components/Blocks/Card/Card';
import { Text } from '../../src/components/Typography/Text/Text';
import { Spinner } from '../../src/components/Feedback/Spinner/Spinner';
import { Icon28Check } from '../../src/icons/28/check';
import { Icon28Bin } from '../../src/icons/28/bin';
import { updateSpending, deleteSpending, getSpendingById, type Spending } from '../lib/spendingService';
import { getAllCategories, type Category } from '../lib/categoryService';
import type { User } from '../lib/supabase';

interface EditorPageProps {
  onClose: () => void;
  spendingId?: string | null;
  user?: User | null;
  onSave?: () => void;
  onDelete?: () => void;
}

const EditorPage = ({ onClose, spendingId, user, onSave, onDelete }: EditorPageProps) => {
  const [spending, setSpending] = useState<Spending | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState('');
  const [storeName, setStoreName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load spending and categories
  useEffect(() => {
    const loadData = async () => {
      if (!spendingId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
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
      } catch (error) {
        console.error('Error loading spending data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [spendingId]);

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
    if (!spending || !user) return;

    setSaving(true);
    try {
      // Parse amount (handle comma as decimal separator)
      const amountValue = parseFloat(amount.replace(',', '.'));
      if (isNaN(amountValue) || amountValue <= 0) {
        alert('Please enter a valid amount');
        setSaving(false);
        return;
      }

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
    } catch (error) {
      console.error('Error saving spending:', error);
      alert('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!spending) return;

    // Native confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this transaction?');
    if (!confirmed) return;

    try {
      const success = await deleteSpending(spending.id);
      if (success) {
        if (onDelete) {
          onDelete();
        }
        onClose();
      } else {
        alert('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting spending:', error);
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
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Spinner size="l" />
      </div>
    );
  }

  if (!spending) {
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
              -{currencyCode}
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
          style={{ paddingTop: '14px', paddingBottom: '14px', width: '272px' }}
        >
          {categories.map((category) => (
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

