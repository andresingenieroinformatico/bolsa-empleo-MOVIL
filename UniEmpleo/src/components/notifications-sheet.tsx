import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppNotification, UserRole } from '@/data/mock-data';
import { Brand, Radius, Space, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { Sheet } from '@/components/ui/sheet';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonBlock } from '@/components/SkeletonBlock';
import { formatRelativeDate } from '@/lib/format';

interface NotificationsSheetProps {
  visible: boolean;
  role: UserRole;
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onRefresh: () => void;
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  /** Opens the section the notification is about. */
  onOpenNotification: (notification: AppNotification) => void;
}

const ROLE_COPY: Record<UserRole, { subtitle: string; emptyTitle: string; emptyBody: string }> = {
  student: {
    subtitle: 'Novedades de tus postulaciones y vacantes.',
    emptyTitle: 'Sin novedades por ahora',
    emptyBody: 'Cuando una empresa revise tus postulaciones verás la actualización en este espacio.',
  },
  company: {
    subtitle: 'Postulaciones nuevas y estado de tu empresa.',
    emptyTitle: 'Sin novedades por ahora',
    emptyBody: 'Aquí llegarán las postulaciones de estudiantes y las respuestas de la administración.',
  },
  admin: {
    subtitle: 'Solicitudes de empresas y actividad de la plataforma.',
    emptyTitle: 'Sin novedades por ahora',
    emptyBody: 'Aquí llegarán las nuevas solicitudes de registro y las alertas de la plataforma.',
  },
};

interface NotificationVisual {
  icon: IconName;
  color: string;
  tint: string;
  line: string;
}

function notificationVisual(type: string): NotificationVisual {
  if (type.includes('company_rejected')) {
    return {
      icon: 'alert-circle-outline',
      color: Brand.red,
      tint: Brand.redTint,
      line: Brand.redLine,
    };
  }
  if (type.includes('company_approved')) {
    return {
      icon: 'shield-checkmark-outline',
      color: Brand.greenDark,
      tint: Brand.greenTint,
      line: Brand.greenLine,
    };
  }
  if (type.includes('company_resubmitted') || type.includes('company_registration')) {
    return {
      icon: 'business-outline',
      color: Brand.blue,
      tint: Brand.blueTint,
      line: Brand.blueLine,
    };
  }
  if (type.includes('new_application')) {
    return {
      icon: 'document-text-outline',
      color: Brand.greenDark,
      tint: Brand.greenTint,
      line: Brand.greenLine,
    };
  }
  if (type.includes('application_status')) {
    return {
      icon: 'megaphone-outline',
      color: Brand.blue,
      tint: Brand.blueTint,
      line: Brand.blueLine,
    };
  }
  return {
    icon: 'notifications-outline',
    color: Brand.slate,
    tint: Brand.surfaceMuted,
    line: Brand.line,
  };
}

export function NotificationsSheet({
  visible,
  role,
  notifications,
  unreadCount,
  isLoading,
  error,
  onClose,
  onRefresh,
  onMarkRead,
  onMarkAllRead,
  onOpenNotification,
}: NotificationsSheetProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const copy = ROLE_COPY[role];

  const handleSelect = async (notification: AppNotification) => {
    if (processingId) return;
    setActionError(null);
    setProcessingId(notification.id);
    try {
      // Opening a notification marks it as read automatically. Even if the
      // request fails we still navigate; the next refresh restores the truth.
      if (!notification.readAt) {
        await onMarkRead(notification.id);
      }
    } catch (markError) {
      setActionError(
        markError instanceof Error
          ? markError.message
          : 'No fue posible marcar la notificación como leída.',
      );
    } finally {
      setProcessingId(null);
    }
    onOpenNotification(notification);
  };

  const handleMarkAll = async () => {
    setActionError(null);
    setIsMarkingAll(true);
    try {
      await onMarkAllRead();
    } catch (markError) {
      setActionError(
        markError instanceof Error
          ? markError.message
          : 'No fue posible marcar todas las notificaciones.',
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Notificaciones"
      subtitle={copy.subtitle}
      icon="notifications-outline"
      closeLabel="Cerrar notificaciones"
      footer={
        unreadCount > 0 ? (
          <Button
            label={isMarkingAll ? 'Marcando…' : 'Marcar todas como leídas'}
            onPress={() => void handleMarkAll()}
            loading={isMarkingAll}
            disabled={unreadCount === 0}
            variant="tonal"
            size="md"
            icon="checkmark-done-outline"
            fullWidth
          />
        ) : null
      }>
      <View style={styles.summary}>
        <View style={[styles.countPill, unreadCount === 0 && styles.countPillMuted]}>
          <Text style={[styles.countText, unreadCount === 0 && styles.countTextMuted]}>
            {unreadCount === 0 ? 'Todo al día' : `${unreadCount} sin leer`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Actualizar notificaciones"
          onPress={onRefresh}
          hitSlop={8}
          style={({ pressed }) => [styles.refresh, pressed && styles.refreshPressed]}>
          <Icon name="refresh-outline" size={16} color={Brand.greenDark} />
          <Text style={styles.refreshText}>Actualizar</Text>
        </Pressable>
      </View>

      {error ? (
        <Notice
          tone="error"
          message={error}
          actionLabel="Reintentar"
          onAction={onRefresh}
        />
      ) : null}
      {actionError ? (
        <Notice tone="error" message={actionError} onDismiss={() => setActionError(null)} />
      ) : null}

      {isLoading && notifications.length === 0 ? (
        <View style={styles.loading} accessibilityLabel="Cargando notificaciones">
          {[0, 1, 2].map((item) => (
            <SkeletonBlock key={item} style={styles.loadingRow} />
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title={copy.emptyTitle}
          description={copy.emptyBody}
        />
      ) : (
        <View style={styles.list} accessibilityRole="list">
          {notifications.map((notification) => {
            const unread = !notification.readAt;
            const visual = notificationVisual(notification.type);
            return (
              <Pressable
                key={notification.id}
                accessibilityRole="button"
                accessibilityLabel={`${unread ? 'No leída. ' : ''}${notification.message}`}
                accessibilityHint="Abre el apartado relacionado y marca la notificación como leída"
                accessibilityState={{ disabled: processingId === notification.id }}
                onPress={() => void handleSelect(notification)}
                style={({ pressed }) => [
                  styles.row,
                  unread && styles.rowUnread,
                  pressed && styles.rowPressed,
                ]}>
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: unread ? visual.tint : Brand.surfaceMuted },
                    { borderColor: unread ? visual.line : Brand.line },
                  ]}>
                  <Icon
                    name={visual.icon}
                    size={18}
                    color={unread ? visual.color : Brand.slateSoft}
                  />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.message}>{notification.message}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.date}>
                      {formatRelativeDate(notification.createdAt)}
                    </Text>
                    {unread ? (
                      <View style={styles.unreadPill}>
                        <View style={styles.unreadDot} />
                        <Text style={styles.unreadText}>Nueva</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <Icon name="chevron-forward" size={15} color={Brand.slateFaint} />
              </Pressable>
            );
          })}
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.md,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Brand.greenTint,
    borderWidth: 1,
    borderColor: Brand.greenLine,
  },
  countPillMuted: {
    backgroundColor: Brand.surfaceMuted,
    borderColor: Brand.line,
  },
  countText: {
    ...Type.label,
    fontSize: 11,
    color: Brand.greenDeep,
  },
  countTextMuted: {
    color: Brand.slate,
  },
  refresh: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 44,
    paddingHorizontal: 6,
  },
  refreshPressed: {
    opacity: 0.7,
  },
  refreshText: {
    ...Type.label,
    color: Brand.greenDark,
  },
  loading: {
    gap: 10,
  },
  loadingRow: {
    height: 64,
    borderRadius: Radius.lg,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    backgroundColor: Brand.surface,
  },
  rowUnread: {
    backgroundColor: Brand.greenTint,
    borderColor: Brand.greenLine,
  },
  rowPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Brand.surfaceMuted,
    borderWidth: 1,
    borderColor: Brand.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  message: {
    ...Type.bodyStrong,
    fontSize: 13,
    lineHeight: 19,
    color: Brand.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slateSoft,
  },
  unreadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.green,
  },
  unreadText: {
    ...Type.overline,
    fontSize: 9,
    color: Brand.greenDeep,
  },
});
