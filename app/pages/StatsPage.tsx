import { LargeTitle } from '../../src/components/Typography/LargeTitle/LargeTitle';
import { Text } from '../../src/components/Typography/Text/Text';
import { Card } from '../../src/components/Blocks/Card/Card';

const StatsPage = () => {
  return (
    <div style={{ 
      backgroundColor: 'var(--tgui--secondary_bg_color)',
      minHeight: '100vh',
    }}>
      <div className="page-content">
        <LargeTitle weight="1" style={{ marginBottom: '20px' }}>
          Statistics
        </LargeTitle>
        <Card style={{ marginBottom: '16px', padding: '16px' }}>
          <Text weight="2" style={{ marginBottom: '8px' }}>Spending Overview</Text>
          <Text>View your spending patterns and trends</Text>
        </Card>
        <Card style={{ marginBottom: '16px', padding: '16px' }}>
          <Text weight="2" style={{ marginBottom: '8px' }}>Category Breakdown</Text>
          <Text>See where your money goes by category</Text>
        </Card>
        <Card style={{ padding: '16px' }}>
          <Text weight="2" style={{ marginBottom: '8px' }}>Monthly Comparison</Text>
          <Text>Compare your spending across months</Text>
        </Card>
      </div>
    </div>
  );
};

export default StatsPage;

