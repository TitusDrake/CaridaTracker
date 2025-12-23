import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Button, Card, Avatar, Divider, SegmentedButtons } from 'react-native-paper';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, ThemeName, themeDisplayNames } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { themeName, setTheme, colors } = useTheme();

  const themeButtons = [
    { value: 'lightSide', label: 'Light Side', icon: 'white-balance-sunny' },
    { value: 'darkSide', label: 'Dark Side', icon: 'death-star-variant' },
    { value: 'bountyHunter', label: 'Bounty Hunter', icon: 'shield-account' },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || '??';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={getInitials()}
            style={{ backgroundColor: colors.primary }}
          />
          <Text variant="headlineMedium" style={styles.username}>
            {user?.username || 'Unknown User'}
          </Text>
          <Text variant="bodyLarge" style={styles.email}>
            {user?.email || ''}
          </Text>
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Profile Info</Text>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>First Name</Text>
              <Text variant="bodyMedium">{user?.firstName || 'Not set'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Last Name</Text>
              <Text variant="bodyMedium">{user?.lastName || 'Not set'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Phone</Text>
              <Text variant="bodyMedium">{user?.phoneNumber || 'Not set'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>TKID</Text>
              <Text variant="bodyMedium">{user?.tkid || 'Not set'}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Theme</Text>
            <Text variant="bodyMedium" style={styles.themeDescription}>
              Choose your allegiance
            </Text>
            <SegmentedButtons
              value={themeName}
              onValueChange={(value) => setTheme(value as ThemeName)}
              buttons={themeButtons}
              style={styles.themeSelector}
            />
            <Text variant="bodySmall" style={styles.currentTheme}>
              Current: {themeDisplayNames[themeName]}
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: colors.error }]}
          textColor={colors.error}
        >
          Logout
        </Button>
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
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  username: {
    fontWeight: 'bold',
    marginTop: 16,
  },
  email: {
    opacity: 0.7,
    marginTop: 4,
  },
  infoCard: {
    marginBottom: 24,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    opacity: 0.7,
  },
  themeDescription: {
    opacity: 0.7,
    marginBottom: 16,
  },
  themeSelector: {
    marginBottom: 8,
  },
  currentTheme: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 4,
  },
});
