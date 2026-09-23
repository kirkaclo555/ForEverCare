import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

type Props = {
  quantity: number;
  maxStock: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isBuyNowLoading?: boolean;
  bottomPadding?: number;
};

export default function StickyActionBar({
  quantity,
  maxStock,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  isBuyNowLoading = false,
  bottomPadding = 12,
}: Props) {
  const isSoldOut = maxStock <= 0;

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxStock) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottomPadding, 12) }]}>
      {/* 1. Quantity Selector Row */}
      {!isSoldOut && (
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.stepperPill}>
            <TouchableOpacity
              style={[styles.stepBtn, quantity <= 1 && styles.stepBtnDisabled]}
              onPress={handleDecrement}
              disabled={quantity <= 1}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel="Decrease quantity"
            >
              <Ionicons name="remove" size={14} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.quantityValue}>{quantity}</Text>

            <TouchableOpacity
              style={[styles.stepBtn, quantity >= maxStock && styles.stepBtnDisabled]}
              onPress={handleIncrement}
              disabled={quantity >= maxStock}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel="Increase quantity"
            >
              <Ionicons name="add" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 2. Side-by-Side Action Buttons (min 48px height) */}
      <View style={styles.buttonRow}>
        {/* Outlined "Add to Cart" Button */}
        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            isSoldOut && styles.addToCartBtnDisabled,
          ]}
          onPress={onAddToCart}
          disabled={isSoldOut}
          activeOpacity={0.8}
          accessibilityLabel="Add to cart"
        >
          <MaterialCommunityIcons
            name="cart-plus"
            size={18}
            color={isSoldOut ? '#9CA3AF' : '#35501F'}
            style={styles.cartIcon}
          />
          <Text
            style={[
              styles.addToCartText,
              isSoldOut && styles.addToCartTextDisabled,
            ]}
          >
            Add to cart
          </Text>
        </TouchableOpacity>

        {/* Solid "Buy Now" Button */}
        <TouchableOpacity
          style={[
            styles.buyNowBtn,
            isSoldOut && styles.buyNowBtnDisabled,
          ]}
          onPress={onBuyNow}
          disabled={isSoldOut || isBuyNowLoading}
          activeOpacity={0.85}
          accessibilityLabel="Buy now"
        >
          {isBuyNowLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buyNowText}>
              {isSoldOut ? 'Sold out' : 'Buy now'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quantityLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#1F2937',
  },
  stepperPill: {
    height: 34,
    minWidth: 84,
    backgroundColor: '#35501F',
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
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
  quantityValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    paddingHorizontal: 4,
    textAlign: 'center',
    minWidth: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addToCartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#35501F',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartBtnDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  cartIcon: {
    marginRight: 6,
  },
  addToCartText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#35501F',
  },
  addToCartTextDisabled: {
    color: '#9CA3AF',
  },
  buyNowBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#35501F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buyNowText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
