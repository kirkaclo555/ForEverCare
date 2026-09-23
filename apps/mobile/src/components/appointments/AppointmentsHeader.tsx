import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  canGoBack: boolean;
  onBack: () => void;
  onBookNow: () => void;
};

export default function AppointmentsHeader({ canGoBack, onBack, onBookNow }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          My Appointments
        </Text>
      </View>

      <TouchableOpacity
        onPress={onBookNow}
        style={styles.bookNowBtn}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Book new appointment"
      >
        <Text style={styles.bookNowText} numberOfLines={1}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#35501F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Catcut',
    fontSize: 18,
    lineHeight: 26,
    paddingVertical: Platform.OS === 'android' ? 4 : 2,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  bookNowBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    flexShrink: 0,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  bookNowText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#35501F',
  },
});
