import { useState, useEffect } from 'react';
import { AppRoot } from '../src/components/Service/AppRoot/AppRoot';
import { Tabbar } from '../src/components/Layout/Tabbar/Tabbar';
import { Icon28Addhome } from '../src/icons/28/addhome';
import { Icon28Archive } from '../src/icons/28/archive';
import { Icon28Stats } from '../src/icons/28/stats';
import { Icon28BotMenu } from '../src/icons/28/bot_menu';

import HomePage from './pages/HomePage';
import BudgetPage from './pages/BudgetPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

/**
 * Platform Detection System
 * ========================
 * 
 * This app automatically detects and applies iOS-specific styling when running on iOS/macOS devices.
 * 
 * How it works:
 * 1. AppRoot component reads window.Telegram.WebApp.platform on initialization
 * 2. When platform is 'ios' or 'macos', all UI Kit components automatically use iOS styling
 * 3. Components use the usePlatform() hook internally to adapt their appearance
 * 
 * Components with iOS-specific styling:
 * - Cell, Button, Tabbar, TabsList, Section, and many others
 * 
 * Development Override:
 * To test iOS styling in development without an iOS device, you can force the platform:
 * 
 * <AppRoot platform="ios">
 *   ...
 * </AppRoot>
 * 
 * Or leave it empty for automatic detection:
 * <AppRoot>
 *   ...
 * </AppRoot>
 * 
 * Note: Platform detection happens automatically via Telegram WebApp API.
 * No manual configuration is needed in production.
 */

type TabId = 'home' | 'budget' | 'stats' | 'settings';

const tabs = [
  {
    id: 'home' as TabId,
    Icon: Icon28Addhome,
    text: 'Home',
    Component: HomePage,
  },
  {
    id: 'budget' as TabId,
    Icon: Icon28Archive,
    text: 'Organize',
    Component: BudgetPage,
  },
  {
    id: 'stats' as TabId,
    Icon: Icon28Stats,
    text: 'Stats',
    Component: StatsPage,
  },
  {
    id: 'settings' as TabId,
    Icon: Icon28BotMenu,
    text: 'Settings',
    Component: SettingsPage,
  },
];

function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('home');

  useEffect(() => {
    // Initialize Telegram Web App
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Set Telegram interface colors to match app background
      tg.setHeaderColor('secondary_bg_color');
      tg.setBackgroundColor(tg.themeParams.secondary_bg_color || '#efeff3');
    }
  }, []);

  const CurrentPage = tabs.find(tab => tab.id === currentTab)?.Component || HomePage;

  return (
    <AppRoot /* platform="ios" - Uncomment for development iOS testing */>
      <div className="page-container">
        <CurrentPage />
      </div>
      <Tabbar>
        {tabs.map(({ id, text, Icon }) => (
          <Tabbar.Item
            key={id}
            text={text}
            selected={id === currentTab}
            onClick={() => setCurrentTab(id)}
          >
            <Icon />
          </Tabbar.Item>
        ))}
      </Tabbar>
    </AppRoot>
  );
}

export default App;

