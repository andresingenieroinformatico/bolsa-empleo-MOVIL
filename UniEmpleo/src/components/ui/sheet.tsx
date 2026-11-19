import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Radius, Shadows, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: IconName;
  children: React.ReactNode;
  /** Sticky footer, usually primary/secondary actions. */
  footer?: React.ReactNode;
  /** Content wrapped in a ScrollView when true (default). */
  scrollable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  maxWidth?: number;
  closeLabel?: string;
}

/**
 * Bottom sheet / dialog used for every modal flow. On tablets and web it
 * centers into a card; on phones it docks to the bottom edge.
 */
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  scrollable = true,
  contentStyle,
  maxWidth = 560,
  closeLabel = 'Cerrar',
}: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}>
          <View
            style={[
              styles.panel,
              { maxWidth, paddingBottom: Math.max(insets.bottom, 16) },
            ]}>
            <View style={styles.grabber} />

            {title ? (
              <View style={styles.header}>
                {icon ? (
                  <View style={styles.headerIcon}>
                    <Icon name={icon} size={20} color={Brand.navy} />
                  </View>
                ) : null}
                <View style={styles.headerCopy}>
                  <Text style={styles.title}>{title}</Text>
                  {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={closeLabel}
                  hitSlop={10}
                  onPress={onClose}
                  style={({ pressed }) => [styles.close, pressed && styles.closePressed]}>
                  <Icon name="close" size={20} color={Brand.slate} />
                </Pressable>
              </View>
            ) : null}

            {scrollable ? (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.content, contentStyle]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.content, contentStyle]}>{children}</View>
            )}

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Brand.overlay,
  },
  keyboard: {
    width: '100%',
    alignItems: 'center',
  },
  panel: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: Brand.surface,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    ...Shadows.sheet,
    paddingTop: 8,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Brand.lineStrong,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Brand.lineSoft,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surfaceSunken,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Type.titleSmall,
    color: Brand.ink,
  },
  subtitle: {
    ...Type.caption,
    color: Brand.slate,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surfaceMuted,
  },
  closePressed: {
    backgroundColor: Brand.surfaceSunken,
  },
  scroll: {
    flexGrow: 0,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Brand.lineSoft,
    gap: 10,
  },
});
