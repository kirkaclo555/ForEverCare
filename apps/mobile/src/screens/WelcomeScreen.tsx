import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale, fontSize, wp, hp, device } from '../utils/responsive';

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
  useEffect(() => {
    const checkLoginPersistence = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user_profile');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id && parsed.id.trim() !== '') {
            // User is already logged in, navigate straight to the dashboard!
            navigation.replace('PetOwnerTabs');
          }
        }
      } catch (e) {
        console.error('Failed to load persistent user', e);
      }
    };
    checkLoginPersistence();
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1a3d28', '#2E5E3E']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Subtle Decorative Paw Prints */}
          <View style={styles.decorativePaw1}>
            <FontAwesome5 name="paw" size={scale(140)} color="rgba(126,212,74,0.08)" />
          </View>
          <View style={styles.decorativePaw2}>
            <FontAwesome5 name="paw" size={scale(80)} color="rgba(126,212,74,0.05)" />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={{ width: scale(120), height: scale(120), resizeMode: 'contain' }} 
                />
              </View>

              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>Your pet's health, our priority.</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.secondaryButtonText}>Login</Text>
                </TouchableOpacity>
              </View>

              {/* Social Logins */}
              <View style={styles.socialContainer}>
                <Text style={styles.socialText}>Or connect with</Text>
                <View style={styles.socialIconsRow}>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome5 name="google" size={scale(20)} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome5 name="facebook-f" size={scale(20)} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Abstract Wave Curve at bottom */}
          <View style={styles.waveContainer}>
            <View style={styles.waveShape} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  decorativePaw1: {
    position: 'absolute',
    top: hp(5),
    right: scale(-40),
    transform: [{ rotate: '25deg' }],
  },
  decorativePaw2: {
    position: 'absolute',
    top: hp(45),
    left: scale(-20),
    transform: [{ rotate: '-15deg' }],
    zIndex: 0,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(30),
    paddingVertical: verticalScale(20),
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: verticalScale(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontFamily: 'Catcut',
    fontSize: fontSize(42),
    color: '#ffffff',
    marginBottom: verticalScale(8),
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(16),
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: verticalScale(40),
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: verticalScale(16),
  },
  primaryButton: {
    backgroundColor: '#7ed44a',
    height: verticalScale(58),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7ed44a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: verticalScale(16), 
  },
  primaryButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: fontSize(18),
    color: '#0f2418',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    height: verticalScale(58),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: fontSize(18),
    color: '#ffffff',
  },
  socialContainer: {
    marginTop: verticalScale(30),
    alignItems: 'center',
  },
  socialText: {
    fontFamily: 'Montserrat-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: verticalScale(16),
    fontSize: fontSize(14),
  },
  socialIconsRow: {
    flexDirection: 'row',
  },
  socialButton: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  waveContainer: {
    position: 'absolute',
    bottom: verticalScale(-150), 
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  waveShape: {
    width: wp(200),
    height: verticalScale(300),
    backgroundColor: '#ffffff',
    borderRadius: wp(100), 
    opacity: 0.08,
  }
});
