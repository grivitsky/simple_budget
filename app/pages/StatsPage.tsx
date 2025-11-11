import { useState } from 'react';
import { Button } from '../../src/components/Blocks/Button/Button';
import { TabsList } from '../../src/components/Navigation/TabsList/TabsList';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { Text } from '../../src/components/Typography/Text/Text';
import { Icon24Guard } from '../../src/icons/24/guard';
import { Divider } from '../../src/components/Misc/Divider/Divider';

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

// Test categories data
const categories = [
  { emoji: '🍔', name: 'Eating Out', amount: '1,323.33 PLN', percentage: '56.2%', color: '#61B5F7' },
  { emoji: '🏠', name: 'Housing', amount: '850.00 PLN', percentage: '36.1%', color: '#FF6B6B' },
  { emoji: '🚗', name: 'Transport', amount: '450.50 PLN', percentage: '19.1%', color: '#4ECDC4' },
  { emoji: '🛒', name: 'Groceries', amount: '620.75 PLN', percentage: '26.3%', color: '#95E1D3' },
  { emoji: '💊', name: 'Healthcare', amount: '280.00 PLN', percentage: '11.9%', color: '#F38181' },
  { emoji: '🎬', name: 'Entertainment', amount: '190.25 PLN', percentage: '8.1%', color: '#AA96DA' },
  { emoji: '👕', name: 'Shopping', amount: '340.90 PLN', percentage: '14.5%', color: '#FCBAD3' },
  { emoji: '📱', name: 'Utilities', amount: '215.00 PLN', percentage: '9.1%', color: '#FFFFD2' },
  { emoji: '✈️', name: 'Travel', amount: '520.00 PLN', percentage: '22.1%', color: '#A8D8EA' },
  { emoji: '🎓', name: 'Education', amount: '175.50 PLN', percentage: '7.5%', color: '#FFB6B9' },
];

const StatsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

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
          November 2025
        </Text>
        
        {/* Amount with Currency */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
        }}>
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
          <span style={{
            fontFamily: '"SF Pro Rounded", "SF Rounded", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '44px',
            fontWeight: '700',
            letterSpacing: '-0.4px',
            color: 'var(--tgui--text_color)',
            lineHeight: '1',
          }}>
            2,043.12
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
      >
        Analyze
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
            10 Categories
          </Button>
        </div>

        {/* Category List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categories.map((category, index) => (
            <Cell
              key={index}
              style={{
                backgroundColor: 'var(--tgui--bg_color)',
                borderRadius: '16px',
              }}
              before={<CategoryCircle emoji={category.emoji} color={category.color} />}
              subtitle={category.amount}
              after={
                <Text weight="1" style={{ color: 'var(--tgui--text_color)' }}>
                  {category.percentage}
                </Text>
              }
            >
              <Text weight="3">{category.name}</Text>
            </Cell>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
