import { View, FlatList, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Keyboard } from 'react-native'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Search as SearchIcon, X, Clock, FileQuestionMark } from 'lucide-react-native'
import { Colors } from '../../../constant/colors'
import { PropertyAPI } from '../../../api/properties'
import { PropertyItem as PItem } from '../../../types/properties'
import PropertyItemSkeleton from '../Home/components/PropertyItemSkeleton'
import PropertyItem from '../Home/components/PropertyItem'
import Typography from '../../../components/ui/Typography'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'

const RECENT_KEY = 'nestBoard.recentSearches'
const MAX_RECENT = 8

const Search = () => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((raw) => {
      if (raw) {
        try { setRecentSearches(JSON.parse(raw)); } catch {}
      }
    });
    inputRef.current?.focus();
  }, []);

  const saveRecent = async (term: string) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...recentSearches.filter((r) => r !== term.trim())].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const clearRecent = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_KEY);
  };

  const doSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const d = await PropertyAPI.searchProperties(text, 1, 20);
      setResults(d.data);
      saveRecent(text);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [recentSearches]);

  const onChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(text), 400);
  };

  const onClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  };

  const onRecentPress = (term: string) => {
    setQuery(term);
    doSearch(term);
  };

  const renderItem = ({ item }: { item: PItem }) => (
    <PropertyItem dt={{ item, index: 0, separators: { highlight: () => {}, unhighlight: () => {}, updateProps: () => {} } } as any} />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.searchBar}>
        <SearchIcon size={20} color={Colors.ICON_GRAY} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search properties, cities..."
          placeholderTextColor={Colors.TEXT_GRAY}
          value={query}
          onChangeText={onChangeText}
          returnKeyType="search"
          onSubmitEditing={() => doSearch(query)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
            <X size={18} color={Colors.ICON_GRAY} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item) => String(item)}
          renderItem={() => <PropertyItemSkeleton />}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : searched ? (
        results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
          />
        ) : (
          <View style={styles.emptyState}>
            <FileQuestionMark color={Colors.ICON_GRAY} size={80} />
            <Typography variant="h3" color={Colors.TEXT_GRAY} style={{ marginTop: 12 }}>
              No properties found
            </Typography>
            <Typography variant="body" color={Colors.TEXT_GRAY}>
              Try a different search term
            </Typography>
          </View>
        )
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={() => (
            recentSearches.length > 0 ? (
              <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                  <View style={styles.recentTitleRow}>
                    <Clock size={16} color={Colors.TEXT_GRAY} />
                    <Typography variant="body" color={Colors.TEXT_GRAY}>Recent searches</Typography>
                  </View>
                  <TouchableOpacity onPress={clearRecent}>
                    <Typography variant="caption" color={Colors.PRIMARY_COLOR}>Clear all</Typography>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((term, i) => (
                  <TouchableOpacity key={`${term}-${i}`} style={styles.recentItem} onPress={() => onRecentPress(term)}>
                    <Clock size={14} color={Colors.TEXT_GRAY} />
                    <Typography variant="body" color={Colors.TEXT_PRIMARY}>{term}</Typography>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <SearchIcon color={Colors.ICON_GRAY} size={80} />
                <Typography variant="h3" color={Colors.TEXT_GRAY} style={{ marginTop: 12 }}>
                  Search for properties
                </Typography>
                <Typography variant="body" color={Colors.TEXT_GRAY}>
                  Find your perfect stay by name or city
                </Typography>
              </View>
            )
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 100,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.TEXT_PRIMARY,
    padding: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  recentSection: {
    paddingTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
});
