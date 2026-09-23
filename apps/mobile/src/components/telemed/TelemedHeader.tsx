import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  canGoBack: boolean;
  onBack: () => void;
};

export default function TelemedHeader({ canGoBack, onBack }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          Telemedicine
        </Text>
      </View>

      {/* Spacer to keep title balanced */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#35501F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    marginHorizontal: 12,
  },
  title: {
    fontFamily: 'Catcut',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  spacer: {
    width: 36,
    height: 36,
  },
});
