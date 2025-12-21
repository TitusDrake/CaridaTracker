import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useAuth } from './AuthContext';

// Theme names
export type ThemeName = 'lightSide' | 'darkSide' | 'bountyHunter';

const THEME_STORAGE_KEY = '@CaridaTracker:theme';
const getThemeStorageKey = (userId?: number) => 
  userId ? `@CaridaTracker:theme:${userId}` : THEME_STORAGE_KEY;

// Star Wars themed color schemes
const themeColors = {
  // Light Side - White background, Blue accents (Jedi/Rebels)
  lightSide: {
    primary: '#007AFF',       // Bright blue
    primaryDark: '#0056B3',   // Darker blue for pressed states
    accent: '#5AC8FA',        // Light blue accent
    background: '#FFFFFF',    // White
    surface: '#F5F5F5',       // Light gray surface
    text: '#1C1C1E',          // Dark text
    textSecondary: '#6B6B6B', // Secondary text
    error: '#FF3B30',         // Red for errors
    success: '#34C759',       // Green for success
    border: '#E5E5EA',        // Light border
    isDark: false,
  },
  // Dark Side - Black background, Red accents (Sith/Empire)
  darkSide: {
    primary: '#FF3B30',       // Imperial red
    primaryDark: '#CC2F26',   // Darker red
    accent: '#FF6961',        // Light red accent
    background: '#000000',    // Black
    surface: '#1C1C1E',       // Dark gray surface
    text: '#FFFFFF',          // White text
    textSecondary: '#8E8E93', // Secondary text
    error: '#FF453A',         // Bright red for errors
    success: '#32D74B',       // Green for success
    border: '#38383A',        // Dark border
    isDark: true,
  },
  // Bounty Hunter - Gray background, Green accents (Mandalorians/Bounty Hunters)
  bountyHunter: {
    primary: '#228B22',       // Forest green (Boba Fett green)
    primaryDark: '#1A6B1A',   // Darker green
    accent: '#90EE90',        // Light green accent
    background: '#E8E8E8',    // Light gray
    surface: '#D3D3D3',       // Medium gray surface
    text: '#2C2C2E',          // Dark text
    textSecondary: '#5C5C5E', // Secondary text
    error: '#FF3B30',         // Red for errors
    success: '#228B22',       // Green for success (matches primary)
    border: '#B0B0B0',        // Gray border
    isDark: false,
  },
};

// Theme display names
export const themeDisplayNames: Record<ThemeName, string> = {
  lightSide: 'Light Side',
  darkSide: 'Dark Side',
  bountyHunter: 'Bounty Hunter',
};

// Get Paper theme for a given theme name
export const getPaperTheme = (themeName: ThemeName) => {
  const colors = themeColors[themeName];
  const baseTheme = colors.isDark ? MD3DarkTheme : MD3LightTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      onPrimary: colors.isDark ? '#FFFFFF' : '#FFFFFF',
      primaryContainer: colors.primaryDark,
      secondary: colors.accent,
      background: colors.background,
      surface: colors.surface,
      surfaceVariant: colors.surface,
      error: colors.error,
      onBackground: colors.text,
      onSurface: colors.text,
      outline: colors.border,
    },
  };
};

// Get Navigation theme for a given theme name
export const getNavigationTheme = (themeName: ThemeName) => {
  const colors = themeColors[themeName];
  const baseTheme = colors.isDark ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };
};

// Get raw colors for custom styling
export const getThemeColors = (themeName: ThemeName) => themeColors[themeName];

// Context type
interface ThemeContextType {
  themeName: ThemeName;
  colors: typeof themeColors.lightSide;
  setTheme: (theme: ThemeName) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('lightSide');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load saved theme when user changes or on mount
  useEffect(() => {
    loadTheme();
  }, [user?.id]);

  const loadTheme = async () => {
    try {
      setIsLoading(true);
      const storageKey = getThemeStorageKey(user?.id);
      const savedTheme = await AsyncStorage.getItem(storageKey);
      
      if (savedTheme && (savedTheme === 'lightSide' || savedTheme === 'darkSide' || savedTheme === 'bountyHunter')) {
        setThemeName(savedTheme as ThemeName);
      } else if (!user) {
        // If no user and no saved theme, try loading the global theme as fallback
        const globalTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (globalTheme && (globalTheme === 'lightSide' || globalTheme === 'darkSide' || globalTheme === 'bountyHunter')) {
          setThemeName(globalTheme as ThemeName);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (theme: ThemeName) => {
    try {
      const storageKey = getThemeStorageKey(user?.id);
      await AsyncStorage.setItem(storageKey, theme);
      
      // Also save to global key if no user (for guest/pre-login state)
      if (!user) {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      }
      
      setThemeName(theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const value: ThemeContextType = {
    themeName,
    colors: themeColors[themeName],
    setTheme,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
