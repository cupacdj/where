import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  'Nice View',
  'Expensive',
  'Quiet',
  'Studying',
  'Romantic',
  'Family',
  'Outdoor',
  'Live Music',
  'Coffee',
  'Cocktails',
  'Vegan',
  'Late Night',
  'Breakfast',
  'Brunch',
];

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCats, setActiveCats] = useState<string[]>([]);

  const toggleCat = (c: string) => {
    setActiveCats(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  const displayedCats = useMemo(
    () => CATEGORIES.filter(c => c.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

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

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
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

      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoriesFluid}>
        {displayedCats.map(c => {
          const active = activeCats.includes(c);
          return (
            <CategoryPill
              key={c}
              label={c}
              active={active}
              onToggle={() => toggleCat(c)}
            />
          );
        })}
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Results</Text>
        <Text style={styles.resultsSub}>
          {(query || activeCats.length) ? 'Filtered preview (mock)' : 'Use search or select categories'}
        </Text>
      </View>
      {/* Placeholder for future results list */}
      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderText}>Results will appear here.</Text>
      </View>
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
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '500',
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
