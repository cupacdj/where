import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { placesApi } from '../api/placesApi';
import { API_BASE_URL } from '../api/httpClient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export const PlaceDetailsScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const { user, logout } = useAuth();
  const { params } = useRoute<any>();
  const { placeId } = params;
  const { data, isLoading, error } = useQuery({
    queryKey: ['place', placeId],
    queryFn: () => placesApi.getById(placeId),
  });
  const [imageModalVisible, setImageModalVisible] = React.useState(false);
  const [fullscreenUrl, setFullscreenUrl] = React.useState<string | null>(null);
  const [favorited, setFavorited] = React.useState<boolean | null>(null);
  const [favBusy, setFavBusy] = React.useState(false);

  // after data load, check favorite
  React.useEffect(() => {
    if (!data || !user) return;
    placesApi
      .isFavorite(placeId)
      .then((res) => setFavorited(res.favorited))
      .catch((err) => {
        // If unauthorized, it means token expired. Logout user.
        if (err.status === 401 || err.message?.includes('Unauthorized')) {
          logout();
        }
        setFavorited(false);
      });
  }, [data, placeId, user]);

  const toggleFavorite = async () => {
    if (!data || favBusy || !user) return;
    try {
      setFavBusy(true);
      const res = await placesApi.toggleFavorite(placeId);
      setFavorited(res.favorited);
    } catch (e: any) {
      if (e.status === 401 || e.message?.includes('Unauthorized')) {
        logout();
      }
    } finally {
      setFavBusy(false);
    }
  };

  if (isLoading) return <ActivityIndicator style={{ marginTop: 40 }} color="#0284c7" />;
  if (error || !data) return <Text style={{ margin: 16, color: '#dc2626' }}>Failed to load place</Text>;

  const primary = data.images.find((i: any) => i.isPrimary) || data.images[0];
  const heroUrl = primary?.url?.startsWith('/') ? `${API_BASE_URL}${primary.url}` : primary?.url;

  const openFullscreen = (url: string | null) => {
    if (!url) return;
    setFullscreenUrl(url);
    setImageModalVisible(true);
  };

  const closeFullscreen = () => {
    setImageModalVisible(false);
    setFullscreenUrl(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      {heroUrl && (
        <View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openFullscreen(heroUrl)}
          >
            <Image source={{ uri: heroUrl }} style={styles.hero} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => nav.goBack()}
            activeOpacity={0.8}
          >
            <View style={styles.backBtnInner}>
              <Text style={styles.backBtnIcon}>‹</Text>
            </View>
          </TouchableOpacity>
          {/* Favorite heart in top-right */}
          {user && (
            <TouchableOpacity
              style={styles.favBtn}
              onPress={toggleFavorite}
              activeOpacity={0.8}
              disabled={favBusy || favorited === null}
            >
              <Text style={[styles.favIcon, favorited && styles.favIconActive]}>
                {favorited ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{data.name}</Text>
        {data.address && <Text style={styles.address}>{data.address}</Text>}
        {data.description && <Text style={styles.desc}>{data.description}</Text>}
        <View style={styles.tagRow}>
          {data.tags.slice(0, 8).map((t: any) => (
            <View key={t.tagId} style={styles.tagChip}>
              <Text style={styles.tagText}>{t.tag.displayName || t.tag.name}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Working Hours</Text>
        {data.workingHours.map((wh: any) => (
          <Text key={wh.id} style={styles.wh}>
            {wh.dayOfWeek}: {wh.isClosed ? 'Closed' : `${wh.openTime} - ${wh.closeTime}`}
          </Text>
        ))}
        <Text style={styles.sectionTitle}>Gallery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {data.images.map((img: any) => {
            const u = img.url.startsWith('/') ? `${API_BASE_URL}${img.url}` : img.url;
            return (
              <TouchableOpacity
                key={img.id}
                activeOpacity={0.9}
                onPress={() => openFullscreen(u)}
              >
                <Image source={{ uri: u }} style={styles.galleryImg} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ScrollView>

      {/* Fullscreen image modal */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFullscreen}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={closeFullscreen}
        >
          <TouchableOpacity
            style={styles.modalCloseBtn}
            activeOpacity={0.8}
            onPress={closeFullscreen}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {fullscreenUrl && (
            <Image
              source={{ uri: fullscreenUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 40 },
  hero: { width: '100%', height: 240 },
  name: { fontSize: 26, fontWeight: '700', color: '#0f172a', marginTop: 16, paddingHorizontal: 16 },
  address: { fontSize: 14, color: '#64748b', paddingHorizontal: 16, marginTop: 4 },
  desc: { fontSize: 15, color: '#334155', paddingHorizontal: 16, marginTop: 12, lineHeight: 21 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginTop: 16 },
  tagChip: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { color: '#0369a1', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0284c7', paddingHorizontal: 16, marginTop: 24 },
  wh: { fontSize: 13, color: '#475569', paddingHorizontal: 16, marginTop: 6 },
  galleryImg: { width: 140, height: 100, borderRadius: 12, marginRight: 12, backgroundColor: '#e2e8f0' },
  backBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  backBtnInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: -2,
  },
  favBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  favIcon: {
    fontSize: 20,
    color: '#64748b',
  },
  favIconActive: {
    color: '#dc2626',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: '700',
  },
});
