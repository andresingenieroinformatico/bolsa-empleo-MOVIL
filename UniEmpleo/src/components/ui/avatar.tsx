import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand, Radius } from '@/constants/theme';
import { getInitials } from '@/lib/format';

interface AvatarProps {
  name?: string | null;
  size?: number;
  tone?: 'navy' | 'green' | 'soft';
  /** Optional short label under the initials, e.g. a role. */
  accessibilityLabel?: string;
}

const TONES = {
  navy: { backgroundColor: Brand.navy, color: Brand.surface },
  green: { backgroundColor: Brand.greenTint, color: Brand.greenDark },
  soft: { backgroundColor: Brand.surfaceSunken, color: Brand.slate },
} as const;

/** Initials avatar — avoids generic stock photos and gives the UI a human touch. */
export function Avatar({ name, size = 44, tone = 'green', accessibilityLabel }: AvatarProps) {
  const palette = TONES[tone];

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel ?? name ?? undefined}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: Math.min(size, Radius.xxl),
          backgroundColor: palette.backgroundColor,
        },
      ]}>
      <Text
        style={{
          color: palette.color,
          fontSize: Math.round(size * 0.36),
          fontWeight: '800',
          letterSpacing: -0.2,
        }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
