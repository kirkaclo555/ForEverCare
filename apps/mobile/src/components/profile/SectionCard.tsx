import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function SectionCard({ title, iconName, rightAction, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {Boolean(title || rightAction) && (
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            {Boolean(iconName) && (
              <Ionicons name={iconName} size={18} color="#35501F" style={styles.headerIcon} />
            )}
            {Boolean(title) && <Text style={styles.titleText}>{title}</Text>}
          </View>
          {Boolean(rightAction) && (
            <TouchableOpacity
              onPress={rightAction?.onPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.rightActionButton}
            >
              <Text style={styles.rightActionText}>{rightAction?.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    marginRight: 8,
  },
  titleText: {
    fontFamily: 'Catcut',
    fontSize: 17,
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  rightActionButton: {
    minHeight: 28,
    justifyContent: 'center',
  },
  rightActionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#35501F',
  },
});
