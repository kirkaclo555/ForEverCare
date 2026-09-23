import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  quantity: number;
  maxStock: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export default function QuantityStepper({
  quantity,
  maxStock,
  onIncrement,
  onDecrement,
}: Props) {
  const isMaxReached = quantity >= maxStock;

  return (
    <View style={styles.pillContainer}>
      {/* Decrement Button */}
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={onDecrement}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityLabel="Decrease quantity"
      >
        <Ionicons name="remove" size={14} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Current Quantity */}
      <Text style={styles.quantityText} numberOfLines={1}>
        {quantity}
      </Text>

      {/* Increment Button */}
      <TouchableOpacity
        style={[styles.stepBtn, isMaxReached && styles.stepBtnDisabled]}
        onPress={onIncrement}
        disabled={isMaxReached}
        activeOpacity={0.7}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityLabel="Increase quantity"
      >
        <Ionicons name="add" size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    height: 34,
    minWidth: 84,
    backgroundColor: '#35501F',
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  quantityText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    paddingHorizontal: 4,
    textAlign: 'center',
    minWidth: 20,
  },
});
