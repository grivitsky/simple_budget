import { Title } from '../../src/components/Typography/Title/Title';
import { Button } from '../../src/components/Blocks/Button/Button';
import { Card } from '../../src/components/Blocks/Card/Card';
import { Subheadline } from '../../src/components/Typography/Subheadline/Subheadline';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { Text } from '../../src/components/Typography/Text/Text';

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
    fontSize: '16px',
  }}>
    {emoji}
  </div>
);

// Test categories data
const categories = [
  { emoji: '🍔', name: 'Eating Out', color: '#61B5F7', textColor: '#2E9DF4' },
  { emoji: '🏠', name: 'Housing', color: '#FF6B6B', textColor: '#E74C3C' },
  { emoji: '🚗', name: 'Transport', color: '#4ECDC4', textColor: '#16A085' },
  { emoji: '🛒', name: 'Groceries', color: '#95E1D3', textColor: '#45B7A0' },
  { emoji: '💊', name: 'Healthcare', color: '#F38181', textColor: '#C0392B' },
  { emoji: '🎬', name: 'Entertainment', color: '#AA96DA', textColor: '#7B68B8' },
  { emoji: '👕', name: 'Shopping', color: '#FCBAD3', textColor: '#E91E63' },
  { emoji: '📱', name: 'Utilities', color: '#FFF176', textColor: '#F57C00' },
  { emoji: '✈️', name: 'Travel', color: '#A8D8EA', textColor: '#0277BD' },
  { emoji: '🎓', name: 'Education', color: '#FFB6B9', textColor: '#C2185B' },
];

const BudgetPage = () => {
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
          Categorise
        </Title>
        <Button mode="plain" size="s">
          5 Items Left
        </Button>
      </div>

      {/* Section 2: Transaction Card */}
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

        {/* Info Wrapper with Store Name, Divider, and Date */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <Subheadline level="2" weight="3" style={{ color: 'var(--tgui--hint_color)' }}>
            Biedronka Sklep
          </Subheadline>
          <div style={{
            width: '1px',
            height: '12px',
            backgroundColor: 'var(--tgui--secondary_bg_color)',
          }} />
          <Subheadline level="2" weight="3" style={{ color: 'var(--tgui--hint_color)' }}>
            4 Nov, 15:54
          </Subheadline>
        </div>
      </Card>

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
      }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
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
            10 Categories
          </Button>
        </div>

        {/* Categories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {categories.map((category, index) => (
            <Cell
              key={index}
              style={{
                backgroundColor: `${category.color}33`, // 20% opacity
                borderRadius: '16px',
                padding: '2px',
              }}
              before={<CategoryCircle emoji={category.emoji} color={category.color} />}
            >
              <Text weight="3" style={{ color: category.textColor }}>
                {category.name}
              </Text>
            </Cell>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
