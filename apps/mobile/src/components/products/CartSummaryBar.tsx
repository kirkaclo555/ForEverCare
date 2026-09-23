import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  totalItems: number;
  totalPrice: number;
  onViewCart: () => void;
  bottomOffset?: number;
};

export default function CartSummaryBar({
  totalItems,
  totalPrice,
  onViewCart,
  bottomOffset = 10,
}: Props) {
  if (totalItems <= 0) return null;

  const itemText = totalItems === 1 ? '1 item' : `${totalItems} items`;

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      <TouchableOpacity
        style={styles.innerContent}
        onPress={onViewCart}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`View cart with ${itemText}, total ₱${totalPrice.toFixed(2)}`}
      >
        {/* Left: Cart Icon & Item info */}
        <View style={styles.leftGroup}>
          <View style={styles.cartIconCircle}>
            <Ionicons name="cart" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.summaryText} numberOfLines={1}>
            {itemText} · ₱{totalPrice.toFixed(2)}
          </Text>
        </View>

        {/* Right: View cart label + chevron */}
        <View style={styles.rightGroup}>
          <Text style={styles.viewCartText}>View cart</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 52,
    zIndex: 99,
  },
  innerContent: {
    flex: 1,
    backgroundColor: '#35501F',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  cartIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  summaryText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewCartText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
