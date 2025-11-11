import { useState, useEffect, useCallback } from 'react';
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
  const [authDebug, setAuthDebug] = useState<string[]>([]);

  const addDebug = useCallback((message: string) => {
    setAuthDebug(prev => [...prev, `${new Date().toLocaleTimeString()} — ${message}`]);
  }, []);

  useEffect(() => {
    // Initialize Telegram Web App and authenticate user
    const initializeApp = async () => {
      const tg = window.Telegram?.WebApp;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        addDebug('❌ Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      } else {
        addDebug('✅ Supabase environment variables detected.');
      }

      if (tg) {
        addDebug('ℹ️ Telegram WebApp object detected. Initializing...');
        tg.ready();
        tg.expand();
        
        // Set Telegram interface colors to match app background
        tg.setHeaderColor('secondary_bg_color');
        tg.setBackgroundColor(tg.themeParams.secondary_bg_color || '#efeff3');

        // Authenticate user
        const telegramUser = tg.initDataUnsafe?.user;
        if (telegramUser) {
          addDebug(`👤 Telegram user received: id=${telegramUser.id}, username=${telegramUser.username || 'n/a'}`);
          const userData = await getOrCreateUser(telegramUser);
          if (userData) {
            setUser(userData);
            addDebug(`✅ User authenticated (telegram_id=${userData.telegram_id}).`);
          } else {
            addDebug('❌ Failed to authenticate user. See Supabase logs for details.');
          }
        } else {
          addDebug('⚠️ No Telegram user data available. The app might not be running inside Telegram.');
        }
      } else {
        addDebug('❌ Telegram WebApp object not found. Are you running inside Telegram?');
      }
      setIsAuthenticating(false);
    };

    initializeApp();
  }, [addDebug]);

  const CurrentPage = tabs.find(tab => tab.id === currentTab)?.Component || HomePage;

  const DebugPanel = (
    authDebug.length > 0 && (
      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: '#fff',
        padding: '12px',
        borderRadius: '12px',
        maxHeight: '40vh',
        overflowY: 'auto',
        fontSize: '12px',
      }}>
        <details open>
          <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>Connection Status</summary>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {authDebug.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </details>
      </div>
    )
  );

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
            <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--tgui--hint_color)' }}>
              Please wait while we connect to Supabase and Telegram.
            </p>
          </div>
        </div>
        {DebugPanel}
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
          <div>
            <p style={{ color: 'var(--tgui--text_color)', marginBottom: '8px' }}>
              We could not verify your account automatically.
            </p>
            <p style={{ color: 'var(--tgui--hint_color)', fontSize: '13px' }}>
              Please review the status panel below and ensure the app is opened inside Telegram with Supabase configured.
            </p>
          </div>
        </div>
        {DebugPanel}
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
        {DebugPanel}
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
      {DebugPanel}
    </AppRoot>
  );
}

export default App;

