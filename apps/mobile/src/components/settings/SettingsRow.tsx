import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export type SettingsRowConfig = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  /** 'nav'=chevron, 'switch'=Switch, 'value'=text value on right, 'danger'=red nav row */
  type: 'nav' | 'switch' | 'value' | 'danger';
  /** For 'value' type */
  value?: string;
  /** For 'switch' type */
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  onPress?: () => void;
  accessibilityLabel: string;
  /** Override icon tile bg (e.g. red for logout) */
  iconBg?: string;
  /** Override icon colour */
  iconColor?: string;
};

type Props = {
  config: SettingsRowConfig;
  isLast?: boolean;
};

export default function SettingsRow({ config, isLast }: Props) {
  const { theme, isDarkMode } = useTheme();
  const {
    icon,
    title,
    description,
    type,
    value,
    switchValue,
    onSwitchChange,
    onPress,
    accessibilityLabel,
    iconBg = '#EAF3DE',
    iconColor = '#27500A',
  } = config;

  const isDanger = type === 'danger';
  const titleColor = isDanger ? '#791F1F' : theme.text;

  const rowContent = (
    <View style={[styles.row, !isLast && { borderBottomWidth: 0.5, borderBottomColor: theme.border }]}>
      {/* Icon tile */}
      <View style={[styles.iconTile, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text
            style={[styles.description, { color: theme.subtext }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {description}
          </Text>
        ) : null}
      </View>

      {/* Right element */}
      {type === 'switch' ? (
        <Switch
          value={switchValue ?? false}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#D1D5DB', true: '#35501F' }}
          thumbColor="#FFFFFF"
          accessibilityRole="switch"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ checked: switchValue ?? false }}
        />
      ) : type === 'value' ? (
        <View style={styles.valueRow}>
          <Text style={[styles.valueText, { color: theme.subtext }]}>{value}</Text>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDanger ? '#F87171' : '#D1D5DB'}
        />
      )}
    </View>
  );

  if (type === 'switch') {
    // Switches: wrap in a plain View so the switch itself handles touch
    return rowContent;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {rowContent}
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
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  description: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});
