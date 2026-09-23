import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MenuRow, { MenuRowConfig } from './MenuRow';

type Props = {
  label: string;
  items: MenuRowConfig[];
};

export default function MenuGroup({ label, items }: Props) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <MenuRow
            key={item.id}
            {...item}
            isLast={index === items.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#9CA3AF',
    marginBottom: 6,
    marginLeft: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
});
