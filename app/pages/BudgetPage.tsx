import { LargeTitle } from '../../src/components/Typography/LargeTitle/LargeTitle';
import { Text } from '../../src/components/Typography/Text/Text';
import { Card } from '../../src/components/Blocks/Card/Card';

const BudgetPage = () => {
  return (
    <div className="page-content">
      <LargeTitle weight="1" style={{ marginBottom: '20px' }}>
        Budget
      </LargeTitle>
      <Card style={{ marginBottom: '16px', padding: '16px' }}>
        <Text weight="2" style={{ marginBottom: '8px' }}>Monthly Budget</Text>
        <Text>Set and track your monthly budget here</Text>
      </Card>
      <Card style={{ padding: '16px' }}>
        <Text weight="2" style={{ marginBottom: '8px' }}>Recent Transactions</Text>
        <Text>Your recent transactions will appear here</Text>
      </Card>
    </div>
  );
};

export default BudgetPage;

