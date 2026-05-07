import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  PetOwnerTabs: undefined;
  Register: undefined;
  Users: undefined;
  ForgotPassword: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("owner@furcare.com");
  const [password, setPassword] = useState("owner123");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleLogin = () => {
    if (email === 'owner@furcare.com' && password === 'owner123') {
      navigation.replace('PetOwnerTabs');
    } else {
      Alert.alert('Login Failed', 'Invalid credentials. Please use owner@furcare.com / owner123');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#1a3d28', '#2E5E3E']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Subtle Decorative Paw Prints */}
          <View style={styles.decorativePaw1}>
            <FontAwesome5 name="paw" size={140} color="rgba(126,212,74,0.08)" />
          </View>
          <View style={styles.decorativePaw2}>
            <FontAwesome5 name="paw" size={80} color="rgba(126,212,74,0.05)" />
          </View>
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'position' : undefined}
            style={styles.keyboardAvoidingView}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.innerContainer}>

                {/* Header Section */}
                <View style={styles.headerSection}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#ffffff" />
                  </TouchableOpacity>

                  <View style={styles.brandingContainer}>
                    <Image source={require('../../assets/logo.png')} style={{ width: 150, height: 150, resizeMode: 'contain', marginBottom: 0 }} />
                  </View>
                </View>

                {/* Bottom Login Card */}
                <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.welcomeText}>FurEver Paw Care</Text>
                    <Text style={styles.subtitleText}>Login to your account</Text>
                  </View>

                  {/* Input Fields */}
                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'email' && styles.inputFocused
                  ]}>
                    <Ionicons name="person-outline" size={20} color={focusedInput === 'email' ? '#2E5E3E' : '#a0aec0'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Username or Email"
                      placeholderTextColor="#a0aec0"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'password' && styles.inputFocused
                  ]}>
                    <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#2E5E3E' : '#a0aec0'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      placeholderTextColor="#a0aec0"
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconToggle}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#a0aec0" />
                    </TouchableOpacity>
                  </View>

                  {/* Options: Remember me & Forgot Password */}
                  <View style={styles.optionsRow}>
                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                      <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                        {rememberMe && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                      </View>
                      <Text style={styles.rememberText}>Remember me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} activeOpacity={0.7}>
                      <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} style={styles.loginBtn}>
                    <Text style={styles.loginBtnText}>Login</Text>
                  </TouchableOpacity>

                  {/* OR Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Social Logins */}
                  <View style={styles.socialIconsRow}>
                    <TouchableOpacity style={styles.socialButton}>
                      <FontAwesome5 name="google" size={20} color="#2E5E3E" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                      <FontAwesome5 name="facebook-f" size={20} color="#2E5E3E" />
                    </TouchableOpacity>
                  </View>

                  {/* Sign Up Link */}
                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>New user? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                      <Text style={styles.registerText}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>

                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
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
  decorativePaw1: {
    position: 'absolute',
    top: height * 0.05,
    right: -40,
    transform: [{ rotate: '25deg' }],
  },
  decorativePaw2: {
    position: 'absolute',
    top: height * 0.35,
    left: -20,
    transform: [{ rotate: '-15deg' }],
    zIndex: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  brandingContainer: {
    alignItems: 'center',
  },
  brandText: {
    fontFamily: 'Catcut',
    fontSize: 26,
    color: '#ffffff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 25,
    paddingBottom: Platform.OS === 'ios' ? 25 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontFamily: 'Catcut',
    fontSize: 28,
    color: '#2E5E3E',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 15,
    color: '#718096',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: '#2E5E3E',
    backgroundColor: '#ffffff',
    shadowColor: '#2E5E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    fontFamily: 'Montserrat-Regular',
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
  },
  eyeIconToggle: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#cbd5e0',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxActive: {
    backgroundColor: '#2E5E3E',
    borderColor: '#2E5E3E',
  },
  rememberText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: '#4a5568',
  },
  forgotText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#2E5E3E',
  },
  loginBtn: {
    height: 56,
    backgroundColor: '#2E5E3E',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E5E3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 15,
  },
  loginBtnText: {
    fontFamily: 'Montserrat-Bold',
    color: '#ffffff',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontFamily: 'Montserrat-SemiBold',
    marginHorizontal: 15,
    color: '#a0aec0',
    fontSize: 14,
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8faf9',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#718096',
  },
  registerText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    color: '#2E5E3E',
  }
});
