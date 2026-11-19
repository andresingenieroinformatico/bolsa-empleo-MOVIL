import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Brand, Radius, Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  tone?: 'default' | 'muted' | 'tinted' | 'navy' | 'flat';
  padded?: boolean;
}

const TONES: Record<NonNullable<CardProps['tone']>, ViewStyle> = {
  default: { backgroundColor: Brand.surface, borderColor: Brand.line },
  muted: { backgroundColor: Brand.surfaceMuted, borderColor: Brand.lineSoft },
  tinted: { backgroundColor: Brand.greenTint, borderColor: Brand.greenLine },
  navy: { backgroundColor: Brand.navy, borderColor: Brand.navySoft },
  flat: { backgroundColor: Brand.surface, borderColor: 'transparent' },
};

export function Card({
  children,
  style,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  tone = 'default',
  padded = true,
}: CardProps) {
  const content = [
    styles.card,
    TONES[tone],
    tone === 'navy' && styles.navyShadow,
    padded && styles.padded,
    style,
  ];

  if (!onPress) {
    return <View style={content}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [...content, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    ...Shadows.card,
  },
  navyShadow: {
    ...Shadows.raised,
  },
  padded: {
    padding: 16,
  },
  pressed: {
    opacity: 0.88,
  },
});
