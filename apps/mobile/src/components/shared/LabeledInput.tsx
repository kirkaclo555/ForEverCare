import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TextInputProps,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { scale, verticalScale, fontSize } from '../../utils/responsive';

export interface LabeledInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  shakeTrigger?: number;
  hint?: string;
  isDarkMode?: boolean;
  themeText?: string;
  themeBorder?: string;
  themeSubtext?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputBoxStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export default function LabeledInput({
  label,
  value = '',
  placeholder,
  error,
  shakeTrigger = 0,
  hint,
  isDarkMode = false,
  themeText = '#2D3748',
  themeBorder = '#E2E8F0',
  themeSubtext = '#718096',
  rightElement,
  leftElement,
  containerStyle,
  inputBoxStyle,
  labelStyle,
  onFocus,
  onBlur,
  ...rest
}: LabeledInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lastShakeTrigger = useRef(shakeTrigger);

  // Trigger shake animation on error or when shakeTrigger increments
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -9, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 9, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -7, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 7, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error]);

  useEffect(() => {
    if (shakeTrigger > 0 && shakeTrigger !== lastShakeTrigger.current) {
      lastShakeTrigger.current = shakeTrigger;
      triggerShake();
    }
  }, [shakeTrigger]);

  const hasValue = !!value && value.length > 0;
  const hasError = !!error;

  // Colors
  const normalLabelColor = isDarkMode ? '#a8d880' : '#2E5E3E'; // Muted dark/gray-green
  const activeLabelColor = hasError ? '#E53E3E' : normalLabelColor;

  const borderColor = hasError
    ? '#E53E3E'
    : isFocused
    ? (isDarkMode ? '#85e05d' : '#2E5E3E')
    : hasValue
    ? (isDarkMode ? '#38a169' : '#2E5E3E')
    : themeBorder;

  const bgColor = hasError
    ? (isDarkMode ? '#2a1010' : '#fff5f5')
    : isDarkMode
    ? '#1a1a1a'
    : isFocused
    ? '#ffffff'
    : '#f8fafc';

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Field title ABOVE input box */}
      {label ? (
        <Text style={[styles.label, { color: activeLabelColor }, labelStyle]}>
          {label}
        </Text>
      ) : null}

      {/* Input box with shake animation */}
      <Animated.View
        style={[
          styles.inputBox,
          {
            borderColor,
            backgroundColor: bgColor,
            transform: [{ translateX: shakeAnim }],
          },
          inputBoxStyle,
        ]}
      >
        {leftElement && <View style={styles.leftEl}>{leftElement}</View>}

        <TextInput
          style={[
            styles.textInput,
            {
              color: themeText,
              paddingRight: rightElement ? scale(40) : scale(14),
              paddingLeft: leftElement ? scale(8) : scale(14),
            },
          ]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={themeSubtext}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {rightElement && <View style={styles.rightEl}>{rightElement}</View>}
      </Animated.View>

      {/* Error or hint message below */}
      {hasError ? (
        <Text style={[styles.hint, { color: '#E53E3E' }]}>⚠ {error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: themeSubtext }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(20), // 18-24px spacing between field groups
  },
  label: {
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    fontSize: fontSize(13), // Smaller than input text (15)
    marginBottom: verticalScale(7), // 6-8px spacing between label and input box
    letterSpacing: 0.2,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: scale(12),
    minHeight: verticalScale(50),
    position: 'relative',
  },
  textInput: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(15),
    paddingVertical: verticalScale(12),
  },
  leftEl: {
    paddingLeft: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightEl: {
    position: 'absolute',
    right: scale(14),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(11),
    marginTop: verticalScale(5),
    marginLeft: scale(4),
  },
});
