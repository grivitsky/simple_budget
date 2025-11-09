import { LargeTitle } from '../../src/components/Typography/LargeTitle/LargeTitle';
import { Text } from '../../src/components/Typography/Text/Text';
import { Placeholder } from '../../src/components/Blocks/Placeholder/Placeholder';

const HomePage = () => {
  return (
    <div style={{ 
      backgroundColor: 'var(--tgui--secondary_bg_color)',
      minHeight: '100vh',
    }}>
      <div className="page-content">
        <LargeTitle weight="1" style={{ marginBottom: '16px' }}>
          Welcome Home
        </LargeTitle>
        <Placeholder
          header="Budget Tracker"
          description="Track your expenses and income easily with this Telegram mini app"
        >
          <img
            alt="Welcome illustration"
            src="https://xelene.me/telegram.gif"
            style={{ display: 'block', width: '144px', height: '144px' }}
          />
        </Placeholder>
        <Text style={{ marginTop: '20px' }}>
          Select a tab below to get started with managing your budget.
        </Text>
      </div>
    </div>
  );
};

export default HomePage;

