import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface NextVaccineSummaryProps {
  dueDate?: string | null;
}

export default function NextVaccineSummary({ dueDate }: NextVaccineSummaryProps) {
  if (!dueDate || dueDate.trim() === '') {
    return null;
  }

  // Format date if it's ISO or parseable, otherwise use as-is
  let formattedDate = dueDate.trim();
  const parsed = new Date(dueDate);
  if (!isNaN(parsed.getTime())) {
    formattedDate = parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: parsed.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <FontAwesome5 name="syringe" size={12} color="#35501F" />
      </View>
      <Text style={styles.text} numberOfLines={1}>
        Next vaccine due <Text style={styles.dateText}>{formattedDate}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3DE',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#276749',
    flex: 1,
  },
  dateText: {
    fontFamily: 'Montserrat-Bold',
    color: '#1E4620',
  },
});
