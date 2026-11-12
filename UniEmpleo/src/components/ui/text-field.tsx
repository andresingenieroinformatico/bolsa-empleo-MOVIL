import React, { useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Brand, Radius, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  icon?: IconName;
  /** Shows a password visibility toggle. */
  secureToggle?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  optionalLabel?: string;
}

/**
 * Labeled input with a clear focus state, inline error and an accessible
 * password toggle. All screens use this instead of raw TextInput.
 */
export function TextField({
  label,
  hint,
  error,
  required = false,
  icon,
  secureToggle = false,
  containerStyle,
  optionalLabel,
  secureTextEntry,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isSecure = secureTextEntry && !revealed;
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
          </Text>
          {optionalLabel ? <Text style={styles.optional}>{optionalLabel}</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          hasError && styles.fieldError,
        ]}>
        {icon ? (
          <Icon
            name={icon}
            size={18}
            color={hasError ? Brand.red : focused ? Brand.greenDark : Brand.slateSoft}
          />
        ) : null}

        <TextInput
          {...inputProps}
          secureTextEntry={isSecure}
          placeholderTextColor={Brand.slateFaint}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          style={[styles.input, inputProps.multiline && styles.inputMultiline]}
        />

        {secureToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            hitSlop={10}
            onPress={() => setRevealed((prev) => !prev)}>
            <Icon
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={Brand.slateSoft}
            />
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    ...Type.label,
    color: Brand.inkSoft,
  },
  optional: {
    ...Type.caption,
    color: Brand.slateSoft,
  },
  required: {
    color: Brand.red,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lineStrong,
    backgroundColor: Brand.surface,
  },
  fieldFocused: {
    borderColor: Brand.green,
    backgroundColor: Brand.surface,
  },
  fieldError: {
    borderColor: Brand.redLine,
    backgroundColor: Brand.redTint,
  },
  input: {
    flex: 1,
    ...Type.body,
    color: Brand.ink,
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 92,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  hint: {
    ...Type.caption,
    color: Brand.slateSoft,
  },
  error: {
    ...Type.caption,
    color: Brand.red,
    fontWeight: '600',
  },
});
