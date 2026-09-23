import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MESSAGES: Record<string, { icon: keyof typeof Ionicons.glyphMap; msg: string }> = {
  All: { icon: 'calendar-outline', msg: 'No appointments yet' },
  Upcoming: { icon: 'calendar-outline', msg: 'No upcoming appointments' },
  Completed: { icon: 'checkmark-circle-outline', msg: 'No completed appointments yet' },
  Cancelled: { icon: 'close-circle-outline', msg: 'No cancelled appointments' },
};

type Props = {
  filter: string;
  onBookNow: () => void;
};

export default function EmptyState({ filter, onBookNow }: Props) {
  const { icon, msg } = MESSAGES[filter] || MESSAGES.All;
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color="#C2E0A3" />
      </View>
      <Text style={styles.msg}>{msg}</Text>
      {(filter === 'All' || filter === 'Upcoming') && (
        <TouchableOpacity style={styles.btn} onPress={onBookNow} activeOpacity={0.85}>
          <Text style={styles.btnText}>Book now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 32,
    gap: 14,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  msg: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#35501F',
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 20,
    marginTop: 4,
  },
  btnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
