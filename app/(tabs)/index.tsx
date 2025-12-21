import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Button, Card, Surface, SegmentedButtons } from 'react-native-paper';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, ThemeName, themeDisplayNames } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { themeName, setTheme, colors } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const themeButtons = [
    { value: 'lightSide', label: 'Light Side', icon: 'white-balance-sunny' },
    { value: 'darkSide', label: 'Dark Side', icon: 'death-star-variant' },
    { value: 'bountyHunter', label: 'Bounty Hunter', icon: 'shield-account' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>CaridaTracker</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Welcome back{user ? `, ${user.username}` : ''}!
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: `${colors.primary}15` }]}>
            <Card.Content style={styles.statCardContent}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>0</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Total Troops</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: `${colors.primary}15` }]}>
            <Card.Content style={styles.statCardContent}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>0</Text>
              <Text variant="bodySmall" style={styles.statLabel}>This Week</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Recent Activity</Text>
          <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
            <Text variant="bodyLarge" style={styles.emptyText}>No activity yet</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Start tracking to see your activity here
            </Text>
          </Surface>
        </View>

        {/* Theme Selector */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Theme</Text>
          <Text variant="bodyMedium" style={styles.themeDescription}>
            Choose your allegiance
          </Text>
          <SegmentedButtons
            value={themeName}
            onValueChange={(value) => setTheme(value as ThemeName)}
            buttons={themeButtons}
            style={styles.themeSelector}
          />
          <Text variant="bodySmall" style={styles.currentTheme}>
            Current: {themeDisplayNames[themeName]}
          </Text>
        </View>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: colors.error }]}
          textColor={colors.error}
        >
          Logout
        </Button>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: 4,
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  themeDescription: {
    opacity: 0.7,
    marginBottom: 16,
  },
  themeSelector: {
    marginBottom: 8,
  },
  currentTheme: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  emptyText: {
    marginBottom: 4,
  },
  emptySubtext: {
    opacity: 0.5,
  },
  logoutButton: {
    marginTop: 16,
  },
});
