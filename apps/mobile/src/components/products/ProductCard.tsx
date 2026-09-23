import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import QuantityStepper from './QuantityStepper';

export type Product = {
  id: string | number;
  name: string;
  price: number;
  category: string;
  icon: string;
  color: string;
  desc: string;
  stock: number;
  image?: string | null;
};

type Props = {
  product: Product;
  cartQuantity: number;
  onPress: () => void;
  onAddToCart: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export default function ProductCard({
  product,
  cartQuantity,
  onPress,
  onAddToCart,
  onIncrement,
  onDecrement,
}: Props) {
  const [imageLoading, setImageLoading] = useState(false);
  const isSoldOut = product.stock <= 0;
  const isLowStock = !isSoldOut && product.stock <= 5;

  return (
    <TouchableOpacity
      style={[styles.card, isSoldOut && styles.cardSoldOut]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, price ₱${product.price.toFixed(2)}`}
    >
      {/* Square Image Container */}
      <View style={styles.imageContainer}>
        {/* Low Stock / Sold Out Badge on top-left */}
        {isSoldOut ? (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutBadgeText}>Sold out</Text>
          </View>
        ) : isLowStock ? (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockBadgeText}>Low stock</Text>
          </View>
        ) : null}

        {/* Product Image / Placeholder */}
        {product.image ? (
          <>
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#35501F" />
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderBox}>
            <Ionicons name="cube-outline" size={36} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Category (12px, muted) */}
      <Text style={styles.categoryText} numberOfLines={1}>
        {product.category}
      </Text>

      {/* Product Name (14px, medium, 2 lines with fixed min height for alignment) */}
      <Text style={styles.nameText} numberOfLines={2}>
        {product.name}
      </Text>

      {/* Bottom Row: Price on left, Action on right */}
      <View style={styles.bottomRow}>
        <Text style={styles.priceText} numberOfLines={1}>
          ₱{product.price.toFixed(2)}
        </Text>

        {isSoldOut ? (
          // Replaced with nothing if sold out
          <View style={styles.emptyAction} />
        ) : cartQuantity > 0 ? (
          <QuantityStepper
            quantity={cartQuantity}
            maxStock={product.stock}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAddToCart}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityLabel={`Add ${product.name} to cart`}
          >
            <MaterialCommunityIcons name="cart-plus" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardSoldOut: {
    opacity: 0.65,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249, 250, 251, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#FDE68A',
  },
  lowStockBadgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    color: '#92400E',
    lineHeight: 12,
  },
  soldOutBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 2,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
  },
  soldOutBadgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 12,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#1F2937',
    lineHeight: 18,
    minHeight: 36, // Ensures uniform card height across two lines
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    minHeight: 36,
  },
  priceText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#35501F',
    flex: 1,
    marginRight: 6,
  },
  emptyAction: {
    width: 36,
    height: 36,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#35501F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
});
