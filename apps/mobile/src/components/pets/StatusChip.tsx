import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatusChipProps {
  status?: 'VERIFIED' | 'PENDING' | string;
  label?: string;
}

export default function StatusChip({ status, label }: StatusChipProps) {
  const isVerified = status === 'VERIFIED';
  const defaultLabel = isVerified ? 'Verified' : 'Pending walk-in';

  return (
    <View
      style={[
        styles.chip,
        isVerified ? styles.verifiedChip : styles.pendingChip,
      ]}
    >
      <Ionicons
        name={isVerified ? 'checkmark-circle' : 'time'}
        size={12}
        color={isVerified ? '#276749' : '#92400E'}
      />
      <Text
        style={[
          styles.text,
          isVerified ? styles.verifiedText : styles.pendingText,
        ]}
      >
        {label || defaultLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  verifiedChip: {
    backgroundColor: '#EAF3DE',
    borderColor: '#C6E7BE',
  },
  pendingChip: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  text: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
  },
  verifiedText: {
    color: '#276749',
  },
  pendingText: {
    color: '#92400E',
  },
});
