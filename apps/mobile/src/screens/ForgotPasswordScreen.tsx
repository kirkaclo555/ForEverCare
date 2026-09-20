import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';


type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  PetOwnerTabs: undefined;
};

type ForgotPasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

type Props = {
  navigation: ForgotPasswordNavigationProp;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { updateUser } = useUser();
  const codeInputRef = useRef<TextInput>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [otpMethod, setOtpMethod] = useState<'email' | 'sms'>('email');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [verifiedUserName, setVerifiedUserName] = useState('');

  // Timer countdown for resending verification code
  useEffect(() => {
    let interval: any = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  const handleToggleMethod = (method: 'email' | 'sms') => {
    setOtpMethod(method);
    setIdentifier('');
  };

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

  const handleSendCode = async () => {
    if (!identifier) {
      Alert.alert('Error', `Please enter your registered ${otpMethod === 'email' ? 'email address' : 'phone number'}`);
      return;
    }

    if (otpMethod === 'sms') {
      const cleanPhone = identifier.replace(/\D/g, '');
      if (cleanPhone.length !== 11) {
        Alert.alert('Invalid Phone Number', 'Please enter a valid 11-digit mobile number (e.g., 0912-345-6789) to receive the reset code.');
        return;
      }
    }
    
    setIsSendingCode(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/mobile/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier,
          otpMethod
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserId(data.userId);
        setCode('');
        setResendTimer(60);
        const destination = otpMethod === 'email' ? 'email' : 'phone via SMS';
        Alert.alert('Code Sent', `A verification code has been sent to your ${destination}.`);
        setStep(2);
      } else {
        Alert.alert('Error', data.error || 'Failed to send verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (isSendingCode || resendTimer > 0) return;
    setIsSendingCode(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/mobile/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier,
          otpMethod
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserId(data.userId);
        setCode('');
        setResendTimer(60);
        const destination = otpMethod === 'email' ? 'email' : 'phone via SMS';
        Alert.alert('Code Resent', `A new verification code has been sent to your ${destination}.`);
      } else {
        Alert.alert('Error', data.error || 'Failed to resend verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (customCode?: any) => {
    let codeToVerify = '';
    if (typeof customCode === 'string') {
      codeToVerify = customCode.trim();
    } else if (typeof code === 'string') {
      codeToVerify = code.trim();
    }

    if (!codeToVerify) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    
    setIsVerifying(true);
    try {
      const payload: { userId?: string; identifier?: string; code: string } = {
        code: codeToVerify
      };
      if (userId) payload.userId = userId;
      if (identifier) payload.identifier = identifier.trim();

      const res = await fetch(`${API_URL}/api/auth/mobile/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (data.user) {
          // Log user into session
          updateUser({
            id: data.user.id,
            fullName: data.user.fullName,
            email: data.user.email,
            phoneNumber: data.user.phoneNumber,
            address: data.user.address || '',
            avatarUri: data.user.profileImage || null,
            language: data.user.language || 'en',
          });
          setVerifiedUserName(data.user.fullName || '');
          setShowSuccessModal(true);
        } else {
          setStep(3);
        }
      } else {
        Alert.alert('Verification Failed', data.error || 'Invalid verification code. Please check and try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      Alert.alert('Error', 'Please enter a valid password and ensure both passwords match');
      return;
    }

    const codeToVerify = (typeof code === 'string' ? code : '').trim();
    setIsResetting(true);
    try {
      const payload: { userId?: string; identifier?: string; code: string; newPassword: string } = {
        code: codeToVerify,
        newPassword
      };
      if (userId) payload.userId = userId;
      if (identifier) payload.identifier = identifier.trim();

      const res = await fetch(`${API_URL}/api/auth/mobile/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (data.user) {
          updateUser({
            id: data.user.id,
            fullName: data.user.fullName,
            email: data.user.email,
            phoneNumber: data.user.phoneNumber,
            address: data.user.address || '',
            avatarUri: data.user.profileImage || null,
            language: data.user.language || 'en',
          });
          Alert.alert('Success', 'Your password has been reset successfully!', [
            { text: 'Open My Account', onPress: () => navigation.replace('PetOwnerTabs') }
          ]);
        } else {
          Alert.alert('Success', 'Your password has been reset successfully.', [
            { text: 'Log In', onPress: () => navigation.replace('Login') }
          ]);
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>

      {/* Verification Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            {/* Green checkmark circle */}
            <View style={[styles.modalIconCircle, { backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE' }]}>
              <Ionicons name="checkmark" size={30} color="#7CB342" />
            </View>

            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Verification Successful!
            </Text>

            <Text style={[styles.modalSubtitle, { color: theme.subtext }]}>
              {verifiedUserName
                ? `Welcome back, ${verifiedUserName}! Your identity has been confirmed.`
                : 'Your verification code has been confirmed.'}
            </Text>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              activeOpacity={0.85}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.replace('PetOwnerTabs');
              }}
            >
              <Ionicons name="home-outline" size={17} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.modalPrimaryBtnText}>Open My Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalSecondaryBtn, { borderColor: isDarkMode ? '#3a5c22' : '#2D5016' }]}
              activeOpacity={0.8}
              onPress={() => {
                setShowSuccessModal(false);
                setStep(3);
              }}
            >
              <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#85e05d' : '#2D5016'} style={{ marginRight: 8 }} />
              <Text style={[styles.modalSecondaryBtnText, { color: isDarkMode ? '#85e05d' : '#2D5016' }]}>Set New Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
                  <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reset Password</Text>
              </View>
            </View>

            <View style={styles.content}>
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {step === 1 ? (
                  <>
                    <Text style={[styles.instructionText, { color: theme.subtext }]}>
                      Choose where you want to receive your reset code and enter your details.
                    </Text>

                    <Text style={[styles.label, { color: theme.text }]}>Receive Reset Code via</Text>
                    <View style={styles.otpMethodContainer}>
                      <TouchableOpacity
                        style={[
                          styles.otpMethodBtn,
                          { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8faf9', borderColor: theme.border },
                          otpMethod === 'email' && styles.otpMethodBtnActive
                        ]}
                        onPress={() => handleToggleMethod('email')}
                        activeOpacity={0.8}
                      >
                        <Ionicons 
                          name="mail-outline" 
                          size={16} 
                          color={otpMethod === 'email' ? '#ffffff' : theme.subtext} 
                          style={{ marginRight: 8 }}
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
                          { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8faf9', borderColor: theme.border },
                          otpMethod === 'sms' && styles.otpMethodBtnActive
                        ]}
                        onPress={() => handleToggleMethod('sms')}
                        activeOpacity={0.8}
                      >
                        <Ionicons 
                          name="chatbubble-ellipses-outline" 
                          size={16} 
                          color={otpMethod === 'sms' ? '#ffffff' : theme.subtext} 
                          style={{ marginRight: 8 }}
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

                    <View style={[
                      styles.inputContainer,
                      { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8faf9', borderColor: theme.border },
                      focusedInput === 'identifier' && styles.inputFocused
                    ]}>
                      <Ionicons name={otpMethod === 'email' ? "mail-outline" : "call-outline"} size={20} color={focusedInput === 'identifier' ? '#3a7d55' : theme.subtext} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        value={identifier}
                        onChangeText={(text) => {
                          if (otpMethod === 'sms') {
                            setIdentifier(formatPhoneNumber(text));
                          } else {
                            setIdentifier(text);
                          }
                        }}
                        placeholder={otpMethod === 'email' ? "Email Address" : "09XX-XXX-XXXX"}
                        placeholderTextColor={theme.subtext}
                        keyboardType={otpMethod === 'email' ? "email-address" : "phone-pad"}
                        autoCapitalize="none"
                        onFocus={() => setFocusedInput('identifier')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                    <TouchableOpacity onPress={handleSendCode} activeOpacity={0.8} style={styles.buttonShadow} disabled={isSendingCode}>
                      <View style={[styles.actionBtn, isSendingCode && { opacity: 0.85 }]}>
                        {isSendingCode ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.actionBtnText}>Sending Code...</Text>
                          </View>
                        ) : (
                          <Text style={styles.actionBtnText}>Send Code</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </>
                ) : step === 2 ? (
                  <>
                    <Text style={[styles.instructionText, { color: theme.subtext }]}>
                      Please enter the 6-digit verification code sent to{'\n'}
                      <Text style={{ fontFamily: 'Montserrat-Bold', color: theme.text }}>{identifier}</Text>
                    </Text>

                    {/* 6 Standing Rectangle Number Boxes */}
                    <View style={styles.standingBoxesContainer}>
                      {Array.from({ length: 6 }).map((_, index) => {
                        const digit = code[index] || '';
                        const isFilled = digit !== '';
                        const isCurrent = index === code.length && focusedInput === 'code';
                        const isGreen = isFilled || isCurrent;

                        return (
                          <TouchableOpacity
                            key={index}
                            activeOpacity={0.85}
                            onPress={() => codeInputRef.current?.focus()}
                            style={[
                              styles.standingBox,
                              {
                                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                                borderColor: isGreen ? '#2D5016' : (isDarkMode ? '#333333' : '#e2e8f0'),
                                borderWidth: isGreen ? 2 : 1.5,
                              },
                              isGreen && styles.standingBoxActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.standingBoxDigit,
                                { color: isFilled ? (isDarkMode ? '#ffffff' : '#1a202c') : theme.subtext }
                              ]}
                            >
                              {digit}
                            </Text>
                            {isCurrent && !digit && (
                              <View style={[styles.activeCursor, { backgroundColor: '#2D5016' }]} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Hidden input for keyboard handling */}
                    <TextInput
                      ref={codeInputRef}
                      style={styles.hiddenTextInput}
                      value={code}
                      onChangeText={(text) => {
                        const clean = text.replace(/[^0-9]/g, '').slice(0, 6);
                        setCode(clean);
                        if (clean.length === 6 && !isVerifying) {
                          handleVerifyCode(clean);
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      onFocus={() => setFocusedInput('code')}
                      onBlur={() => setFocusedInput(null)}
                      autoFocus={true}
                      caretHidden={true}
                    />

                    {/* Resend Code Section with Timer */}
                    <View style={styles.resendSection}>
                      {resendTimer > 0 ? (
                        <View style={styles.timerRow}>
                          <Ionicons name="time-outline" size={15} color={theme.subtext} style={{ marginRight: 6 }} />
                          <Text style={[styles.timerText, { color: theme.subtext }]}>
                            Resend code in{' '}
                            <Text style={{ fontFamily: 'Montserrat-Bold', color: isDarkMode ? '#85e05d' : '#2D5016' }}>
                              {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
                            </Text>
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.resendActionRow}>
                          <Text style={[styles.resendQuestionText, { color: theme.subtext }]}>
                            Didn't receive the code?{' '}
                          </Text>
                          <TouchableOpacity
                            onPress={handleResendCode}
                            disabled={isSendingCode}
                            activeOpacity={0.7}
                            style={styles.resendBtnClickable}
                          >
                            {isSendingCode ? (
                              <ActivityIndicator size="small" color="#2D5016" />
                            ) : (
                              <Text style={[styles.resendActionText, { color: isDarkMode ? '#85e05d' : '#2D5016' }]}>
                                Resend Code
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity 
                      onPress={() => handleVerifyCode()} 
                      activeOpacity={0.8} 
                      style={styles.buttonShadow}
                      disabled={isVerifying}
                    >
                      <View style={[styles.actionBtn, isVerifying && { opacity: 0.85 }]}>
                        {isVerifying ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.actionBtnText}>Verifying Code...</Text>
                          </View>
                        ) : (
                          <Text style={styles.actionBtnText}>Verify & Open Account</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={[styles.instructionText, { color: theme.subtext }]}>
                      Please enter your new password.
                    </Text>
                    <View style={[
                      styles.inputContainer,
                      { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8faf9', borderColor: theme.border },
                      focusedInput === 'password' && styles.inputFocused
                    ]}>
                      <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#3a7d55' : theme.subtext} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="New Password"
                        placeholderTextColor={theme.subtext}
                        secureTextEntry
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                    <View style={[
                      styles.inputContainer,
                      { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8faf9', borderColor: theme.border },
                      focusedInput === 'confirmPassword' && styles.inputFocused
                    ]}>
                      <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'confirmPassword' ? '#3a7d55' : theme.subtext} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.text }]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm Password"
                        placeholderTextColor={theme.subtext}
                        secureTextEntry
                        onFocus={() => setFocusedInput('confirmPassword')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>

                    {/* Password Requirements */}
                    <View style={[styles.passwordRequirements, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc', borderColor: theme.border }]}>
                      <Text style={[styles.reqHeader, { color: theme.text }]}>
                        <Ionicons name="shield-checkmark-outline" size={13} color={theme.text} />  Password Requirements
                      </Text>
                      <View style={styles.reqRow}>
                        <Ionicons 
                          name={newPassword.length >= 8 ? "checkmark-circle" : "ellipse"} 
                          size={newPassword.length >= 8 ? 16 : 8} 
                          color={newPassword.length >= 8 ? '#38a169' : '#a0aec0'} 
                        />
                        <Text style={[styles.reqText, newPassword.length >= 8 && styles.reqMet]}>At least 8 characters</Text>
                      </View>
                      <View style={styles.reqRow}>
                        <Ionicons 
                          name={/[A-Z]/.test(newPassword) ? "checkmark-circle" : "ellipse"} 
                          size={/[A-Z]/.test(newPassword) ? 16 : 8} 
                          color={/[A-Z]/.test(newPassword) ? '#38a169' : '#a0aec0'} 
                        />
                        <Text style={[styles.reqText, /[A-Z]/.test(newPassword) && styles.reqMet]}>One uppercase letter</Text>
                      </View>
                      <View style={styles.reqRow}>
                        <Ionicons 
                          name={/[0-9]/.test(newPassword) ? "checkmark-circle" : "ellipse"} 
                          size={/[0-9]/.test(newPassword) ? 16 : 8} 
                          color={/[0-9]/.test(newPassword) ? '#38a169' : '#a0aec0'} 
                        />
                        <Text style={[styles.reqText, /[0-9]/.test(newPassword) && styles.reqMet]}>One number</Text>
                      </View>
                      <View style={styles.reqRow}>
                        <Ionicons 
                          name={(newPassword && newPassword === confirmPassword) ? "checkmark-circle" : "ellipse"} 
                          size={(newPassword && newPassword === confirmPassword) ? 16 : 8} 
                          color={(newPassword && newPassword === confirmPassword) ? '#38a169' : '#a0aec0'} 
                        />
                        <Text style={[styles.reqText, (newPassword && newPassword === confirmPassword) && styles.reqMet]}>Passwords match</Text>
                      </View>
                    </View>

                    <TouchableOpacity onPress={handleResetPassword} activeOpacity={0.8} style={styles.buttonShadow} disabled={isResetting}>
                      <View style={[styles.actionBtn, isResetting && { opacity: 0.85 }]}>
                        {isResetting ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.actionBtnText}>Updating Password...</Text>
                          </View>
                        ) : (
                          <Text style={styles.actionBtnText}>Reset Password & Open Account</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F1EC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F1EC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2D5016',
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Catcut',
    color: 'white',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    paddingTop: 32,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  instructionText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#718096',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e8f0ec',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: '#2D5016',
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    fontFamily: 'Montserrat-Regular',
  },
  buttonShadow: {
    marginTop: 16,
  },
  actionBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#2D5016',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: 'Montserrat-Medium',
    marginBottom: 8,
    color: '#2d3748',
    fontSize: 14,
  },
  otpMethodContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  otpMethodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#e8f0ec',
    borderRadius: 16,
    backgroundColor: '#f8faf9',
  },
  otpMethodBtnActive: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  otpMethodText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#4a5568',
  },
  otpMethodTextActive: {
    color: '#ffffff',
  },
  passwordRequirements: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reqHeader: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
    color: '#2D5016',
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
    fontSize: 12,
    color: '#a0aec0',
  },
  reqMet: {
    color: '#38a169',
    fontFamily: 'Montserrat-Medium',
  },
  // Standing Rectangle OTP Number Boxes
  standingBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
    paddingHorizontal: 2,
  },
  standingBox: {
    width: 44,
    height: 58,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  standingBoxActive: {
    shadowColor: '#2D5016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  standingBoxDigit: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  activeCursor: {
    position: 'absolute',
    bottom: 12,
    width: 14,
    height: 2.5,
    borderRadius: 2,
  },
  hiddenTextInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: 'none',
  },
  // Resend Timer & Action Section
  resendSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 16,
    minHeight: 28,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
  },
  resendActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  resendQuestionText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  resendBtnClickable: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  resendActionText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
    textDecorationLine: 'underline',
  },
  // Verification Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 26,
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D5016',
    borderRadius: 14,
    paddingVertical: 15,
    width: '100%',
    marginBottom: 12,
  },
  modalPrimaryBtnText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
  modalSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
  },
  modalSecondaryBtnText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
});
