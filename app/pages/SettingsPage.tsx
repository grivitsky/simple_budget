import { Avatar } from '../../src/components/Blocks/Avatar/Avatar';
import { Headline } from '../../src/components/Typography/Headline/Headline';
import { Caption } from '../../src/components/Typography/Caption/Caption';
import { List } from '../../src/components/Blocks/List/List';
import { Cell } from '../../src/components/Blocks/Cell/Cell';

const SettingsPage = () => {
  return (
    <div className="page-content">
      {/* User Profile Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '20px',
        marginLeft: '44px',
        marginRight: '44px',
      }}>
        <Avatar
          size={96}
          acronym="NS"
        />
        <Headline 
          weight="2" 
          style={{ 
            marginTop: '16px',
            color: 'var(--tgui--text_color)',
          }}
        >
          Name Surname
        </Headline>
        <Caption 
          level="1"
          style={{ 
            marginTop: '4px',
            color: 'var(--tgui--hint_color)',
          }}
        >
          Settings
        </Caption>
      </div>

      {/* Settings List */}
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

