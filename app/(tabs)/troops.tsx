import { StyleSheet, ScrollView, View, RefreshControl, Pressable } from 'react-native';
import { Text, Surface, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useTroops } from '@/contexts/TroopsContext';
import { Troop } from '@/services/api';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isUpcoming(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

interface TroopCardProps {
  troop: Troop;
  onPress: () => void;
  colors: any;
}

function TroopCard({ troop, onPress, colors }: TroopCardProps) {
  const upcoming = isUpcoming(troop.event_date);

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.troopCard}>
        <Card.Content>
          <View style={styles.troopHeader}>
            <Text variant="titleMedium" style={styles.troopName} numberOfLines={1}>
              {troop.event_name}
            </Text>
            <Chip
              compact
              style={[
                styles.statusChip,
                { backgroundColor: upcoming ? `${colors.primary}20` : `${colors.border}40` },
              ]}
              textStyle={{ color: upcoming ? colors.primary : colors.text, fontSize: 11 }}
            >
              {upcoming ? 'Upcoming' : 'Past'}
            </Chip>
          </View>

          <Text variant="bodyMedium" style={styles.troopDate}>
            {formatDate(troop.event_date)}
          </Text>

          {troop.venue_name && (
            <Text variant="bodySmall" style={styles.troopVenue} numberOfLines={1}>
              {troop.venue_name}
              {troop.city && `, ${troop.city}`}
            </Text>
          )}

          <View style={styles.troopFooter}>
            <Text variant="bodySmall" style={styles.clubName}>
              {troop.club_name || 'Unknown Club'}
            </Text>
            {troop.is_attending && (
              <Chip
                compact
                style={[styles.attendingChip, { backgroundColor: `${colors.success || '#4CAF50'}20` }]}
                textStyle={{ color: colors.success || '#4CAF50', fontSize: 10 }}
              >
                Attending
              </Chip>
            )}
            {troop.attendee_count !== undefined && troop.attendee_count > 0 && (
              <Text variant="bodySmall" style={styles.attendeeCount}>
                {troop.attendee_count} attending
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

export default function TroopsScreen() {
  const { colors } = useTheme();
  const { troops, isLoading, error, fetchTroops } = useTroops();
  const router = useRouter();

  useEffect(() => {
    fetchTroops();
  }, [fetchTroops]);

  const onRefresh = useCallback(() => {
    fetchTroops();
  }, [fetchTroops]);

  const handleTroopPress = (troopId: number) => {
    router.push(`/troop/${troopId}`);
  };

  // Separate upcoming and past troops
  const upcomingTroops = troops.filter(t => isUpcoming(t.event_date));
  const pastTroops = troops.filter(t => !isUpcoming(t.event_date));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>Troops</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Upcoming and past events
          </Text>
        </View>

        {error && (
          <Surface style={[styles.errorState, { borderColor: colors.error }]} elevation={0}>
            <Text variant="bodyMedium" style={{ color: colors.error }}>
              {error}
            </Text>
          </Surface>
        )}

        {isLoading && troops.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant="bodyMedium" style={styles.loadingText}>Loading troops...</Text>
          </View>
        ) : troops.length === 0 ? (
          <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
            <Text variant="bodyLarge" style={styles.emptyText}>No troops yet</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Troops you can attend will appear here
            </Text>
          </Surface>
        ) : (
          <>
            {upcomingTroops.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Upcoming ({upcomingTroops.length})
                </Text>
                {upcomingTroops.map(troop => (
                  <TroopCard
                    key={troop.id}
                    troop={troop}
                    onPress={() => handleTroopPress(troop.id)}
                    colors={colors}
                  />
                ))}
              </View>
            )}

            {pastTroops.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Past ({pastTroops.length})
                </Text>
                {pastTroops.map(troop => (
                  <TroopCard
                    key={troop.id}
                    troop={troop}
                    onPress={() => handleTroopPress(troop.id)}
                    colors={colors}
                  />
                ))}
              </View>
            )}
          </>
        )}
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
    marginBottom: 24,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorState: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
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
  troopCard: {
    marginBottom: 12,
  },
  troopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  troopName: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  troopDate: {
    opacity: 0.8,
    marginBottom: 4,
  },
  troopVenue: {
    opacity: 0.6,
    marginBottom: 8,
  },
  troopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clubName: {
    opacity: 0.6,
  },
  attendingChip: {
    height: 20,
  },
  attendeeCount: {
    opacity: 0.5,
    marginLeft: 'auto',
  },
});
