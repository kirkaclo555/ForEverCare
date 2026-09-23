import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PetProfile } from '../../context/PetContext';
import PetPhoto from './PetPhoto';
import StatusChip from './StatusChip';
import PendingNotice from './PendingNotice';

interface PetCardProps {
  pet: PetProfile;
  hasDuplicateName?: boolean;
  onPress: () => void;
  onPressRecords: () => void;
  onPressBookVisit: () => void;
}

export default function PetCard({
  pet,
  hasDuplicateName = false,
  onPress,
  onPressRecords,
  onPressBookVisit,
}: PetCardProps) {
  const isVerified = pet.verificationStatus === 'VERIFIED';
  const subtitle = `${pet.breed || 'Unknown breed'}${pet.age ? ` · ${pet.age}` : ''}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${pet.name}, ${subtitle}`}
    >
      {/* Top horizontal row */}
      <View style={styles.mainRow}>
        {/* Uniform 60x60 Pet Photo */}
        <PetPhoto avatar={pet.avatar} species={pet.species} size={60} />

        {/* Middle details column */}
        <View style={styles.infoCol}>
          <Text style={styles.name} numberOfLines={1}>
            {pet.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          <View style={styles.chipRow}>
            <StatusChip status={pet.verificationStatus} />
          </View>
        </View>

        {/* Right chevron */}
        <View style={styles.chevronWrapper}>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      </View>

      {/* Verified: Slim action row with two equal outlined buttons */}
      {isVerified ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onPressRecords}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="View pet records"
          >
            <Ionicons name="document-text-outline" size={14} color="#35501F" />
            <Text style={styles.actionBtnText}>Records</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onPressBookVisit}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Book visit for pet"
          >
            <Ionicons name="calendar-outline" size={14} color="#35501F" />
            <Text style={styles.actionBtnText}>Book visit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Pending: Gray info notice */
        <PendingNotice hasDuplicateName={hasDuplicateName} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#1F2937',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 4,
  },
  chipRow: {
    marginTop: 2,
  },
  chevronWrapper: {
    width: 24,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
  },
  actionBtn: {
    flex: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#35501F',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#35501F',
  },
});
