'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials } from '@/types';
import { authService } from '@/lib/services';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedDb: string;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  setSelectedDb: (db: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDb, setSelectedDbState] = useState('allyalign');

  // Check session on mount and periodically
  useEffect(() => {
    checkSession();
    
    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkSession = async () => {
    try {
      const sessionInfo = await authService.getSession();
      
      setIsAuthenticated(sessionInfo.isAuthenticated);
      setSelectedDbState(sessionInfo.selectedDb || 'allyalign');
      
      if (sessionInfo.isAuthenticated) {
        // Get user information when authenticated
        const userInfo = await authService.getUserInfo();
        setUser(userInfo);
        
        if (!sessionInfo.hasTokens.access) {
          // Try to refresh token if authenticated but no access token
          await refreshToken();
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const success = await authService.refreshToken();
      
      if (success) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const success = await authService.login(credentials);

      if (success) {
        setIsAuthenticated(true);
        // Get user info after successful login
        const userInfo = await authService.getUserInfo();
        setUser(userInfo);
        await checkSession(); // Refresh session data
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setSelectedDbState('allyalign');
    }
  };

  const setSelectedDb = async (db: string): Promise<void> => {
    try {
      const success = await authService.setSelectedDatabase(db);

      if (success) {
        setSelectedDbState(db);
      } else {
        console.error('Failed to set database');
      }
    } catch (error) {
      console.error('Database selection error:', error);
    }
  };

  const refreshSession = async (): Promise<void> => {
    await checkSession();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    selectedDb,
    login,
    logout,
    setSelectedDb,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}