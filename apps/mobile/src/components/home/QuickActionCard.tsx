import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  upcomingAppointmentsCount: number;
  petsCount: number;
  onPressAppointments: () => void;
  onPressPets: () => void;
};

export default function QuickActionCard({
  upcomingAppointmentsCount,
  petsCount,
  onPressAppointments,
  onPressPets,
}: Props) {
  const appointmentStatus = `${upcomingAppointmentsCount} upcoming`;
  const petsStatus = `${petsCount} ${petsCount === 1 ? 'pet' : 'pets'}`;

  return (
    <View style={styles.container}>
      {/* Appointments Quick Card */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.78}
        onPress={onPressAppointments}
      >
        <View style={styles.greenIconTile}>
          <Ionicons name="calendar" size={20} color="#2D5016" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            Appointments
          </Text>
          <Text style={styles.cardStatusGreen} numberOfLines={1}>
            {appointmentStatus}
          </Text>
        </View>
      </TouchableOpacity>

      {/* My Pets Quick Card */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.78}
        onPress={onPressPets}
      >
        <View style={styles.amberIconTile}>
          <Ionicons name="paw" size={20} color="#B45309" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            My pets
          </Text>
          <Text style={styles.cardStatusAmber} numberOfLines={1}>
            {petsStatus}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    minHeight: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  greenIconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  amberIconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 2,
  },
  cardStatusGreen: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#35501F',
  },
  cardStatusAmber: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#B45309',
  },
});
