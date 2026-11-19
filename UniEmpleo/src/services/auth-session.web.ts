import type { ApiUser } from './api';

const SESSION_KEY = 'uniempleo.auth-session';

let webSession: AuthSession | null = null;

export interface AuthSession {
  token: string;
  user: ApiUser;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
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
  webSession = session;
  try {
    getStorage()?.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // The in-memory session still works for the current visit.
  }
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  if (webSession) return webSession;

  try {
    const stored = getStorage()?.getItem(SESSION_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as Record<string, unknown>).token === 'string' &&
      isApiUser((parsed as Record<string, unknown>).user)
    ) {
      webSession = parsed as AuthSession;
      return webSession;
    }
  } catch {
    // Ignore corrupted or unavailable local storage.
  }

  return null;
}

export async function clearAuthSession(): Promise<void> {
  webSession = null;
  try {
    getStorage()?.removeItem(SESSION_KEY);
  } catch {
    // Nothing else to clear when storage is unavailable.
  }
}
