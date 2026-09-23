import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  canGoBack?: boolean;
  onBack?: () => void;
  cartCount: number;
  onCartPress: () => void;
};

export default function ProductsHeader({
  canGoBack = false,
  onBack,
  cartCount,
  onCartPress,
}: Props) {
  const badgeText = cartCount > 9 ? '9+' : String(cartCount);

  return (
    <View style={styles.header}>
      {/* Back button */}
      {canGoBack && onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.backPlaceholder} />
      )}

      {/* Title & Subtitle (both strictly 1 line each) */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          Products
        </Text>
        <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
          Order supplies for pick-up
        </Text>
      </View>

      {/* Cart button with red count badge */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={onCartPress}
        activeOpacity={0.8}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        accessibilityLabel={`Cart with ${cartCount} items`}
      >
        <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
        {cartCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {badgeText}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#35501F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  backPlaceholder: {
    width: 6,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Catcut',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: 10,
    flexShrink: 0,
  },
  badgeContainer: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Bold',
    lineHeight: 12,
    textAlign: 'center',
  },
});
