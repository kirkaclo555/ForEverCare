import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  petsCount: number;
  visitsCount: number;
  memberSinceYear: string | number;
};

export default function StatsRow({ petsCount, visitsCount, memberSinceYear }: Props) {
  return (
    <View style={styles.card}>
      {/* Pets Column */}
      <View style={styles.statColumn}>
        <Text style={styles.statValue}>{petsCount}</Text>
        <Text style={styles.statLabel}>Pets</Text>
      </View>

      {/* Divider 1 */}
      <View style={styles.divider} />

      {/* Visits Column */}
      <View style={styles.statColumn}>
        <Text style={styles.statValue}>{visitsCount}</Text>
        <Text style={styles.statLabel}>Visits</Text>
      </View>

      {/* Divider 2 */}
      <View style={styles.divider} />

      {/* Member Since Column */}
      <View style={styles.statColumn}>
        <Text style={styles.statValue}>{memberSinceYear}</Text>
        <Text style={styles.statLabel}>Member since</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'Catcut',
    fontSize: 21,
    color: '#35501F',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
});
