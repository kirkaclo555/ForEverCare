import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VerificationNoticeProps {
  petName: string;
  verificationStatus?: string;
}

export default function VerificationNotice({
  petName,
  verificationStatus,
}: VerificationNoticeProps) {
  if (verificationStatus === 'VERIFIED') {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name="alert-circle" size={20} color="#92400E" />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>Pending in-person clinic verification</Text>
        <Text style={styles.message}>
          Bring {petName} in for a walk-in visit so the vet can verify their details and unlock pet monitoring.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#FDE68A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    marginRight: 10,
    marginTop: 1,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#92400E',
    marginBottom: 3,
    lineHeight: 18,
  },
  message: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#92400E',
    lineHeight: 18,
  },
});
