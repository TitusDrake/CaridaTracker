import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, Surface } from 'react-native-paper';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

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
              <Text variant="bodySmall" style={styles.statLabel}>This Year</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Upcoming Troops</Text>
          <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
            <Text variant="bodyLarge" style={styles.emptyText}>No upcoming troops</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Check the Troops tab to find events to attend
            </Text>
          </Surface>
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Recent Activity</Text>
          <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
            <Text variant="bodyLarge" style={styles.emptyText}>No activity yet</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Your recent troop activity will appear here
            </Text>
          </Surface>
        </View>
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
    textAlign: 'center',
  },
});
