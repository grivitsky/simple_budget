import { useState } from 'react';
import { Button } from '../../src/components/Blocks/Button/Button';
import { TabsList } from '../../src/components/Navigation/TabsList/TabsList';
import { Section } from '../../src/components/Blocks/Section/Section';
import { Icon24Guard } from '../../src/icons/24/guard';

const StatsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  return (
    <div style={{ 
      backgroundColor: 'var(--tgui--secondary_bg_color)',
      minHeight: '100vh',
      padding: '16px',
    }}>
      {/* 1. Analyze Button */}
      <Button
        mode="bezeled"
        size="l"
        stretched
        before={<Icon24Guard />}
        style={{ marginBottom: '20px' }}
      >
        Analyze
      </Button>

      {/* 2. Period Tabs */}
      <TabsList style={{ marginBottom: '20px' }}>
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

      {/* 3. Category Section with Custom Header */}
      <Section
        header={
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 8px 8px 8px',
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
                padding: 0,
              }}
            >
              10 Categories
            </Button>
          </div>
        }
      >
        {/* Content will be added later */}
      </Section>
    </div>
  );
};

export default StatsPage;
