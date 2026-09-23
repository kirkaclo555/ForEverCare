import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PendingNoticeProps {
  hasDuplicateName?: boolean;
}

export default function PendingNotice({ hasDuplicateName = false }: PendingNoticeProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="information-circle-outline"
        size={14}
        color="#6B7280"
        style={styles.icon}
      />
      <Text style={styles.text}>
        Waiting for the clinic to verify this pet.
        {hasDuplicateName ? ' Same name as another pet on your account.' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    gap: 6,
  },
  icon: {
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#4B5563',
    lineHeight: 16,
  },
});
