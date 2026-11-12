import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Radius, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';

interface ChipProps {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'neutral' | 'green' | 'navy';
  accessibilityLabel?: string;
}

const TONE_STYLES = {
  neutral: {
    border: Brand.line,
    background: Brand.surface,
    text: Brand.inkSoft,
    icon: Brand.slate,
    selectedBackground: Brand.surfaceSunken,
    selectedBorder: Brand.lineStrong,
    selectedText: Brand.ink,
  },
  green: {
    border: Brand.greenLine,
    background: Brand.greenTint,
    text: Brand.greenDark,
    icon: Brand.greenDark,
    selectedBackground: Brand.green,
    selectedBorder: Brand.green,
    selectedText: Brand.surface,
  },
  navy: {
    border: Brand.navySoft,
    background: Brand.surface,
    text: Brand.navy,
    icon: Brand.navy,
    selectedBackground: Brand.navy,
    selectedBorder: Brand.navy,
    selectedText: Brand.surface,
  },
} as const;

/** Rounded filter/pill control. Used for filters, availability and tags. */
export function Chip({
  label,
  icon,
  selected = false,
  onPress,
  tone = 'neutral',
  accessibilityLabel,
}: ChipProps) {
  const palette = TONE_STYLES[tone];

  const content = (
    <View style={styles.inner}>
      {icon ? (
        <Icon
          name={icon}
          size={14}
          color={selected ? palette.selectedText : palette.icon}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          { color: selected ? palette.selectedText : palette.text },
        ]}>
        {label}
      </Text>
    </View>
  );

  const containerStyle = [
    styles.base,
    {
      backgroundColor: selected ? palette.selectedBackground : palette.background,
      borderColor: selected ? palette.selectedBorder : palette.border,
    },
  ];

  if (!onPress) {
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [...containerStyle, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 34,
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    ...Type.label,
  },
  pressed: {
    opacity: 0.8,
  },
});
