import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from './CartItemRow';

interface OrderSummaryProps {
  items: CartItem[];
  totalAmount: number;
}

export default function OrderSummary({ items, totalAmount }: OrderSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) return null;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded(prev => !prev)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Order summary, ${totalItemsCount} items, total ₱${totalAmount.toFixed(2)}`}
      >
        <Text style={styles.title}>
          Order summary · {totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemPrice}>
                ₱{(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₱{totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#1F2937',
  },
  expandedContent: {
    marginTop: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#374151',
    marginRight: 8,
  },
  itemQty: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#35501F',
  },
});
