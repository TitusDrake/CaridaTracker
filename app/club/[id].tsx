import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, Avatar, Divider, Surface } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';

export default function ClubDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  // TODO: Fetch club data based on id

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Avatar.Text
            size={64}
            label="GC"
            style={{ backgroundColor: colors.primary }}
          />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.title}>Club Name</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>Organization Name</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium">
              Club description and information will appear here. This is placeholder text.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Location</Text>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium">Central Pennsylvania</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Stats</Text>
            <Divider style={styles.divider} />

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>0</Text>
                <Text variant="bodySmall" style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>0</Text>
                <Text variant="bodySmall" style={styles.statLabel}>Troops</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>0</Text>
                <Text variant="bodySmall" style={styles.statLabel}>This Year</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Upcoming Troops</Text>
          <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              No upcoming troops for this club
            </Text>
          </Surface>
        </View>

        <Text variant="bodySmall" style={styles.clubId}>Club ID: {id}</Text>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 2,
  },
  card: {
    marginBottom: 16,
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  emptySubtext: {
    opacity: 0.5,
    textAlign: 'center',
  },
  clubId: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 24,
  },
});
