import React, { useState, useEffect } from 'react';
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
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { API_URL } from '../config/api';
import AddressPickerModal from '../components/AddressPickerModal';
import { scale, verticalScale, moderateScale, fontSize, wp, hp } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useUser } from '../context/UserContext';

WebBrowser.maybeCompleteAuthSession();

type RootStackParamList = {
  Login: undefined;
  PetOwnerTabs: undefined;
  Register: undefined;
  Users: undefined;
};

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: SignupScreenNavigationProp;
};

const GOOGLE_WEB_CLIENT_ID = '763437324119-neuj1g0eqp1ksu0lshq25coj3hlcchod.apps.googleusercontent.com';

export default function SignupScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { updateUser } = useUser();
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [structuredAddress, setStructuredAddress] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google OAuth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({ scheme: 'fureverpawcare' }),
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleAuthSuccess(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-Up Failed', response.error?.message || 'An error occurred during Google sign-in.');
    }
  }, [response]);


  // Email verification verification code states
  const [verificationToken, setVerificationToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [otpMethod, setOtpMethod] = useState<'email' | 'sms'>("email");

  const formatPhoneNumber = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.startsWith('63') && cleaned.length > 10) {
      cleaned = '0' + cleaned.slice(2);
    }
    const trimmed = cleaned.slice(0, 11);
    if (trimmed.length > 7) {
      return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 7)}-${trimmed.slice(7)}`;
    } else if (trimmed.length > 4) {
      return `${trimmed.slice(0, 4)}-${trimmed.slice(4)}`;
    }
    return trimmed;
  };

  const showAddressExplanation = () => {
    Alert.alert(
      "Why we need your address",
      "As a real vet clinic, we need your address for medical records, potential emergency house calls, and ensuring accurate pet profiles."
    );
  };

  const fetchLocationAddress = async () => {
    try {
      setIsLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied.');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (geocode) {
        // Map expo-location fields to Philippine equivalents
        // district -> Barangay, city -> City/Municipality, subregion -> Province, region -> Region
        const structuredParts = [
          geocode.district,
          geocode.city,
          geocode.subregion,
          geocode.region
        ].filter(Boolean);
        
        setStructuredAddress(structuredParts.join(', '));
        
        const streetParts = [
          geocode.streetNumber,
          geocode.street
        ].filter(Boolean);
        
        setStreetAddress(streetParts.join(' '));
      } else {
        Alert.alert('Error', 'Could not determine address from location.');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to fetch location. Please enter your address manually.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleAddressSelect = (addressInfo: { region: string; province: string; city: string; barangay: string; }) => {
    const parts = [
      addressInfo.barangay,
      addressInfo.city,
      addressInfo.province !== '' ? addressInfo.province : null,
      addressInfo.region
    ].filter(Boolean);
    
    setStructuredAddress(parts.join(', '));
  };

  const finalAddress = structuredAddress ? `${streetAddress ? streetAddress + ', ' : ''}${structuredAddress}` : '';

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !contactNumber || !finalAddress || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (otpMethod === 'sms') {
      const cleanPhone = contactNumber.replace(/\D/g, '');
      if (cleanPhone.length !== 11) {
        Alert.alert('Invalid Phone Number', 'Please enter a valid 11-digit mobile number (e.g., 0912-345-6789) to receive the verification SMS.');
        return;
      }
    }

    setIsSignupLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/mobile/signup/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phoneNumber: contactNumber,
          otpMethod
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.error || 'Failed to send verification code. Please check your details.');
      } else {
        setVerificationToken(data.verificationToken);
        setIsOtpModalVisible(true);
        const destination = otpMethod === 'email' ? `email: ${email}` : `phone: ${contactNumber}`;
        Alert.alert('Verification Sent', `A secure 6-digit code has been sent to your ${destination}. Please check to verify.`);
      }
    } catch (error) {
      console.error('Send OTP signup error:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again.');
    } finally {
      setIsSignupLoading(false);
    }
  };

  const handleVerifyOtp = async (customOtp?: any) => {
    let codeToVerify = '';
    if (typeof customOtp === 'string') {
      codeToVerify = customOtp.trim();
    } else if (typeof otpCode === 'string') {
      codeToVerify = otpCode.trim();
    }
    if (!codeToVerify || codeToVerify.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }

    setIsSignupLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/mobile/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber: contactNumber,
          address: finalAddress,
          password,
          verificationToken,
          code: codeToVerify
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Verification Failed', data.error || 'Failed to complete registration.');
      } else {
        setIsOtpModalVisible(false);
        setOtpCode("");
        
        if (data.user) {
          updateUser({
            id: data.user.id,
            fullName: data.user.fullName,
            email: data.user.email,
            phoneNumber: data.user.phoneNumber,
            address: data.user.address || finalAddress || '',
            avatarUri: data.user.profileImage || null,
            language: data.user.language || 'en',
          });
          Alert.alert('Success', 'Account created and verified successfully!', [
            { text: 'Open My Account', onPress: () => navigation.replace('PetOwnerTabs') }
          ]);
        } else {
          Alert.alert('Success', 'Account created and verified successfully!', [
            { text: 'OK', onPress: () => navigation.replace('Login') }
          ]);
        }
      }
    } catch (error) {
      console.error('Final signup verification error:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again.');
    } finally {
      setIsSignupLoading(false);
    }
  };

  const handleGoogleAuthSuccess = async (accessToken: string) => {
    setIsGoogleLoading(true);
    try {
      const profileRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await profileRes.json();

      if (!profile.email) {
        Alert.alert('Google Sign-Up Failed', 'Could not retrieve your email from Google.');
        return;
      }

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
        Alert.alert('Sign-Up Failed', data.error || 'An error occurred. Please try again.');
      } else {
        // Auto-login after Google sign-up
        updateUser({
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          phoneNumber: data.user.phoneNumber,
          address: data.user.address || '',
          avatarUri: data.user.profileImage || null,
          language: data.user.language || 'en',
        });
        Alert.alert(
          '🎉 Welcome to FurEverPawCare!',
          `Your account has been created with your Google account (${profile.email}). You are now logged in!`,
          [{ text: 'Get Started', onPress: () => navigation.replace('PetOwnerTabs') }]
        );
      }
    } catch (error) {
      console.error('Google signup error:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#1a3d28', flex: 0 }} />
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
          <View style={styles.container}>
            <LinearGradient
              colors={['#1a3d28', '#2E5E3E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <FontAwesome5 name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <View style={styles.headerBrand}>
                  <Text style={styles.headerTitle}>Create Account</Text>
                  <Text style={styles.headerSubtitle}>Join the FurEverPawCare Family</Text>
                </View>
              </View>
            </LinearGradient>

            <ScrollView 
              contentContainerStyle={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
                <View style={styles.signupContainerWrapper}>
                  {/* Google Sign-Up Button */}
                  <TouchableOpacity
                    style={[styles.googleBtn, { borderColor: isDarkMode ? '#333' : '#e2e8f0', backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}
                    onPress={() => promptAsync()}
                    disabled={!request || isGoogleLoading || isSignupLoading}
                    activeOpacity={0.8}
                  >
                    {isGoogleLoading ? (
                      <ActivityIndicator size="small" color="#4285F4" />
                    ) : (
                      <>
                        <View style={styles.googleIconCircle}>
                          <Text style={styles.googleGText}>G</Text>
                        </View>
                        <Text style={[styles.googleBtnLabel, { color: theme.text }]}>Continue with Google</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* OR Divider */}
                  <View style={styles.orDivider}>
                    <View style={[styles.orLine, { backgroundColor: theme.border }]} />
                    <Text style={[styles.orText, { color: theme.subtext }]}>or sign up manually</Text>
                    <View style={[styles.orLine, { backgroundColor: theme.border }]} />
                  </View>

                  <View style={styles.signupHeader}>
                    <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome! 🐾</Text>
                    <Text style={[styles.instructionText, { color: theme.subtext }]}>Enter your details below to sign up</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>First Name</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border, color: theme.text },
                        focusedInput === 'firstName' && styles.inputFocused
                      ]}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Name"
                      placeholderTextColor={theme.subtext}
                      autoCapitalize="words"
                      onFocus={() => setFocusedInput('firstName')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Last Name</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border, color: theme.text },
                        focusedInput === 'lastName' && styles.inputFocused
                      ]}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Last Name"
                      placeholderTextColor={theme.subtext}
                      autoCapitalize="words"
                      onFocus={() => setFocusedInput('lastName')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border, color: theme.text },
                        focusedInput === 'email' && styles.inputFocused
                      ]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="example@gmail.com"
                      placeholderTextColor={theme.subtext}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border, color: theme.text },
                        focusedInput === 'contactNumber' && styles.inputFocused
                      ]}
                      value={contactNumber}
                      onChangeText={(text) => setContactNumber(formatPhoneNumber(text))}
                      placeholder="09XX-XXX-XXXX"
                      placeholderTextColor={theme.subtext}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      onFocus={() => setFocusedInput('contactNumber')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Receive Verification Code via</Text>
                    <View style={styles.otpMethodContainer}>
                      <TouchableOpacity
                        style={[
                          styles.otpMethodBtn,
                          { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border },
                          otpMethod === 'email' && styles.otpMethodBtnActive
                        ]}
                        onPress={() => setOtpMethod('email')}
                        activeOpacity={0.8}
                      >
                        <FontAwesome5 
                          name="envelope" 
                          size={14} 
                          color={otpMethod === 'email' ? '#ffffff' : theme.subtext} 
                          style={{ marginRight: scale(8) }}
                        />
                        <Text style={[
                          styles.otpMethodText,
                          { color: theme.subtext },
                          otpMethod === 'email' && styles.otpMethodTextActive
                        ]}>
                          Email
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.otpMethodBtn,
                          { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border },
                          otpMethod === 'sms' && styles.otpMethodBtnActive
                        ]}
                        onPress={() => setOtpMethod('sms')}
                        activeOpacity={0.8}
                      >
                        <FontAwesome5 
                          name="sms" 
                          size={14} 
                          color={otpMethod === 'sms' ? '#ffffff' : theme.subtext} 
                          style={{ marginRight: scale(8) }}
                        />
                        <Text style={[
                          styles.otpMethodText,
                          { color: theme.subtext },
                          otpMethod === 'sms' && styles.otpMethodTextActive
                        ]}>
                          SMS (Phone)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Home Address</Text>
                      <TouchableOpacity onPress={showAddressExplanation} style={{ marginLeft: 8, backgroundColor: isDarkMode ? '#2d2d2d' : '#e2e8f0', borderRadius: 12, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 12, color: theme.subtext }}>?</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity 
                      style={[styles.pickerTrigger, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border }]}
                      onPress={() => setIsPickerVisible(true)}
                    >
                      <Text style={[styles.pickerTriggerText, { color: theme.text }, !structuredAddress && { color: theme.subtext }]}>
                        {structuredAddress || "Select Province, City, Barangay"}
                      </Text>
                      <FontAwesome5 name="chevron-down" size={12} color={theme.subtext} />
                    </TouchableOpacity>

                    <TextInput
                      style={[
                        styles.input,
                        { marginTop: 10, backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border, color: theme.text },
                        focusedInput === 'street' && styles.inputFocused
                      ]}
                      value={streetAddress}
                      onChangeText={setStreetAddress}
                      placeholder="Street Name, House No., or Purok (Optional)"
                      placeholderTextColor={theme.subtext}
                      autoCapitalize="words"
                      onFocus={() => setFocusedInput('street')}
                      onBlur={() => setFocusedInput(null)}
                    />

                    <TouchableOpacity 
                      onPress={fetchLocationAddress} 
                      disabled={isLocationLoading}
                      style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, alignSelf: 'flex-start' }}
                    >
                      {isLocationLoading ? (
                        <ActivityIndicator size="small" color="#2E5E3E" />
                      ) : (
                        <FontAwesome5 name="map-marker-alt" size={14} color="#2E5E3E" />
                      )}
                      <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#2E5E3E', marginLeft: 6 }}>
                        {isLocationLoading ? "Detecting Location..." : "Use Current Location"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                    <View>
                      <TextInput
                        style={[
                          styles.input,
                          { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border, color: theme.text, paddingRight: 45 },
                          focusedInput === 'password' && styles.inputFocused
                        ]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Create a password"
                        placeholderTextColor={theme.subtext}
                        secureTextEntry={!showPassword}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      <TouchableOpacity 
                        style={styles.eyeIconAbsolute} 
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesome5 name={showPassword ? "eye-slash" : "eye"} size={16} color={theme.subtext} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
                    <View>
                      <TextInput
                        style={[
                          styles.input,
                          { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border, color: theme.text, paddingRight: 45 },
                          focusedInput === 'confirm' && styles.inputFocused
                        ]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm your password"
                        placeholderTextColor={theme.subtext}
                        secureTextEntry={!showConfirmPassword}
                        onFocus={() => setFocusedInput('confirm')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      <TouchableOpacity 
                        style={styles.eyeIconAbsolute} 
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <FontAwesome5 name={showConfirmPassword ? "eye-slash" : "eye"} size={16} color={theme.subtext} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Password Requirements */}
                  <View style={[styles.passwordRequirements, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc', borderColor: theme.border }]}>
                    <Text style={[styles.reqHeader, { color: theme.text }]}>
                      <FontAwesome5 name="shield-alt" size={12} color={theme.text} />  Password Requirements
                    </Text>
                    <View style={styles.reqRow}>
                      <FontAwesome5 
                        name={password.length >= 8 ? "check-circle" : "circle"} 
                        size={password.length >= 8 ? 14 : 6} 
                        color={password.length >= 8 ? '#38a169' : '#a0aec0'} 
                        solid={password.length >= 8}
                      />
                      <Text style={[styles.reqText, password.length >= 8 && styles.reqMet]}>At least 8 characters</Text>
                    </View>
                    <View style={styles.reqRow}>
                      <FontAwesome5 
                        name={/[A-Z]/.test(password) ? "check-circle" : "circle"} 
                        size={/[A-Z]/.test(password) ? 14 : 6} 
                        color={/[A-Z]/.test(password) ? '#38a169' : '#a0aec0'} 
                        solid={/[A-Z]/.test(password)}
                      />
                      <Text style={[styles.reqText, /[A-Z]/.test(password) && styles.reqMet]}>One uppercase letter</Text>
                    </View>
                    <View style={styles.reqRow}>
                      <FontAwesome5 
                        name={/[0-9]/.test(password) ? "check-circle" : "circle"} 
                        size={/[0-9]/.test(password) ? 14 : 6} 
                        color={/[0-9]/.test(password) ? '#38a169' : '#a0aec0'} 
                        solid={/[0-9]/.test(password)}
                      />
                      <Text style={[styles.reqText, /[0-9]/.test(password) && styles.reqMet]}>One number</Text>
                    </View>
                    <View style={styles.reqRow}>
                      <FontAwesome5 
                        name={(password && password === confirmPassword) ? "check-circle" : "circle"} 
                        size={(password && password === confirmPassword) ? 14 : 6} 
                        color={(password && password === confirmPassword) ? '#38a169' : '#a0aec0'} 
                        solid={!!(password && password === confirmPassword)}
                      />
                      <Text style={[styles.reqText, (password && password === confirmPassword) && styles.reqMet]}>Passwords match</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={handleSignup} activeOpacity={0.8} style={styles.signupBtn} disabled={isSignupLoading}>
                    <Text style={styles.signupBtnText}>Sign Up</Text>
                  </TouchableOpacity>

                  <View style={[styles.loginHintContainer, { paddingBottom: Math.max(insets.bottom, verticalScale(20)) }]}>
                    <Text style={[styles.alreadyAccountText, { color: theme.subtext }]}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={[styles.loginText, { color: isDarkMode ? theme.text : '#2E5E3E' }]}>Sign in</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              </View>
            </ScrollView>
          </View>
      </KeyboardAvoidingView>
      
      <AddressPickerModal 
        visible={isPickerVisible} 
        onClose={() => setIsPickerVisible(false)} 
        onSelectComplete={handleAddressSelect} 
      />

      <Modal transparent={true} visible={isSignupLoading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7ed44a" />
          <Text style={styles.loadingText}>Creating your account...</Text>
        </View>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal visible={isOtpModalVisible} animationType="fade" transparent>
        <View style={[styles.modalOverlay, { justifyContent: 'center', paddingHorizontal: 24 }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }]}>
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <View style={{ 
                width: 60, height: 60, borderRadius: 30, 
                backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE', 
                alignItems: 'center', justifyContent: 'center', marginBottom: 15 
              }}>
                <FontAwesome5 name={otpMethod === 'email' ? 'envelope' : 'sms'} size={24} color={isDarkMode ? '#EAF3DE' : '#2D5016'} />
              </View>
              <Text style={[styles.modalTitle, { color: isDarkMode ? theme.text : '#2E5E3E', textAlign: 'center' }]}>
                {otpMethod === 'email' ? 'Verify Your Email' : 'Verify Your Phone'}
              </Text>
              <Text style={{ marginTop: 8, marginBottom: 5, color: theme.subtext, fontSize: 14, textAlign: 'center', lineHeight: 20, fontFamily: 'Montserrat-Regular' }}>
                We have sent a 6-digit verification code to <Text style={{ fontWeight: 'bold' }}>{otpMethod === 'email' ? email : contactNumber}</Text>. Please enter the code below.
              </Text>
            </View>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc', borderColor: theme.border, color: theme.text }]}
              placeholder="Enter 6-digit code"
              placeholderTextColor={theme.subtext}
              keyboardType="number-pad"
              maxLength={6}
              value={otpCode}
              onChangeText={(text) => {
                setOtpCode(text);
                if (text.trim().length === 6 && !isSignupLoading) {
                  handleVerifyOtp(text.trim());
                }
              }}
            />
            <View style={{ gap: 10, marginTop: 5 }}>
              <TouchableOpacity 
                style={{ backgroundColor: '#2E5E3E', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }} 
                onPress={() => handleVerifyOtp()}
                disabled={isSignupLoading}
              >
                <Text style={{ color: 'white', fontSize: 15, fontFamily: 'Montserrat-Bold' }}>
                  {isSignupLoading ? 'Verifying...' : 'Verify & Open Account'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border }} 
                onPress={() => { setIsOtpModalVisible(false); setOtpCode(""); }}
              >
                <Text style={{ color: theme.text, fontSize: 15, fontFamily: 'Montserrat-SemiBold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(20),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: scale(10),
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? verticalScale(10) : 0,
  },
  backButton: {
    marginRight: scale(15),
    padding: scale(5),
  },
  headerBrand: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Catcut',
    color: 'white',
    fontSize: fontSize(18),
    marginBottom: verticalScale(2),
  },
  headerSubtitle: {
    fontFamily: 'Montserrat-Regular',
    color: 'white',
    fontSize: fontSize(12),
    opacity: 0.85,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(40),
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(30),
    paddingHorizontal: scale(25),
  },
  signupContainerWrapper: {
    width: '100%',
    maxWidth: scale(400),
  },
  signupHeader: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  welcomeText: {
    fontFamily: 'Catcut',
    fontSize: fontSize(28),
    color: '#1a202c',
    marginBottom: verticalScale(8),
  },
  instructionText: {
    fontFamily: 'Montserrat-Regular',
    color: '#718096',
    fontSize: fontSize(15),
  },
  formGroup: {
    marginBottom: verticalScale(15),
  },
  label: {
    fontFamily: 'Montserrat-Medium',
    marginBottom: verticalScale(8),
    color: '#2d3748',
    fontSize: fontSize(14),
  },
  input: {
    fontFamily: 'Montserrat-Regular',
    width: '100%',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: scale(10),
    fontSize: fontSize(15),
    backgroundColor: '#f8fafc',
    color: '#1a202c',
  },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: scale(10),
    backgroundColor: '#f8fafc',
  },
  pickerTriggerText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(15),
    color: '#1a202c',
    flex: 1,
    marginRight: scale(10),
  },
  eyeIconAbsolute: {
    position: 'absolute',
    right: scale(15),
    height: '100%',
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: '#2E5E3E',
    backgroundColor: '#ffffff',
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
    color: '#2E5E3E',
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
    backgroundColor: '#2E5E3E',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(25),
    borderRadius: scale(10),
  },
  saveBtnText: {
    color: 'white',
    fontSize: fontSize(15),
    fontFamily: 'Montserrat-Bold',
  },
  signupBtn: {
    width: '100%',
    paddingVertical: verticalScale(16),
    borderRadius: scale(14),
    backgroundColor: '#7ed44a',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(30),
    shadowColor: '#7ed44a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: scale(10),
    elevation: 5,
  },
  signupBtnText: {
    fontFamily: 'Montserrat-Bold',
    color: '#0f2418',
    fontSize: fontSize(16),
  },
  loginHintContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: verticalScale(20),
  },
  alreadyAccountText: {
    fontFamily: 'Montserrat-Regular',
    color: '#718096',
    fontSize: fontSize(14),
  },
  loginText: {
    fontFamily: 'Montserrat-Bold',
    color: '#2E5E3E',
    fontSize: fontSize(14),
  },
  otpMethodContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(4),
  },
  otpMethodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: scale(10),
    backgroundColor: '#f8fafc',
  },
  otpMethodBtnActive: {
    backgroundColor: '#2E5E3E',
    borderColor: '#2E5E3E',
  },
  otpMethodText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: fontSize(14),
    color: '#4a5568',
  },
  otpMethodTextActive: {
    color: '#ffffff',
  },
  passwordRequirements: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reqHeader: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: fontSize(12),
    color: '#2E5E3E',
    marginBottom: 10,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  reqText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(12),
    color: '#a0aec0',
  },
  reqMet: {
    color: '#38a169',
    fontFamily: 'Montserrat-Medium',
  },
  googleBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(52),
    borderRadius: scale(14),
    borderWidth: 1.5,
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(20),
  },
  googleIconCircle: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  googleGText: {
    color: '#ffffff',
    fontSize: fontSize(15),
    fontFamily: 'Montserrat-Bold',
  },
  googleBtnLabel: {
    fontSize: fontSize(15),
    fontFamily: 'Montserrat-SemiBold',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: verticalScale(20),
    gap: scale(10),
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(13),
  },
});

