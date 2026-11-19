import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ApplicationStatus, CompanyStatus } from '@/data/mock-data';
import { Brand, Radius, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';

interface StatusBadgeProps {
  status: ApplicationStatus | CompanyStatus | 'active' | 'paused' | 'closed';
  label?: string;
  size?: 'small' | 'medium';
}

type BadgeConfig = {
  bg: string;
  border: string;
  color: string;
  icon: IconName;
  text: string;
};

/**
 * Status pill shared by applications, companies and job offers.
 * Uses a dot + icon instead of emoji so it reads as product UI.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'medium' }) => {
  const config = getBadgeConfig(status, label);
  const isSmall = size === 'small';

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={config.text}
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
        isSmall && styles.badgeSmall,
      ]}>
      <Icon name={config.icon} size={isSmall ? 12 : 13} color={config.color} />
      <Text style={[styles.text, { color: config.color }, isSmall && styles.textSmall]}>
        {config.text}
      </Text>
    </View>
  );
};

function getBadgeConfig(
  status: StatusBadgeProps['status'],
  label?: string,
): BadgeConfig {
  switch (status) {
    case 'pending':
      return {
        bg: Brand.amberTint,
        border: Brand.amberLine,
        color: Brand.amber,
        text: label || 'Pendiente',
        icon: 'time-outline',
      };
    case 'reviewed':
      return {
        bg: Brand.blueTint,
        border: Brand.blueLine,
        color: Brand.blue,
        text: label || 'En revisión',
        icon: 'eye-outline',
      };
    case 'interview':
      return {
        bg: '#EEF0FD',
        border: '#D5D9F7',
        color: '#3B3F94',
        text: label || 'Entrevista',
        icon: 'calendar-outline',
      };
    case 'accepted':
    case 'approved':
    case 'active':
      return {
        bg: Brand.greenTint,
        border: Brand.greenLine,
        color: Brand.greenDark,
        text:
          label ||
          (status === 'active' ? 'Activa' : status === 'approved' ? 'Aprobada' : 'Aceptado'),
        icon: 'checkmark-circle-outline',
      };
    case 'rejected':
      return {
        bg: Brand.redTint,
        border: Brand.redLine,
        color: Brand.red,
        text: label || 'Rechazado',
        icon: 'close-circle-outline',
      };
    case 'paused':
    case 'closed':
    case 'inactive':
      return {
        bg: Brand.surfaceMuted,
        border: Brand.line,
        color: Brand.slate,
        text:
          label ||
          (status === 'paused' ? 'Pausada' : status === 'closed' ? 'Cerrada' : 'Inactiva'),
        icon: 'pause-circle-outline',
      };
    default:
      return {
        bg: Brand.surfaceMuted,
        border: Brand.line,
        color: Brand.slate,
        text: label || String(status),
        icon: 'ellipse-outline',
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  badgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },
  text: {
    ...Type.label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  textSmall: {
    fontSize: 10,
  },
});
