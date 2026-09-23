import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function PetCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.list}>
      {[1, 2, 3].map(key => (
        <Animated.View key={key} style={[styles.card, { opacity }]}>
          {/* 60x60 square image placeholder */}
          <View style={styles.photoPlaceholder} />

          {/* Details placeholder */}
          <View style={styles.detailsCol}>
            <View style={styles.nameLine} />
            <View style={styles.breedLine} />
            <View style={styles.chipPlaceholder} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  nameLine: {
    width: '45%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  breedLine: {
    width: '32%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  chipPlaceholder: {
    width: 68,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginTop: 2,
  },
});
