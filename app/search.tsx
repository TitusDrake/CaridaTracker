import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text, Searchbar, SegmentedButtons, Surface, Card, Chip, ActivityIndicator, Avatar } from 'react-native-paper';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { searchApi, Troop, UserSearchResult } from '@/services/api';

type SearchType = 'troops' | 'people';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
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

function getInitials(firstName?: string, lastName?: string, username?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (username) {
    return username.slice(0, 2).toUpperCase();
  }
  return '??';
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('troops');
  const [isLoading, setIsLoading] = useState(false);
  const [troopResults, setTroopResults] = useState<Troop[]>([]);
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const performSearch = useCallback(async () => {
    if (debouncedQuery.length < 2) {
      setTroopResults([]);
      setUserResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (searchType === 'troops') {
        const results = await searchApi.searchTroops(debouncedQuery);
        setTroopResults(results);
      } else {
        const results = await searchApi.searchUsers(debouncedQuery);
        setUserResults(results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, searchType]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Clear results when switching search type
  useEffect(() => {
    setTroopResults([]);
    setUserResults([]);
    if (debouncedQuery.length >= 2) {
      performSearch();
    }
  }, [searchType]);

  const handleTroopPress = (troopId: number) => {
    router.push(`/troop/${troopId}`);
  };

  const results = searchType === 'troops' ? troopResults : userResults;
  const hasQuery = debouncedQuery.length >= 2;

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

        <ScrollView style={styles.results}>
          {error && (
            <Surface style={[styles.errorState, { borderColor: colors.error }]} elevation={0}>
              <Text variant="bodyMedium" style={{ color: colors.error }}>{error}</Text>
            </Surface>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text variant="bodyMedium" style={styles.loadingText}>Searching...</Text>
            </View>
          ) : !hasQuery ? (
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
          ) : results.length === 0 ? (
            <Surface style={[styles.emptyState, { borderColor: colors.border }]} elevation={0}>
              <Text variant="bodyLarge" style={styles.emptyText}>No results</Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                No {searchType} found for &quot;{searchQuery}&quot;
              </Text>
            </Surface>
          ) : searchType === 'troops' ? (
            // Troop Results
            troopResults.map(troop => {
              const upcoming = isUpcoming(troop.event_date);
              return (
                <Pressable key={troop.id} onPress={() => handleTroopPress(troop.id)}>
                  <Card style={styles.resultCard}>
                    <Card.Content>
                      <View style={styles.resultHeader}>
                        <Text variant="titleMedium" style={styles.resultTitle} numberOfLines={1}>
                          {troop.event_name}
                        </Text>
                        <Chip
                          compact
                          style={[
                            styles.statusChip,
                            { backgroundColor: upcoming ? `${colors.primary}20` : `${colors.border}40` },
                          ]}
                          textStyle={{ color: upcoming ? colors.primary : colors.text, fontSize: 10 }}
                        >
                          {upcoming ? 'Upcoming' : 'Past'}
                        </Chip>
                      </View>
                      <Text variant="bodyMedium" style={styles.resultSubtitle}>
                        {formatDate(troop.event_date)}
                      </Text>
                      {troop.club_name && (
                        <Text variant="bodySmall" style={styles.resultMeta}>
                          {troop.club_name}
                        </Text>
                      )}
                    </Card.Content>
                  </Card>
                </Pressable>
              );
            })
          ) : (
            // User Results
            userResults.map(user => (
              <Card key={user.id} style={styles.resultCard}>
                <Card.Content style={styles.userResult}>
                  <Avatar.Text
                    size={40}
                    label={getInitials(user.first_name, user.last_name, user.username)}
                    style={{ backgroundColor: `${colors.primary}40` }}
                  />
                  <View style={styles.userInfo}>
                    <Text variant="titleMedium" style={styles.resultTitle}>
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
                    </Text>
                    {user.first_name && user.last_name && (
                      <Text variant="bodySmall" style={styles.resultMeta}>
                        @{user.username}
                      </Text>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </ScrollView>
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
    marginBottom: 16,
  },
  results: {
    flex: 1,
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
  resultCard: {
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 22,
  },
  resultSubtitle: {
    opacity: 0.8,
    marginTop: 2,
  },
  resultMeta: {
    opacity: 0.6,
    marginTop: 4,
  },
  userResult: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
});
