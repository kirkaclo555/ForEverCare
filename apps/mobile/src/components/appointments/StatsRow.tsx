import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  total: number;
  upcoming: number;
  completed: number;
};

type ColProps = {
  count: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
};

function StatCol({ count, label, icon, iconColor }: ColProps) {
  return (
    <View style={styles.col}>
      <Text style={styles.count}>{count}</Text>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={11} color={iconColor} style={{ marginRight: 3 }} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

export default function StatsRow({ total, upcoming, completed }: Props) {
  return (
    <View style={styles.card}>
      <StatCol count={total} label="Total" icon="paw-outline" iconColor="#35501F" />
      <View style={styles.divider} />
      <StatCol count={upcoming} label="Upcoming" icon="calendar-outline" iconColor="#B45309" />
      <View style={styles.divider} />
      <StatCol count={completed} label="Completed" icon="checkmark-circle-outline" iconColor="#059669" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  count: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#6B7280',
  },
  divider: {
    width: 0.5,
    height: 36,
    backgroundColor: '#E5E7EB',
  },
});
