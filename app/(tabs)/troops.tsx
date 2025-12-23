import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';

export default function TroopsScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>Troops</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Upcoming and past events
          </Text>
        </View>

        <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
          <Text variant="bodyLarge" style={styles.emptyText}>No troops yet</Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Troops you can attend will appear here
          </Text>
        </Surface>
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
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
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
});
