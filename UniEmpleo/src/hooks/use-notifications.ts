import { useCallback, useEffect, useState } from 'react';
import { AppNotification } from '@/data/mock-data';
import {
  getNotifications,
  getNotificationsUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  unwrapData,
  unwrapList,
} from '@/services/api';
import { mapNotification } from '@/services/api-mappers';

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

function readUnreadCount(value: unknown): number {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 0;
  const parsed = Number((value as { unread_count?: unknown }).unread_count);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Notifications belong to the signed-in account, so every role gets its own
 * feed from the same endpoint. The hook keeps the bell badge in sync with the
 * list and degrades to an empty state when the API has nothing to show.
 */
export function useNotifications(token: string | null | undefined): NotificationsState {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [listResponse, countResponse] = await Promise.all([
        getNotifications(token),
        getNotificationsUnreadCount(token),
      ]);
      setNotifications(unwrapList<unknown>(listResponse).map(mapNotification));
      setUnreadCount(readUnreadCount(unwrapData(countResponse)));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible cargar tus notificaciones.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const markRead = useCallback(
    async (id: string) => {
      if (!token) return;
      const target = notifications.find((notification) => notification.id === id);
      await markNotificationAsRead(token, id);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, readAt: new Date().toISOString() }
            : notification,
        ),
      );
      if (target && !target.readAt) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    },
    [notifications, token],
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;
    await markAllNotificationsAsRead(token);
    const now = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) =>
        notification.readAt ? notification : { ...notification, readAt: now },
      ),
    );
    setUnreadCount(0);
  }, [token]);

  return { notifications, unreadCount, isLoading, error, refresh, markRead, markAllRead };
}
