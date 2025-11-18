import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import type { Place } from '../types';

interface Props {
  place: Place;
}

export const PlaceCard: React.FC<Props> = ({ place }) => {
  const primaryImage = place.images.find((img) => img.isPrimary) ?? place.images[0];

  return (
    <View style={styles.card}>
      {primaryImage ? (
        <Image source={{ uri: primaryImage.url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>No image</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.meta}>
          {place.city}
          {place.address ? ` • ${place.address}` : ''}
        </Text>
        {place.stats?.avgRating && (
          <Text style={styles.meta}>⭐ {place.stats.avgRating.toFixed(1)} rating</Text>
        )}
        <View style={styles.tagsRow}>
          {place.tags.slice(0, 3).map((pt) => (
            <View key={pt.tagId} style={styles.tagChip}>
              <Text style={styles.tagText}>{pt.tag.displayName || pt.tag.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#020617',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2933',
  },
  image: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  imagePlaceholderText: {
    color: '#6b7280',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  meta: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  tagChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#111827',
  },
  tagText: {
    color: '#f97316',
    fontSize: 11,
  },
});
