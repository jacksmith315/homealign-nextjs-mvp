import { LoginCredentials, User } from '@/types';

export interface SessionInfo {
  isAuthenticated: boolean;
  selectedDb: string;
  hasTokens: {
    access: boolean;
    refresh: boolean;
  };
  user?: User;
}

export class AuthService {
  private baseUrl = '/api/auth';

  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  async getUserInfo(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      }

      return null;
    } catch (error) {
      console.error('Get user info error:', error);
      return null;
    }
  }

  async getSession(): Promise<SessionInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/session`, {
        credentials: 'include',
      });

      if (response.ok) {
        return await response.json();
      }

      return {
        isAuthenticated: false,
        selectedDb: 'allyalign',
        hasTokens: {
          access: false,
          refresh: false,
        },
      };
    } catch (error) {
      console.error('Session check error:', error);
      return {
        isAuthenticated: false,
        selectedDb: 'allyalign',
        hasTokens: {
          access: false,
          refresh: false,
        },
      };
    }
  }

  async setSelectedDatabase(database: string): Promise<boolean> {
    try {
      const response = await fetch('/api/data/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedDb: database }),
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Database selection error:', error);
      return false;
    }
  }

  async getSelectedDatabase(): Promise<string> {
    try {
      const response = await fetch('/api/data/database', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.selectedDb || 'allyalign';
      }

      return 'allyalign';
    } catch (error) {
      console.error('Get database error:', error);
      return 'allyalign';
    }
  }
}

export const authService = new AuthService();