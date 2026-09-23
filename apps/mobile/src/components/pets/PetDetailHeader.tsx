import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PetDetailHeaderProps {
  petName: string;
  onBack: () => void;
  onEdit: () => void;
}

export default function PetDetailHeader({
  petName,
  onBack,
  onEdit,
}: PetDetailHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      {/* Back button */}
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Pet Name Title */}
      <View style={styles.titleWrapper}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {petName}
        </Text>
      </View>

      {/* Edit button */}
      <TouchableOpacity
        onPress={onEdit}
        style={styles.editBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Edit pet profile"
      >
        <Ionicons name="pencil" size={15} color="#FFFFFF" style={{ marginRight: 5 }} />
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
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
    marginLeft: -8,
    marginRight: 6,
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Catcut',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  editText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
  },
});
