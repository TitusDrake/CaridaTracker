import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme, ThemeName } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </AuthProvider>
);

describe('ThemeContext', () => {
  it('provides default theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.themeName).toBeDefined();
    expect(result.current.colors).toBeDefined();
    expect(result.current.setTheme).toBeDefined();
  });

  it('allows changing theme', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    await act(async () => {
      await result.current.setTheme('darkSide');
    });

    expect(result.current.themeName).toBe('darkSide');
  });

  it('provides theme colors', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.colors).toHaveProperty('background');
    expect(result.current.colors).toHaveProperty('text');
    expect(result.current.colors).toHaveProperty('primary');
  });
});



