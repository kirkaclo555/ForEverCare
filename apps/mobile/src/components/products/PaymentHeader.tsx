import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PaymentHeaderProps {
  onLeave: () => void;
}

export default function PaymentHeader({ onLeave }: PaymentHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    Alert.alert(
      'Leave payment?',
      'Your order is saved. You can finish paying from My orders.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: onLeave,
        },
      ]
    );
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity
        onPress={handleBackPress}
        style={styles.backBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        Payment
      </Text>

      <View style={styles.secureBadge}>
        <Ionicons name="lock-closed" size={12} color="rgba(255, 255, 255, 0.85)" />
        <Text style={styles.secureText}>Secure checkout</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#35501F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  secureText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
