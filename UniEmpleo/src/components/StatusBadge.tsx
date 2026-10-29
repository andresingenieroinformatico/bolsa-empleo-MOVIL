import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ApplicationStatus, CompanyStatus } from '@/data/mock-data';

interface StatusBadgeProps {
  status: ApplicationStatus | CompanyStatus | 'active' | 'paused' | 'closed';
  label?: string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'medium' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'pending':
        return {
          bg: '#FEF3C7',
          color: '#92400E',
          text: label || 'Pendiente',
          icon: '⏳',
        };
      case 'reviewed':
        return {
          bg: '#DBEAFE',
          color: '#1E40AF',
          text: label || 'En revisión',
          icon: '👀',
        };
      case 'interview':
        return {
          bg: '#EDE9FE',
          color: '#5B21B6',
          text: label || 'Entrevista',
          icon: '📅',
        };
      case 'accepted':
      case 'approved':
      case 'active':
        return {
          bg: '#D1FAE5',
          color: '#065F46',
          text: label || (status === 'active' ? 'Activa' : status === 'approved' ? 'Aprobada' : 'Aceptado'),
          icon: '✅',
        };
      case 'rejected':
        return {
          bg: '#FEE2E2',
          color: '#991B1B',
          text: label || 'Rechazado',
          icon: '❌',
        };
      case 'paused':
      case 'closed':
      case 'inactive':
        return {
          bg: '#F3F4F6',
          color: '#4B5563',
          text: label || (status === 'paused' ? 'Pausada' : status === 'closed' ? 'Cerrada' : 'Inactiva'),
          icon: '⏸️',
        };
      default:
        return {
          bg: '#E5E7EB',
          color: '#374151',
          text: label || String(status),
          icon: '•',
        };
    }
  };

  const config = getBadgeConfig();
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, isSmall && styles.badgeSmall]}>
      <Text style={[styles.icon, isSmall && styles.iconSmall]}>{config.icon}</Text>
      <Text style={[styles.text, { color: config.color }, isSmall && styles.textSmall]}>
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
  },
  icon: {
    fontSize: 12,
  },
  iconSmall: {
    fontSize: 10,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSmall: {
    fontSize: 11,
  },
});
