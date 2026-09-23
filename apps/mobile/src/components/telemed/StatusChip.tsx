import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  status: string;
  isMissed?: boolean;
};

type ChipConfig = {
  bg: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function getConfig(status: string, isMissed?: boolean): ChipConfig {
  if (isMissed) {
    return { bg: '#FEF3C7', text: '#B45309', icon: 'alert-circle', label: 'Missed' };
  }

  const s = (status || '').toLowerCase();

  if (s === 'paid') {
    return { bg: '#EAF3DE', text: '#35501F', icon: 'checkmark-circle', label: 'Paid' };
  }
  if (s === 'completed' || s === 'done') {
    return { bg: '#F3F4F6', text: '#4B5563', icon: 'checkmark-circle-outline', label: 'Completed' };
  }
  if (s === 'cancelled' || s === 'declined') {
    return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle', label: 'Cancelled' };
  }
  if (s === 'confirmed') {
    return { bg: '#FEF3C7', text: '#B45309', icon: 'time', label: 'Confirmed' };
  }
  if (s === 'pending') {
    return { bg: '#F3F4F6', text: '#6B7280', icon: 'time-outline', label: 'Pending' };
  }

  return { bg: '#EAF3DE', text: '#35501F', icon: 'checkmark-circle-outline', label: status || 'Upcoming' };
}

export default function StatusChip({ status, isMissed }: Props) {
  const cfg = getConfig(status, isMissed);
  return (
    <View style={[styles.chip, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon} size={11} color={cfg.text} style={{ marginRight: 4 }} />
      <Text style={[styles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
  },
});
