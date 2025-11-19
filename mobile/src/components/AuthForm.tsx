import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const AuthForm: React.FC = () => {
  const { signUp, login } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

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
    if (!busy) return;
    const id = setTimeout(() => {
      setBusy(false);
      setError((e) => e || 'Operation timed out. Check connection.');
    }, 15000);
    return () => clearTimeout(id);
  }, [busy]);

  useEffect(() => {
    // clear form + errors when switching modes
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
    <View style={styles.card}>
      <Text style={styles.header}>{mode === 'signup' ? 'Create account' : 'Login'}</Text>

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

      <TouchableOpacity style={[styles.button, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
        <Text style={styles.buttonText}>
          {busy ? 'Please wait...' : mode === 'signup' ? 'Sign Up' : 'Login'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
        <Text style={styles.switch}>
          {mode === 'signup' ? 'Have an account? Login' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  input: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  genderBtnActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#38bdf8',
  },
  genderText: { color: '#475569', fontWeight: '600' },
  genderTextActive: { color: '#0369a1' },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
  switch: { color: '#0f172a', textAlign: 'center', marginTop: 4, fontWeight: '500' },
  error: { color: '#dc2626', fontSize: 12, lineHeight: 16 },
});
