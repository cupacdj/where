import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_LOCAL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://localhost:4000';

// Prefer Expo runtime env (EXPO_PUBLIC_*), then app config extras, then generic env, then default
const ENV_BASE =
  (globalThis as any).process?.env?.EXPO_PUBLIC_API_BASE_URL ||
  (Constants.expoConfig?.extra as any)?.API_BASE_URL ||
  (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_API_BASE_URL ||
  (globalThis as any).process?.env?.API_BASE_URL;

const API_BASE_URL = ENV_BASE || DEFAULT_LOCAL;

async function request<T>(path: string, options: RequestInit = {}, timeoutMs = 10000): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const token = await AsyncStorage.getItem('accessToken');

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let message = text || `HTTP ${res.status}`;
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.message)) message = parsed.message.join('\n');
        else if (parsed.message) message = parsed.message;
        else if (parsed.error) message = parsed.error;
      } catch {}
      console.warn('HTTP error', res.status, message);
      throw new Error(message);
    }

    return res.json() as Promise<T>;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timeout. Server unreachable.');
    }
    if (err.message?.includes('Network request failed')) {
      throw new Error('Network error. Check API_BASE_URL / connectivity.');
    }
    console.warn('Request error', err);
    throw new Error(err.message || 'Unknown network error');
  } finally {
    clearTimeout(t);
  }
}

export const httpClient = {
  get: <T>(path: string, timeoutMs?: number) => request<T>(path, {}, timeoutMs),
  post: <T>(path: string, body: unknown, timeoutMs?: number) =>
    request<T>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      timeoutMs
    ),
};
