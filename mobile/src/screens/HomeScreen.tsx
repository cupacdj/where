import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
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

  const grouped = (data || []).reduce<Record<string, Place[]>>((acc, p) => {
    (acc[p.type] = acc[p.type] || []).push(p);
    return acc;
  }, {});

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover Places</Text>
          <Text style={styles.subtitle}>Find your next favorite spot</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Finding amazing places...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Places</Text>
        <Text style={styles.subtitle}>Find your next favorite spot</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load places</Text>
          <Text style={styles.errorSubtext}>
            Check your connection and try again
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.sections}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(grouped).map(([type, places]) => (
            <View key={type} style={styles.section}>
              <Text style={styles.sectionTitle}>{type}</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 10 }}
                nestedScrollEnabled
                directionalLockEnabled
                decelerationRate="fast"
              >
                {places.map((p, idx) => (
                  <PlaceCard key={p.id} place={p} index={idx} horizontal />
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  sections: { paddingHorizontal: 16, paddingBottom: 32 },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0284c7',
    marginBottom: 12,
  },
});
