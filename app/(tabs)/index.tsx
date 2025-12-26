import { StyleSheet, ScrollView, View, RefreshControl, Pressable } from 'react-native';
import { Text, Card, Surface, Chip } from 'react-native-paper';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTroops } from '@/contexts/TroopsContext';
import { useClubs } from '@/contexts/ClubsContext';
import { Troop } from '@/services/api';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function isUpcoming(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

interface TroopItemProps {
  troop: Troop;
  onPress: () => void;
  colors: any;
}

function TroopItem({ troop, onPress, colors }: TroopItemProps) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.troopCard}>
        <Card.Content style={styles.troopCardContent}>
          <View style={styles.troopInfo}>
            <Text variant="titleSmall" style={styles.troopName} numberOfLines={1}>
              {troop.event_name}
            </Text>
            <Text variant="bodySmall" style={styles.troopDate}>
              {formatDate(troop.event_date)}
            </Text>
          </View>
          {troop.is_attending && (
            <Chip
              compact
              style={[styles.attendingChip, { backgroundColor: `${colors.success || '#4CAF50'}20` }]}
              textStyle={{ color: colors.success || '#4CAF50', fontSize: 9 }}
            >
              Attending
            </Chip>
          )}
        </Card.Content>
      </Card>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { troops, isLoading: troopsLoading, fetchTroops } = useTroops();
  const { globalStats, isLoading: statsLoading, fetchGlobalStats } = useClubs();
  const router = useRouter();

  const isLoading = troopsLoading || statsLoading;

  useEffect(() => {
    fetchTroops();
    fetchGlobalStats();
  }, [fetchTroops, fetchGlobalStats]);

  const onRefresh = useCallback(() => {
    fetchTroops();
    fetchGlobalStats();
  }, [fetchTroops, fetchGlobalStats]);

  const handleTroopPress = (troopId: number) => {
    router.push(`/troop/${troopId}`);
  };

  // Get upcoming troops (next 5)
  const upcomingTroops = troops
    .filter(t => isUpcoming(t.event_date))
    .slice(0, 5);

  // Get recently attended (past troops user attended, last 5)
  const recentActivity = troops
    .filter(t => !isUpcoming(t.event_date) && t.is_attending)
    .slice(0, 5);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
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
              <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>
                {globalStats?.total_troops ?? 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>Total Troops</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: `${colors.primary}15` }]}>
            <Card.Content style={styles.statCardContent}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>
                {globalStats?.upcoming_troops ?? 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>Upcoming</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Upcoming Troops</Text>
            {upcomingTroops.length > 0 && (
              <Pressable onPress={() => router.push('/(tabs)/troops')}>
                <Text variant="bodyMedium" style={[styles.seeAll, { color: colors.primary }]}>
                  See All
                </Text>
              </Pressable>
            )}
          </View>

          {upcomingTroops.length === 0 ? (
            <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
              <Text variant="bodyLarge" style={styles.emptyText}>No upcoming troops</Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Check the Troops tab to find events to attend
              </Text>
            </Surface>
          ) : (
            upcomingTroops.map(troop => (
              <TroopItem
                key={troop.id}
                troop={troop}
                onPress={() => handleTroopPress(troop.id)}
                colors={colors}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Recent Activity</Text>

          {recentActivity.length === 0 ? (
            <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
              <Text variant="bodyLarge" style={styles.emptyText}>No activity yet</Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Your recent troop activity will appear here
              </Text>
            </Surface>
          ) : (
            recentActivity.map(troop => (
              <TroopItem
                key={troop.id}
                troop={troop}
                onPress={() => handleTroopPress(troop.id)}
                colors={colors}
              />
            ))
          )}
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
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
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
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  seeAll: {
    fontWeight: '500',
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
    marginBottom: 8,
  },
  troopCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  troopInfo: {
    flex: 1,
    marginRight: 8,
  },
  troopName: {
    fontWeight: '500',
  },
  troopDate: {
    opacity: 0.6,
    marginTop: 2,
  },
  attendingChip: {
    height: 20,
  },
});
