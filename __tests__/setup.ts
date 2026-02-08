// Jest setup file for React Native/Expo tests
import '@testing-library/jest-native/extend-expect';

// Mock Expo's import.meta registry (needed for SDK 54+)
// @ts-expect-error - This is needed for Expo SDK 54's winter runtime
globalThis.__ExpoImportMetaRegistry = {
  get: () => ({}),
  set: () => {},
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  usePathname: () => '/',
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
  Tabs: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TextInput, TouchableOpacity } = require('react-native');

  return {
    PaperProvider: ({ children }: { children: React.ReactNode }) => children,
    MD3DarkTheme: { colors: {} },
    MD3LightTheme: { colors: {} },
    Button: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) =>
      React.createElement(TouchableOpacity, { onPress },
        React.createElement(Text, null, children)),
    TextInput: (props: any) => React.createElement(TextInput, props),
    Surface: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    Text: ({ children }: { children: React.ReactNode }) =>
      React.createElement(Text, null, children),
    Card: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    SegmentedButtons: () => null,
    Searchbar: () => null,
    List: {
      Item: () => null,
    },
  };
});

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};


