import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ApiUser } from './api';

const SESSION_KEY = 'uniempleo.auth-session';
let webSession: AuthSession | null = null;

export interface AuthSession {
  token: string;
  user: ApiUser;
}

function isApiUser(value: unknown): value is ApiUser {
  if (!value || typeof value !== 'object') return false;
  const user = value as Record<string, unknown>;
  return (
    (typeof user.id === 'string' || typeof user.id === 'number') &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    (user.role === 'student' || user.role === 'company' || user.role === 'admin')
  );
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  if (Platform.OS === 'web') {
    webSession = session;
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  if (Platform.OS === 'web') {
    return webSession;
  }

  const stored = await SecureStore.getItemAsync(SESSION_KEY);
  if (!stored) return null;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as Record<string, unknown>).token === 'string' &&
      isApiUser((parsed as Record<string, unknown>).user)
    ) {
      return parsed as AuthSession;
    }
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }

  return null;
}

export async function clearAuthSession(): Promise<void> {
  if (Platform.OS === 'web') {
    webSession = null;
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
