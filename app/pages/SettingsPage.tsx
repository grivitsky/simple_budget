import { useState } from 'react';
import { Avatar } from '../../src/components/Blocks/Avatar/Avatar';
import { Headline } from '../../src/components/Typography/Headline/Headline';
import { Caption } from '../../src/components/Typography/Caption/Caption';
import { List } from '../../src/components/Blocks/List/List';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { IconContainer } from '../../src/components/Blocks/IconContainer/IconContainer';
import { Icon24Notifications } from '../../src/icons/24/notifications';
import { Icon16Chevron } from '../../src/icons/16/chevron';
import { Modal } from '../../src/components/Overlays/Modal/Modal';

const SettingsPage = () => {
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  return (
    <div style={{ 
      backgroundColor: 'var(--tgui--secondary_bg_color)',
      minHeight: '100vh',
    }}>
      {/* User Profile Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '40px',
        paddingBottom: '20px',
        paddingLeft: '44px',
        paddingRight: '44px',
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
        padding: '12px 16px',
      }}>
        <List style={{ 
          backgroundColor: 'var(--tgui--bg_color)',
          borderRadius: '12px',
          padding: '0',
        }}>
          <Cell
            onClick={() => setIsCurrencyModalOpen(true)}
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

      {/* Currency Modal */}
      <Modal
        open={isCurrencyModalOpen}
        onOpenChange={setIsCurrencyModalOpen}
        header={<Modal.Header>Default Currency</Modal.Header>}
      >
        <div style={{ padding: '20px' }}>
          {/* Currency selection content will go here */}
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;

