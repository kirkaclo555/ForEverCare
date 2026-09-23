import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import SettingsRow, { SettingsRowConfig } from './SettingsRow';

type Props = {
  label: string;
  rows: SettingsRowConfig[];
};

export default function SettingsGroup({ label, rows }: Props) {
  const { theme } = useTheme();

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { color: theme.subtext }]}>{label}</Text>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {rows.map((row, index) => (
          <SettingsRow
            key={row.id}
            config={row}
            isLast={index === rows.length - 1}
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
    marginBottom: 6,
    marginLeft: 2,
  },
  card: {
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
});
