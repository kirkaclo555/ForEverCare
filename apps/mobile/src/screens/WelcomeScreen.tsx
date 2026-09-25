import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import WelcomeHero from '../components/welcome/WelcomeHero';
import WelcomeSheet from '../components/welcome/WelcomeSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  PetOwnerTabs: undefined;
  Register: undefined;
  Users: undefined;
  Profile: undefined;
  ForgotPassword: undefined;
};

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

type Props = {
  navigation: WelcomeScreenNavigationProp;
};

export default function WelcomeScreen({ navigation }: Props) {
  const { setIsGuest } = useUser();

  // Hero: fade in + logo gently scales up
  const heroFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.88)).current;

  // Sheet: springs up from below — same feel as Login card
  const sheetSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    // ── Fire animations immediately on mount (same as Login screen) ──
    Animated.parallel([
      // Hero fades in smoothly
      Animated.timing(heroFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Logo + brand name springs into view
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 45,
        friction: 7,
        useNativeDriver: true,
      }),
      // Bottom sheet springs up — identical spring config to Login card
      Animated.spring(sheetSlideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // ── Check persistence in parallel, navigate away if already logged in ──
    const checkLoginPersistence = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user_profile');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id && parsed.id.trim() !== '') {
            navigation.replace('PetOwnerTabs');
          }
        }
      } catch (e) {
        console.error('Failed to load persistent user', e);
      }
    };

    checkLoginPersistence();
  }, []);

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const handleCreateAccount = () => {
    navigation.navigate('Register');
  };

  const handleContinueGuest = () => {
    setIsGuest(true);
    navigation.replace('PetOwnerTabs');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Hero Section — fades in, logo springs up */}
      <Animated.View style={[styles.heroWrapper, { opacity: heroFadeAnim }]}>
        <SafeAreaView edges={['top']} style={styles.safeTop}>
          <WelcomeHero logoScaleAnim={logoScaleAnim} />
        </SafeAreaView>
      </Animated.View>

      {/* Bottom Sheet — springs up from off-screen */}
      <Animated.View
        style={[
          styles.sheetWrapper,
          { transform: [{ translateY: sheetSlideAnim }] },
        ]}
      >
        <WelcomeSheet
          onSignIn={handleSignIn}
          onCreateAccount={handleCreateAccount}
          onContinueGuest={handleContinueGuest}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a3d28',
  },
  safeTop: {
    flex: 1,
    backgroundColor: '#1a3d28',
  },
  heroWrapper: {
    height: '46%',
    minHeight: 270,
  },
  sheetWrapper: {
    flex: 1,
    backgroundColor: '#2E5E3E',
  },
});
