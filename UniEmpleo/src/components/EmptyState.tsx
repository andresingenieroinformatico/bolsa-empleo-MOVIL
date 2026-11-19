import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand, Radius, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Empty / zero-result state. Deliberately calm: a tinted glyph, a short
 * headline and one clear next action.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search-outline',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={26} color={Brand.greenDark} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="tonal"
          size="sm"
          style={styles.button}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.line,
    borderStyle: 'dashed',
    marginVertical: 8,
    gap: 4,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.xl,
    backgroundColor: Brand.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    ...Type.heading,
    color: Brand.ink,
    textAlign: 'center',
  },
  description: {
    ...Type.caption,
    color: Brand.slate,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
    marginTop: 2,
  },
  button: {
    marginTop: 14,
  },
});
