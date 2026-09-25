import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { scale, verticalScale, fontSize } from '../../utils/responsive';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  language?: 'en' | 'tl';
  title?: string;
  message?: string;
};

export default function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  language = 'en',
  title,
  message,
}: Props) {
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const defaultTitle =
    language === 'en' ? 'Log out of your account?' : 'Mag-logout sa iyong account?';
  const defaultMessage =
    language === 'en'
      ? 'Are you sure you want to log out? You can sign back in anytime to access your pets and appointments.'
      : 'Sigurado ka bang nais mong mag-logout? Maaari kang mag-log in muli anumang oras.';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Refined Logout Icon Badge */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.15)' : '#FEF2F2',
                borderColor: isDarkMode ? 'rgba(220, 38, 38, 0.3)' : '#FEE2E2',
              },
            ]}
          >
            <Ionicons name="log-out-outline" size={28} color="#DC2626" />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {title || defaultTitle}
          </Text>

          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {message || defaultMessage}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Confirm log out"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.btnContent}>
                  <Ionicons name="log-out-outline" size={18} color="#FFFFFF" style={{ marginRight: scale(8) }} />
                  <Text style={styles.logoutBtnText}>
                    {language === 'en' ? 'Log Out' : 'Mag-logout'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#F8FAFC',
                  borderColor: theme.border,
                },
              ]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Cancel log out"
            >
              <Text style={[styles.cancelBtnText, { color: theme.text }]}>
                {language === 'en' ? 'Cancel' : 'Kanselahin'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  dialog: {
    width: '100%',
    maxWidth: scale(340),
    borderRadius: scale(22),
    borderWidth: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(20),
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: scale(20),
  },
  iconCircle: {
    width: scale(62),
    height: scale(62),
    borderRadius: scale(31),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: fontSize(18),
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: verticalScale(8),
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: fontSize(13.5),
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: verticalScale(24),
    lineHeight: 20,
    paddingHorizontal: scale(4),
  },
  buttonContainer: {
    width: '100%',
    gap: verticalScale(10),
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    width: '100%',
    height: verticalScale(48),
    borderRadius: scale(14),
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: scale(8),
    elevation: 4,
  },
  logoutBtnText: {
    fontSize: fontSize(15),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cancelBtn: {
    width: '100%',
    height: verticalScale(48),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  cancelBtnText: {
    fontSize: fontSize(15),
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
