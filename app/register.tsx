import { useState, useEffect } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View, ActivityIndicator, TouchableOpacity, Modal, FlatList } from 'react-native';
import { TextInput, Button, Text, HelperText, List, Divider, Portal, Surface } from 'react-native-paper';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { organizationApi, clubApi } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';

// Dropdown component using Modal
function Dropdown({
  label,
  value,
  options,
  onSelect,
  disabled = false,
}: {
  label: string;
  value: string;
  options: Array<{ id: string; name: string }>;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const { colors } = useTheme();
  const selectedOption = options.find(opt => opt.id === value);
  const displayValue = disabled && !value
    ? 'Select organization first'
    : (selectedOption?.name || 'Select...');

  const openModal = () => {
    if (!disabled) {
      setVisible(true);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={openModal} activeOpacity={0.7} disabled={disabled}>
        <View pointerEvents="none">
          <TextInput
            label={label}
            value={displayValue}
            mode="outlined"
            editable={false}
            disabled={disabled}
            style={styles.input}
            right={<TextInput.Icon icon="chevron-down" />}
          />
        </View>
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={() => setVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setVisible(false)}
          >
            <Surface style={[styles.modalContent, { backgroundColor: colors.surface }]} elevation={4}>
              <Text variant="titleMedium" style={styles.modalTitle}>{label}</Text>
              <Divider />
              <FlatList
                data={options}
                keyExtractor={(item, index) => item.id || `empty-${index}`}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item.id);
                      setVisible(false);
                    }}
                    style={[
                      styles.optionItem,
                      item.id === value && { backgroundColor: `${colors.primary}20` }
                    ]}
                  >
                    <Text
                      variant="bodyLarge"
                      style={item.id === value ? { color: colors.primary, fontWeight: '600' } : undefined}
                    >
                      {item.name}
                    </Text>
                    {item.id === value && (
                      <List.Icon icon="check" color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <Divider />}
                style={styles.optionsList}
              />
            </Surface>
          </TouchableOpacity>
        </Modal>
      </Portal>
    </View>
  );
}

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [tkid, setTkid] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [clubId, setClubId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register } = useAuth();

  // Organizations and clubs state
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([
    { id: '', name: 'Select Organization' },
  ]);
  const [clubs, setClubs] = useState<Array<{ id: string; name: string }>>([
    { id: '', name: 'Select Club' },
  ]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoadingOrgs(true);
        setError(''); // Clear any previous errors
        console.log('Fetching organizations...');
        const orgs = await organizationApi.getAll();
        console.log('Organizations fetched:', orgs);
        setOrganizations([
          { id: '', name: 'Select Organization' },
          ...orgs.map(org => ({ id: org.id.toString(), name: org.name })),
        ]);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to load organizations. Please ensure the backend API is running.';
        setError(errorMessage);
      } finally {
        setIsLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Fetch clubs when organization changes
  useEffect(() => {
    const fetchClubs = async () => {
      if (!organizationId) {
        setClubs([{ id: '', name: 'Select Club' }]);
        setClubId('');
        return;
      }

      try {
        setIsLoadingClubs(true);
        const clubList = await clubApi.getByOrganization(parseInt(organizationId, 10));
        setClubs([
          { id: '', name: 'Select Club' },
          ...clubList.map(club => ({ id: club.id.toString(), name: club.name })),
        ]);
        // Auto-select first club if in dev mode and filling test data
        if (__DEV__ && clubList.length > 0) {
          setClubId(clubList[0].id.toString());
        } else {
          setClubId(''); // Reset club selection when organization changes
        }
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setError('Failed to load clubs. Please try again.');
        setClubs([{ id: '', name: 'Select Club' }]);
      } finally {
        setIsLoadingClubs(false);
      }
    };

    fetchClubs();
  }, [organizationId]);

  const availableClubs = clubs;

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword || !firstName || !lastName || !organizationId || !clubId) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (username.length < 3 || username.length > 30) {
      setError('Username must be 3-30 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!organizationId || organizationId === '') {
      setError('Please select an organization');
      return false;
    }
    if (!clubId || clubId === '') {
      setError('Please select a club');
      return false;
    }
    return true;
  };

  const handleOrganizationChange = (value: string) => {
    setOrganizationId(value);
    setClubId(''); // Reset club when organization changes
  };

  const fillTestData = () => {
    // Random data for fields that need to be unique
    const randomNum = Math.floor(Math.random() * 10000);
    const timestamp = Date.now().toString().slice(-6);

    // Fixed username and password for easy testing
    setUsername('testuser');
    setEmail(`test${randomNum}@example.com`);
    setPassword('password');
    setConfirmPassword('password');
    setFirstName('Test');
    setLastName(`User${randomNum}`);
    setPhoneNumber('555-123-4567');
    setTkid(`TK-${timestamp}`);

    // Set first available organization and club if available
    if (organizations.length > 1) {
      const firstOrg = organizations[1]; // Skip the "Select Organization" option
      setOrganizationId(firstOrg.id);
      // Club will be set automatically when organization changes via useEffect
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email,
        username,
        password,
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined,
        tkid: tkid || undefined,
        organizationId: organizationId || undefined,
        clubId: clubId || undefined,
      });
      // Registration successful - user is now logged in
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <ThemedView style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>CaridaTracker</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>Create your account</Text>

          {error ? (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {error}
            </HelperText>
          ) : null}

          {__DEV__ && (
            <Button
              mode="outlined"
              onPress={fillTestData}
              disabled={isLoading || isLoadingOrgs}
              style={styles.testDataButton}
              icon="content-copy"
            >
              Fill Test Data
            </Button>
          )}

          <View style={styles.formContainer}>
            {/* Account Information Section */}
            <Text variant="titleMedium" style={styles.sectionTitle}>Account Information</Text>

            <TextInput
              label="Username *"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
              disabled={isLoading}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              disabled={isLoading}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Password *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={isLoading}
              mode="outlined"
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <TextInput
              label="Confirm Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={isLoading}
              mode="outlined"
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            {/* Personal Information Section */}
            <Text variant="titleMedium" style={styles.sectionTitle}>Personal Information</Text>

            <TextInput
              label="First Name *"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoComplete="given-name"
              disabled={isLoading}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Last Name *"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoComplete="family-name"
              disabled={isLoading}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
              disabled={isLoading}
              mode="outlined"
              style={styles.input}
            />

            {/* Club Information Section */}
            <Text variant="titleMedium" style={styles.sectionTitle}>Club Information</Text>

            <TextInput
              label="501st TKID (e.g., TK-12345)"
              value={tkid}
              onChangeText={setTkid}
              autoCapitalize="characters"
              disabled={isLoading}
              mode="outlined"
              style={styles.input}
            />

            {isLoadingOrgs ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text variant="bodySmall" style={styles.loadingText}>Loading organizations...</Text>
              </View>
            ) : (
              <Dropdown
                label="Organization *"
                value={organizationId}
                options={organizations}
                onSelect={handleOrganizationChange}
                disabled={isLoading}
              />
            )}

            {isLoadingClubs && organizationId ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text variant="bodySmall" style={styles.loadingText}>Loading clubs...</Text>
              </View>
            ) : (
              <Dropdown
                label="Club *"
                value={clubId}
                options={availableClubs}
                onSelect={setClubId}
                disabled={isLoading || !organizationId || organizationId === '' || isLoadingClubs}
              />
            )}

            <Text variant="bodySmall" style={styles.requiredNote}>* Required fields</Text>

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              Create Account
            </Button>

            <View style={styles.loginLinkContainer}>
              <Text variant="bodyMedium" style={styles.loginLinkText}>
                Already have an account?{' '}
              </Text>
              <Button
                mode="text"
                onPress={() => router.replace('/login')}
                compact
                labelStyle={styles.signInLabel}
              >
                Sign In
              </Button>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  formContainer: {
    gap: 12,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 4,
    opacity: 0.8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '60%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalTitle: {
    padding: 16,
    fontWeight: '600',
  },
  optionsList: {
    maxHeight: 350,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  selectedItem: {
    // backgroundColor set dynamically
  },
  requiredNote: {
    opacity: 0.6,
    marginTop: 4,
  },
  registerButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    height: 50,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    opacity: 0.7,
  },
  signInLabel: {
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    opacity: 0.7,
  },
  testDataButton: {
    marginBottom: 16,
    borderStyle: 'dashed',
  },
});
