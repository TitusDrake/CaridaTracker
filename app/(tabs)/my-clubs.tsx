import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MyClubsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>My Clubs</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Your memberships and stats
          </Text>
        </View>

        <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
          <Text variant="bodyLarge" style={styles.emptyText}>No clubs yet</Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Your club memberships will appear here
          </Text>
        </Surface>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Stats by Club</Text>
          <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Troop counts per club will show here
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
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    marginBottom: 16,
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
