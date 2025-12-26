import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Card, Avatar, Divider, Surface, ActivityIndicator, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useClubs } from '@/contexts/ClubsContext';
import { clubApi, Club, ClubMember, UserClubStats } from '@/services/api';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ClubDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { fetchClubStats, fetchClubMembers, clubStats, clubMembers } = useClubs();
  const router = useRouter();

  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clubId = id ? parseInt(id, 10) : 0;
  const stats: UserClubStats | undefined = clubStats.get(clubId);
  const members: ClubMember[] = clubMembers.get(clubId) || [];

  useEffect(() => {
    const loadClubData = async () => {
      if (!id) {return;}

      setIsLoading(true);
      setError(null);

      try {
        // Fetch club details
        const clubData = await clubApi.getById(clubId);
        setClub(clubData);

        // Fetch stats and members in parallel
        await Promise.all([
          fetchClubStats(clubId).catch(() => {}), // Stats might fail if user isn't member
          fetchClubMembers(clubId).catch(() => {}), // Members might fail if user isn't member
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load club');
      } finally {
        setIsLoading(false);
      }
    };

    loadClubData();
  }, [id, clubId, fetchClubStats, fetchClubMembers]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>Loading club details...</Text>
      </View>
    );
  }

  if (error || !club) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text variant="bodyLarge" style={{ color: colors.error }}>
          {error || 'Club not found'}
        </Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Avatar.Text
            size={64}
            label={getInitials(club.name)}
            style={{ backgroundColor: colors.primary }}
          />
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.title}>{club.name}</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {stats?.club?.organization_name || 'Organization'}
            </Text>
          </View>
        </View>

        {club.description && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>About</Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium">{club.description}</Text>
            </Card.Content>
          </Card>
        )}

        {club.location && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Location</Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium">{club.location}</Text>
            </Card.Content>
          </Card>
        )}

        {stats && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Your Stats</Text>
              <Divider style={styles.divider} />

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>
                    {stats.total_troops}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>Total Troops</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>
                    {stats.upcoming_troops}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>Upcoming</Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="headlineMedium" style={[styles.statNumber, { color: colors.primary }]}>
                    {stats.past_troops}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>Past</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {members.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Members ({members.length})
            </Text>
            <Card style={styles.card}>
              <Card.Content>
                {members.slice(0, 10).map((member, index) => (
                  <View key={member.membership_id}>
                    <View style={styles.memberRow}>
                      <Avatar.Text
                        size={36}
                        label={getInitials(
                          member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : member.username,
                        )}
                        style={{ backgroundColor: `${colors.primary}40` }}
                        labelStyle={{ fontSize: 14 }}
                      />
                      <View style={styles.memberInfo}>
                        <Text variant="bodyMedium" style={styles.memberName}>
                          {member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : member.username}
                        </Text>
                        <Text variant="bodySmall" style={styles.memberRole}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1).replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                    {index < members.slice(0, 10).length - 1 && <Divider style={styles.memberDivider} />}
                  </View>
                ))}
                {members.length > 10 && (
                  <Text variant="bodySmall" style={styles.moreMembers}>
                    +{members.length - 10} more members
                  </Text>
                )}
              </Card.Content>
            </Card>
          </View>
        )}

        {members.length === 0 && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Members</Text>
            <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Member list not available
              </Text>
            </Surface>
          </View>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backButton: {
    marginTop: 16,
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
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontWeight: '500',
  },
  memberRole: {
    opacity: 0.6,
  },
  memberDivider: {
    marginVertical: 4,
  },
  moreMembers: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 12,
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
