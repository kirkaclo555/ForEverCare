import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PetRecordsHeaderProps {
  onBack?: () => void;
  canGoBack?: boolean;
}

export default function PetRecordsHeader({ onBack, canGoBack = true }: PetRecordsHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      {canGoBack && onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <View style={styles.textColumn}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          Pet Records
        </Text>
        <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
          Manage your pets' profiles and history
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#35501F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginLeft: -8,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Catcut',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    marginTop: 2,
  },
});
