import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Brand, Space } from '@/constants/theme';

interface PageScrollProps {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<React.ComponentProps<typeof RefreshControl>>;
  footerInset?: number;
}

/**
 * Page container: calms every screen onto the same canvas, with a readable
 * max width on tablets and web and consistent gutters on phones.
 */
export function PageScroll({ children, contentStyle, refreshControl, footerInset = 0 }: PageScrollProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: Space.xxxl + footerInset }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}>
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    width: '100%',
    backgroundColor: Brand.canvas,
  },
  content: {
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: 920,
    paddingHorizontal: Space.lg,
    paddingTop: Space.lg,
    gap: Space.lg,
  },
});
