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
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/api';
import { scale, verticalScale, moderateScale, fontSize, wp, hp, device } from '../utils/responsive';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();


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

const GOOGLE_WEB_CLIENT_ID = '763437324119-neuj1g0eqp1ksu0lshq25coj3hlcchod.apps.googleusercontent.com';

const slideAnimValue = device.height;

export default function LoginScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { updateUser } = useUser();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google OAuth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({ scheme: 'fureverpawcare' }),
  });

  const slideAnim = useRef(new Animated.Value(slideAnimValue)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start();
    
    checkRememberedUser();
  }, [slideAnim]);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleAuthSuccess(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-In Failed', response.error?.message || 'An error occurred during Google sign-in.');
    }
  }, [response]);

  const checkRememberedUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('remembered_user');
      if (storedUser) {
        const { identifier: storedIdentifier, password: storedPassword } = JSON.parse(storedUser);
        setIdentifier(storedIdentifier);
        setPassword(storedPassword);
        setRememberMe(true);
      }
    } catch (e) {
      console.error('Error loading remembered user:', e);
    }
  };



  const handleLogin = () => {
    performLogin(identifier, password);
  };

  const handleGoogleAuthSuccess = async (accessToken: string) => {
    setIsGoogleLoading(true);
    try {
      // Fetch the user's Google profile using the access token
      const profileRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await profileRes.json();

      if (!profile.email) {
        Alert.alert('Google Sign-In Failed', 'Could not retrieve email from your Google account.');
        return;
      }

      // Send to our backend social auth endpoint
      const response = await fetch(`${API_URL}/api/auth/mobile/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          fullName: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || profile.email,
          provider: 'google',
          providerId: profile.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Sign-In Failed', data.error || 'An error occurred. Please try again.');
      } else {
        completeLogin(data.user);
      }
    } catch (error) {
      console.error('Google auth success handler error:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    promptAsync();
  };


  const performLogin = async (loginIdentifier: string, loginPassword: string) => {
    if (!loginIdentifier || !loginPassword) {
      Alert.alert('Error', 'Please enter your phone number/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/mobile/login`, {
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

        if (rememberMe) {
          await AsyncStorage.setItem('remembered_user', JSON.stringify({ identifier: loginIdentifier, password: loginPassword }));
        } else {
          await AsyncStorage.removeItem('remembered_user');
        }

        completeLogin(data.user);
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
      address: user.address || '',
      avatarUri: user.profileImage || null,
      language: user.language || 'en',
    });
    navigation.replace('PetOwnerTabs');
  };



  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#1a3d28', '#2E5E3E']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%' }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Subtle Decorative Paw Prints */}
          <View style={styles.decorativePaw1}>
            <FontAwesome5 name="paw" size={140} color="rgba(126,212,74,0.08)" />
          </View>
          <View style={styles.decorativePaw2}>
            <FontAwesome5 name="paw" size={80} color="rgba(126,212,74,0.05)" />
          </View>
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                    <Image source={require('../../assets/logo.png')} style={{ width: 130, height: 130, resizeMode: 'contain', marginBottom: 8 }} />
                    <Text
                      style={styles.brandText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      FurEver Paw Care
                    </Text>
                  </View>
                </View>

                {/* Bottom Login Card */}
                <Animated.View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, transform: [{ translateY: slideAnim }] }]}>
                  <View style={styles.headerTextContainer}>
                    <Text style={[styles.subtitleText, { color: theme.subtext }]}>Login to your account</Text>
                  </View>

                  {/* Input Fields */}
                  <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8faf9', borderColor: theme.border }]}>
                    <Ionicons name="person-outline" size={20} color={theme.subtext} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      value={identifier}
                      onChangeText={setIdentifier}
                      placeholder="Phone Number or Email"
                      placeholderTextColor={theme.subtext}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8faf9', borderColor: theme.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.subtext} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      placeholderTextColor={theme.subtext}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconToggle}>
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.subtext} />
                    </TouchableOpacity>
                  </View>

                  {/* Options: Remember me & Forgot Password */}
                  <View style={styles.optionsRow}>
                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                      <View style={[styles.checkbox, { backgroundColor: theme.card, borderColor: theme.border }, rememberMe && styles.checkboxActive]}>
                        {rememberMe && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                      </View>
                      <Text style={[styles.rememberText, { color: theme.text }]}>Remember me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} activeOpacity={0.7}>
                      <Text style={[styles.forgotText, { color: isDarkMode ? theme.text : '#2E5E3E' }]}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} style={styles.loginBtn} disabled={isLoading}>
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
                    <TouchableOpacity 
                      style={[styles.socialButton, styles.googleButton, { borderColor: isGoogleLoading ? '#4285F4' : theme.border }]} 
                      onPress={handleGoogleSignIn} 
                      disabled={isLoading || isGoogleLoading || !request}
                      activeOpacity={0.8}
                    >
                      {isGoogleLoading ? (
                        <ActivityIndicator size="small" color="#4285F4" />
                      ) : (
                        <>
                          <View style={styles.googleIconWrapper}>
                            <Text style={styles.googleG}>G</Text>
                          </View>
                          <Text style={[styles.googleBtnText, { color: theme.text }]}>Continue with Google</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Sign Up Link */}
                  <View style={[styles.footerRow, { paddingBottom: Math.max(insets.bottom, verticalScale(20)) }]}>
                    <Text style={[styles.footerText, { color: theme.subtext }]}>New user? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                      <Text style={[styles.registerText, { color: isDarkMode ? theme.text : '#2E5E3E' }]}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>

                </Animated.View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Loading Modal */}
          <Modal transparent={true} visible={isLoading} animationType="fade">
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#7ed44a" />
              <Text style={styles.loadingText}>Logging in...</Text>
            </View>
          </Modal>



        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  decorativePaw1: {
    position: 'absolute',
    top: hp(5),
    right: scale(-40),
  },
  decorativePaw2: {
    position: 'absolute',
    top: hp(35),
    left: scale(-20),
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
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(10),
  },
  backButton: {
    position: 'absolute',
    top: verticalScale(10),
    left: scale(20),
    padding: scale(10),
    zIndex: 10,
  },
  brandingContainer: {
    alignItems: 'center',
  },
  brandText: {
    fontFamily: 'Catcut',
    fontSize: fontSize(24),
    lineHeight: fontSize(32),
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingVertical: Platform.OS === 'android' ? 3 : 1,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: scale(40),
    borderTopRightRadius: scale(40),
    paddingHorizontal: scale(30),
    paddingTop: verticalScale(25),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(25) : verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: scale(20),
    elevation: 20,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(16),
    marginTop: verticalScale(4),
  },
  welcomeText: {
    fontFamily: 'Catcut',
    fontSize: fontSize(28),
    color: '#2E5E3E',
    marginBottom: verticalScale(6),
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(15),
    color: '#718096',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: scale(16),
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: scale(16),
    height: verticalScale(56),
    marginBottom: verticalScale(16),
  },
  inputIcon: {
    marginRight: scale(12),
  },
  input: {
    fontFamily: 'Montserrat-Regular',
    flex: 1,
    height: '100%',
    fontSize: fontSize(16),
    color: '#2d3748',
  },
  eyeIconToggle: {
    padding: scale(4),
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    marginTop: verticalScale(4),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(6),
    borderWidth: 1.5,
    borderColor: '#cbd5e0',
    marginRight: scale(8),
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
    fontSize: fontSize(14),
    color: '#4a5568',
  },
  forgotText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: fontSize(14),
    color: '#2E5E3E',
  },
  loginBtn: {
    height: verticalScale(56),
    backgroundColor: '#2E5E3E',
    borderRadius: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E5E3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: scale(10),
    elevation: 6,
    marginBottom: verticalScale(15),
  },
  loginBtnText: {
    fontFamily: 'Montserrat-Bold',
    color: '#ffffff',
    fontSize: fontSize(16),
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontFamily: 'Montserrat-SemiBold',
    marginHorizontal: scale(15),
    color: '#a0aec0',
    fontSize: fontSize(14),
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(52),
    borderRadius: scale(14),
    borderWidth: 1.5,
    paddingHorizontal: scale(16),
  },
  googleButton: {
    backgroundColor: 'transparent',
  },
  googleIconWrapper: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  googleG: {
    color: '#ffffff',
    fontSize: fontSize(15),
    fontFamily: 'PlusJakartaSans-Bold',
  },
  googleBtnText: {
    fontSize: fontSize(15),
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(14),
    color: '#718096',
  },
  registerText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: fontSize(14),
    color: '#2E5E3E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: scale(16),
    padding: scale(25),
  },
  modalTitle: {
    fontSize: fontSize(20),
    fontFamily: 'Catcut',
    color: '#2D5016',
    marginBottom: verticalScale(10),
  },
  modalInput: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: scale(10),
    padding: scale(15),
    marginBottom: verticalScale(20),
    fontSize: fontSize(16),
    color: '#2d3748',
    textAlign: 'center',
    letterSpacing: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: scale(15),
  },
  cancelBtn: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
  },
  cancelBtnText: {
    color: '#718096',
    fontSize: fontSize(15),
    fontFamily: 'Montserrat-SemiBold',
  },
  saveBtn: {
    backgroundColor: '#2D5016',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(25),
    borderRadius: scale(10),
  },
  saveBtnText: {
    color: 'white',
    fontSize: fontSize(15),
    fontFamily: 'Montserrat-Bold',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Montserrat-Bold',
    color: 'white',
    marginTop: verticalScale(15),
    fontSize: fontSize(16),
  }
});
