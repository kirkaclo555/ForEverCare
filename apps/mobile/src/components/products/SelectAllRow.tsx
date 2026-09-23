import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectAllRowProps {
  allSelected: boolean;
  selectedCount: number;
  totalCount: number;
  onToggle: () => void;
}

export default function SelectAllRow({
  allSelected,
  selectedCount,
  totalCount,
  onToggle,
}: SelectAllRowProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.checkbox, allSelected && styles.checkboxSelected]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: allSelected }}
      >
        {allSelected && <Ionicons name="checkmark" size={13} color="white" />}
      </TouchableOpacity>
      <Text style={styles.label}>Select all</Text>
      <Text style={styles.counter}>{selectedCount} of {totalCount} selected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F4F1EC',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E0',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    borderColor: '#35501F',
    backgroundColor: '#35501F',
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#1F2937',
  },
  counter: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
  },
});
