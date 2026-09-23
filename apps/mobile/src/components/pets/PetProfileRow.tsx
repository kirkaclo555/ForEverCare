import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PetPhoto from './PetPhoto';
import StatusChip from './StatusChip';

interface PetProfileRowProps {
  avatar?: string | null;
  name: string;
  breed: string;
  species: string;
  verificationStatus?: string;
}

export default function PetProfileRow({
  avatar,
  name,
  breed,
  species,
  verificationStatus,
}: PetProfileRowProps) {
  const isVerified = verificationStatus === 'VERIFIED';
  const subtitle = [breed, species].filter(Boolean).join(' · ');

  return (
    <View style={styles.container}>
      {/* 72x72 Pet Photo with borderRadius 18 */}
      <PetPhoto
        avatar={avatar}
        species={species}
        size={72}
        borderRadius={18}
      />

      {/* Info Column */}
      <View style={styles.infoCol}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle || 'Unknown breed'}
        </Text>
        <View style={styles.chipRow}>
          <StatusChip
            status={verificationStatus}
            label={isVerified ? 'Verified' : 'Pending verification'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontFamily: 'Catcut',
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
