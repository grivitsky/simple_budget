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
          <span style={{
            fontFamily: '"SF Pro Rounded", "SF Rounded", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '-0.4px',
            color: 'var(--tgui--hint_color)',
            lineHeight: '1',
            padding: '0px 0px 0px 4px',
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
        <Section
          header={
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0px',
            }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 400,
                textTransform: 'uppercase',
                color: 'var(--tgui--section_header_text_color)',
                letterSpacing: '-0.08px',
              }}>
                Tue, 4 NOV
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
                -100.88 PLN
              </Button>
            </div>
          }
        >
          <Cell
            before={<TransactionCircle emoji="🍔" color="#61B5F7" />}
            subtitle={
              <Subheadline level="2" weight="3" style={{ color: 'var(--tgui--subtitle_text_color)' }}>
                12:00 AM
              </Subheadline>
            }
            after={
              <div style={{ textAlign: 'right' }}>
                <Text weight="1" style={{ color: 'var(--tgui--text_color)', display: 'block' }}>
                  -30,32 PLN
                </Text>
                <Subheadline level="2" weight="3" style={{ color: 'var(--tgui--subtitle_text_color)' }}>
                  Spent
                </Subheadline>
              </div>
            }
          >
            <Text weight="3">McDonalds</Text>
          </Cell>
        </Section>
      </div>
    </div>
  );
};

export default HomePage;

