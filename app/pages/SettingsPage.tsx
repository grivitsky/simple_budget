import { Avatar } from '../../src/components/Blocks/Avatar/Avatar';
import { Headline } from '../../src/components/Typography/Headline/Headline';
import { Caption } from '../../src/components/Typography/Caption/Caption';
import { List } from '../../src/components/Blocks/List/List';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { IconContainer } from '../../src/components/Blocks/IconContainer/IconContainer';
import { Icon24Notifications } from '../../src/icons/24/notifications';
import { Icon16Chevron } from '../../src/icons/16/chevron';

const SettingsPage = () => {
  return (
    <div style={{ 
      backgroundColor: 'var(--tgui--secondary_bg_color)',
      minHeight: '100vh',
    }}>
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
        <div style={{
          marginTop: '12px',
          marginBottom: '12px',
          marginLeft: '16px',
          marginRight: '16px',
        }}>
          <List>
            <Cell
              before={
                <IconContainer>
                  <Icon24Notifications />
                </IconContainer>
              }
              after={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  color: 'var(--tgui--hint_color)',
                }}>
                  <span>PLN</span>
                  <Icon16Chevron />
                </div>
              }
            >
              Currency
            </Cell>
          </List>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

