import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

type Props = {
  count?: number;
};

export default function ProductSkeleton({ count = 4 }: Props) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={styles.grid}>
      {items.map((key) => (
        <View key={key} style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Gray rounded image block */}
            <Animated.View
              style={[
                styles.imageBlock,
                { opacity: pulseAnim },
              ]}
            />

            {/* Category line */}
            <Animated.View
              style={[
                styles.textLineSmall,
                { opacity: pulseAnim },
              ]}
            />

            {/* Product title two lines */}
            <Animated.View
              style={[
                styles.textLineTitle1,
                { opacity: pulseAnim },
              ]}
            />
            <Animated.View
              style={[
                styles.textLineTitle2,
                { opacity: pulseAnim },
              ]}
            />

            {/* Price & action footer */}
            <View style={styles.footerRow}>
              <Animated.View
                style={[
                  styles.pricePlaceholder,
                  { opacity: pulseAnim },
                ]}
              />
              <Animated.View
                style={[
                  styles.btnPlaceholder,
                  { opacity: pulseAnim },
                ]}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 11,
    marginTop: 8,
  },
  cardContainer: {
    width: '50%',
    padding: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 8,
  },
  imageBlock: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  textLineSmall: {
    width: '40%',
    height: 10,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
    marginBottom: 4,
  },
  textLineTitle1: {
    width: '85%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  textLineTitle2: {
    width: '60%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    minHeight: 36,
  },
  pricePlaceholder: {
    width: 50,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  btnPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
});
