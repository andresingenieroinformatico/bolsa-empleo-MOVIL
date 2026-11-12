import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Radius, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';

type NoticeTone = 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface NoticeProps {
  tone?: NoticeTone;
  title?: string;
  message: string;
  icon?: IconName;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

const TONES: Record<NoticeTone, { bg: string; border: string; text: string; icon: string; defaultIcon: IconName }> = {
  success: {
    bg: Brand.greenTint,
    border: Brand.greenLine,
    text: Brand.greenDeep,
    icon: Brand.greenDark,
    defaultIcon: 'checkmark-circle-outline',
  },
  error: {
    bg: Brand.redTint,
    border: Brand.redLine,
    text: Brand.red,
    icon: Brand.red,
    defaultIcon: 'alert-circle-outline',
  },
  warning: {
    bg: Brand.amberTint,
    border: Brand.amberLine,
    text: Brand.amber,
    icon: Brand.amber,
    defaultIcon: 'warning-outline',
  },
  info: {
    bg: Brand.blueTint,
    border: Brand.blueLine,
    text: Brand.blue,
    icon: Brand.blue,
    defaultIcon: 'information-circle-outline',
  },
  neutral: {
    bg: Brand.surfaceMuted,
    border: Brand.line,
    text: Brand.slate,
    icon: Brand.slate,
    defaultIcon: 'information-circle-outline',
  },
};

/** Inline feedback banner. Replaces ad-hoc colored Views across screens. */
export function Notice({
  tone = 'neutral',
  title,
  message,
  icon,
  onDismiss,
  actionLabel,
  onAction,
}: NoticeProps) {
  const palette = TONES[tone];

  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      style={[styles.base, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Icon name={icon ?? palette.defaultIcon} size={19} color={palette.icon} />
      <View style={styles.copy}>
        {title ? <Text style={[styles.title, { color: palette.text }]}>{title}</Text> : null}
        <Text style={[styles.message, { color: palette.text }]}>{message}</Text>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={onAction}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
            <Text style={[styles.actionText, { color: palette.text }]}>{actionLabel}</Text>
            <Icon name="arrow-forward" size={13} color={palette.text} />
          </Pressable>
        ) : null}
      </View>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Descartar mensaje"
          hitSlop={10}
          onPress={onDismiss}>
          <Icon name="close" size={16} color={palette.icon} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Type.bodyStrong,
    fontWeight: '700',
  },
  message: {
    ...Type.caption,
    lineHeight: 18,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionText: {
    ...Type.label,
    fontWeight: '800',
  },
});
