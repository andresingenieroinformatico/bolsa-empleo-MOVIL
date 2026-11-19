import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand, Type } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional element rendered on the right, usually a link or count. */
  action?: React.ReactNode;
  overline?: string;
}

/** Consistent section title block used across every screen. */
export function SectionHeader({ title, subtitle, action, overline }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        {overline ? <Text style={styles.overline}>{overline}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  overline: {
    ...Type.overline,
    color: Brand.greenDark,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    ...Type.titleSmall,
    color: Brand.ink,
  },
  subtitle: {
    ...Type.caption,
    color: Brand.slate,
    marginTop: 2,
  },
  action: {
    paddingTop: 2,
  },
});
