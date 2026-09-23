import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  count?: number;
};

export default function SectionLabel({ title, count }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
        {count !== undefined && count > 0 ? ` (${count})` : ''}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#9CA3AF',
    letterSpacing: 0.3,
    flexShrink: 0,
  },
  line: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#E5E7EB',
  },
});
