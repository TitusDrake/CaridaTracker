import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Switch,
  Divider,
  ActivityIndicator,
  Menu,
  Card,
  IconButton,
  Portal,
  Modal,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useClubs } from '@/contexts/ClubsContext';
import { troopApi, TroopCreateData, TroopUpdateData, TroopShift, TroopShiftInput } from '@/services/api';

export default function TroopCreateEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useTheme();
  const { myClubs, fetchMyClubs } = useClubs();

  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get admin clubs only
  const adminClubs = myClubs.filter(c => c.role === 'admin' || c.role === 'super_admin');

  // Form state
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [startTime, setStartTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState('');

  // Boolean toggles
  const [propWeaponsAllowed, setPropWeaponsAllowed] = useState(false);
  const [secureChangingArea, setSecureChangingArea] = useState(false);
  const [shareWithSisterGroups, setShareWithSisterGroups] = useState(false);

  // Capacity settings
  const [maxTroopers, setMaxTroopers] = useState('');
  const [maxSquires, setMaxSquires] = useState('');
  const [adminApprovalRequired, setAdminApprovalRequired] = useState(false);
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);

  // Club selection
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [clubMenuVisible, setClubMenuVisible] = useState(false);

  // Shifts state (only for editing)
  const [shifts, setShifts] = useState<TroopShift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [editingShift, setEditingShift] = useState<TroopShift | null>(null);
  const [shiftSaving, setShiftSaving] = useState(false);

  // Shift form state
  const [shiftName, setShiftName] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('');
  const [shiftEndTime, setShiftEndTime] = useState('');
  const [shiftMaxTroopers, setShiftMaxTroopers] = useState('');
  const [shiftMaxSquires, setShiftMaxSquires] = useState('');

  useEffect(() => {
    fetchMyClubs();
  }, [fetchMyClubs]);

  // Auto-select first admin club
  useEffect(() => {
    if (adminClubs.length === 1 && !selectedClubId) {
      setSelectedClubId(adminClubs[0].club_id);
    }
  }, [adminClubs, selectedClubId]);

  const loadTroop = useCallback(async (troopId: number) => {
    setLoading(true);
    try {
      const troop = await troopApi.getById(troopId);

      // Populate form
      setEventName(troop.event_name);
      setEventDate(troop.event_date.split('T')[0]); // Format date
      setVenueName(troop.venue_name || '');
      setAddress(troop.address || '');
      setCity(troop.city || '');
      setState(troop.state || '');
      setZipCode(troop.zip_code || '');
      setStartTime(troop.start_time || '');
      setArrivalTime(troop.arrival_time || '');
      setEndTime(troop.end_time || '');
      setDescription(troop.description || '');
      setAmenities(troop.amenities || '');
      setPropWeaponsAllowed(troop.prop_weapons_allowed || false);
      setSecureChangingArea(troop.secure_changing_area || false);
      setShareWithSisterGroups(troop.share_with_sister_groups || false);
      setMaxTroopers(troop.max_troopers?.toString() || '');
      setMaxSquires(troop.max_squires?.toString() || '');
      setAdminApprovalRequired(troop.admin_approval_required || false);
      setWaitlistEnabled(troop.waitlist_enabled !== false);
      setSelectedClubId(troop.created_by_club_id);
    } catch {
      Alert.alert('Error', 'Failed to load troop');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Load existing troop for editing
  useEffect(() => {
    if (isEditing && id) {
      loadTroop(parseInt(id, 10));
    }
  }, [isEditing, id, loadTroop]);

  // Load shifts for editing
  const loadShifts = useCallback(async (troopId: number) => {
    setShiftsLoading(true);
    try {
      const troopShifts = await troopApi.getShifts(troopId);
      setShifts(troopShifts);
    } catch {
      console.error('Failed to load shifts');
    } finally {
      setShiftsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadShifts(parseInt(id, 10));
    }
  }, [isEditing, id, loadShifts]);

  const resetShiftForm = () => {
    setShiftName('');
    setShiftStartTime('');
    setShiftEndTime('');
    setShiftMaxTroopers('');
    setShiftMaxSquires('');
    setEditingShift(null);
  };

  const openAddShiftModal = () => {
    resetShiftForm();
    setShiftModalVisible(true);
  };

  const openEditShiftModal = (shift: TroopShift) => {
    setEditingShift(shift);
    setShiftName(shift.name);
    setShiftStartTime(shift.start_time || '');
    setShiftEndTime(shift.end_time || '');
    setShiftMaxTroopers(shift.max_troopers?.toString() || '');
    setShiftMaxSquires(shift.max_squires?.toString() || '');
    setShiftModalVisible(true);
  };

  const handleSaveShift = async () => {
    if (!shiftName.trim()) {
      Alert.alert('Validation Error', 'Shift name is required');
      return;
    }
    if (!id) {return;}

    const troopId = parseInt(id, 10);
    setShiftSaving(true);

    try {
      const shiftData: TroopShiftInput = {
        name: shiftName.trim(),
        start_time: shiftStartTime.trim() || undefined,
        end_time: shiftEndTime.trim() || undefined,
        max_troopers: shiftMaxTroopers ? parseInt(shiftMaxTroopers, 10) : undefined,
        max_squires: shiftMaxSquires ? parseInt(shiftMaxSquires, 10) : undefined,
      };

      if (editingShift) {
        await troopApi.updateShift(troopId, editingShift.id, shiftData);
      } else {
        await troopApi.createShift(troopId, shiftData);
      }

      setShiftModalVisible(false);
      resetShiftForm();
      loadShifts(troopId);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save shift');
    } finally {
      setShiftSaving(false);
    }
  };

  const handleDeleteShift = async (shift: TroopShift) => {
    if (!id) {return;}

    Alert.alert(
      'Delete Shift',
      `Are you sure you want to delete "${shift.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await troopApi.deleteShift(parseInt(id, 10), shift.id);
              loadShifts(parseInt(id, 10));
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete shift');
            }
          },
        },
      ],
    );
  };

  const validateForm = (): boolean => {
    if (!eventName.trim()) {
      Alert.alert('Validation Error', 'Event name is required');
      return false;
    }
    if (!eventDate.trim()) {
      Alert.alert('Validation Error', 'Event date is required');
      return false;
    }
    if (!selectedClubId && !isEditing) {
      Alert.alert('Validation Error', 'Please select a club');
      return false;
    }
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      Alert.alert('Validation Error', 'Date must be in YYYY-MM-DD format');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        const updateData: TroopUpdateData = {
          event_name: eventName.trim(),
          event_date: eventDate,
          venue_name: venueName.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          zip_code: zipCode.trim() || undefined,
          start_time: startTime.trim() || undefined,
          arrival_time: arrivalTime.trim() || undefined,
          end_time: endTime.trim() || undefined,
          description: description.trim() || undefined,
          amenities: amenities.trim() || undefined,
          prop_weapons_allowed: propWeaponsAllowed,
          secure_changing_area: secureChangingArea,
          share_with_sister_groups: shareWithSisterGroups,
          max_troopers: maxTroopers ? parseInt(maxTroopers, 10) : null,
          max_squires: maxSquires ? parseInt(maxSquires, 10) : null,
          admin_approval_required: adminApprovalRequired,
          waitlist_enabled: waitlistEnabled,
        };

        await troopApi.update(parseInt(id, 10), updateData);
        Alert.alert('Success', 'Troop updated successfully');
      } else {
        const createData: TroopCreateData = {
          event_name: eventName.trim(),
          event_date: eventDate,
          created_by_club_id: selectedClubId!,
          venue_name: venueName.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          zip_code: zipCode.trim() || undefined,
          start_time: startTime.trim() || undefined,
          arrival_time: arrivalTime.trim() || undefined,
          end_time: endTime.trim() || undefined,
          description: description.trim() || undefined,
          amenities: amenities.trim() || undefined,
          prop_weapons_allowed: propWeaponsAllowed,
          secure_changing_area: secureChangingArea,
          share_with_sister_groups: shareWithSisterGroups,
          max_troopers: maxTroopers ? parseInt(maxTroopers, 10) : null,
          max_squires: maxSquires ? parseInt(maxSquires, 10) : null,
          admin_approval_required: adminApprovalRequired,
          waitlist_enabled: waitlistEnabled,
          club_ids: [selectedClubId!],
        };

        const newTroop = await troopApi.create(createData);
        Alert.alert('Success', 'Troop created successfully');
        router.replace(`/troop/${newTroop.id}`);
        return;
      }

      router.back();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save troop');
    } finally {
      setSaving(false);
    }
  };

  const selectedClub = adminClubs.find(c => c.club_id === selectedClubId);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyMedium" style={{ marginTop: 16 }}>Loading troop...</Text>
      </View>
    );
  }

  if (adminClubs.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 16 }}>
            Admin Access Required
          </Text>
          <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.7 }}>
            You must be an admin of at least one club to create troops.
          </Text>
          <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 24 }}>
            Go Back
          </Button>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={styles.title}>
          {isEditing ? 'Edit Troop' : 'Create New Troop'}
        </Text>

        {/* Club Selection - only for create */}
        {!isEditing && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Creating Club</Text>
            <Menu
              visible={clubMenuVisible}
              onDismiss={() => setClubMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setClubMenuVisible(true)}
                  style={styles.clubButton}
                >
                  {selectedClub ? selectedClub.club_name : 'Select a club...'}
                </Button>
              }
            >
              {adminClubs.map(club => (
                <Menu.Item
                  key={club.club_id}
                  onPress={() => {
                    setSelectedClubId(club.club_id);
                    setClubMenuVisible(false);
                  }}
                  title={club.club_name}
                />
              ))}
            </Menu>
          </View>
        )}

        {/* Basic Info */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Event Details</Text>

          <TextInput
            label="Event Name *"
            value={eventName}
            onChangeText={setEventName}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Event Date (YYYY-MM-DD) *"
            value={eventDate}
            onChangeText={setEventDate}
            style={styles.input}
            mode="outlined"
            placeholder="2025-01-15"
          />

          <TextInput
            label="Venue Name"
            value={venueName}
            onChangeText={setVenueName}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            mode="outlined"
          />

          <View style={styles.row}>
            <TextInput
              label="City"
              value={city}
              onChangeText={setCity}
              style={[styles.input, styles.flex2]}
              mode="outlined"
            />
            <TextInput
              label="State"
              value={state}
              onChangeText={setState}
              style={[styles.input, styles.flex1]}
              mode="outlined"
            />
            <TextInput
              label="ZIP"
              value={zipCode}
              onChangeText={setZipCode}
              style={[styles.input, styles.flex1]}
              mode="outlined"
            />
          </View>
        </View>

        {/* Time Settings */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Time</Text>

          <View style={styles.row}>
            <TextInput
              label="Arrival Time"
              value={arrivalTime}
              onChangeText={setArrivalTime}
              style={[styles.input, styles.flex1]}
              mode="outlined"
              placeholder="10:00 AM"
            />
            <TextInput
              label="Start Time"
              value={startTime}
              onChangeText={setStartTime}
              style={[styles.input, styles.flex1]}
              mode="outlined"
              placeholder="11:00 AM"
            />
            <TextInput
              label="End Time"
              value={endTime}
              onChangeText={setEndTime}
              style={[styles.input, styles.flex1]}
              mode="outlined"
              placeholder="3:00 PM"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>

          <TextInput
            label="Event Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
          />

          <TextInput
            label="Amenities"
            value={amenities}
            onChangeText={setAmenities}
            style={styles.input}
            mode="outlined"
            placeholder="Parking, restrooms, food..."
          />
        </View>

        {/* Venue Options */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Venue Options</Text>

          <View style={styles.switchRow}>
            <Text variant="bodyLarge">Prop Weapons Allowed</Text>
            <Switch value={propWeaponsAllowed} onValueChange={setPropWeaponsAllowed} />
          </View>

          <View style={styles.switchRow}>
            <Text variant="bodyLarge">Secure Changing Area</Text>
            <Switch value={secureChangingArea} onValueChange={setSecureChangingArea} />
          </View>

          <View style={styles.switchRow}>
            <Text variant="bodyLarge">Share with Sister Groups</Text>
            <Switch value={shareWithSisterGroups} onValueChange={setShareWithSisterGroups} />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Capacity Settings */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Capacity Limits</Text>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>
            Leave blank for unlimited spots
          </Text>

          <View style={styles.row}>
            <TextInput
              label="Max Troopers"
              value={maxTroopers}
              onChangeText={setMaxTroopers}
              style={[styles.input, styles.flex1]}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Unlimited"
            />
            <TextInput
              label="Max Squires/Handlers"
              value={maxSquires}
              onChangeText={setMaxSquires}
              style={[styles.input, styles.flex1]}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Unlimited"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text variant="bodyLarge">Enable Waitlist</Text>
              <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                When full, users can join a waitlist
              </Text>
            </View>
            <Switch value={waitlistEnabled} onValueChange={setWaitlistEnabled} />
          </View>
        </View>

        {/* Admin Approval */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Approval Settings</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text variant="bodyLarge">Require Admin Approval</Text>
              <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                Signups must be approved by an admin
              </Text>
            </View>
            <Switch value={adminApprovalRequired} onValueChange={setAdminApprovalRequired} />
          </View>
        </View>

        {/* Shifts - only shown when editing */}
        {isEditing && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Shifts</Text>
                <Button
                  mode="contained"
                  compact
                  onPress={openAddShiftModal}
                  icon="plus"
                >
                  Add Shift
                </Button>
              </View>
              <Text variant="bodySmall" style={styles.sectionSubtitle}>
                Create shifts to allow signups for specific time slots
              </Text>

              {shiftsLoading ? (
                <ActivityIndicator size="small" style={{ marginTop: 16 }} />
              ) : shifts.length === 0 ? (
                <Card style={styles.emptyShiftCard} mode="outlined">
                  <Card.Content>
                    <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.6 }}>
                      No shifts configured. Users will sign up for the entire event.
                    </Text>
                  </Card.Content>
                </Card>
              ) : (
                shifts.map((shift) => (
                  <Card key={shift.id} style={styles.shiftCard} mode="outlined">
                    <Card.Content style={styles.shiftCardContent}>
                      <View style={styles.shiftInfo}>
                        <Text variant="titleSmall">{shift.name}</Text>
                        {(shift.start_time || shift.end_time) && (
                          <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                            {shift.start_time || '?'} - {shift.end_time || '?'}
                          </Text>
                        )}
                        <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                          {shift.attendee_count || 0} signed up
                          {shift.max_troopers && ` • Max ${shift.max_troopers} troopers`}
                          {shift.max_squires && ` • Max ${shift.max_squires} squires`}
                        </Text>
                      </View>
                      <View style={styles.shiftActions}>
                        <IconButton
                          icon="pencil"
                          size={20}
                          onPress={() => openEditShiftModal(shift)}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => handleDeleteShift(shift)}
                        />
                      </View>
                    </Card.Content>
                  </Card>
                ))
              )}
            </View>
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.actionButton}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.actionButton}
            loading={saving}
            disabled={saving}
          >
            {isEditing ? 'Save Changes' : 'Create Troop'}
          </Button>
        </View>
      </ScrollView>

      {/* Shift Modal */}
      <Portal>
        <Modal
          visible={shiftModalVisible}
          onDismiss={() => setShiftModalVisible(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            {editingShift ? 'Edit Shift' : 'Add Shift'}
          </Text>

          <TextInput
            label="Shift Name *"
            value={shiftName}
            onChangeText={setShiftName}
            style={styles.input}
            mode="outlined"
            placeholder="e.g., Morning Shift"
          />

          <View style={styles.row}>
            <TextInput
              label="Start Time"
              value={shiftStartTime}
              onChangeText={setShiftStartTime}
              style={[styles.input, styles.flex1]}
              mode="outlined"
              placeholder="09:00"
            />
            <TextInput
              label="End Time"
              value={shiftEndTime}
              onChangeText={setShiftEndTime}
              style={[styles.input, styles.flex1]}
              mode="outlined"
              placeholder="12:00"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Max Troopers"
              value={shiftMaxTroopers}
              onChangeText={setShiftMaxTroopers}
              style={[styles.input, styles.flex1]}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Unlimited"
            />
            <TextInput
              label="Max Squires"
              value={shiftMaxSquires}
              onChangeText={setShiftMaxSquires}
              style={[styles.input, styles.flex1]}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Unlimited"
            />
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShiftModalVisible(false)}
              style={styles.flex1}
              disabled={shiftSaving}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveShift}
              style={styles.flex1}
              loading={shiftSaving}
              disabled={shiftSaving}
            >
              {editingShift ? 'Update' : 'Add'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionSubtitle: {
    opacity: 0.6,
    marginTop: -8,
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  clubButton: {
    justifyContent: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shiftCard: {
    marginBottom: 8,
  },
  shiftCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shiftInfo: {
    flex: 1,
  },
  shiftActions: {
    flexDirection: 'row',
  },
  emptyShiftCard: {
    marginTop: 8,
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
