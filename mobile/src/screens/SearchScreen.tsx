import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { placesApi } from '../api/placesApi';
import type { Place } from '../types';
import { PlaceCard } from '../components/PlaceCard';
import { useNavigation } from '@react-navigation/native';

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [results, setResults] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagOptions, setTagOptions] = useState<Array<{ name: string; label: string }>>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation<any>();

  // load tags from backend on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        setTagsLoading(true);
        const tags = await placesApi.getTags();
        const mapped = tags.map((t) => ({
          name: t.name,
          label: t.displayName || t.name.replace(/_/g, ' '),
        }));
        setTagOptions(mapped);
      } catch (e: any) {
        console.warn('Failed to load tags', e?.message);
      } finally {
        setTagsLoading(false);
      }
    };
    loadTags();
  }, []);

  const toggleCat = (name: string) => {
    setActiveCats(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const displayedCats = useMemo(
    () =>
      tagOptions.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase())
      ),
    [query, tagOptions]
  );

  // active tag names -> backend values
  const activeTagNames = useMemo(
    () => activeCats,
    [activeCats]
  );

  const runSearch = async (q: string, tags: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const data = await placesApi.search({ q: q.trim() || undefined, tags });
      setResults(data);
    } catch (e: any) {
      setError(e.message || 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // debounce query / category changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query, activeTagNames);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeTagNames.join(',')]);

  const CategoryPill: React.FC<{
    label: string;
    active: boolean;
    onToggle: () => void;
  }> = ({ label, active, onToggle }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const handlePressIn = () => {
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 30 }).start();
    };
    const handlePressOut = () => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
    };
    return (
      <Animated.View style={[styles.catAnimated, { transform: [{ scale }] }]}>
        <Pressable
          onPress={onToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.catPill, active && styles.catPillActive]}
          android_ripple={{ color: active ? '#0ea5e9' : '#e2e8f0' }}
        >
          {active && (
            <Ionicons
              name="checkmark"
              size={14}
              color="#0f172a"
              style={{ marginRight: 4 }}
            />
          )}
          <Text style={[styles.catText, active && styles.catTextActive]} numberOfLines={1}>
            {label}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  const selectedCount = activeCats.length;

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search places, tags..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Select categories toggle row */}
        <TouchableOpacity
          style={styles.categoriesToggle}
          activeOpacity={0.8}
          onPress={() => setCategoriesOpen((o) => !o)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons
              name="options-outline"
              size={18}
              color="#0f172a"
            />
            <Text style={styles.categoriesToggleText}>
              Select categories
            </Text>
            {selectedCount > 0 && (
              <View style={styles.categoriesBadge}>
                <Text style={styles.categoriesBadgeText}>{selectedCount}</Text>
              </View>
            )}
          </View>
          <Ionicons
            name={categoriesOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#64748b"
          />
        </TouchableOpacity>

        {categoriesOpen && (
          <>
            <Text style={styles.sectionTitle}>Categories</Text>
            {tagsLoading && (
              <Text style={styles.tagsLoadingText}>Loading categories...</Text>
            )}
            <View style={styles.categoriesFluid}>
              {displayedCats.map(c => {
                const active = activeCats.includes(c.name);
                return (
                  <CategoryPill
                    key={c.name}
                    label={c.label}
                    active={active}
                    onToggle={() => toggleCat(c.name)}
                  />
                );
              })}
              {displayedCats.length === 0 && !tagsLoading && (
                <Text style={styles.tagsEmptyText}>No categories match your search.</Text>
              )}
            </View>
          </>
        )}

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Results</Text>
          <Text style={styles.resultsSub}>
            {loading
              ? 'Searching...'
              : error
              ? error
              : results && results.length
              ? `${results.length} place${results.length === 1 ? '' : 's'} found`
              : 'Use search or select categories'}
          </Text>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#0284c7" />
          </View>
        )}

        {!loading && results && results.length > 0 && (
          <View>
            {results.map((item, index) => (
              <View key={item.id} style={{ marginBottom: 16 }}>
                <PlaceCard place={item} index={index} />
              </View>
            ))}
          </View>
        )}

        {!loading && (!results || results.length === 0) && !error && (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>No places match your filters yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
  },
  categoriesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 10,
    marginBottom: 4,
  },
  categoriesToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  categoriesBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  categoriesBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  categoriesFluid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  catAnimated: {
    // wrapper for animation
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 40,
  },
  catPillActive: {
    backgroundColor: '#bae6fd',
    borderColor: '#38bdf8',
  },
  catText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  catTextActive: {
    color: '#0f172a',
  },
  tagsLoadingText: {
    fontSize: 12,
    color: '#64748b',
    paddingHorizontal: 2,
    marginBottom: 6,
  },
  tagsEmptyText: {
    fontSize: 12,
    color: '#94a3b8',
    paddingHorizontal: 2,
  },
  resultsHeader: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  resultsSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  placeholderBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
});
