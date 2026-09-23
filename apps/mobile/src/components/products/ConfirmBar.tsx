import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ConfirmBarProps {
  onConfirm: () => void;
  isConfirming: boolean;
  disabled: boolean;
  errorMessage: string | null;
  onDismissError: () => void;
  bottomPadding?: number;
}

export default function ConfirmBar({
  onConfirm,
  isConfirming,
  disabled,
  errorMessage,
  onDismissError,
  bottomPadding,
}: ConfirmBarProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom =
    bottomPadding !== undefined ? bottomPadding : Math.max(insets.bottom, 16);

  const isButtonDisabled = disabled || isConfirming;

  return (
    <View style={[styles.container, { paddingBottom }]}>
      {/* Dismissible Error Banner */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons
            name="alert-circle"
            size={18}
            color="#DC2626"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.errorBannerText} numberOfLines={2}>
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={onDismissError}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Dismiss error"
          >
            <Ionicons name="close" size={16} color="#991B1B" />
          </TouchableOpacity>
        </View>
      )}

      {/* Confirm Payment Button */}
      <TouchableOpacity
        style={[
          styles.button,
          isButtonDisabled && styles.buttonDisabled,
        ]}
        onPress={onConfirm}
        disabled={isButtonDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Confirm payment"
      >
        {isConfirming ? (
          <View style={styles.btnContent}>
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Verifying…</Text>
          </View>
        ) : (
          <View style={styles.btnContent}>
            <Ionicons
              name="lock-closed"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Confirm payment</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#991B1B',
  },
  closeBtn: {
    padding: 2,
    marginLeft: 6,
  },
  button: {
    backgroundColor: '#35501F',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});
