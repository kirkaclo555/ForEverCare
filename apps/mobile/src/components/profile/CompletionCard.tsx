import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  percentage?: number;
  hintText?: string;
  onPressHint?: () => void;
};

export default function CompletionCard({
  percentage = 70,
  hintText = 'Add birthday',
  onPressHint,
}: Props) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Ionicons name="sparkles" size={16} color="#35501F" style={{ marginRight: 6 }} />
          <Text style={styles.percentageTitle}>
            Profile {clampedPercentage}% complete
          </Text>
        </View>

        {Boolean(hintText) && (
          <TouchableOpacity
            style={styles.hintButton}
            onPress={onPressHint}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.hintText}>{hintText}</Text>
            <Ionicons name="chevron-forward" size={14} color="#35501F" />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clampedPercentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EAF3DE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C2E0A3',
    padding: 16,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  percentageTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#244013',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(53, 80, 31, 0.08)',
    borderRadius: 12,
  },
  hintText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#35501F',
    marginRight: 2,
  },
  progressTrack: {
    height: 7,
    backgroundColor: 'rgba(53, 80, 31, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#35501F',
    borderRadius: 4,
  },
});
