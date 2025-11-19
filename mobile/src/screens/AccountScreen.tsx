import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export const AccountScreen: React.FC = () => {
  const { user, loading, logout, updateProfile } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editSurname, setEditSurname] = useState(user?.surname || '');
  const [editPasswordCurrent, setEditPasswordCurrent] = useState('');
  const [editPasswordNext, setEditPasswordNext] = useState('');
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  if (loading) return <SafeAreaView style={styles.container}><Text style={styles.subtle}>Loading...</Text></SafeAreaView>;

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

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <View style={styles.topBar}>
        {user && (
          <>
            <TouchableOpacity onPress={logout} style={styles.topIconBtn}>
              <Ionicons name="log-out-outline" size={22} color="#dc2626" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openSettings} style={styles.topIconBtn}>
              <Ionicons name="settings-outline" size={22} color="#0f172a" />
            </TouchableOpacity>
          </>
        )}
      </View>
      {user ? (
        <>
          {/* Avatar */}
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickAvatar} disabled={avatarLoading}>
            {user.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarInitials}>{(user.name?.[0] || '?').toUpperCase()}{(user.surname?.[0] || '').toUpperCase()}</Text>
            )}
            {avatarLoading && <View style={styles.avatarOverlay}><Text style={styles.avatarOverlayText}>...</Text></View>}
          </TouchableOpacity>
          <Text style={styles.nameText}>{[user.name, user.surname].filter(Boolean).join(' ')}</Text>
          <Text style={styles.emailText}>{user.email}</Text>

          <TouchableOpacity style={styles.favBtn}>
            <Ionicons name="heart-outline" size={18} color="#0f172a" />
            <Text style={styles.favBtnText}>Favorites</Text>
          </TouchableOpacity>

          {/* Modal unchanged */}
          <Modal visible={settingsOpen} transparent animationType="slide">
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setSettingsOpen(false)}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
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
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#38bdf8' }]} onPress={saveSettings}>
                      <Text style={styles.modalBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#64748b' }]} onPress={() => setSettingsOpen(false)}>
                      <Text style={styles.modalBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.note}>Password change is local placeholder.</Text>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>
        </>
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
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topIconBtn: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  subtle: { color: '#475569' },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitials: { fontSize: 40, fontWeight: '700', color: '#334155' },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlayText: { color: '#fff', fontSize: 20 },
  nameText: { fontSize: 20, fontWeight: '600', textAlign: 'center', color: '#0f172a' },
  emailText: { fontSize: 14, textAlign: 'center', color: '#475569', marginTop: 4, marginBottom: 16 },
  favBtn: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  favBtnText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    elevation: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  modalInput: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    color: '#0f172a',
  },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  modalBtnText: { color: '#ffffff', fontWeight: '600' },
  note: { fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 4 },
  authCenter: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
});
