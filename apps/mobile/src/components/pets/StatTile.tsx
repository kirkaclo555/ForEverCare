import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatTileProps {
  label: string;
  value?: string | number | null;
}

export default function StatTile({ label, value }: StatTileProps) {
  const displayValue = value !== undefined && value !== null && String(value).trim() !== ''
    ? String(value)
    : '—';

  return (
    <View style={styles.tile}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={1}>
        {displayValue}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexBasis: 96,
    minHeight: 56,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#1F2937',
    textAlign: 'center',
  },
});
