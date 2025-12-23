import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';

export default function TroopDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  // TODO: Fetch troop data based on id

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>Troop Name</Text>
          <Chip style={styles.statusChip}>Upcoming</Chip>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Event Details</Text>
            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>Date</Text>
              <Text variant="bodyMedium">January 1, 2025</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>Time</Text>
              <Text variant="bodyMedium">10:00 AM - 2:00 PM</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>Arrival</Text>
              <Text variant="bodyMedium">9:30 AM</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Location</Text>
            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>Venue</Text>
              <Text variant="bodyMedium">Venue Name</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>Address</Text>
              <Text variant="bodyMedium">123 Main St, City, PA 12345</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Amenities</Text>
            <Divider style={styles.divider} />

            <View style={styles.chipContainer}>
              <Chip style={styles.amenityChip} compact>Secure Changing</Chip>
              <Chip style={styles.amenityChip} compact>Props Allowed</Chip>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
            <Divider style={styles.divider} />
            <Text variant="bodyMedium">
              Troop description will appear here. This is placeholder text for the event description.
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          style={[styles.signupButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            // TODO: Sign up for troop
          }}
        >
          Sign Up to Attend
        </Button>

        <Text variant="bodySmall" style={styles.troopId}>Troop ID: {id}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    marginLeft: 8,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    opacity: 0.7,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    marginRight: 4,
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  troopId: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 24,
  },
});
