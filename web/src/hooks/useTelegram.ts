import { useEffect, useState } from 'react';

interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
  };
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

// Mock Telegram WebApp for local development
const createMockTelegramWebApp = (): TelegramWebApp => {
  // Create a simple mock that matches the TelegramWebApp interface
  return {
    initData: 'mock_init_data',
    initDataUnsafe: {
      query_id: 'mock_query_id',
      user: {
        id: 104, // Mock Telegram user ID 100
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'en',
        is_premium: false
      },
      auth_date: String(Math.floor(new Date().getTime() / 1000)),
      hash: 'mock_hash'
    },
    colorScheme: 'light',
    themeParams: {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#2481cc',
      button_color: '#2481cc',
      button_text_color: '#ffffff'
    },
    isExpanded: false,
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
    headerColor: '#ffffff',
    backgroundColor: '#ffffff',
    ready: () => console.log('WebApp ready called'),
    expand: () => console.log('WebApp expand called'),
    close: () => console.log('WebApp close called')
  };
};

export const useTelegram = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if running in development mode
    const isDev = process.env.NODE_ENV === 'development';
    console.log("isDev", isDev)
    // Get actual Telegram WebApp or create a mock if in development
    // const tg = window.Telegram?.WebApp || (isDev ? createMockTelegramWebApp() : null);
    const tg = createMockTelegramWebApp();

    if (tg) {
      setWebApp(tg);
      setUser(tg.initDataUnsafe.user || null);
      
      tg.ready();
      setIsReady(true);
    }
  }, []);

  return {
    telegramUser: user,
    webApp,
    isReady
  };
};
