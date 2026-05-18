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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal } from 'react-native';

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
  const { updateUser } = useUser();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [is2FAModalVisible, setIs2FAModalVisible] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [expected2FACode, setExpected2FACode] = useState('');
  const [pendingUserAuth, setPendingUserAuth] = useState<any>(null);

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start();
    
    checkBiometricLogin();
  }, [slideAnim]);

  const checkBiometricLogin = async () => {
    try {
      const credentialsString = await AsyncStorage.getItem('global_biometric_credentials');
      if (credentialsString) {
        const credentials = JSON.parse(credentialsString);
        
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        if (hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Login with Biometrics',
            fallbackLabel: 'Use Password',
          });
          
          if (result.success) {
            setIdentifier(credentials.identifier);
            setPassword(credentials.password);
            // Auto login with credentials
            performLogin(credentials.identifier, credentials.password);
          }
        }
      }
    } catch (e) {
      console.error('Biometric auto-login error:', e);
    }
  };

  const handleLogin = () => {
    performLogin(identifier, password);
  };

  const performLogin = async (loginIdentifier: string, loginPassword: string) => {
    if (!loginIdentifier || !loginPassword) {
      Alert.alert('Error', 'Please enter your phone number/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.100.16:3000/api/auth/mobile/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.error || 'Invalid credentials. Please try again.');
      } else {
        // Save latest successful login credentials for biometrics (if they have it enabled, this is handled via account security later)
        await AsyncStorage.setItem('latest_successful_login', JSON.stringify({ identifier: loginIdentifier, password: loginPassword }));

        if (data.user.twoFactorEnabled) {
          // Mock 2FA Code Generation
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          setExpected2FACode(code);
          setPendingUserAuth(data.user);
          setIs2FAModalVisible(true);
          
          // Display the code since there is no SMS provider
          setTimeout(() => {
            Alert.alert('Mock SMS Received', `Your FurEverPawCare 2FA code is: ${code}`);
          }, 1000);
        } else {
          completeLogin(data.user);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeLogin = (user: any) => {
    updateUser({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatarUri: user.profileImage || null,
    });
    navigation.replace('PetOwnerTabs');
  };

  const verify2FA = () => {
    if (twoFactorCode === expected2FACode) {
      setIs2FAModalVisible(false);
      completeLogin(pendingUserAuth);
    } else {
      Alert.alert('Error', 'Invalid 2FA code. Please try again.');
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="always" keyboardDismissMode="none" bounces={false} showsVerticalScrollIndicator={false}>
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
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={identifier}
                      onChangeText={setIdentifier}
                      placeholder="Phone Number or Email"
                      placeholderTextColor="#a0aec0"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#a0aec0" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      placeholderTextColor="#a0aec0"
                      secureTextEntry={!showPassword}
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
                  <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} style={styles.loginBtn} disabled={isLoading}>
                    <Text style={styles.loginBtnText}>{isLoading ? "Logging in..." : "Login"}</Text>
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
            </ScrollView>
          </KeyboardAvoidingView>

          {/* 2FA Modal */}
          <Modal visible={is2FAModalVisible} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
                <Text style={{marginBottom: 15, color: '#718096', fontSize: 14}}>Please enter the 6-digit code sent to your registered phone number.</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={twoFactorCode}
                  onChangeText={setTwoFactorCode}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIs2FAModalVisible(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={verify2FA}>
                    <Text style={styles.saveBtnText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

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
  scrollContainer: {
    flexGrow: 1,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    fontFamily: 'Montserrat-Regular',
    flex: 1,
    height: '100%',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 16,
    padding: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Catcut',
    color: '#2D5016',
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#2d3748',
    textAlign: 'center',
    letterSpacing: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    color: '#718096',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  saveBtn: {
    backgroundColor: '#2D5016',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  }
});
