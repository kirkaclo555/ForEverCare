import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: Props) {
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
            <FontAwesome5 name="paw" size={140} color="rgba(126,212,74,0.08)" />
          </View>
          <View style={styles.decorativePaw2}>
            <FontAwesome5 name="paw" size={80} color="rgba(126,212,74,0.05)" />
          </View>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/logo.png')} style={{ width: 120, height: 120, resizeMode: 'contain' }} />
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
                  <FontAwesome5 name="google" size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <FontAwesome5 name="facebook-f" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

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
    justifyContent: 'space-between',
  },
  decorativePaw1: {
    position: 'absolute',
    top: height * 0.05,
    right: -40,
    transform: [{ rotate: '25deg' }],
  },
  decorativePaw2: {
    position: 'absolute',
    top: height * 0.45,
    left: -20,
    transform: [{ rotate: '-15deg' }],
    zIndex: 0,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontFamily: 'Catcut',
    fontSize: 42,
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 60,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16, // Uses gap property for spacing between buttons
  },
  primaryButton: {
    backgroundColor: '#7ed44a',
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7ed44a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 16, 
  },
  primaryButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#0f2418',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
  socialContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  socialText: {
    fontFamily: 'Montserrat-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    fontSize: 14,
  },
  socialIconsRow: {
    flexDirection: 'row',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  waveContainer: {
    position: 'absolute',
    bottom: -150, 
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  waveShape: {
    width: width * 2,
    height: 300,
    backgroundColor: '#ffffff',
    borderRadius: width, 
    opacity: 0.08,
  }
});
