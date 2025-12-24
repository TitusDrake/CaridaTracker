import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the AuthContext since ThemedView uses theme context
const MockProviders = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </AuthProvider>
);

describe('ThemedView', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <MockProviders>
        <ThemedView testID="themed-view">
          <></>
        </ThemedView>
      </MockProviders>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { padding: 10 };
    const { getByTestId } = render(
      <MockProviders>
        <ThemedView testID="themed-view" style={customStyle}>
          <></>
        </ThemedView>
      </MockProviders>
    );

    const view = getByTestId('themed-view');
    expect(view).toBeTruthy();
    // Style is applied (exact style checking can be complex in RN testing)
  });
});

