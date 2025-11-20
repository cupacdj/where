import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity } from 'react-native';
import type { Place } from '../types';

interface Props {
  place: Place;
  index: number;
}

export const PlaceCard: React.FC<Props> = ({ place, index }) => {
  const primaryImage = place.images.find((img) => img.isPrimary) ?? place.images[0];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
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
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  imagePlaceholderText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  meta: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  tagChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  tagText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '600',
  },
});
