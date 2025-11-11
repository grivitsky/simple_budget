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
import EditorPage from './pages/EditorPage';
import { getOrCreateUser } from './lib/userService';
import type { User } from './lib/supabase';

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
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    // Initialize Telegram Web App and authenticate user
    const initializeApp = async () => {
      const tg = window.Telegram?.WebApp;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (tg) {
        tg.ready();
        tg.expand();
        
        // Set Telegram interface colors to match app background
        tg.setHeaderColor('secondary_bg_color');
        tg.setBackgroundColor(tg.themeParams.secondary_bg_color || '#efeff3');

        // Authenticate user
        const telegramUser = tg.initDataUnsafe?.user;
        if (telegramUser) {
          if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
            return;
          }

          const userData = await getOrCreateUser(telegramUser);
          if (userData) {
            setUser(userData);
          } else {
            console.error('Failed to authenticate user. See Supabase logs for details.');
          }
        } else {
          console.warn('No Telegram user data available. The app might not be running inside Telegram.');
        }
      } else {
        console.error('Telegram WebApp object not found. Are you running inside Telegram?');
      }
      setIsAuthenticating(false);
    };

    initializeApp();
  }, []);

  const CurrentPage = tabs.find(tab => tab.id === currentTab)?.Component || HomePage;

  // Show loading state while authenticating
  if (isAuthenticating) {
    return (
      <AppRoot>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--tgui--secondary_bg_color)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p>Loading...</p>
          </div>
        </div>
      </AppRoot>
    );
  }

  if (!user) {
    return (
      <AppRoot>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--tgui--secondary_bg_color)',
          padding: '24px',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--tgui--text_color)', marginBottom: '8px' }}>
            We could not verify your account automatically.
          </p>
          <p style={{ color: 'var(--tgui--hint_color)', fontSize: '13px' }}>
            Please make sure you open the app inside Telegram and configure Supabase credentials.
          </p>
        </div>
      </AppRoot>
    );
  }

  // If editor is open, show EditorPage and hide Tabbar
  if (isEditorOpen) {
    return (
      <AppRoot /* platform="ios" - Uncomment for development iOS testing */>
        <div className="page-container">
          <EditorPage onClose={() => setIsEditorOpen(false)} />
        </div>
      </AppRoot>
    );
  }

  return (
    <AppRoot /* platform="ios" - Uncomment for development iOS testing */>
      <div className="page-container">
        <CurrentPage onOpenEditor={() => setIsEditorOpen(true)} user={user} />
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

