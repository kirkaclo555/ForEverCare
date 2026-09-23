import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PickupBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          Easy in-clinic pick-up
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          Order now, skip the line later.
        </Text>
      </View>
      <View style={styles.iconContainer}>
        <Ionicons name="cube-outline" size={44} color="rgba(255, 255, 255, 0.2)" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 64,
    backgroundColor: '#35501F',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  title: {
    fontFamily: 'Catcut',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 2,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});
