import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  language: 'en' | 'tl';
};

export default function ConfirmDialog({ visible, onClose, onConfirm, language }: Props) {
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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: theme.card }]}>
          {/* Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>👋</Text>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {language === 'en'
              ? 'Log out of Furever Paw Care?'
              : 'Mag-logout sa Furever Paw Care?'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {language === 'en'
              ? 'You can always log back in anytime.'
              : 'Maaari kang mag-log in muli anumang oras.'}
          </Text>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleConfirm}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Confirm log out"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.logoutBtnText}>
                {language === 'en' ? 'Log out' : 'Mag-logout'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cancelBtn,
              { backgroundColor: isDarkMode ? '#2d2d2d' : '#F3F4F6', borderColor: theme.border },
            ]}
            onPress={onClose}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Cancel log out"
          >
            <Text style={[styles.cancelBtnText, { color: theme.text }]}>
              {language === 'en' ? 'Cancel' : 'Kanselahin'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  dialog: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FCEBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 30,
  },
  title: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  logoutBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#C0392B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoutBtnText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#FFFFFF',
  },
  cancelBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
});
