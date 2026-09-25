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
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  Dimensions,
  TextInputProps,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { API_URL } from '../config/api';
import AddressPickerModal from '../components/AddressPickerModal';
import { scale, verticalScale, fontSize } from '../utils/responsive';
import { useTheme } from '../context/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useUser } from '../context/UserContext';

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const STEPS = [
  { id: 1, title: 'Personal Info', icon: 'user', subtitle: 'Tell us about yourself' },
  { id: 2, title: 'Home Address', icon: 'map-marker-alt', subtitle: 'Where are you located?' },
  { id: 3, title: 'Set Password', icon: 'lock', subtitle: 'Secure your account' },
];

import LabeledInput from '../components/shared/LabeledInput';

const pickerStyles = StyleSheet.create({
  label: {
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500',
    fontSize: fontSize(13),
    marginBottom: verticalScale(7),
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: scale(12),
    minHeight: verticalScale(50),
    paddingHorizontal: scale(16),
  },
  textInput: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(15),
    paddingVertical: verticalScale(12),
  },
  rightEl: {
    marginLeft: scale(8),
  },
  hint: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(11),
    marginTop: verticalScale(5),
    marginLeft: scale(4),
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SignupScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { updateUser } = useUser();
  const insets = useSafeAreaInsets();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const progressAnim = useRef(new Animated.Value(1 / 3)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [structuredAddress, setStructuredAddress] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [otpMethod, setOtpMethod] = useState<'email' | 'sms'>('email');

  // Inline field errors
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [contactError, setContactError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const addressShakeAnim = useRef(new Animated.Value(0)).current;

  const triggerAddressShake = () => {
    addressShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(addressShakeAnim, { toValue: -9, duration: 55, useNativeDriver: true }),
      Animated.timing(addressShakeAnim, { toValue: 9,  duration: 55, useNativeDriver: true }),
      Animated.timing(addressShakeAnim, { toValue: -7, duration: 50, useNativeDriver: true }),
      Animated.timing(addressShakeAnim, { toValue: 7,  duration: 50, useNativeDriver: true }),
      Animated.timing(addressShakeAnim, { toValue: -4, duration: 45, useNativeDriver: true }),
      Animated.timing(addressShakeAnim, { toValue: 0,  duration: 45, useNativeDriver: true }),
    ]).start();
  };

  // OTP / verification state
  const [verificationToken, setVerificationToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);

  // Google OAuth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({ scheme: 'fureverpawcare' }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) handleGoogleAuthSuccess(authentication.accessToken);
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-Up Failed', response.error?.message || 'An error occurred during Google sign-in.');
    }
  }, [response]);

  // ─── Step animation ───────────────────────────────────────
  const goToStep = (next: number, direction: 'forward' | 'back' = 'forward') => {
    Animated.timing(slideAnim, {
      toValue: direction === 'forward' ? -SCREEN_WIDTH : SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(next);
      slideAnim.setValue(direction === 'forward' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(progressAnim, { toValue: next / STEPS.length, duration: 350, useNativeDriver: false }),
      ]).start();
    });
  };

  // ─── Helpers ──────────────────────────────────────────────
  const formatPhoneNumber = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.startsWith('63') && cleaned.length > 10) cleaned = '0' + cleaned.slice(2);
    const trimmed = cleaned.slice(0, 11);
    if (trimmed.length > 7) return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 7)}-${trimmed.slice(7)}`;
    else if (trimmed.length > 4) return `${trimmed.slice(0, 4)}-${trimmed.slice(4)}`;
    return trimmed;
  };

  const showAddressExplanation = () => {
    Alert.alert(
      'Why we need your address',
      'As a real vet clinic, we need your address for medical records, potential emergency house calls, and ensuring accurate pet profiles.'
    );
  };

  const fetchLocationAddress = async () => {
    try {
      setIsLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission denied', 'Permission to access location was denied.'); return; }
      const location = await Location.getCurrentPositionAsync({});
      const [geocode] = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      if (geocode) {
        const structuredParts = [geocode.district, geocode.city, geocode.subregion, geocode.region].filter(Boolean);
        setStructuredAddress(structuredParts.join(', '));
        setStreetAddress([geocode.streetNumber, geocode.street].filter(Boolean).join(' '));
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

  const handleAddressSelect = (addressInfo: { region: string; province: string; city: string; barangay: string }) => {
    const parts = [addressInfo.barangay, addressInfo.city, addressInfo.province !== '' ? addressInfo.province : null, addressInfo.region].filter(Boolean);
    setStructuredAddress(parts.join(', '));
  };

  const finalAddress = structuredAddress ? `${streetAddress ? streetAddress + ', ' : ''}${structuredAddress}` : '';

  // ─── Validation ───────────────────────────────────────────
  const validateStep1 = () => {
    let valid = true;
    setShakeTrigger((prev) => prev + 1);
    if (!firstName.trim()) { setFirstNameError('First name is required'); valid = false; } else setFirstNameError('');
    if (!lastName.trim()) { setLastNameError('Last name is required'); valid = false; } else setLastNameError('');
    if (!email.trim() || !email.includes('@')) { setEmailError('Enter a valid email address'); valid = false; } else setEmailError('');
    if (!contactNumber.trim()) { setContactError('Phone number is required'); valid = false; } else setContactError('');
    return valid;
  };
  const validateStep2 = () => {
    setShakeTrigger((prev) => prev + 1);
    if (!structuredAddress) {
      setAddressError('Please select your province, city, and barangay');
      triggerAddressShake();
      return false;
    }
    setAddressError('');
    return true;
  };
  const validateStep3 = () => {
    let valid = true;
    setShakeTrigger((prev) => prev + 1);
    if (!password) { setPasswordError('Password is required'); valid = false; }
    else if (password.length < 8) { setPasswordError('Password must be at least 8 characters'); valid = false; }
    else if (!/[A-Z]/.test(password)) { setPasswordError('Must contain at least one uppercase letter'); valid = false; }
    else if (!/[0-9]/.test(password)) { setPasswordError('Must contain at least one number'); valid = false; }
    else setPasswordError('');
    if (!confirmPassword) { setConfirmPasswordError('Please confirm your password'); valid = false; }
    else if (password !== confirmPassword) { setConfirmPasswordError('Passwords do not match'); valid = false; }
    else setConfirmPasswordError('');
    return valid;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) goToStep(2, 'forward');
    else if (currentStep === 2 && validateStep2()) goToStep(3, 'forward');
    else if (currentStep === 3) handleSignup();
  };

  const handleBackStep = () => {
    if (currentStep > 1) goToStep(currentStep - 1, 'back');
    else navigation.goBack();
  };

  // ─── API calls ────────────────────────────────────────────
  const handleSignup = async () => {
    if (!validateStep3()) return;
    if (otpMethod === 'sms') {
      const cleanPhone = contactNumber.replace(/\D/g, '');
      if (cleanPhone.length !== 11) {
        Alert.alert('Invalid Phone Number', 'Please enter a valid 11-digit mobile number (e.g., 0912-345-6789).');
        return;
      }
    }
    setIsSignupLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/mobile/signup/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phoneNumber: contactNumber, otpMethod }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.error || 'Failed to send verification code.');
      } else {
        setVerificationToken(data.verificationToken);
        setIsOtpModalVisible(true);
        const destination = otpMethod === 'email' ? `email: ${email}` : `phone: ${contactNumber}`;
        Alert.alert('Verification Sent', `A secure 6-digit code has been sent to your ${destination}.`);
      }
    } catch (error) {
      console.error('Send OTP signup error:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again.');
    } finally {
      setIsSignupLoading(false);
    }
  };

  const handleVerifyOtp = async (customOtp?: any) => {
    let codeToVerify = typeof customOtp === 'string' ? customOtp.trim() : (typeof otpCode === 'string' ? otpCode.trim() : '');
    if (!codeToVerify || codeToVerify.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }
    setIsSignupLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/mobile/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phoneNumber: contactNumber, address: finalAddress, password, verificationToken, code: codeToVerify }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Verification Failed', data.error || 'Failed to complete registration.');
      } else {
        setIsOtpModalVisible(false);
        setOtpCode('');
        if (data.user) {
          updateUser({ id: data.user.id, fullName: data.user.fullName, email: data.user.email, phoneNumber: data.user.phoneNumber, address: data.user.address || finalAddress || '', avatarUri: data.user.profileImage || null, language: data.user.language || 'en' });
          Alert.alert('Success', 'Account created and verified successfully!', [{ text: 'Open My Account', onPress: () => navigation.replace('PetOwnerTabs') }]);
        } else {
          Alert.alert('Success', 'Account created and verified successfully!', [{ text: 'OK', onPress: () => navigation.replace('Login') }]);
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
      const profileRes = await fetch('https://www.googleapis.com/userinfo/v2/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      const profile = await profileRes.json();
      if (!profile.email) { Alert.alert('Google Sign-Up Failed', 'Could not retrieve your email from Google.'); return; }
      const res = await fetch(`${API_URL}/api/auth/mobile/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, fullName: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || profile.email, provider: 'google', providerId: profile.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Sign-Up Failed', data.error || 'An error occurred. Please try again.');
      } else {
        updateUser({ id: data.user.id, fullName: data.user.fullName, email: data.user.email, phoneNumber: data.user.phoneNumber, address: data.user.address || '', avatarUri: data.user.profileImage || null, language: data.user.language || 'en' });
        Alert.alert('🎉 Welcome to FurEverPawCare!', `Account created with Google (${profile.email}). You are now logged in!`, [{ text: 'Get Started', onPress: () => navigation.replace('PetOwnerTabs') }]);
      }
    } catch (error) {
      console.error('Google signup error:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ─── Step Renders ─────────────────────────────────────────
  const renderStep1 = () => (
    <View>
      {/* Google Sign-Up */}
      <TouchableOpacity
        style={[styles.googleBtn, { borderColor: isDarkMode ? '#333' : '#e2e8f0', backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}
        onPress={() => promptAsync()}
        disabled={!request || isGoogleLoading}
        activeOpacity={0.8}
      >
        {isGoogleLoading ? (
          <ActivityIndicator size="small" color="#4285F4" />
        ) : (
          <>
            <Image source={require('../../assets/google_logo.png')} style={styles.googleLogoImg} />
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

      {/* Name row — side by side */}
      <View style={styles.nameRow}>
        <LabeledInput
          label="First Name"
          value={firstName}
          onChangeText={(t) => { setFirstName(t); if (firstNameError) setFirstNameError(''); }}
          placeholder="First name"
          autoCapitalize="words"
          error={firstNameError}
          shakeTrigger={shakeTrigger}
          isDarkMode={isDarkMode}
          themeText={theme.text}
          themeBorder={theme.border}
          themeSubtext={theme.subtext}
          containerStyle={{ flex: 1, marginRight: scale(8) }}
        />
        <LabeledInput
          label="Last Name"
          value={lastName}
          onChangeText={(t) => { setLastName(t); if (lastNameError) setLastNameError(''); }}
          placeholder="Last name"
          autoCapitalize="words"
          error={lastNameError}
          shakeTrigger={shakeTrigger}
          isDarkMode={isDarkMode}
          themeText={theme.text}
          themeBorder={theme.border}
          themeSubtext={theme.subtext}
          containerStyle={{ flex: 1, marginLeft: scale(8) }}
        />
      </View>

      <LabeledInput
        label="Email Address"
        value={email}
        onChangeText={(t) => { setEmail(t); if (emailError) setEmailError(''); }}
        placeholder="example@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
        shakeTrigger={shakeTrigger}
        isDarkMode={isDarkMode}
        themeText={theme.text}
        themeBorder={theme.border}
        themeSubtext={theme.subtext}
      />

      <LabeledInput
        label="Mobile Number"
        value={contactNumber}
        onChangeText={(text) => { setContactNumber(formatPhoneNumber(text)); if (contactError) setContactError(''); }}
        placeholder="0912-345-6789"
        keyboardType="phone-pad"
        error={contactError}
        shakeTrigger={shakeTrigger}
        isDarkMode={isDarkMode}
        themeText={theme.text}
        themeBorder={theme.border}
        themeSubtext={theme.subtext}
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      {/* Address explanation card */}
      <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1a2e1a' : '#EAF3DE', borderColor: isDarkMode ? '#2E5E3E' : '#b5d99c' }]}>
        <FontAwesome5 name="info-circle" size={14} color="#2E5E3E" style={{ marginRight: scale(8), marginTop: 2 }} />
        <Text style={[styles.infoCardText, { color: isDarkMode ? '#a8d880' : '#2D5016' }]}>
          We collect your home address for medical records and emergency house visits.{' '}
          <Text style={{ fontFamily: 'Montserrat-Bold' }} onPress={showAddressExplanation}>Learn more</Text>
        </Text>
      </View>

      {/* Province / City / Barangay picker */}
      <View style={{ marginBottom: verticalScale(20) }}>
        <Text style={[pickerStyles.label, { color: addressError ? '#E53E3E' : isDarkMode ? '#a8d880' : '#2E5E3E' }]}>
          Province / City / Barangay
        </Text>
        <Animated.View style={{ transform: [{ translateX: addressShakeAnim }] }}>
          <TouchableOpacity
            style={[
              pickerStyles.inputBox,
              {
                borderColor: addressError ? '#E53E3E' : structuredAddress ? (isDarkMode ? '#38a169' : '#2E5E3E') : theme.border,
                backgroundColor: addressError ? (isDarkMode ? '#2a1010' : '#fff5f5') : isDarkMode ? '#1a1a1a' : '#f8fafc',
              },
            ]}
            onPress={() => { setIsPickerVisible(true); if (addressError) setAddressError(''); }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                pickerStyles.textInput,
                { color: structuredAddress ? theme.text : theme.subtext },
              ]}
              numberOfLines={1}
            >
              {structuredAddress || 'Select province, city, and barangay'}
            </Text>
            <View style={pickerStyles.rightEl}>
              <FontAwesome5
                name={structuredAddress ? 'check-circle' : 'chevron-down'}
                size={14}
                color={structuredAddress ? '#2E5E3E' : theme.subtext}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
        {addressError ? (
          <Text style={[pickerStyles.hint, { color: '#E53E3E' }]}>⚠ {addressError}</Text>
        ) : (
          <Text style={[pickerStyles.hint, { color: theme.subtext }]}>Tap to select your barangay, city, and province</Text>
        )}
      </View>

      <LabeledInput
        label="Street / House No. / Purok (Optional)"
        value={streetAddress}
        onChangeText={setStreetAddress}
        placeholder="e.g. 12 Sampaguita St., Purok 3"
        autoCapitalize="words"
        hint="e.g. 12 Sampaguita St., Purok 3"
        isDarkMode={isDarkMode}
        themeText={theme.text}
        themeBorder={theme.border}
        themeSubtext={theme.subtext}
      />

      {/* GPS button */}
      <TouchableOpacity onPress={fetchLocationAddress} disabled={isLocationLoading} style={styles.locationBtn}>
        <View style={[styles.locationBtnInner, { backgroundColor: isDarkMode ? '#1a2e1a' : '#EAF3DE' }]}>
          {isLocationLoading ? <ActivityIndicator size="small" color="#2E5E3E" /> : <FontAwesome5 name="map-marker-alt" size={15} color="#2E5E3E" />}
          <Text style={styles.locationBtnText}>{isLocationLoading ? 'Detecting Location...' : 'Use Current Location'}</Text>
        </View>
      </TouchableOpacity>

      {/* Address preview */}
      {finalAddress ? (
        <View style={[styles.addressPreview, { backgroundColor: isDarkMode ? '#0f1f0f' : '#f0f8e8', borderColor: '#2E5E3E' }]}>
          <FontAwesome5 name="home" size={13} color="#2E5E3E" style={{ marginRight: scale(8) }} />
          <Text style={[styles.addressPreviewText, { color: isDarkMode ? '#a8d880' : '#2D5016' }]} numberOfLines={2}>{finalAddress}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderStep3 = () => (
    <View>
      {/* OTP Method */}
      <View style={{ marginBottom: verticalScale(18) }}>
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Send verification code via</Text>
        <View style={styles.otpMethodContainer}>
          {(['email', 'sms'] as const).map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.otpMethodBtn,
                { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc', borderColor: theme.border },
                otpMethod === method && styles.otpMethodBtnActive,
              ]}
              onPress={() => setOtpMethod(method)}
              activeOpacity={0.8}
            >
              <FontAwesome5 name={method === 'email' ? 'envelope' : 'sms'} size={14} color={otpMethod === method ? '#ffffff' : theme.subtext} style={{ marginRight: scale(8) }} />
              <Text style={[styles.otpMethodText, { color: theme.subtext }, otpMethod === method && styles.otpMethodTextActive]}>
                {method === 'email' ? 'Email' : 'SMS (Phone)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[pickerStyles.hint, { color: theme.subtext, marginLeft: scale(4) }]}>
          {otpMethod === 'email' ? `Code will be sent to ${email || 'your email'}` : `Code will be sent to ${contactNumber || 'your phone'}`}
        </Text>
      </View>

      <LabeledInput
        label="Password"
        value={password}
        onChangeText={(t) => { setPassword(t); if (passwordError) setPasswordError(''); }}
        placeholder="Enter your password"
        secureTextEntry={!showPassword}
        hint="Min. 8 characters · 1 uppercase letter · 1 number"
        error={passwordError}
        shakeTrigger={shakeTrigger}
        isDarkMode={isDarkMode}
        themeText={theme.text}
        themeBorder={theme.border}
        themeSubtext={theme.subtext}
        rightElement={
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={16} color={theme.subtext} />
          </TouchableOpacity>
        }
      />

      <LabeledInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(t) => { setConfirmPassword(t); if (confirmPasswordError) setConfirmPasswordError(''); }}
        placeholder="Re-enter your password"
        secureTextEntry={!showConfirmPassword}
        hint={confirmPassword && password !== confirmPassword ? undefined : confirmPassword && password === confirmPassword ? '✓ Passwords match' : 'Re-enter your password to confirm'}
        error={confirmPasswordError}
        shakeTrigger={shakeTrigger}
        isDarkMode={isDarkMode}
        themeText={theme.text}
        themeBorder={confirmPasswordError ? '#E53E3E' : confirmPassword ? (password === confirmPassword ? '#38a169' : '#e53e3e') : theme.border}
        themeSubtext={confirmPassword ? (password === confirmPassword ? '#38a169' : '#e53e3e') : theme.subtext}
        rightElement={
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <FontAwesome5 name={showConfirmPassword ? 'eye-slash' : 'eye'} size={16} color={theme.subtext} />
          </TouchableOpacity>
        }
      />

      {/* Password Requirements */}
      <View style={[styles.passwordRequirements, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc', borderColor: theme.border }]}>
        <Text style={[styles.reqHeader, { color: theme.text }]}>
          <FontAwesome5 name="shield-alt" size={12} color={theme.text} />{'  '}Password Requirements
        </Text>
        {[
          { label: 'At least 8 characters', met: password.length >= 8 },
          { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
          { label: 'One number', met: /[0-9]/.test(password) },
          { label: 'Passwords match', met: !!(password && password === confirmPassword) },
        ].map(({ label, met }) => (
          <View key={label} style={styles.reqRow}>
            <FontAwesome5 name={met ? 'check-circle' : 'circle'} size={met ? 14 : 6} color={met ? '#38a169' : '#a0aec0'} solid={met} />
            <Text style={[styles.reqText, met && styles.reqMet]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ─── Progress Header ──────────────────────────────────────
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const activeStep = STEPS[currentStep - 1];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#1a3d28', flex: 0 }} />
      <StatusBar style="light" />

      {/* ── Header with animated progress ── */}
      <LinearGradient colors={['#1a3d28', '#2E5E3E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={handleBackStep} style={styles.backButton}>
            <FontAwesome5 name="arrow-left" size={18} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>{activeStep.subtitle}</Text>
          </View>
          <Text style={styles.stepCounter}>{currentStep}/{STEPS.length}</Text>
        </View>

        <View style={styles.stepDotsRow}>
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <View key={step.id} style={styles.stepDotGroup}>
                <View style={[styles.stepDot, isCompleted && styles.stepDotCompleted, isActive && styles.stepDotActive]}>
                  {isCompleted
                    ? <FontAwesome5 name="check" size={9} color="#1a3d28" solid />
                    : <FontAwesome5 name={step.icon} size={isActive ? 11 : 9} color={isActive ? '#1a3d28' : 'rgba(255,255,255,0.5)'} solid={isActive} />
                  }
                </View>
                <Text style={[styles.stepDotLabel, isActive && styles.stepDotLabelActive]}>{step.title}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, verticalScale(30)) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </Animated.View>

          {/* Navigation buttons */}
          <View style={styles.navBtns}>
            {currentStep > 1 && (
              <TouchableOpacity style={[styles.backBtn, { borderColor: theme.border, backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]} onPress={handleBackStep} activeOpacity={0.8}>
                <FontAwesome5 name="arrow-left" size={14} color={theme.text} style={{ marginRight: scale(8) }} />
                <Text style={[styles.backBtnText, { color: theme.text }]}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.nextBtn, currentStep === 1 && { flex: 1 }]} onPress={handleNextStep} disabled={isSignupLoading} activeOpacity={0.85}>
              {isSignupLoading
                ? <ActivityIndicator size="small" color="#0f2418" />
                : <Text style={styles.nextBtnText}>{currentStep === STEPS.length ? 'Create Account' : 'Continue'}</Text>
              }
            </TouchableOpacity>
          </View>

          {currentStep === 1 && (
            <View style={styles.loginHintContainer}>
              <Text style={[styles.alreadyAccountText, { color: theme.subtext }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginText, { color: isDarkMode ? theme.text : '#2E5E3E' }]}>Sign in</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <AddressPickerModal visible={isPickerVisible} onClose={() => setIsPickerVisible(false)} onSelectComplete={handleAddressSelect} />

      <Modal transparent visible={isSignupLoading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7ed44a" />
          <Text style={styles.loadingText}>Creating your account...</Text>
        </View>
      </Modal>

      <Modal visible={isOtpModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE', alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}>
                <FontAwesome5 name={otpMethod === 'email' ? 'envelope' : 'sms'} size={24} color={isDarkMode ? '#EAF3DE' : '#2D5016'} />
              </View>
              <Text style={[styles.modalTitle, { color: isDarkMode ? theme.text : '#2E5E3E', textAlign: 'center' }]}>
                {otpMethod === 'email' ? 'Verify Your Email' : 'Verify Your Phone'}
              </Text>
              <Text style={{ marginTop: 8, marginBottom: 5, color: theme.subtext, fontSize: 14, textAlign: 'center', lineHeight: 20, fontFamily: 'Montserrat-Regular' }}>
                We sent a 6-digit code to <Text style={{ fontWeight: 'bold' }}>{otpMethod === 'email' ? email : contactNumber}</Text>. Enter it below.
              </Text>
            </View>

            {/* OTP input with digit hint */}
            <View style={{ marginBottom: verticalScale(20) }}>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc', borderColor: theme.border, color: theme.text }]}
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={(text) => {
                  setOtpCode(text);
                  if (text.trim().length === 6 && !isSignupLoading) handleVerifyOtp(text.trim());
                }}
              />
              {/* Digit slots visual guide */}
              <View style={styles.otpSlots}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <View key={i} style={[styles.otpSlot, { borderColor: otpCode.length > i ? '#2E5E3E' : theme.border, backgroundColor: isDarkMode ? '#1a1a1a' : '#f8fafc' }]}>
                    <Text style={[styles.otpSlotChar, { color: theme.text }]}>{otpCode[i] || ''}</Text>
                  </View>
                ))}
              </View>
              <Text style={[pickerStyles.hint, { color: theme.subtext, textAlign: 'center', marginTop: 8 }]}>Enter the 6-digit code — it auto-submits when complete</Text>
            </View>

            <View style={{ gap: 10 }}>
              <TouchableOpacity style={{ backgroundColor: '#2E5E3E', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }} onPress={() => handleVerifyOtp()} disabled={isSignupLoading}>
                <Text style={{ color: 'white', fontSize: 15, fontFamily: 'Montserrat-Bold' }}>{isSignupLoading ? 'Verifying...' : 'Verify & Open Account'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border }} onPress={() => { setIsOtpModalVisible(false); setOtpCode(''); }}>
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
  header: {
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'android' ? verticalScale(10) : 0,
    paddingBottom: verticalScale(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: scale(10),
    elevation: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  backButton: {
    marginRight: scale(14),
    padding: scale(6),
  },
  headerTitle: {
    fontFamily: 'Catcut',
    color: 'white',
    fontSize: fontSize(18),
    marginBottom: verticalScale(1),
  },
  headerSubtitle: {
    fontFamily: 'Montserrat-Regular',
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize(12),
  },
  stepCounter: {
    fontFamily: 'Montserrat-Bold',
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize(13),
  },
  stepDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(4),
  },
  stepDotGroup: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  stepDotActive: {
    backgroundColor: '#7ed44a',
    borderColor: '#7ed44a',
    shadowColor: '#7ed44a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  stepDotCompleted: {
    backgroundColor: '#c8f5a0',
    borderColor: '#c8f5a0',
  },
  stepDotLabel: {
    fontFamily: 'Montserrat-Regular',
    color: 'rgba(255,255,255,0.55)',
    fontSize: fontSize(10),
  },
  stepDotLabelActive: {
    color: '#ffffff',
    fontFamily: 'Montserrat-Bold',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7ed44a',
    borderRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(24),
  },
  stepContent: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
  },
  sectionLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: fontSize(13),
    marginBottom: verticalScale(10),
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: scale(10),
    borderWidth: 1,
    padding: scale(14),
    marginBottom: verticalScale(16),
  },
  infoCardText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(13),
    lineHeight: 19,
    flex: 1,
  },
  locationBtn: {
    marginBottom: verticalScale(14),
  },
  locationBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(14),
    borderRadius: scale(20),
    gap: scale(8),
  },
  locationBtnText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: fontSize(13),
    color: '#2E5E3E',
  },
  addressPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: scale(10),
    padding: scale(12),
    marginBottom: verticalScale(8),
  },
  addressPreviewText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: fontSize(13),
    flex: 1,
    lineHeight: 20,
  },
  otpMethodContainer: {
    flexDirection: 'row',
    gap: scale(12),
  },
  otpMethodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderRadius: scale(10),
  },
  otpMethodBtnActive: {
    backgroundColor: '#2E5E3E',
    borderColor: '#2E5E3E',
  },
  otpMethodText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: fontSize(14),
  },
  otpMethodTextActive: {
    color: '#ffffff',
  },
  passwordRequirements: {
    borderRadius: 12,
    padding: 14,
    marginBottom: verticalScale(10),
    borderWidth: 1,
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
  navBtns: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(24),
    marginBottom: verticalScale(10),
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(20),
    borderRadius: scale(14),
    borderWidth: 1.5,
  },
  backBtnText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: fontSize(15),
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(15),
    borderRadius: scale(14),
    backgroundColor: '#2E5E3E',
    shadowColor: '#2E5E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: scale(10),
    elevation: 5,
  },
  nextBtnText: {
    fontFamily: 'Montserrat-Bold',
    color: '#ffffff',
    fontSize: fontSize(16),
  },
  loginHintContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  alreadyAccountText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(14),
  },
  loginText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: fontSize(14),
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
    marginBottom: verticalScale(18),
  },
  googleLogoImg: {
    width: scale(36),
    height: scale(36),
    marginRight: scale(12),
    resizeMode: 'contain',
  },
  googleBtnLabel: {
    fontSize: fontSize(15),
    fontFamily: 'Montserrat-Bold',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: verticalScale(18),
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
    paddingHorizontal: scale(24),
  },
  modalContent: {
    width: '100%',
    borderRadius: scale(20),
    padding: scale(25),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: fontSize(20),
    fontFamily: 'Catcut',
    color: '#2E5E3E',
    marginBottom: verticalScale(10),
  },
  // Hidden actual OTP input sits on top
  modalInput: {
    position: 'absolute',
    width: '100%',
    height: verticalScale(56),
    opacity: 0,
    zIndex: 10,
  },
  otpSlots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(8),
  },
  otpSlot: {
    width: scale(42),
    height: scale(52),
    borderRadius: scale(10),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpSlotChar: {
    fontFamily: 'Montserrat-Bold',
    fontSize: fontSize(22),
  },
});
