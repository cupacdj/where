import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { placesApi } from '../api/placesApi';
import { PlaceCard } from '../components/PlaceCard';

export const AccountScreen: React.FC = () => {
  const { user, loading, logout, updateProfile } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editSurname, setEditSurname] = useState(user?.surname || '');
  const [editPasswordCurrent, setEditPasswordCurrent] = useState('');
  const [editPasswordNext, setEditPasswordNext] = useState('');
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favorites, setFavorites] = useState<any[] | null>(null);
  const [favLoading, setFavLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (user) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pickAvatar = async () => {
    setAvatarLoading(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        setAvatarLoading(false);
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (!res.canceled && res.assets[0]) {
        await updateProfile({ avatarUri: res.assets[0].uri });
      }
    } finally {
      setAvatarLoading(false);
    }
  };

  const openSettings = () => {
    setEditName(user?.name || '');
    setEditSurname(user?.surname || '');
    setEditPasswordCurrent('');
    setEditPasswordNext('');
    setSettingsError(null);
    setSettingsOpen(true);
  };

  const saveSettings = async () => {
    setSettingsError(null);
    try {
      const passwordPayload = editPasswordNext
        ? { current: editPasswordCurrent, next: editPasswordNext }
        : undefined;
      if (passwordPayload && (!passwordPayload.current || passwordPayload.next.length < 6)) {
        setSettingsError('Provide current password and new password (min 6 chars).');
        return;
      }
      await updateProfile({
        name: editName.trim(),
        surname: editSurname.trim(),
        password: passwordPayload,
      });
      setSettingsOpen(false);
    } catch (e: any) {
      setSettingsError(e.message || 'Failed to update.');
    }
  };

  const openFavorites = async () => {
    if (!user) return;
    setFavoritesOpen(true);
    setFavLoading(true);
    try {
      const data = await placesApi.getFavorites();
      setFavorites(data);
    } catch {
      setFavorites([]);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      {user ? (
        <Animated.View
          style={[
            styles.profileContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={logout}
              style={[styles.topIconBtn, styles.logoutBtn]}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openSettings} style={styles.topIconBtn} activeOpacity={0.7}>
              <Ionicons name="settings-outline" size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={pickAvatar}
              disabled={avatarLoading}
              activeOpacity={0.8}
            >
              {user.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {(user.name?.[0] || '?').toUpperCase()}{(user.surname?.[0] || '').toUpperCase()}
                  </Text>
                </View>
              )}
              {avatarLoading && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color="#ffffff" size="small" />
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.nameText}>{[user.name, user.surname].filter(Boolean).join(' ')}</Text>
          <Text style={styles.emailText}>{user.email}</Text>

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={openFavorites}>
              <Ionicons name="heart" size={24} color="#dc2626" />
              <Text style={styles.statNumber}>
                {favorites?.length ?? 0}
              </Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </TouchableOpacity>
            <View style={styles.statCard}>
              <Ionicons name="location" size={24} color="#0284c7" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Visited</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          <Modal visible={settingsOpen} transparent animationType="fade">
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setSettingsOpen(false)}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Ionicons name="person-circle-outline" size={32} color="#0284c7" />
                    <Text style={styles.modalTitle}>Edit Profile</Text>
                  </View>
                  <TextInput
                    placeholder="Name"
                    placeholderTextColor="#94a3b8"
                    style={styles.modalInput}
                    value={editName}
                    onChangeText={setEditName}
                  />
                  <TextInput
                    placeholder="Surname"
                    placeholderTextColor="#94a3b8"
                    style={styles.modalInput}
                    value={editSurname}
                    onChangeText={setEditSurname}
                  />
                  <TextInput
                    placeholder="Current Password"
                    placeholderTextColor="#94a3b8"
                    style={styles.modalInput}
                    secureTextEntry
                    value={editPasswordCurrent}
                    onChangeText={setEditPasswordCurrent}
                  />
                  <TextInput
                    placeholder="New Password (optional)"
                    placeholderTextColor="#94a3b8"
                    style={styles.modalInput}
                    secureTextEntry
                    value={editPasswordNext}
                    onChangeText={setEditPasswordNext}
                  />
                  {settingsError && (
                    <Text style={{ color: '#dc2626', fontSize: 12 }}>{settingsError}</Text>
                  )}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnPrimary]}
                      onPress={saveSettings}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                      <Text style={styles.modalBtnText}>Save Changes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnSecondary]}
                      onPress={() => setSettingsOpen(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.modalBtnText, { color: '#64748b' }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>

          {/* Favorites modal */}
          <Modal visible={favoritesOpen} transparent animationType="slide">
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setFavoritesOpen(false)}
            >
              <TouchableWithoutFeedback>
                <View style={[styles.modalCard, { maxHeight: '80%' }]}>
                  <View style={styles.modalHeader}>
                    <Ionicons name="heart" size={28} color="#dc2626" />
                    <Text style={styles.modalTitle}>Your Favorites</Text>
                  </View>
                  {favLoading ? (
                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                      <ActivityIndicator color="#0284c7" />
                    </View>
                  ) : favorites && favorites.length > 0 ? (
                    <ScrollView
                      style={{ maxHeight: 400 }}
                      contentContainerStyle={{ paddingBottom: 12 }}
                    >
                      {favorites.map((p, idx) => (
                        <View key={p.id} style={{ marginBottom: 12 }}>
                          <PlaceCard place={p} index={idx} />
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <Text style={{ color: '#64748b', fontSize: 14 }}>
                      You don&apos;t have any favorites yet.
                    </Text>
                  )}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnSecondary]}
                      onPress={() => setFavoritesOpen(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.modalBtnText, { color: '#64748b' }]}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>
        </Animated.View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.authScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.authCenter}>
              <AuthForm />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  profileContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  topIconBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarInitials: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0284c7',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#0284c7',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 70,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0f172a',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    fontWeight: '500',
  },
  modalButtons: {
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalBtnPrimary: {
    backgroundColor: '#0284c7',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalBtnSecondary: {
    backgroundColor: '#f1f5f9',
  },
  modalBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  authCenter: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
});
