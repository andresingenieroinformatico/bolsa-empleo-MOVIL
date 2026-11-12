import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';

interface InfoRowProps {
  icon?: IconName;
  label: string;
  value: string;
  /** Renders the value as a subtle caption instead of strong text. */
  muted?: boolean;
  last?: boolean;
}

/** Label/value row with a hairline divider — used in detail sheets. */
export function InfoRow({ icon, label, value, muted = false, last = false }: InfoRowProps) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Icon name={icon} size={16} color={Brand.slate} />
        </View>
      ) : null}
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, muted && styles.valueMuted]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Brand.lineSoft,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Brand.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Type.caption,
    color: Brand.slateSoft,
    flex: 1,
    paddingTop: 3,
  },
  value: {
    ...Type.bodyStrong,
    color: Brand.ink,
    flex: 1.4,
    textAlign: 'right',
    paddingTop: 1,
  },
  valueMuted: {
    fontWeight: '400',
    color: Brand.slate,
  },
});
