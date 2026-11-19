import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { UserRole } from '@/data/mock-data';
import { Brand, Radius, Shadows, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';

interface RoleHeaderProps {
  currentRole: UserRole;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  onGoHome?: () => void;
  onOpenNotifications?: () => void;
  unreadNotifications?: number;
  userName?: string;
}

const ROLE_META: Record<UserRole, { label: string; icon: IconName }> = {
  student: { label: 'Estudiante', icon: 'school-outline' },
  company: { label: 'Empresa', icon: 'business-outline' },
  admin: { label: 'Administrador', icon: 'shield-checkmark-outline' },
};

/** Brand header: navy identity bar with the session state on the right. */
export const RoleHeader: React.FC<RoleHeaderProps> = ({
  currentRole,
  onOpenLoginModal,
  onLogout,
  onGoHome,
  onOpenNotifications,
  unreadNotifications = 0,
  userName,
}) => {
  const role = ROLE_META[currentRole];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ir a la página de inicio"
          onPress={onGoHome}
          style={({ pressed }) => [styles.brand, pressed && styles.pressed]}>
          <Image
            accessibilityLabel="Logo de UniEmpleo"
            resizeMode="contain"
            source={require('../../assets/images/uniempleo-logo.png')}
            style={styles.brandLogo}
          />
          <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>UniEmpleo</Text>
            <Text style={styles.brandSubtitle}>UNIPAZ · Barrancabermeja</Text>
          </View>
        </Pressable>

        {userName && onLogout ? (
          <View style={styles.sessionArea}>
            <View style={styles.sessionCopy}>
              <Text style={styles.sessionName} numberOfLines={1}>
                {userName}
              </Text>
              <View style={styles.rolePill}>
                <Icon name={role.icon} size={11} color={Brand.greenTint} />
                <Text style={styles.roleText}>{role.label}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                unreadNotifications > 0
                  ? `Notificaciones, ${unreadNotifications} sin leer`
                  : 'Notificaciones'
              }
              onPress={onOpenNotifications}
              hitSlop={8}
              style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}>
              <Icon name="notifications-outline" size={18} color={Brand.surface} />
              {unreadNotifications > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              onPress={onLogout}
              hitSlop={8}
              style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}>
              <Icon name="log-out-outline" size={18} color={Brand.surface} />
            </Pressable>
          </View>
        ) : onOpenLoginModal ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
            onPress={onOpenLoginModal}
            style={({ pressed }) => [styles.loginButton, pressed && styles.loginPressed]}>
            <Avatar name={userName} size={24} tone="soft" />
            <Text style={styles.loginText}>Iniciar sesión</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.navy,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    ...Shadows.raised,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Brand.surface,
  },
  brandCopy: {
    gap: 1,
  },
  brandTitle: {
    ...Type.heading,
    fontSize: 18,
    color: Brand.surface,
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    ...Type.caption,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.62)',
    letterSpacing: 0.1,
  },
  sessionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  sessionCopy: {
    alignItems: 'flex-end',
    gap: 3,
    flexShrink: 1,
  },
  sessionName: {
    ...Type.label,
    color: Brand.surface,
    fontSize: 11,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: Brand.navyLine,
  },
  roleText: {
    ...Type.overline,
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.82)',
    letterSpacing: 0.5,
  },
  signOut: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: Brand.navyLine,
  },
  signOutPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: Brand.green,
    borderWidth: 1.5,
    borderColor: Brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    ...Type.overline,
    fontSize: 8,
    lineHeight: 10,
    color: Brand.surface,
    letterSpacing: 0,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: Brand.navyLine,
  },
  loginPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  loginText: {
    ...Type.label,
    color: Brand.surface,
    fontSize: 11,
  },
});
