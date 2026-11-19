import * as SecureStore from 'expo-secure-store';
import type { ApiUser } from './api';

const SESSION_KEY = 'uniempleo.auth-session';

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
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function loadAuthSession(): Promise<AuthSession | null> {
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
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
