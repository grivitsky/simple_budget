import { useState } from 'react';
import { IconButton } from '../../src/components/Blocks/IconButton/IconButton';
import { Input } from '../../src/components/Form/Input/Input';
import { Select } from '../../src/components/Form/Select/Select';
import { Text } from '../../src/components/Typography/Text/Text';
import { Icon28Check } from '../../src/icons/28/check';
import { Icon28Bin } from '../../src/icons/28/bin';

interface EditorPageProps {
  onClose: () => void;
}

// Categories data
const categories = [
  { emoji: '🍔', name: 'Eating Out', color: '#61B5F7' },
  { emoji: '🏠', name: 'Housing', color: '#FF6B6B' },
  { emoji: '🚗', name: 'Transport', color: '#4ECDC4' },
  { emoji: '🛒', name: 'Groceries', color: '#95E1D3' },
  { emoji: '💊', name: 'Healthcare', color: '#F38181' },
  { emoji: '🎬', name: 'Entertainment', color: '#AA96DA' },
  { emoji: '👕', name: 'Shopping', color: '#FCBAD3' },
  { emoji: '📱', name: 'Utilities', color: '#FFF176' },
  { emoji: '✈️', name: 'Travel', color: '#A8D8EA' },
  { emoji: '🎓', name: 'Education', color: '#FFB6B9' },
];

const EditorPage = ({ onClose }: EditorPageProps) => {
  const [amount, setAmount] = useState('2,043.12');
  const [storeName, setStoreName] = useState('Biedronka');
  const [selectedCategory, setSelectedCategory] = useState('Eating Out');

  // Handle amount input - allow only numbers, comma, and period
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits, comma, and period
    if (/^[\d.,]*$/.test(value)) {
      setAmount(value);
    }
  };

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
          onClick={onClose}
        >
          <Icon28Check />
        </IconButton>
        <IconButton
          mode="bezeled"
          size="s"
          style={{
            color: '#FF383C',
            backgroundColor: 'rgba(255, 56, 60, 0.14)',
          }}
        >
          <Icon28Bin />
        </IconButton>
      </div>

      {/* Section 2: Amount and Store Name */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {/* Amount Input */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '4px',
        }}>
          <div style={{ paddingBottom: '4px' }}>
            <span style={{
              fontFamily: '"SF Pro Rounded", "SF Rounded", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-0.4px',
              color: 'var(--tgui--hint_color)',
              lineHeight: '1',
            }}>
              -PLN
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
              width: `${(amount.length || 1) * 0.6}ch`,
              maxWidth: '300px',
              padding: '0',
            }}
          />
        </div>

        {/* Store Name Input */}
        <Input
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          style={{ width: '240px', textAlign: 'center' }}
        />
      </div>

      {/* Section 3: Category Select */}
      <Select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{ paddingTop: '12px', paddingBottom: '12px' }}
      >
        {categories.map((category) => (
          <option key={category.name} value={category.name}>
            {category.emoji} {category.name}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default EditorPage;

