import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';

export type StatTone = 'green' | 'navy' | 'blue' | 'amber';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: IconName;
  tone?: StatTone;
  helper?: string;
}

const TONES: Record<StatTone, { tile: string; icon: string }> = {
  green: { tile: Brand.greenTint, icon: Brand.greenDark },
  navy: { tile: Brand.blueTint, icon: Brand.navy },
  blue: { tile: Brand.blueTint, icon: Brand.blue },
  amber: { tile: Brand.amberTint, icon: Brand.amber },
};

/** Compact KPI card used by the three role dashboards. */
export function StatCard({ label, value, icon, tone = 'green', helper }: StatCardProps) {
  const palette = TONES[tone];

  return (
    <View
      style={styles.card}
      accessibilityRole="summary"
      accessibilityLabel={`${label}: ${value}${helper ? `. ${helper}` : ''}`}>
      <View style={[styles.tile, { backgroundColor: palette.tile }]}>
        <Icon name={icon} size={18} color={palette.icon} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      {helper ? (
        <Text style={styles.helper} numberOfLines={2}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
  },
  card: {
    flexGrow: 1,
    flexBasis: 148,
    minWidth: 140,
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.lg,
    gap: 3,
    ...Shadows.card,
  },
  tile: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  value: {
    ...Type.title,
    color: Brand.ink,
  },
  label: {
    ...Type.label,
    color: Brand.inkSoft,
  },
  helper: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slateSoft,
  },
});
