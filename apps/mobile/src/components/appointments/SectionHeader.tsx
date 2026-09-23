import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  isMissed?: boolean;
};

export default function SectionHeader({ title, isMissed }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, isMissed && styles.textMissed]}>{title}</Text>
      <View style={[styles.line, isMissed && styles.lineMissed]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#9CA3AF',
    letterSpacing: 0.3,
    flexShrink: 0,
  },
  textMissed: { color: '#B45309' },
  line: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#E5E7EB',
  },
  lineMissed: { backgroundColor: '#FDE68A' },
});
