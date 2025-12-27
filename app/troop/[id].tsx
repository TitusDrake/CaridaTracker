import { StyleSheet, ScrollView, View, Alert, Modal, TextInput, Pressable, FlatList, Linking } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator, Menu, RadioButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useTroops } from '@/contexts/TroopsContext';
import { useClubs } from '@/contexts/ClubsContext';
import { costumeApi, troopApi, Legion501Costume, TroopShift, AttendanceStatus, AttendanceSignupData, AttendeeType, CapacityInfo } from '@/services/api';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timeString: string | null | undefined): string {
  if (!timeString) {
    return '';
  }
  // Time is in HH:MM:SS format
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function isUpcoming(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

// Generate calendar URLs
function generateCalendarUrls(troop: any, shift?: TroopShift) {
  const title = encodeURIComponent(troop.event_name);
  const location = encodeURIComponent([
    troop.venue_name,
    troop.address,
    troop.city,
    troop.state,
    troop.zip_code,
  ].filter(Boolean).join(', '));
  const description = encodeURIComponent(troop.special_notes || troop.description || '501st Legion Troop');

  // Parse date and times
  const eventDate = new Date(troop.event_date);
  const year = eventDate.getFullYear();
  const month = String(eventDate.getMonth() + 1).padStart(2, '0');
  const day = String(eventDate.getDate()).padStart(2, '0');

  // Use shift times if available, otherwise troop times
  const startTime = shift?.start_time || troop.start_time || '12:00:00';
  const endTime = shift?.end_time || troop.end_time || '16:00:00';

  // Format for Google/Yahoo (YYYYMMDDTHHMMSS)
  const startISO = `${year}${month}${day}T${startTime.replace(/:/g, '')}`;
  const endISO = `${year}${month}${day}T${endTime.replace(/:/g, '')}`;

  // Format for Outlook (ISO 8601)
  const startOutlook = `${year}-${month}-${day}T${startTime}`;
  const endOutlook = `${year}-${month}-${day}T${endTime}`;

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${description}&location=${location}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startOutlook}&enddt=${endOutlook}&body=${description}&location=${location}`,
    yahoo: `https://calendar.yahoo.com/?v=60&title=${title}&st=${startISO}&et=${endISO}&desc=${description}&in_loc=${location}`,
  };
}

export default function TroopDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { currentTroop, isLoading, error, fetchTroopById, attendTroop, cancelAttendance } = useTroops();
  const { myClubs, fetchMyClubs } = useClubs();
  const router = useRouter();

  const [menuVisible, setMenuVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Signup modal state
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [costumes, setCostumes] = useState<Legion501Costume[]>([]);
  const [costumesLoading, setCostumesLoading] = useState(false);
  const [shifts, setShifts] = useState<TroopShift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [costumeSearch, setCostumeSearch] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

  // Signup form state
  const [selectedCostume, setSelectedCostume] = useState<Legion501Costume | null>(null);
  const [selectedBackupCostume, setSelectedBackupCostume] = useState<Legion501Costume | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('confirmed');
  const [selectedShift, setSelectedShift] = useState<TroopShift | null>(null);
  const [attendeeType, setAttendeeType] = useState<AttendeeType>('trooper');

  // Free-text costume input (for non-501st orgs)
  const [freeTextCostume, setFreeTextCostume] = useState('');
  const [freeTextBackupCostume, setFreeTextBackupCostume] = useState('');
  const [is501stOrg, setIs501stOrg] = useState(true);

  // Capacity info
  const [capacityInfo, setCapacityInfo] = useState<CapacityInfo | null>(null);

  // Modal step state - now includes attendee_type step
  const [currentStep, setCurrentStep] = useState<'attendee_type' | 'costume' | 'backup' | 'status' | 'shift'>('attendee_type');

  // Calendar modal
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTroopById(parseInt(id, 10));
      fetchMyClubs();
    }
  }, [id, fetchTroopById, fetchMyClubs]);

  // Fetch costumes and shifts when modal opens
  const loadSignupData = async (clubId: number) => {
    // Check if the selected club's organization is 501st Legion
    const selectedClub = myClubs.find(c => c.club_id === clubId);
    const is501st = selectedClub?.organization_name?.toLowerCase().includes('501st') ?? false;
    setIs501stOrg(is501st);

    // Load costumes only for 501st members
    if (is501st) {
      setCostumesLoading(true);
      try {
        const myCostumes = await costumeApi.getMyCostumes();
        setCostumes(myCostumes);
      } catch (err) {
        console.error('Failed to load costumes:', err);
        setCostumes([]);
      } finally {
        setCostumesLoading(false);
      }
    } else {
      setCostumes([]);
    }

    // Load shifts and capacity
    if (id) {
      setShiftsLoading(true);
      try {
        const [troopShifts, capacity] = await Promise.all([
          troopApi.getShifts(parseInt(id, 10)),
          troopApi.getCapacity(parseInt(id, 10)),
        ]);
        setShifts(troopShifts);
        setCapacityInfo(capacity);
      } catch (err) {
        console.error('Failed to load shifts/capacity:', err);
        setShifts([]);
        setCapacityInfo(null);
      } finally {
        setShiftsLoading(false);
      }
    }
  };

  // Filter costumes based on search
  const filteredCostumes = useMemo(() => {
    if (!costumeSearch.trim()) {
      return costumes;
    }
    const search = costumeSearch.toLowerCase();
    return costumes.filter(
      costume =>
        costume.costumeName.toLowerCase().includes(search) ||
        costume.prefix.toLowerCase().includes(search),
    );
  }, [costumes, costumeSearch]);

  const openSignupModal = async (clubId: number) => {
    setSelectedClubId(clubId);
    setMenuVisible(false);
    setSignupModalVisible(true);
    setSelectedCostume(null);
    setSelectedBackupCostume(null);
    setAttendanceStatus('confirmed');
    setSelectedShift(null);
    setAttendeeType('trooper');
    setFreeTextCostume('');
    setFreeTextBackupCostume('');
    setCostumeSearch('');
    setCurrentStep('attendee_type');
    setCapacityInfo(null);
    await loadSignupData(clubId);
  };

  const handleNextStep = () => {
    if (currentStep === 'attendee_type') {
      // If squire, skip costume selection
      if (attendeeType === 'squire') {
        setCurrentStep('status');
      } else {
        setCurrentStep('costume');
      }
    } else if (currentStep === 'costume') {
      // Check for valid costume selection
      if (is501stOrg && !selectedCostume) {
        Alert.alert('Costume Required', 'Please select a costume before continuing.');
        return;
      }
      if (!is501stOrg && !freeTextCostume.trim()) {
        Alert.alert('Costume Required', 'Please enter a costume name before continuing.');
        return;
      }
      setCurrentStep('backup');
    } else if (currentStep === 'backup') {
      setCurrentStep('status');
    } else if (currentStep === 'status') {
      if (shifts.length > 0) {
        setCurrentStep('shift');
      } else {
        handleSubmitSignup();
      }
    } else if (currentStep === 'shift') {
      handleSubmitSignup();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'costume') {
      setCurrentStep('attendee_type');
    } else if (currentStep === 'backup') {
      setCurrentStep('costume');
    } else if (currentStep === 'status') {
      // If squire, go back to attendee_type, otherwise go to backup
      if (attendeeType === 'squire') {
        setCurrentStep('attendee_type');
      } else {
        setCurrentStep('backup');
      }
    } else if (currentStep === 'shift') {
      setCurrentStep('status');
    }
  };

  const handleSubmitSignup = async () => {
    if (!id || !selectedClubId) {
      return;
    }

    // Validate costume for troopers
    if (attendeeType === 'trooper') {
      if (is501stOrg && !selectedCostume) {
        Alert.alert('Costume Required', 'Please select a costume.');
        return;
      }
      if (!is501stOrg && !freeTextCostume.trim()) {
        Alert.alert('Costume Required', 'Please enter a costume name.');
        return;
      }
    }

    setSignupModalVisible(false);
    setActionLoading(true);
    try {
      const signupData: AttendanceSignupData = {
        club_id: selectedClubId,
        attendance_status: attendanceStatus,
        attendee_type: attendeeType,
      };

      // Only add costume data for troopers
      if (attendeeType === 'trooper') {
        if (is501stOrg && selectedCostume) {
          signupData.costume_id = selectedCostume.costumeId;
          signupData.costume_name = `${selectedCostume.prefix} - ${selectedCostume.costumeName}`;
          if (selectedBackupCostume) {
            signupData.backup_costume_id = selectedBackupCostume.costumeId;
            signupData.backup_costume_name = `${selectedBackupCostume.prefix} - ${selectedBackupCostume.costumeName}`;
          }
        } else {
          // Free-text costumes
          signupData.costume_name = freeTextCostume.trim();
          if (freeTextBackupCostume.trim()) {
            signupData.backup_costume_name = freeTextBackupCostume.trim();
          }
        }
      }

      if (selectedShift) {
        signupData.shift_id = selectedShift.id;
      }

      const response = await attendTroop(parseInt(id, 10), signupData);

      // Show appropriate message based on signup status
      const successMessage = response.message || 'You have signed up for this troop!';
      Alert.alert('Success', successMessage);
      resetSignupState();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setActionLoading(false);
    }
  };

  const resetSignupState = () => {
    setSelectedCostume(null);
    setSelectedBackupCostume(null);
    setAttendanceStatus('confirmed');
    setSelectedShift(null);
    setSelectedClubId(null);
    setAttendeeType('trooper');
    setFreeTextCostume('');
    setFreeTextBackupCostume('');
    setCurrentStep('attendee_type');
    setCapacityInfo(null);
  };

  const handleCancelAttendance = async () => {
    if (!id || !currentTroop?.user_attendance_club_id) {
      return;
    }

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

  const openCalendarUrl = (url: string) => {
    setCalendarModalVisible(false);
    Linking.openURL(url);
  };

  const renderCostumeItem = ({ item }: { item: Legion501Costume }, isBackup: boolean = false) => {
    const selected = isBackup ? selectedBackupCostume : selectedCostume;
    const setSelected = isBackup ? setSelectedBackupCostume : setSelectedCostume;
    const isSelected = selected?.costumeId === item.costumeId;

    // Don't show selected primary costume in backup list
    if (isBackup && selectedCostume?.costumeId === item.costumeId) {
      return null;
    }

    return (
      <Pressable
        style={[
          styles.costumeItem,
          { borderColor: colors.border },
          isSelected && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
        ]}
        onPress={() => setSelected(isSelected ? null : item)}
      >
        <Text variant="titleSmall" style={{ color: colors.primary }}>{item.prefix}</Text>
        <Text variant="bodyMedium" style={styles.costumeName}>{item.costumeName}</Text>
        {isSelected && (
          <Text style={{ color: colors.primary }}>✓</Text>
        )}
      </Pressable>
    );
  };

  const renderShiftItem = (shift: TroopShift) => {
    const isSelected = selectedShift?.id === shift.id;
    const isFull = shift.max_attendees && shift.attendee_count && shift.attendee_count >= shift.max_attendees;

    return (
      <Pressable
        key={shift.id}
        style={[
          styles.shiftItem,
          { borderColor: colors.border },
          isSelected && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
          isFull && { opacity: 0.5 },
        ]}
        onPress={() => !isFull && setSelectedShift(isSelected ? null : shift)}
        disabled={isFull}
      >
        <View style={styles.shiftInfo}>
          <Text variant="titleSmall">{shift.name}</Text>
          {(shift.start_time || shift.end_time) && (
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
            </Text>
          )}
          <Text variant="bodySmall" style={{ opacity: 0.7 }}>
            {shift.attendee_count || 0}{shift.max_attendees ? `/${shift.max_attendees}` : ''} signed up
          </Text>
        </View>
        {isSelected && (
          <Text style={{ color: colors.primary }}>✓</Text>
        )}
        {isFull && (
          <Chip compact style={{ backgroundColor: colors.error + '20' }}>Full</Chip>
        )}
      </Pressable>
    );
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'attendee_type': return 'How are you attending?';
      case 'costume': return 'Select Your Costume';
      case 'backup': return 'Select Backup Costume (Optional)';
      case 'status': return 'Attendance Status';
      case 'shift': return 'Select Shift';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'attendee_type': {
        // Show capacity info if available
        if (capacityInfo) {
          const trooperInfo = capacityInfo.max_troopers
            ? `${capacityInfo.confirmed_troopers}/${capacityInfo.max_troopers} troopers`
            : `${capacityInfo.confirmed_troopers} troopers`;
          const squireInfo = capacityInfo.max_squires
            ? `${capacityInfo.confirmed_squires}/${capacityInfo.max_squires} squires`
            : `${capacityInfo.confirmed_squires} squires`;
          return `Current signup: ${trooperInfo}, ${squireInfo}`;
        }
        return 'Are you trooping in costume or attending as a squire/handler?';
      }
      case 'costume': return is501stOrg
        ? 'Choose which costume you will be wearing'
        : 'Enter the costume you will be wearing';
      case 'backup': return is501stOrg
        ? 'Choose a backup costume in case your primary is unavailable'
        : 'Enter a backup costume (optional)';
      case 'status': return 'How confident are you about attending?';
      case 'shift': return 'Select which time slot you will attend';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'attendee_type': return true; // Always has a default
      case 'costume': return is501stOrg ? !!selectedCostume : !!freeTextCostume.trim();
      case 'backup': return true; // Optional
      case 'status': return true; // Always has a default
      case 'shift': return shifts.length === 0 || !!selectedShift; // Required if shifts exist
    }
  };

  const isLastStep = () => {
    if (currentStep === 'shift') {
      return true;
    }
    if (currentStep === 'status' && shifts.length === 0) {
      return true;
    }
    return false;
  };

  // Calculate total steps for progress indicator
  const getTotalSteps = () => {
    let steps = 3; // attendee_type, status, always present
    if (attendeeType === 'trooper') {
      steps += 2; // costume, backup
    }
    if (shifts.length > 0) {
      steps += 1; // shift
    }
    return steps;
  };

  const getCurrentStepIndex = () => {
    if (currentStep === 'attendee_type') {
      return 0;
    }
    if (attendeeType === 'squire') {
      if (currentStep === 'status') {
        return 1;
      }
      if (currentStep === 'shift') {
        return 2;
      }
    } else {
      if (currentStep === 'costume') {
        return 1;
      }
      if (currentStep === 'backup') {
        return 2;
      }
      if (currentStep === 'status') {
        return 3;
      }
      if (currentStep === 'shift') {
        return 4;
      }
    }
    return 0;
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

  const calendarUrls = generateCalendarUrls(currentTroop);

  return (
    <>
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

                  {/* Calendar buttons for attendees */}
                  <Button
                    mode="outlined"
                    icon="calendar"
                    style={styles.calendarButton}
                    onPress={() => setCalendarModalVisible(true)}
                  >
                    Add to Calendar
                  </Button>

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
                      onPress={() => openSignupModal(club.club_id)}
                      title={club.club_name}
                    />
                  ))}
                </Menu>
              ) : myClubs.length === 1 ? (
                <Button
                  mode="contained"
                  style={[styles.signupButton, { backgroundColor: colors.primary }]}
                  onPress={() => openSignupModal(myClubs[0].club_id)}
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

      {/* Signup Modal - Multi-step */}
      <Modal
        visible={signupModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSignupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {/* Progress indicator - dynamic based on attendee type */}
            <View style={styles.progressContainer}>
              {Array.from({ length: getTotalSteps() }).map((_, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {index > 0 && <View style={[styles.progressLine, { backgroundColor: colors.border }]} />}
                  <View style={[
                    styles.progressDot,
                    getCurrentStepIndex() === index && { backgroundColor: colors.primary },
                    getCurrentStepIndex() > index && { backgroundColor: colors.primary, opacity: 0.5 },
                  ]} />
                </View>
              ))}
            </View>

            <Text variant="titleLarge" style={styles.modalTitle}>{getStepTitle()}</Text>
            <Text variant="bodySmall" style={styles.modalSubtitle}>{getStepSubtitle()}</Text>

            {/* Attendee Type Step */}
            {currentStep === 'attendee_type' && (
              <View style={styles.statusContainer}>
                <RadioButton.Group onValueChange={value => setAttendeeType(value as AttendeeType)} value={attendeeType}>
                  <Pressable
                    style={[
                      styles.statusOption,
                      { borderColor: colors.border },
                      attendeeType === 'trooper' && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
                    ]}
                    onPress={() => setAttendeeType('trooper')}
                  >
                    <RadioButton value="trooper" />
                    <View style={styles.statusOptionText}>
                      <Text variant="titleSmall">Trooper (In Costume)</Text>
                      <Text variant="bodySmall" style={{ opacity: 0.7 }}>I will be wearing a costume at this event</Text>
                      {capacityInfo?.max_troopers && (
                        <Text variant="bodySmall" style={{ color: capacityInfo.confirmed_troopers >= capacityInfo.max_troopers ? colors.error : colors.primary }}>
                          {capacityInfo.confirmed_troopers}/{capacityInfo.max_troopers} spots filled
                          {capacityInfo.confirmed_troopers >= capacityInfo.max_troopers && capacityInfo.waitlist_enabled && ' (waitlist available)'}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.statusOption,
                      { borderColor: colors.border },
                      attendeeType === 'squire' && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
                    ]}
                    onPress={() => setAttendeeType('squire')}
                  >
                    <RadioButton value="squire" />
                    <View style={styles.statusOptionText}>
                      <Text variant="titleSmall">Squire / Handler</Text>
                      <Text variant="bodySmall" style={{ opacity: 0.7 }}>I am attending to support/assist a trooper</Text>
                      {capacityInfo?.max_squires && (
                        <Text variant="bodySmall" style={{ color: capacityInfo.confirmed_squires >= capacityInfo.max_squires ? colors.error : colors.primary }}>
                          {capacityInfo.confirmed_squires}/{capacityInfo.max_squires} spots filled
                          {capacityInfo.confirmed_squires >= capacityInfo.max_squires && capacityInfo.waitlist_enabled && ' (waitlist available)'}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                </RadioButton.Group>
                {capacityInfo?.admin_approval_required && (
                  <View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
                    <Text variant="bodySmall" style={{ color: colors.primary }}>
                      Note: This troop requires admin approval for all signups.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Costume Step */}
            {(currentStep === 'costume' || currentStep === 'backup') && (
              <>
                {is501stOrg ? (
                  <>
                    <TextInput
                      style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      placeholder="Search costumes..."
                      placeholderTextColor={colors.text + '80'}
                      value={costumeSearch}
                      onChangeText={setCostumeSearch}
                    />

                    {costumesLoading ? (
                      <View style={styles.costumesLoading}>
                        <ActivityIndicator color={colors.primary} />
                        <Text variant="bodyMedium" style={{ marginTop: 8 }}>Loading costumes...</Text>
                      </View>
                    ) : costumes.length === 0 ? (
                      <View style={styles.noCostumes}>
                        <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.7 }}>
                          No costumes found. Make sure your TKID is set in your profile.
                        </Text>
                      </View>
                    ) : (
                      <FlatList
                        data={filteredCostumes.filter(c => currentStep === 'costume' || c.costumeId !== selectedCostume?.costumeId)}
                        renderItem={({ item }) => renderCostumeItem({ item }, currentStep === 'backup')}
                        keyExtractor={item => item.costumeId.toString()}
                        style={styles.costumeList}
                        ListEmptyComponent={
                          <Text variant="bodyMedium" style={{ textAlign: 'center', padding: 16, opacity: 0.7 }}>
                            No costumes match your search
                          </Text>
                        }
                      />
                    )}
                  </>
                ) : (
                  <View style={styles.freeTextContainer}>
                    <TextInput
                      style={[styles.freeTextInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                      placeholder={currentStep === 'costume' ? 'Enter costume name...' : 'Enter backup costume (optional)...'}
                      placeholderTextColor={colors.text + '80'}
                      value={currentStep === 'costume' ? freeTextCostume : freeTextBackupCostume}
                      onChangeText={currentStep === 'costume' ? setFreeTextCostume : setFreeTextBackupCostume}
                      multiline={false}
                    />
                    <Text variant="bodySmall" style={{ opacity: 0.6, marginTop: 8 }}>
                      Type the name of the costume you will be wearing.
                    </Text>
                  </View>
                )}
              </>
            )}

            {currentStep === 'status' && (
              <View style={styles.statusContainer}>
                <RadioButton.Group onValueChange={value => setAttendanceStatus(value as AttendanceStatus)} value={attendanceStatus}>
                  <Pressable
                    style={[
                      styles.statusOption,
                      { borderColor: colors.border },
                      attendanceStatus === 'confirmed' && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
                    ]}
                    onPress={() => setAttendanceStatus('confirmed')}
                  >
                    <RadioButton value="confirmed" />
                    <View style={styles.statusOptionText}>
                      <Text variant="titleSmall">{"I'll be there!"}</Text>
                      <Text variant="bodySmall" style={{ opacity: 0.7 }}>I am definitely attending this troop</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.statusOption,
                      { borderColor: colors.border },
                      attendanceStatus === 'tentative' && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
                    ]}
                    onPress={() => setAttendanceStatus('tentative')}
                  >
                    <RadioButton value="tentative" />
                    <View style={styles.statusOptionText}>
                      <Text variant="titleSmall">Tentative</Text>
                      <Text variant="bodySmall" style={{ opacity: 0.7 }}>I might attend, pending other commitments</Text>
                    </View>
                  </Pressable>
                </RadioButton.Group>
              </View>
            )}

            {currentStep === 'shift' && (
              <View style={styles.shiftsContainer}>
                {shiftsLoading ? (
                  <View style={styles.costumesLoading}>
                    <ActivityIndicator color={colors.primary} />
                    <Text variant="bodyMedium" style={{ marginTop: 8 }}>Loading shifts...</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.shiftsList}>
                    {shifts.map(renderShiftItem)}
                  </ScrollView>
                )}
              </View>
            )}

            <View style={styles.modalActions}>
              {currentStep !== 'attendee_type' ? (
                <Button
                  mode="outlined"
                  onPress={handlePreviousStep}
                  style={styles.modalButton}
                >
                  Back
                </Button>
              ) : (
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSignupModalVisible(false);
                    resetSignupState();
                  }}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
              )}
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={styles.modalButton}
                disabled={!canProceed()}
              >
                {isLastStep() ? 'Sign Up' : 'Next'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Selection Modal */}
      <Modal
        visible={calendarModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCalendarModalVisible(false)}>
          <View style={[styles.calendarModalContent, { backgroundColor: colors.surface }]}>
            <Text variant="titleMedium" style={styles.calendarModalTitle}>Add to Calendar</Text>
            <Button
              mode="outlined"
              icon="google"
              style={styles.calendarOption}
              onPress={() => openCalendarUrl(calendarUrls.google)}
            >
              Google Calendar
            </Button>
            <Button
              mode="outlined"
              icon="microsoft-outlook"
              style={styles.calendarOption}
              onPress={() => openCalendarUrl(calendarUrls.outlook)}
            >
              Outlook.com
            </Button>
            <Button
              mode="outlined"
              icon="yahoo"
              style={styles.calendarOption}
              onPress={() => openCalendarUrl(calendarUrls.yahoo)}
            >
              Yahoo Calendar
            </Button>
            <Button
              mode="text"
              onPress={() => setCalendarModalVisible(false)}
              style={{ marginTop: 8 }}
            >
              Cancel
            </Button>
          </View>
        </Pressable>
      </Modal>
    </>
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
  calendarButton: {
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
  },
  progressLine: {
    width: 30,
    height: 2,
    marginHorizontal: 4,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  costumeList: {
    maxHeight: 280,
  },
  costumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  costumeName: {
    flex: 1,
    marginLeft: 12,
  },
  costumesLoading: {
    padding: 40,
    alignItems: 'center',
  },
  noCostumes: {
    padding: 40,
    alignItems: 'center',
  },
  freeTextContainer: {
    marginBottom: 16,
  },
  freeTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  infoBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusOptionText: {
    flex: 1,
    marginLeft: 8,
  },
  shiftsContainer: {
    marginBottom: 16,
  },
  shiftsList: {
    maxHeight: 280,
  },
  shiftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  shiftInfo: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  // Calendar modal
  calendarModalContent: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'stretch',
  },
  calendarModalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  calendarOption: {
    marginBottom: 8,
  },
});
