import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Brand, Radius, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tonal'
  | 'ghost'
  | 'danger'
  | 'light'
  | 'outlineLight';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const HEIGHTS: Record<ButtonSize, number> = { sm: 40, md: 48, lg: 54 };
const FONT_SIZES: Record<ButtonSize, number> = { sm: 12, md: 14, lg: 15 };
const ICON_SIZES: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 19 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const isInactive = disabled || loading;
  const foreground = getForeground(variant);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: HEIGHTS[size],
          paddingHorizontal: size === 'sm' ? 14 : size === 'md' ? 18 : 22,
        },
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isInactive && styles.pressed,
        isInactive && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={ICON_SIZES[size]} color={foreground} /> : null}
          <Text
            style={[
              styles.label,
              { color: foreground, fontSize: FONT_SIZES[size] },
              variant === 'primary' && styles.labelStrong,
              labelStyle,
            ]}>
            {label}
          </Text>
          {iconRight ? <Icon name={iconRight} size={ICON_SIZES[size]} color={foreground} /> : null}
        </View>
      )}
    </Pressable>
  );
}

function getForeground(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return Brand.surface;
    case 'secondary':
      return Brand.ink;
    case 'tonal':
      return Brand.greenDark;
    case 'ghost':
      return Brand.inkSoft;
    case 'danger':
      return Brand.red;
    case 'light':
      return Brand.navy;
    case 'outlineLight':
      return Brand.surface;
    default:
      return Brand.ink;
  }
}

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: Brand.green,
  },
  secondary: {
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.lineStrong,
  },
  tonal: {
    backgroundColor: Brand.greenTint,
    borderWidth: 1,
    borderColor: Brand.greenLine,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Brand.redTint,
    borderWidth: 1,
    borderColor: Brand.redLine,
  },
  light: {
    backgroundColor: Brand.surface,
  },
  outlineLight: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Brand.navyLine,
  },
});

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    ...Type.bodyStrong,
    textAlign: 'center',
  },
  labelStrong: {
    fontWeight: '700',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
});
