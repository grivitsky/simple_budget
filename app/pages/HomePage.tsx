import { useState } from 'react';
import { Text } from '../../src/components/Typography/Text/Text';
import { TabsList } from '../../src/components/Navigation/TabsList/TabsList';
import { Button } from '../../src/components/Blocks/Button/Button';
import { Section } from '../../src/components/Blocks/Section/Section';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { Subheadline } from '../../src/components/Typography/Subheadline/Subheadline';

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

// Daily transactions data
const dailyTransactions = [
  {
    date: 'Tue, 4 NOV',
    total: '-100.88 PLN',
    transactions: [
      { emoji: '🍔', name: 'McDonalds', time: '12:00 AM', amount: '-30.32 PLN', type: 'Spent', color: '#61B5F7' },
      { emoji: '🛒', name: 'Biedronka', time: '3:45 PM', amount: '-45.50 PLN', type: 'Spent', color: '#95E1D3' },
      { emoji: '☕', name: 'Starbucks', time: '9:15 AM', amount: '-25.06 PLN', type: 'Spent', color: '#AA96DA' },
    ]
  },
  {
    date: 'Mon, 3 NOV',
    total: '-245.60 PLN',
    transactions: [
      { emoji: '🚗', name: 'Shell Gas', time: '7:30 AM', amount: '-180.00 PLN', type: 'Spent', color: '#4ECDC4' },
      { emoji: '🎬', name: 'Cinema City', time: '8:00 PM', amount: '-45.00 PLN', type: 'Spent', color: '#AA96DA' },
      { emoji: '🍕', name: 'Pizza Hut', time: '6:30 PM', amount: '-20.60 PLN', type: 'Spent', color: '#FCBAD3' },
    ]
  },
  {
    date: 'Sun, 2 NOV',
    total: '-320.45 PLN',
    transactions: [
      { emoji: '👕', name: 'H&M', time: '2:00 PM', amount: '-150.00 PLN', type: 'Spent', color: '#FCBAD3' },
      { emoji: '🏠', name: 'IKEA', time: '4:30 PM', amount: '-120.45 PLN', type: 'Spent', color: '#FF6B6B' },
      { emoji: '📱', name: 'Apple Store', time: '11:00 AM', amount: '-50.00 PLN', type: 'Spent', color: '#FFF176' },
    ]
  },
];

const HomePage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

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
          This Month
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
              -PLN
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
            2,043.12
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dailyTransactions.map((day, dayIndex) => (
          <Section
            key={dayIndex}
            style={{
              paddingTop: '8px',
              paddingBottom: '8px',
            }}
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
                  {day.total}
                </Button>
              </div>
            }
          >
            {day.transactions.map((transaction, transactionIndex) => (
              <Cell
                key={transactionIndex}
                before={<TransactionCircle emoji={transaction.emoji} color={transaction.color} />}
                subtitle={
                  <Subheadline level="2" weight="3" style={{ color: 'var(--tgui--subtitle_text_color)' }}>
                    {transaction.time}
                  </Subheadline>
                }
                after={
                  <div style={{ textAlign: 'right' }}>
                    <Text weight="1" style={{ color: 'var(--tgui--text_color)', display: 'block' }}>
                      {transaction.amount}
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
      </div>
    </div>
  );
};

export default HomePage;

