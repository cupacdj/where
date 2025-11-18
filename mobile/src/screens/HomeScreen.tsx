import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Recommended places</Text>

      {isLoading && <Text style={styles.subtle}>Loading...</Text>}
      {error && <Text style={styles.subtle}>Error loading places</Text>}

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlaceCard place={item} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 12,
  },
  subtle: {
    color: '#9ca3af',
    marginBottom: 8,
  },
});
