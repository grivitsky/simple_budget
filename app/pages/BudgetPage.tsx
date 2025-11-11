import { Title } from '../../src/components/Typography/Title/Title';
import { Button } from '../../src/components/Blocks/Button/Button';
import { Card } from '../../src/components/Blocks/Card/Card';
import { Subheadline } from '../../src/components/Typography/Subheadline/Subheadline';

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
        <Title level="3" weight="1" style={{ color: 'var(--tgui--text_color)' }}>
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
            padding: '0px 0px 0px 6px',
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
    </div>
  );
};

export default BudgetPage;
