import { useState, useEffect } from 'react';
import { Avatar } from '../../src/components/Blocks/Avatar/Avatar';
import { Headline } from '../../src/components/Typography/Headline/Headline';
import { Caption } from '../../src/components/Typography/Caption/Caption';
import { List } from '../../src/components/Blocks/List/List';
import { Cell } from '../../src/components/Blocks/Cell/Cell';
import { IconContainer } from '../../src/components/Blocks/IconContainer/IconContainer';
import { Icon32CurrencyColoredSquare } from '../../src/icons/32/currency_colored_square';
import { Icon16Chevron } from '../../src/icons/16/chevron';
import { Modal } from '../../src/components/Overlays/Modal/Modal';
import { Divider } from '../../src/components/Misc/Divider/Divider';
import { Selectable } from '../../src/components/Form/Selectable/Selectable';
import { Text } from '../../src/components/Typography/Text/Text';
import { getAllCurrencies, type Currency } from '../lib/currencyService';
import { updateUserSettings } from '../lib/userService';
import type { User } from '../lib/supabase';

interface SettingsPageProps {
  user?: User | null;
}

const SettingsPage = ({ user }: SettingsPageProps) => {
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.default_currency || 'USD');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load currencies from database
  useEffect(() => {
    const loadCurrencies = async () => {
      const data = await getAllCurrencies();
      setCurrencies(data);
    };
    loadCurrencies();
  }, []);

  // Update selected currency when user data changes
  useEffect(() => {
    if (user?.default_currency) {
      setSelectedCurrency(user.default_currency);
    }
  }, [user]);

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.first_name?.[0] || '';
    const lastInitial = user.last_name?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  };

  // Get user's display name
  const getUserName = () => {
    if (!user) return 'User';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  };

  // Handle currency selection
  const handleCurrencySelect = async (currencyCode: string) => {
    if (!user) return;
    
    setIsUpdating(true);
    setSelectedCurrency(currencyCode);
    
    // Update in database
    const result = await updateUserSettings(user.telegram_id, {
      default_currency: currencyCode,
    });
    
    if (result) {
      console.log('✅ Currency updated successfully');
      // Close modal after short delay
      setTimeout(() => {
        setIsCurrencyModalOpen(false);
        setIsUpdating(false);
      }, 300);
    } else {
      console.error('❌ Failed to update currency');
      setIsUpdating(false);
    }
  };
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
          src={user?.photo_url || undefined}
          acronym={getUserInitials()}
        />
        <Headline 
          weight="2" 
          style={{ 
            marginTop: '16px',
            color: 'var(--tgui--text_color)',
          }}
        >
          {getUserName()}
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
        <List style={{ padding: '0' }}>
          <Cell
            onClick={() => setIsCurrencyModalOpen(true)}
            style={{
              backgroundColor: 'var(--tgui--bg_color)',
              borderRadius: '12px',
              padding: '4px 16px',
            }}
              before={
                <IconContainer style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon32CurrencyColoredSquare />
                </IconContainer>
              }
            after={
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                color: 'var(--tgui--hint_color)',
              }}>
                <span>{selectedCurrency}</span>
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
        <div style={{ padding: '16px 16px 32px 16px' }}>
          <div style={{
            backgroundColor: 'var(--tgui--secondary_bg_color)',
            borderRadius: '12px',
          }}>
            {currencies.map((currency, index) => (
              <div key={currency.code}>
                <Cell
                  onClick={() => handleCurrencySelect(currency.code)}
                  disabled={isUpdating}
                  style={{
                    paddingTop: '14px',
                    paddingBottom: '14px',
                  }}
                  before={
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <Text 
                        weight="3"
                        style={{ 
                          color: 'var(--tgui--hint_color)',
                          width: '36px',
                          flexShrink: 0,
                        }}
                      >
                        {currency.code}
                      </Text>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <Text 
                          weight="3"
                          style={{ color: 'var(--tgui--text_color)' }}
                        >
                          {currency.name}
                        </Text>
                      </div>
                    </div>
                  }
                  after={
                    <Selectable
                      name="currency"
                      value={currency.code}
                      checked={selectedCurrency === currency.code}
                      onChange={() => {}} // Handled by onClick
                      disabled={isUpdating}
                    />
                  }
                >
                  {null}
                </Cell>
                {index < currencies.length - 1 && (
                  <Divider style={{ 
                    borderColor: 'var(--tgui--divider)',
                    marginLeft: '16px',
                    marginRight: '16px',
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;

