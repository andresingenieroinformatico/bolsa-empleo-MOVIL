import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserRole } from '@/data/mock-data';

interface RoleHeaderProps {
  currentRole: UserRole;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  onGoHome?: () => void;
  userName?: string;
}

export const RoleHeader: React.FC<RoleHeaderProps> = ({
  currentRole,
  onOpenLoginModal,
  onLogout,
  onGoHome,
  userName,
}) => {
  const roleNames: Record<UserRole, string> = {
    student: 'Estudiante',
    company: 'Empresa',
    admin: 'Administrador',
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Ir a la página de inicio"
          onPress={onGoHome}
          style={styles.titleArea}>
          <Text style={styles.brandTitle}>UniEmpleo</Text>
          <Text style={styles.brandSubtitle}>
            {userName ? `${roleNames[currentRole]} · ${userName}` : 'UNIPAZ · Barrancabermeja'}
          </Text>
        </TouchableOpacity>

        {userName && onLogout ? (
          <TouchableOpacity
            style={styles.authBadge}
            onPress={onLogout}
            activeOpacity={0.8}>
            <Text style={styles.authBadgeText}>Cerrar sesión</Text>
          </TouchableOpacity>
        ) : onOpenLoginModal ? (
          <TouchableOpacity
            style={styles.authBadge}
            onPress={onOpenLoginModal}
            activeOpacity={0.8}>
            <Text style={styles.authBadgeText}>Iniciar sesión</Text>
          </TouchableOpacity>
        ) : null}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#10235F',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  titleArea: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#E6F7ED',
    fontWeight: '500',
  },
  authBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  authBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
