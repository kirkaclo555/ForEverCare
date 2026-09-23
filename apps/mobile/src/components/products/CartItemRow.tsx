import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export interface Product {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  icon?: string;
  color?: string;
  desc?: string;
  stock: number;
  image?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartItemRowProps {
  item: CartItem;
  isSelected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onQuantityChange: (delta: number) => void;
  onPress?: () => void;
}

export default function CartItemRow({
  item,
  isSelected,
  onToggle,
  onRemove,
  onQuantityChange,
  onPress,
}: CartItemRowProps) {
  const { product, quantity } = item;
  const isMaxReached = quantity >= product.stock;
  const isMinReached = quantity <= 1;
  const lineTotal = product.price * quantity;

  return (
    <View style={styles.card}>
      {/* Selection Checkbox */}
      <TouchableOpacity
        onPress={onToggle}
        style={[styles.checkbox, isSelected && styles.checkboxSelected]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
      </TouchableOpacity>

      {/* Product Image */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.imageContainer}
        disabled={!onPress}
      >
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <FontAwesome5
            name={product.icon || 'box'}
            size={24}
            color={product.color || '#35501F'}
          />
        )}
      </TouchableOpacity>

      {/* Product Details Column */}
      <View style={styles.detailsColumn}>
        {/* Top row: Name & Remove button */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            style={styles.nameTouchable}
            disabled={!onPress}
          >
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Remove item from cart"
          >
            <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Stock warning */}
        {isMaxReached && (
          <Text style={styles.stockWarning}>Only {product.stock} left</Text>
        )}

        {/* Bottom row: Pricing & Quantity Stepper */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.unitPrice}>₱{product.price.toFixed(2)}</Text>
            {quantity > 1 && (
              <Text style={styles.lineTotal}>₱{lineTotal.toFixed(2)} total</Text>
            )}
          </View>

          {/* Compact Pill Stepper */}
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => onQuantityChange(-1)}
              disabled={isMinReached}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Decrease quantity"
            >
              <Ionicons
                name="remove"
                size={14}
                color={isMinReached ? '#CBD5E1' : '#1F2937'}
              />
            </TouchableOpacity>

            <Text style={styles.stepperCount}>{quantity}</Text>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => onQuantityChange(1)}
              disabled={isMaxReached}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Increase quantity"
            >
              <Ionicons
                name="add"
                size={14}
                color={isMaxReached ? '#CBD5E1' : '#1F2937'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 10,
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
    marginRight: 8,
  },
  checkboxSelected: {
    borderColor: '#35501F',
    backgroundColor: '#35501F',
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsColumn: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 72,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameTouchable: {
    flex: 1,
    marginRight: 6,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#1F2937',
    lineHeight: 18,
  },
  removeBtn: {
    padding: 2,
  },
  stockWarning: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    color: '#D97706',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  priceContainer: {
    justifyContent: 'flex-end',
  },
  unitPrice: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#3B6D11',
  },
  lineTotal: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    marginTop: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    height: 32,
    paddingHorizontal: 4,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#1F2937',
  },
});
