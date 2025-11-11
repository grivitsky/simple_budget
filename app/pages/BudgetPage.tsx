import { Title } from '../../src/components/Typography/Title/Title';
import { Button } from '../../src/components/Blocks/Button/Button';
import { Card } from '../../src/components/Blocks/Card/Card';
import { Subheadline } from '../../src/components/Typography/Subheadline/Subheadline';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { Text } from '../../src/components/Typography/Text/Text';
import { Section } from '../../src/components/Blocks/Section/Section';

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
        }
      >
        <Cell
          before={
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#61B5F7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>
              🍔
            </div>
          }
        >
          <Text weight="3" style={{ color: '#2E9DF4' }}>
            Eating out
          </Text>
        </Cell>
      </Section>
    </div>
  );
};

export default BudgetPage;
