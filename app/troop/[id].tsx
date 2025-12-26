import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator, Menu } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useTroops } from '@/contexts/TroopsContext';
import { useClubs } from '@/contexts/ClubsContext';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
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

export default function TroopDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { currentTroop, isLoading, error, fetchTroopById, attendTroop, cancelAttendance } = useTroops();
  const { myClubs, fetchMyClubs } = useClubs();
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTroopById(parseInt(id, 10));
      fetchMyClubs();
    }
  }, [id, fetchTroopById, fetchMyClubs]);

  const handleAttend = async (clubId: number) => {
    if (!id) {return;}
    setActionLoading(true);
    setMenuVisible(false);
    try {
      await attendTroop(parseInt(id, 10), clubId);
      Alert.alert('Success', 'You have signed up for this troop!');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAttendance = async () => {
    if (!id || !currentTroop?.user_attendance_club_id) {return;}

    Alert.alert(
      'Cancel Attendance',
      'Are you sure you want to cancel your attendance for this troop?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelAttendance(parseInt(id, 10), currentTroop.user_attendance_club_id!);
              Alert.alert('Cancelled', 'Your attendance has been cancelled.');
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to cancel');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading && !currentTroop) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>Loading troop details...</Text>
      </View>
    );
  }

  if (error && !currentTroop) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text variant="bodyLarge" style={{ color: colors.error }}>{error}</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!currentTroop) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text variant="bodyLarge">Troop not found</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const upcoming = isUpcoming(currentTroop.event_date);
  const address = [
    currentTroop.address,
    currentTroop.city,
    currentTroop.state,
    currentTroop.zip_code,
  ].filter(Boolean).join(', ');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>{currentTroop.event_name}</Text>
          <Chip
            style={[
              styles.statusChip,
              { backgroundColor: upcoming ? `${colors.primary}20` : `${colors.border}40` },
            ]}
            textStyle={{ color: upcoming ? colors.primary : colors.text }}
          >
            {upcoming ? 'Upcoming' : 'Past'}
          </Chip>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Event Details</Text>
            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>Date</Text>
              <Text variant="bodyMedium">{formatDate(currentTroop.event_date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.label}>Hosted By</Text>
              <Text variant="bodyMedium">{currentTroop.club_name || 'Unknown'}</Text>
            </View>

            {currentTroop.organization_name && (
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.label}>Organization</Text>
                <Text variant="bodyMedium">{currentTroop.organization_name}</Text>
              </View>
            )}

            {currentTroop.attendee_count !== undefined && (
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.label}>Attendees</Text>
                <Text variant="bodyMedium">{currentTroop.attendee_count}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {(currentTroop.venue_name || address) && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Location</Text>
              <Divider style={styles.divider} />

              {currentTroop.venue_name && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.label}>Venue</Text>
                  <Text variant="bodyMedium">{currentTroop.venue_name}</Text>
                </View>
              )}

              {address && (
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.label}>Address</Text>
                  <Text variant="bodyMedium" style={styles.addressText}>{address}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {currentTroop.charity_name && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Charity</Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium">{currentTroop.charity_name}</Text>
              {currentTroop.charity_url && (
                <Text variant="bodySmall" style={styles.urlText}>{currentTroop.charity_url}</Text>
              )}
            </Card.Content>
          </Card>
        )}

        {currentTroop.special_notes && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Notes</Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium">{currentTroop.special_notes}</Text>
            </Card.Content>
          </Card>
        )}

        {upcoming && (
          <>
            {currentTroop.is_attending ? (
              <View style={styles.attendingSection}>
                <View style={[styles.attendingBanner, { backgroundColor: `${colors.success || '#4CAF50'}15` }]}>
                  <Text variant="titleMedium" style={{ color: colors.success || '#4CAF50' }}>
                    {"You're Attending!"}
                  </Text>
                </View>
                <Button
                  mode="outlined"
                  style={styles.cancelButton}
                  textColor={colors.error}
                  onPress={handleCancelAttendance}
                  loading={actionLoading}
                  disabled={actionLoading}
                >
                  Cancel Attendance
                </Button>
              </View>
            ) : myClubs.length > 1 ? (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="contained"
                    style={[styles.signupButton, { backgroundColor: colors.primary }]}
                    onPress={() => setMenuVisible(true)}
                    loading={actionLoading}
                    disabled={actionLoading}
                  >
                    Sign Up to Attend
                  </Button>
                }
              >
                <Text style={styles.menuHeader}>Attend as which club?</Text>
                {myClubs.map(club => (
                  <Menu.Item
                    key={club.club_id}
                    onPress={() => handleAttend(club.club_id)}
                    title={club.club_name}
                  />
                ))}
              </Menu>
            ) : myClubs.length === 1 ? (
              <Button
                mode="contained"
                style={[styles.signupButton, { backgroundColor: colors.primary }]}
                onPress={() => handleAttend(myClubs[0].club_id)}
                loading={actionLoading}
                disabled={actionLoading}
              >
                Sign Up to Attend
              </Button>
            ) : (
              <Text variant="bodyMedium" style={styles.noClubsText}>
                Join a club to attend troops
              </Text>
            )}
          </>
        )}

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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
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
    flex: 1,
  },
  addressText: {
    flex: 2,
    textAlign: 'right',
  },
  urlText: {
    opacity: 0.6,
    marginTop: 4,
  },
  attendingSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  attendingBanner: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButton: {
    borderColor: '#F44336',
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  menuHeader: {
    padding: 16,
    paddingBottom: 8,
    fontWeight: '600',
    opacity: 0.7,
  },
  noClubsText: {
    textAlign: 'center',
    opacity: 0.6,
    marginVertical: 16,
  },
  troopId: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 24,
  },
});
