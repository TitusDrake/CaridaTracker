import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, RegisterData, storeAuthData, clearAuthData, getToken, getStoredUser, ApiError } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      if (token) {
        // Try to get user from storage first
        const storedUser = await getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Verify token is still valid by calling /me endpoint
        try {
          const currentUser = await authApi.me();
          setUser(currentUser);
        } catch {
          // Token is invalid, clear auth data
          await clearAuthData();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const response = await authApi.login(emailOrUsername, password);
      await storeAuthData(response.token, response.user);
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errors && apiError.errors.length > 0) {
        throw new Error(apiError.errors[0].msg);
      }
      throw new Error(apiError.error || 'Login failed. Please try again.');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      await storeAuthData(response.token, response.user);
      setUser(response.user);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errors && apiError.errors.length > 0) {
        throw new Error(apiError.errors[0].msg);
      }
      throw new Error(apiError.error || 'Registration failed. Please try again.');
    }
  };

  const logout = async () => {
    await clearAuthData();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
