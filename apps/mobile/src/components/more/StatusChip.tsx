import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
};

export default function StatusChip({ label }: Props) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#FAEEDA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'center',
  },
  text: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#633806',
  },
});
