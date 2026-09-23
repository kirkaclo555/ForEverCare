import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type SpecItem = {
  label: string;
  value?: string | number | null;
};

type Props = {
  description: string;
  specs?: SpecItem[];
};

export default function DetailRow({ description, specs = [] }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Filter out any undefined or blank specs
  const activeSpecs = specs.filter(
    (s) => s.value !== undefined && s.value !== null && String(s.value).trim() !== ''
  );

  const isLongDescription = description && description.length > 140;

  return (
    <View style={styles.container}>
      {/* "About this item" Section */}
      <Text style={styles.sectionTitle}>About this item</Text>

      <Text
        style={styles.descriptionText}
        numberOfLines={expanded ? undefined : 4}
      >
        {description || 'No description available for this product.'}
      </Text>

      {/* Read More / Show Less Toggle */}
      {isLongDescription && (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={styles.toggleBtn}
        >
          <Text style={styles.toggleText}>
            {expanded ? 'Show less' : 'Read more'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Metadata / Specification Rows */}
      {activeSpecs.length > 0 && (
        <View style={styles.specsContainer}>
          <View style={styles.divider} />
          {activeSpecs.map((spec, index) => (
            <View
              key={`${spec.label}-${index}`}
              style={[
                styles.specRow,
                index === activeSpecs.length - 1 && styles.specRowLast,
              ]}
            >
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>{String(spec.value)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 8,
  },
  descriptionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
  },
  toggleBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  toggleText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#35501F',
  },
  specsContainer: {
    marginTop: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  specRowLast: {
    borderBottomWidth: 0,
  },
  specLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  specValue: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#1F2937',
  },
});
