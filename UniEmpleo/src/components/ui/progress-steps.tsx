import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Brand, Radius, Type } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';

export type ProgressStep = {
  key: string;
  label: string;
  description?: string;
};

interface ProgressStepsProps {
  steps: ProgressStep[];
  /** Index of the current step (0-based). -1 means none completed. */
  currentIndex: number;
  /** Marks all steps as failed/cancelled. */
  failed?: boolean;
}

/**
 * Horizontal/vertical application timeline. Replaces the plain status text
 * with a visual account of where the candidate stands.
 */
export function ProgressSteps({ steps, currentIndex, failed = false }: ProgressStepsProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFailed = failed && index === currentIndex;
        const accent = isFailed ? Brand.red : isDone || isCurrent ? Brand.green : Brand.lineStrong;

        return (
          <View key={step.key} style={styles.step}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      isDone || isCurrent ? (isFailed ? Brand.redTint : Brand.greenTint) : Brand.surfaceMuted,
                    borderColor: accent,
                  },
                ]}>
                <Icon
                  name={
                    isFailed
                      ? 'close'
                      : isDone
                        ? 'checkmark'
                        : isCurrent
                          ? 'ellipse'
                          : 'ellipse-outline'
                  }
                  size={isFailed || isDone ? 13 : 9}
                  color={isFailed ? Brand.red : isDone || isCurrent ? Brand.greenDark : Brand.slateFaint}
                />
              </View>
              {index < steps.length - 1 ? (
                <View style={[styles.line, { backgroundColor: isDone ? Brand.greenLine : Brand.line }]} />
              ) : null}
            </View>

            <View style={styles.copy}>
              <Text
                style={[
                  styles.label,
                  (isDone || isCurrent) && styles.labelActive,
                  isFailed && styles.labelFailed,
                ]}>
                {step.label}
              </Text>
              {step.description ? <Text style={styles.description}>{step.description}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
  },
  rail: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginVertical: 2,
  },
  copy: {
    flex: 1,
    paddingBottom: 18,
    paddingTop: 1,
  },
  label: {
    ...Type.bodyStrong,
    color: Brand.slateSoft,
  },
  labelActive: {
    color: Brand.ink,
    fontWeight: '700',
  },
  labelFailed: {
    color: Brand.red,
  },
  description: {
    ...Type.caption,
    color: Brand.slate,
    marginTop: 2,
  },
});
