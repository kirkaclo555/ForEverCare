import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  statusLabel: string;
  rawStatus: string;
  isMissed?: boolean;
};

type ChipConfig = {
  bg: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function getConfig(rawStatus: string, statusLabel: string, isMissed?: boolean): ChipConfig {
  if (isMissed) {
    return { bg: '#FEF3C7', text: '#B45309', icon: 'alert-circle', label: 'Missed' };
  }
  if (rawStatus === 'paid') {
    return { bg: '#EAF3DE', text: '#35501F', icon: 'checkmark-circle', label: 'Paid' };
  }
  if (rawStatus === 'completed') {
    return { bg: '#EAF3DE', text: '#35501F', icon: 'checkmark-circle', label: 'Completed' };
  }
  if (rawStatus === 'cancelled' || rawStatus === 'declined') {
    return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle', label: statusLabel };
  }
  if (statusLabel === 'Cancel Pending') {
    return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle', label: 'Cancel Pending' };
  }
  if (rawStatus === 'confirmed') {
    return { bg: '#FEF3C7', text: '#B45309', icon: 'time', label: 'Confirmed' };
  }
  if (rawStatus === 'pending') {
    return { bg: '#F3F4F6', text: '#6B7280', icon: 'time-outline', label: 'Awaiting' };
  }
  return { bg: '#EAF3DE', text: '#35501F', icon: 'checkmark-circle-outline', label: statusLabel };
}

export default function StatusChip({ statusLabel, rawStatus, isMissed }: Props) {
  const cfg = getConfig(rawStatus, statusLabel, isMissed);
  return (
    <View style={[styles.chip, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon} size={11} color={cfg.text} style={{ marginRight: 3 }} />
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
  },
  text: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
  },
});
