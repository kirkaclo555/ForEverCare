import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HowToPayProps {
  amount: number;
}

export default function HowToPay({ amount }: HowToPayProps) {
  const formattedAmount = `₱${amount.toFixed(2)}`;

  const steps = [
    {
      num: '1',
      content: (
        <Text style={styles.stepText}>
          Scan the QR above, or save it and upload it in your wallet app.
        </Text>
      ),
    },
    {
      num: '2',
      content: (
        <Text style={styles.stepText}>
          Pay exactly <Text style={styles.boldText}>{formattedAmount}</Text>.
        </Text>
      ),
    },
    {
      num: '3',
      content: (
        <Text style={styles.stepText}>
          Enter the reference number from your receipt below.
        </Text>
      ),
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>How to pay</Text>
      <View style={styles.stepList}>
        {steps.map((s, idx) => (
          <View key={idx} style={styles.stepRow}>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{s.num}</Text>
            </View>
            <View style={styles.stepContent}>{s.content}</View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#1F2937',
    marginBottom: 12,
  },
  stepList: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  circleText: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    color: '#35501F',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#4B5563',
    lineHeight: 18,
  },
  boldText: {
    fontFamily: 'Montserrat-Bold',
    color: '#1F2937',
  },
});
