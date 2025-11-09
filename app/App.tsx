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
    text: 'Budget',
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
    <AppRoot>
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

