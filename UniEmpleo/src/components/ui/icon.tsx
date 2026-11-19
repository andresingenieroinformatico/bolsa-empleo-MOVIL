import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * Single source of truth for iconography. Icon fonts render crisp glyphs on
 * every platform and keep the interface free of emoji.
 */
export function Icon({ name, size = 20, color = '#596377' }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
