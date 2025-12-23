import { StyleSheet, View } from 'react-native';
import { Text, Searchbar, SegmentedButtons, Surface } from 'react-native-paper';
import { useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';

type SearchType = 'troops' | 'people';

export default function SearchScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('troops');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.content}>
        <Searchbar
          placeholder={searchType === 'troops' ? 'Search troops...' : 'Search people...'}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          autoFocus
        />

        <SegmentedButtons
          value={searchType}
          onValueChange={(value) => setSearchType(value as SearchType)}
          buttons={[
            { value: 'troops', label: 'Troops', icon: 'calendar' },
            { value: 'people', label: 'People', icon: 'account' },
          ]}
          style={styles.segmentedButtons}
        />

        <View style={styles.results}>
          {searchQuery.length === 0 ? (
            <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                {searchType === 'troops' ? 'Search for troops' : 'Search for people'}
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                {searchType === 'troops'
                  ? 'Find upcoming events to attend'
                  : 'Find members by name or username'}
              </Text>
            </Surface>
          ) : (
            <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
              <Text variant="bodyLarge" style={styles.emptyText}>No results</Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                No {searchType} found for "{searchQuery}"
              </Text>
            </Surface>
          )}
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  results: {
    flex: 1,
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
