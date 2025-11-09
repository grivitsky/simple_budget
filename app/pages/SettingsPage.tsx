import { LargeTitle } from '../../src/components/Typography/LargeTitle/LargeTitle';
import { Text } from '../../src/components/Typography/Text/Text';
import { List } from '../../src/components/Blocks/List/List';
import { Cell } from '../../src/components/Blocks/Cell/Cell';

const SettingsPage = () => {
  return (
    <div className="page-content">
      <LargeTitle weight="1" style={{ marginBottom: '20px' }}>
        Settings
      </LargeTitle>
      <List>
        <Cell
          subtitle="Configure your budget preferences"
        >
          Budget Settings
        </Cell>
        <Cell
          subtitle="Choose your preferred currency"
        >
          Currency
        </Cell>
        <Cell
          subtitle="Set up notifications"
        >
          Notifications
        </Cell>
        <Cell
          subtitle="Manage your account"
        >
          Account
        </Cell>
      </List>
    </div>
  );
};

export default SettingsPage;

