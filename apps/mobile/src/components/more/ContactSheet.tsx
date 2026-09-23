import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CLINIC_NAME = 'Balingasag Dog and Cat Clinic';
const CLINIC_PHONE = '+639171234567'; // mock number

export default function ContactSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  const handleCall = () => {
    const url = `tel:${CLINIC_PHONE}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
    });
    onClose();
  };

  const handleMessage = () => {
    const smsUrl = Platform.OS === 'ios'
      ? `sms:${CLINIC_PHONE}`
      : `sms:${CLINIC_PHONE}?body=Hello, I'd like to reach ${CLINIC_NAME}.`;
    Linking.canOpenURL(smsUrl).then(supported => {
      if (supported) Linking.openURL(smsUrl);
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Clinic name */}
        <Text style={styles.clinicName}>{CLINIC_NAME}</Text>
        <Text style={styles.clinicPhone}>{CLINIC_PHONE.replace('+63', '0')}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Call */}
        <TouchableOpacity
          style={styles.option}
          onPress={handleCall}
          accessibilityRole="button"
          accessibilityLabel="Call the clinic"
          activeOpacity={0.6}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="call-outline" size={20} color="#27500A" />
          </View>
          <Text style={styles.optionText}>Call</Text>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Message */}
        <TouchableOpacity
          style={styles.option}
          onPress={handleMessage}
          accessibilityRole="button"
          accessibilityLabel="Send a message to the clinic"
          activeOpacity={0.6}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#27500A" />
          </View>
          <Text style={styles.optionText}>Message</Text>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </TouchableOpacity>

        {/* Cancel */}
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cancel contact options"
          activeOpacity={0.6}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  clinicName: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  clinicPhone: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#1F2937',
  },
  cancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#EF4444',
  },
});
