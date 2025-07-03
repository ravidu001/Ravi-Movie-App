import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  UserSession,
  getCurrentUser,
  getUserSessions,
  isAuthenticated,
  refreshAuth,
  signOut
} from '@/services/auth';

interface SessionContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  sessions: UserSession[];
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loadSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<UserSession[]>([]);

  // Initialize session check when provider mounts
  useEffect(() => {
    initializeSession();
    
    // Set up periodic session validation (every 5 minutes)
    const interval = setInterval(() => {
      validateCurrentSession();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Initializing session...');

      const authenticated = await isAuthenticated();
      
      if (authenticated) {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          setIsLoggedIn(true);
          await loadUserSessions();
          console.log('✅ Session initialized for user:', userData.email);
        } else {
          console.log('⚠️ No user data found, logging out');
          await performLogout();
        }
      } else {
        console.log('❌ No valid session found');
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('❌ Error initializing session:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCurrentSession = async () => {
    try {
      if (!isLoggedIn) return;

      const authenticated = await isAuthenticated();
      if (!authenticated) {
        console.log('⚠️ Session validation failed, logging out');
        await performLogout();
      }
    } catch (error) {
      console.error('❌ Error validating session:', error);
      await performLogout();
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    loadUserSessions();
    console.log('✅ User logged in:', userData.email);
  };

  const performLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLoggedIn(false);
      setSessions([]);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Force logout even if server call fails
      setUser(null);
      setIsLoggedIn(false);
      setSessions([]);
    }
  };

  const refreshSession = async () => {
    try {
      console.log('🔄 Refreshing session...');
      const result = await refreshAuth();
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsLoggedIn(true);
        await loadUserSessions();
        console.log('✅ Session refreshed successfully');
      } else {
        console.log('❌ Session refresh failed');
        await performLogout();
      }
    } catch (error) {
      console.error('❌ Error refreshing session:', error);
      await performLogout();
    }
  };

  const loadUserSessions = async () => {
    try {
      const userSessions = await getUserSessions();
      setSessions(userSessions);
      console.log('✅ Loaded user sessions:', userSessions.length);
    } catch (error) {
      console.error('❌ Error loading sessions:', error);
      setSessions([]);
    }
  };

  const contextValue: SessionContextType = {
    user,
    isLoggedIn,
    isLoading,
    sessions,
    login,
    logout: performLogout,
    refreshSession,
    loadSessions: loadUserSessions,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};