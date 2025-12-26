import { StyleSheet, ScrollView, View, RefreshControl, Pressable } from 'react-native';
import { Text, Surface, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useClubs } from '@/contexts/ClubsContext';
import { ClubMembership } from '@/services/api';

function getRoleColor(role: string, colors: any): string {
  switch (role) {
    case 'super_admin':
      return colors.error || '#F44336';
    case 'admin':
      return colors.primary;
    case 'member':
      return colors.success || '#4CAF50';
    case 'cadet':
      return colors.warning || '#FF9800';
    default:
      return colors.text;
  }
}

function formatRole(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'member':
      return 'Member';
    case 'cadet':
      return 'Cadet';
    default:
      return role;
  }
}

interface ClubCardProps {
  club: ClubMembership;
  onPress: () => void;
  colors: any;
}

function ClubCard({ club, onPress, colors }: ClubCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.clubCard}>
        <Card.Content>
          <View style={styles.clubHeader}>
            <View style={styles.clubInfo}>
              <Text variant="titleMedium" style={styles.clubName}>
                {club.club_name}
              </Text>
              <Text variant="bodySmall" style={styles.orgName}>
                {club.organization_name}
              </Text>
            </View>
            <Chip
              compact
              style={[styles.roleChip, { backgroundColor: `${getRoleColor(club.role, colors)}20` }]}
              textStyle={{ color: getRoleColor(club.role, colors), fontSize: 11 }}
            >
              {formatRole(club.role)}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

export default function MyClubsScreen() {
  const { colors } = useTheme();
  const { myClubs, globalStats, isLoading, error, fetchMyClubs, fetchGlobalStats } = useClubs();
  const router = useRouter();

  useEffect(() => {
    fetchMyClubs();
    fetchGlobalStats();
  }, [fetchMyClubs, fetchGlobalStats]);

  const onRefresh = useCallback(() => {
    fetchMyClubs();
    fetchGlobalStats();
  }, [fetchMyClubs, fetchGlobalStats]);

  const handleClubPress = (clubId: number) => {
    router.push(`/club/${clubId}`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>My Clubs</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Your memberships and stats
          </Text>
        </View>

        {error && (
          <Surface style={[styles.errorState, { borderColor: colors.error }]} elevation={0}>
            <Text variant="bodyMedium" style={{ color: colors.error }}>
              {error}
            </Text>
          </Surface>
        )}

        {/* Global Stats */}
        {globalStats && (
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, { backgroundColor: `${colors.primary}15` }]}>
              <Card.Content style={styles.statCardContent}>
                <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>
                  {globalStats.total_troops}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Total Troops</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: `${colors.primary}15` }]}>
              <Card.Content style={styles.statCardContent}>
                <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>
                  {globalStats.upcoming_troops}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Upcoming</Text>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Club Memberships */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Memberships ({myClubs.length})
          </Text>

          {isLoading && myClubs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text variant="bodyMedium" style={styles.loadingText}>Loading clubs...</Text>
            </View>
          ) : myClubs.length === 0 ? (
            <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
              <Text variant="bodyLarge" style={styles.emptyText}>No clubs yet</Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Your club memberships will appear here
              </Text>
            </Surface>
          ) : (
            myClubs.map(club => (
              <ClubCard
                key={club.membership_id}
                club={club}
                onPress={() => handleClubPress(club.club_id)}
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
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
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
  clubCard: {
    marginBottom: 12,
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubInfo: {
    flex: 1,
    marginRight: 8,
  },
  clubName: {
    fontWeight: '600',
  },
  orgName: {
    opacity: 0.6,
    marginTop: 2,
  },
  roleChip: {
    height: 24,
  },
});
