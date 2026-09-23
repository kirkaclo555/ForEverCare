import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  category: string;
  name: string;
  price: number;
};

export default function ProductInfo({ category, name, price }: Props) {
  // Convert category to sentence case (e.g. "PET FOOD" -> "Pet food", "GROOMING" -> "Grooming")
  const formatSentenceCase = (str: string) => {
    if (!str) return 'Other';
    const trimmed = str.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  return (
    <View style={styles.container}>
      {/* 1. Category as a small chip (sentence case, muted text on light gray background) */}
      <View style={styles.categoryChip}>
        <Text style={styles.categoryText} numberOfLines={1}>
          {formatSentenceCase(category)}
        </Text>
      </View>

      {/* 2. Product name (playful title font, 19-20px, allowed to wrap across 2-3 lines) */}
      <Text style={styles.nameText}>
        {name}
      </Text>

      {/* 3. Price below the name (22px, dark green #3B6D11, strictly on its own row) */}
      <Text style={styles.priceText} numberOfLines={1}>
        ₱{price.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#4B5563',
  },
  nameText: {
    fontSize: 20,
    fontFamily: 'Catcut',
    color: '#1F2937',
    lineHeight: 26,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#3B6D11',
    letterSpacing: 0.2,
  },
});
