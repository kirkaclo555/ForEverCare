import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

type Props = {
  sessionCode: string;
  onChangeCode: (text: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  errorMessage?: string | null;
};

export default function JoinSessionCard({
  sessionCode,
  onChangeCode,
  onSubmit,
  loading = false,
  errorMessage,
}: Props) {
  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.trim().length > 0) {
        onChangeCode(text.trim().toUpperCase());
      }
    } catch {
      // Clipboard access fallback
    }
  };

  return (
    <View style={styles.card}>
      {/* ── Compact Header Row with Circular Call Badge ── */}
      <View style={styles.headerRow}>
        <View style={styles.callCircleOuter}>
          <View style={styles.callCircleInner}>
            <Ionicons name="videocam" size={22} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.headerTextCol}>
          <Text style={styles.title}>Join session</Text>
          <Text style={styles.subtitle}>Enter the code from your appointment</Text>
        </View>
      </View>

      {/* ── Session Code Input with Inline Paste Button ── */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, !!errorMessage && styles.inputWrapperError]}>
          <TextInput
            style={styles.input}
            placeholder="e.g. FC-DE2VN3"
            placeholderTextColor="#9CA3AF"
            value={sessionCode}
            onChangeText={onChangeCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={24}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.pasteBtn}
            onPress={handlePaste}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={loading}
          >
            <Ionicons name="clipboard-outline" size={19} color="#35501F" />
            <Text style={styles.pasteText}>Paste</Text>
          </TouchableOpacity>
        </View>

        {/* Inline Validation Error */}
        {!!errorMessage && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={13} color="#DC2626" style={{ marginRight: 4 }} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
      </View>

      {/* ── Circular/Pill "Join session" Call Button ── */}
      <TouchableOpacity
        style={[styles.joinBtn, loading && styles.joinBtnDisabled]}
        onPress={onSubmit}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.btnContent}>
            <Ionicons name="call" size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.joinBtnText}>Join session</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  callCircleOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  callCircleInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#35501F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#6B7280',
  },

  // Input
  inputContainer: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    height: 46,
  },
  inputWrapperError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#1F2937',
    letterSpacing: 0.8,
    paddingVertical: 0,
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingVertical: 4,
    gap: 3,
  },
  pasteText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#35501F',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#DC2626',
  },

  // Join Button
  joinBtn: {
    backgroundColor: '#35501F',
    borderRadius: 24,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#35501F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  joinBtnDisabled: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
