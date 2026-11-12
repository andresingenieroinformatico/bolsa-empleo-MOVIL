import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonBlockProps {
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBlock({ style }: SkeletonBlockProps) {
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, style]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E4ECE8',
  },
});
