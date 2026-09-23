import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CartSummaryPanelProps {
  selectedCount: number;
  selectedTotal: number;
  onCheckout: () => void;
  bottomPadding?: number;
}

export default function CartSummaryPanel({
  selectedCount,
  selectedTotal,
  onCheckout,
  bottomPadding,
}: CartSummaryPanelProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = bottomPadding !== undefined ? bottomPadding : Math.max(insets.bottom, 16);
  const isNoneSelected = selectedCount === 0;

  return (
    <View style={[styles.container, { paddingBottom }]}>
      {/* Pickup Store Row */}
      <View style={styles.storeRow}>
        <Ionicons name="storefront-outline" size={14} color="#6B7280" />
        <Text style={styles.storeText} numberOfLines={1}>
          Pick up at Balingasag Dog and Cat Clinic
        </Text>
      </View>

      {/* Total Row */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>
          Total ({selectedCount} item{selectedCount !== 1 ? 's' : ''})
        </Text>
        <Text style={styles.totalAmount}>
          ₱{selectedTotal.toFixed(2)}
        </Text>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        style={[styles.checkoutBtn, isNoneSelected && styles.checkoutBtnDisabled]}
        onPress={onCheckout}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={
          isNoneSelected
            ? 'Checkout disabled, select at least one item'
            : `Checkout, total ₱${selectedTotal.toFixed(2)}`
        }
      >
        <Text style={styles.checkoutBtnText}>Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  storeText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    color: '#1F2937',
  },
  checkoutBtn: {
    backgroundColor: '#35501F',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});
