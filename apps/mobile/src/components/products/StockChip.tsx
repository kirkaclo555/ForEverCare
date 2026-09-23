import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  stock: number;
  clinicName?: string;
};

export default function StockChip({
  stock,
  clinicName = 'Balingasag Dog and Cat Clinic',
}: Props) {
  const isSoldOut = stock <= 0;
  const isLowStock = !isSoldOut && stock <= 5;

  return (
    <View style={styles.container}>
      {/* Stock Status Chip */}
      {isSoldOut ? (
        <View style={[styles.chip, styles.chipSoldOut]}>
          <Ionicons name="close-circle" size={15} color="#6B7280" />
          <Text style={[styles.chipText, styles.textSoldOut]}>Sold out</Text>
        </View>
      ) : isLowStock ? (
        <View style={[styles.chip, styles.chipLowStock]}>
          <Ionicons name="alert-circle" size={15} color="#D97706" />
          <Text style={[styles.chipText, styles.textLowStock]}>
            Only {stock} left
          </Text>
        </View>
      ) : (
        <View style={[styles.chip, styles.chipInStock]}>
          <Ionicons name="checkmark-circle" size={15} color="#35501F" />
          <Text style={[styles.chipText, styles.textInStock]}>
            In stock at clinic · {stock} left
          </Text>
        </View>
      )}

      {/* Pick-up Clinic Line */}
      <View style={styles.pickupRow}>
        <Ionicons name="storefront-outline" size={16} color="#4B5563" />
        <Text style={styles.pickupText} numberOfLines={1}>
          Pick up at {clinicName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    borderWidth: 0.5,
  },
  chipInStock: {
    backgroundColor: '#EAF3DE',
    borderColor: '#CDE5B3',
  },
  chipLowStock: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  chipSoldOut: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  textInStock: {
    color: '#35501F',
  },
  textLowStock: {
    color: '#92400E',
  },
  textSoldOut: {
    color: '#4B5563',
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  pickupText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#4B5563',
    flexShrink: 1,
  },
});
