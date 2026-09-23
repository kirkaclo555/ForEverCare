import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface ReferenceInputProps {
  walletName: string;
  value: string;
  onChangeText: (text: string) => void;
  error: string | null;
  onClearError: () => void;
  onShowToast?: (msg: string) => void;
  onFocus?: () => void;
}

export default function ReferenceInput({
  walletName,
  value,
  onChangeText,
  error,
  onClearError,
  onShowToast,
  onFocus,
}: ReferenceInputProps) {
  const handleChange = (rawText: string) => {
    // Strip non-digit characters
    const digitsOnly = rawText.replace(/[^0-9]/g, '').slice(0, 13);
    if (error) {
      onClearError();
    }
    onChangeText(digitsOnly);
  };

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      const digits = clipboardContent.replace(/[^0-9]/g, '').slice(0, 13);
      if (digits.length > 0) {
        if (error) onClearError();
        onChangeText(digits);
        onShowToast?.('Pasted from clipboard');
      } else {
        onShowToast?.('No digits found in clipboard');
      }
    } catch {
      onShowToast?.('Unable to paste from clipboard');
    }
  };

  const hasError = !!error;

  return (
    <View style={styles.container}>
      {/* Label Row with live counter */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>{walletName} reference number</Text>
        <Text style={styles.counter}>{value.length}/13</Text>
      </View>

      {/* Input container with in-field paste button */}
      <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          onFocus={onFocus}
          placeholder="1234567890123"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={13}
          autoCorrect={false}
          accessibilityLabel={`${walletName} reference number input`}
        />
        <TouchableOpacity
          onPress={handlePaste}
          style={styles.pasteBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Paste reference number"
        >
          <Ionicons name="clipboard-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Inline Error Message */}
      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.helperText}>
          Find the 13-digit number on your {walletName} receipt. It must match exactly to avoid delays.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#1F2937',
  },
  counter: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 48,
    paddingHorizontal: 12,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    color: '#1F2937',
    letterSpacing: 1.2,
    height: '100%',
  },
  pasteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 16,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#EF4444',
    marginTop: 6,
  },
});
