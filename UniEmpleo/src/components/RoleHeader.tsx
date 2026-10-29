import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserRole } from '@/data/mock-data';

interface RoleHeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenLoginModal?: () => void;
  userName?: string;
}

export const RoleHeader: React.FC<RoleHeaderProps> = ({
  currentRole,
  onSelectRole,
  onOpenLoginModal,
  userName,
}) => {
  const getRoleStories = () => {
    switch (currentRole) {
      case 'student':
        return 'HU-01 · HU-04 · HU-05 · HU-06 · HU-09';
      case 'company':
        return 'HU-02 · HU-03 · HU-07';
      case 'admin':
        return 'HU-02 · HU-08';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text style={styles.brandTitle}>UniEmpleo</Text>
          <Text style={styles.brandSubtitle}>UNIPAZ · Barrancabermeja</Text>
        </View>

        {onOpenLoginModal && (
          <TouchableOpacity
            style={styles.authBadge}
            onPress={onOpenLoginModal}
            activeOpacity={0.8}>
            <Text style={styles.authBadgeText}>🔑 Probar Auth (HU-01)</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.roleTabsContainer}>
        <TouchableOpacity
          style={[styles.roleTab, currentRole === 'student' && styles.roleTabActive]}
          onPress={() => onSelectRole('student')}>
          <Text style={[styles.roleTabText, currentRole === 'student' && styles.roleTabTextActive]}>
            🎓 Estudiante
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, currentRole === 'company' && styles.roleTabActive]}
          onPress={() => onSelectRole('company')}>
          <Text style={[styles.roleTabText, currentRole === 'company' && styles.roleTabTextActive]}>
            🏢 Empresa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleTab, currentRole === 'admin' && styles.roleTabActive]}
          onPress={() => onSelectRole('admin')}>
          <Text style={[styles.roleTabText, currentRole === 'admin' && styles.roleTabTextActive]}>
            🛡️ Admin
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.storiesBanner}>
        <Text style={styles.storiesLabel}>Criterios activos:</Text>
        <Text style={styles.storiesTags}>{getRoleStories()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F766E', // Verde UNIPAZ elegante
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
    marginBottom: 12,
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
    color: '#CCFBF1',
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
  roleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E6FFFA',
  },
  roleTabTextActive: {
    color: '#0F766E',
    fontWeight: '700',
  },
  storiesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  storiesLabel: {
    fontSize: 11,
    color: '#99F6E4',
    fontWeight: '600',
  },
  storiesTags: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
