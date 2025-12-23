import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme, getPaperTheme, getNavigationTheme } from '@/contexts/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Inner component that uses the theme
function ThemedApp() {
  const { themeName, colors, isLoading } = useTheme();
  const paperTheme = getPaperTheme(themeName);
  const navTheme = getNavigationTheme(themeName);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationThemeProvider value={navTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false, title: 'Reset Password' }} />
          <Stack.Screen name="search" options={{ title: 'Search', headerBackTitle: 'Back' }} />
          <Stack.Screen name="troop/[id]" options={{ title: 'Troop Details', headerBackTitle: 'Back' }} />
          <Stack.Screen name="club/[id]" options={{ title: 'Club Details', headerBackTitle: 'Back' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      </NavigationThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </AuthProvider>
  );
}
