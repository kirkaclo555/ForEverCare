import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onOrdersPress: () => void;
};

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  onOrdersPress,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.inputWrapper}>
        <Ionicons name="search" size={17} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search shampoo, food, vitamins"
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Compact Orders Button */}
      <TouchableOpacity
        style={styles.ordersBtn}
        onPress={onOrdersPress}
        activeOpacity={0.8}
        accessibilityLabel="My Orders"
      >
        <Ionicons name="receipt-outline" size={15} color="#35501F" />
        <Text style={styles.ordersText}>Orders</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#1F2937',
    paddingVertical: 0,
    height: '100%',
  },
  clearBtn: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ordersBtn: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
    borderWidth: 0.5,
    borderColor: '#D4E7BF',
  },
  ordersText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#35501F',
  },
});
