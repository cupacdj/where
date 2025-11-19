import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { placesApi } from '../api/placesApi';
import { PlaceCard } from '../components/PlaceCard';
import type { Place } from '../types';

export const HomeScreen: React.FC = () => {
  const { data, isLoading, error } = useQuery<Place[]>({
    queryKey: ['places'],
    queryFn: () => placesApi.getAll(),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <Text style={styles.title}>Recommended places</Text>

      {isLoading && <Text style={styles.subtle}>Loading...</Text>}
      {error && <Text style={styles.subtle}>Error loading places</Text>}

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlaceCard place={item} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  subtle: {
    color: '#475569',
    marginBottom: 8,
  },
});
