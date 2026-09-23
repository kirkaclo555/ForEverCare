import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  badge?: string | number;
  isDestructive?: boolean;
  onPress: () => void;
  showDivider?: boolean;
};

export default function SettingsRow({
  iconName,
  title,
  subtitle,
  badge,
  isDestructive = false,
  onPress,
  showDivider = true,
}: Props) {
  const iconColor = isDestructive ? '#EF4444' : '#35501F';
  const iconBg = isDestructive ? '#FEE2E2' : '#F3F4F6';
  const titleColor = isDestructive ? '#EF4444' : '#1F2937';

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.7}
        onPress={onPress}
      >
        {/* Left Icon Container */}
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>

        {/* Title and optional subtitle */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
            {title}
          </Text>
          {Boolean(subtitle) && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Badge / Chevron */}
        <View style={styles.rightContainer}>
          {badge !== undefined && badge !== null && (
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isDestructive ? '#FCA5A5' : '#9CA3AF'}
          />
        </View>
      </TouchableOpacity>

      {/* Divider */}
      {showDivider && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingVertical: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    backgroundColor: '#EAF3DE',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  badgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: '#35501F',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 48,
    marginVertical: 2,
  },
});
