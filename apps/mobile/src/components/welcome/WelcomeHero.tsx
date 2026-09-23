import React from 'react';
import { View, Text, Image, StyleSheet, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

type Props = {
  logoScaleAnim?: Animated.Value;
};

export default function WelcomeHero({ logoScaleAnim }: Props) {
  const scaleStyle = logoScaleAnim
    ? { transform: [{ scale: logoScaleAnim }] }
    : {};

  return (
    <LinearGradient
      colors={['#1a3d28', '#2E5E3E']}
      style={styles.heroContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Faint paw watermarks */}
      <View style={styles.pawWatermark1} pointerEvents="none">
        <FontAwesome5 name="paw" size={150} color="rgba(126, 212, 74, 0.08)" />
      </View>
      <View style={styles.pawWatermark2} pointerEvents="none">
        <FontAwesome5 name="paw" size={85} color="rgba(255, 255, 255, 0.05)" />
      </View>

      {/* Logo + Brand Name — spring scale together */}
      <Animated.View style={[styles.logoWrapper, scaleStyle]}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          accessibilityLabel="FurEver Paw Care veterinary logo"
        />
        <Text
          style={styles.brandTitle}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          FurEver Paw Care
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Text style={styles.tagline}>
        Let's check in on your furry babies
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  pawWatermark1: {
    position: 'absolute',
    top: 10,
    right: -25,
    transform: [{ rotate: '25deg' }],
  },
  pawWatermark2: {
    position: 'absolute',
    bottom: 25,
    left: -20,
    transform: [{ rotate: '-18deg' }],
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 8,
  },
  logo: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  brandTitle: {
    fontFamily: 'Catcut',
    fontSize: 24,
    lineHeight: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingVertical: Platform.OS === 'android' ? 3 : 1,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
    marginBottom: 4,
  },
  tagline: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

