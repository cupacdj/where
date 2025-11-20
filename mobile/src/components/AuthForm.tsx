import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export const AuthForm: React.FC = () => {
  const { signUp, login } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // login
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');

  // signup
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'man' | 'woman'>('man');

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
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
    ]).start();
  }, []);

  useEffect(() => {
    if (!busy) return;
    const id = setTimeout(() => {
      setBusy(false);
      setError((e) => e || 'Operation timed out. Check connection.');
    }, 15000);
    return () => clearTimeout(id);
  }, [busy]);

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    setError(null);
    setPassword('');
    if (mode === 'login') {
      setIdentifier('');
    } else {
      setUsername('');
      setName('');
      setSurname('');
      setEmail('');
    }
  }, [mode]);

  const clearErrorOnEdit = () => {
    if (error) setError(null);
  };

  const validateSignup = () => {
    const errs: string[] = [];
    if (!username.trim()) errs.push('Username is required.');
    if (!name.trim()) errs.push('Name is required.');
    if (!surname.trim()) errs.push('Surname is required.');
    if (!email.trim()) errs.push('Email is required.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.push('Email format is invalid.');
    if (!password) errs.push('Password is required.');
    else if (password.length < 6) errs.push('Password must be at least 6 characters.');
    return errs;
  };

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') {
        const errs = validateSignup();
        if (errs.length) throw new Error(errs.join('\n'));
        await signUp({
          email: email.trim(),
          username: username.trim(),
          name: name.trim(),
          surname: surname.trim(),
          password,
          gender,
        });
      } else {
        if (!identifier.trim() || !password) {
          throw new Error('Identifier and password are required.');
        }
        await login(identifier.trim(), password);
      }
    } catch (e: any) {
      let msg = e.message || 'Failed';
      try {
        const parsed = JSON.parse(msg);
        if (Array.isArray(parsed.message)) msg = parsed.message.join('\n');
        else if (parsed.message) msg = parsed.message;
      } catch {}
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={styles.headerSubtitle}>
          {mode === 'signup' ? 'Join us to discover amazing places' : 'Login to continue your journey'}
        </Text>
      </View>

      {mode === 'signup' ? (
        <>
          <TextInput
            placeholder="Username"
            placeholderTextColor="#6b7280"
            style={styles.input}
            value={username}
            onChangeText={(v) => { clearErrorOnEdit(); setUsername(v); }}
          />
          <TextInput
            placeholder="Name"
            placeholderTextColor="#6b7280"
            style={styles.input}
            value={name}
            onChangeText={(v) => { clearErrorOnEdit(); setName(v); }}
          />
          <TextInput
            placeholder="Surname"
            placeholderTextColor="#6b7280"
            style={styles.input}
            value={surname}
            onChangeText={(v) => { clearErrorOnEdit(); setSurname(v); }}
          />
          <TextInput
            placeholder="email"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={(v) => { clearErrorOnEdit(); setEmail(v); }}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={(v) => { clearErrorOnEdit(); setPassword(v); }}
          />
          <View style={styles.genderRow}>
            <TouchableOpacity
              onPress={() => setGender('man')}
              style={[styles.genderBtn, gender === 'man' && styles.genderBtnActive]}
            >
              <Text style={[styles.genderText, gender === 'man' && styles.genderTextActive]}>Man</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGender('woman')}
              style={[styles.genderBtn, gender === 'woman' && styles.genderBtnActive]}
            >
              <Text style={[styles.genderText, gender === 'woman' && styles.genderTextActive]}>Woman</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <TextInput
            placeholder="Email or Username"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            style={styles.input}
            value={identifier}
            onChangeText={(v) => { clearErrorOnEdit(); setIdentifier(v); }}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={(v) => { clearErrorOnEdit(); setPassword(v); }}
          />
        </>
      )}

      <TouchableOpacity style={[styles.button, busy && styles.buttonBusy]} onPress={submit} disabled={busy}>
        {busy ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.buttonText}>Processing...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </Text>
        )}
      </TouchableOpacity>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#dc2626" />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
        <Text style={styles.switch}>
          {mode === 'signup' ? 'Have an account? Login' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 24,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContainer: {
    marginBottom: 8,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    fontWeight: '500',
  },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  genderBtnActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#0284c7',
    borderWidth: 2,
  },
  genderText: { color: '#475569', fontWeight: '600' },
  genderTextActive: { color: '#0369a1' },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  buttonBusy: {
    backgroundColor: '#64748b',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  switch: {
    color: '#0284c7',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
    fontSize: 15,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  error: { flex: 1, color: '#dc2626', fontSize: 13, lineHeight: 18, fontWeight: '500' },
});
