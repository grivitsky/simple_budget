import { useState } from 'react';
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

const currencies = [
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'EUR', name: 'Euro' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'BGN', name: 'Bulgarian Lev' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
];

const SettingsPage = () => {
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('PLN');
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
                  onClick={() => setSelectedCurrency(currency.code)}
                  style={{
                    paddingTop: '14px',
                    paddingBottom: '14px',
                  }}
                  before={
                    <div style={{ display: 'flex', gap: '16px' }}>
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
                      <Text 
                        weight="3"
                        style={{ color: 'var(--tgui--text_color)' }}
                      >
                        {currency.name}
                      </Text>
                    </div>
                  }
                  after={
                    <Selectable
                      name="currency"
                      value={currency.code}
                      checked={selectedCurrency === currency.code}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
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

