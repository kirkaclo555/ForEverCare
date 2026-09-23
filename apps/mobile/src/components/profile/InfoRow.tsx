import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
  isVerified?: boolean;
  emptyActionText?: string;
  onPressEmptyAction?: () => void;
  showDivider?: boolean;
};

export default function InfoRow({
  iconName,
  label,
  value,
  isVerified = false,
  emptyActionText = 'Add information',
  onPressEmptyAction,
  showDivider = true,
}: Props) {
  const hasValue = Boolean(value && value.trim() !== '');

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Left Icon */}
        <View style={styles.iconBox}>
          <Ionicons name={iconName} size={18} color="#35501F" />
        </View>

        {/* Middle Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>{label}</Text>
          {hasValue ? (
            <Text style={styles.valueText} numberOfLines={1} ellipsizeMode="tail">
              {value}
            </Text>
          ) : (
            <TouchableOpacity
              onPress={onPressEmptyAction}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyActionText}>{emptyActionText}</Text>
              <Ionicons name="add-circle-outline" size={14} color="#35501F" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>

        {/* Right Badge (e.g. Verified) */}
        {hasValue && isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#047857" style={{ marginRight: 3 }} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {/* Subtle Separator */}
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
    minHeight: 52,
    paddingVertical: 6,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  label: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  valueText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#1F2937',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  emptyActionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#35501F',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: '#047857',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 48,
    marginVertical: 4,
  },
});
