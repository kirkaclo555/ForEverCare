import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusChip from './StatusChip';

export type MenuRowConfig = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  showVerifyChip?: boolean;
  accessibilityLabel: string;
};

type Props = MenuRowConfig & {
  isLast?: boolean;
};

export default function MenuRow({
  icon,
  title,
  description,
  onPress,
  showVerifyChip,
  accessibilityLabel,
  isLast,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.divider]}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Icon tile */}
      <View style={styles.iconTile}>
        <Ionicons name={icon} size={20} color="#27500A" />
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail">
          {description}
        </Text>
      </View>

      {/* Optional chip + chevron */}
      {showVerifyChip && (
        <StatusChip label="Verify pet first" />
      )}
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 12,
    gap: 12,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#1F2937',
  },
  description: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#9CA3AF',
    marginTop: 1,
  },
  chevron: {
    marginLeft: 4,
  },
});
