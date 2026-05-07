import React, { useState } from 'react';
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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

type ForgotPasswordNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

type Props = {
  navigation: ForgotPasswordNavigationProp;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSendCode = () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your registered phone number');
      return;
    }
    // Simulate sending code
    Alert.alert('Code Sent', 'A verification code has been sent to your phone number.');
    setStep(2);
  };

  const handleResetPassword = () => {
    if (!code || !newPassword) {
      Alert.alert('Error', 'Please enter the verification code and your new password');
      return;
    }
    // Simulate reset
    Alert.alert('Success', 'Your password has been reset successfully.', [
      { text: 'OK', onPress: () => navigation.navigate('Login') }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
                  <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reset Password</Text>
              </View>
            </View>

            <View style={styles.content}>
              <View style={styles.card}>
                {step === 1 ? (
                  <>
                    <Text style={styles.instructionText}>
                      Enter your registered phone number and we will send you a verification code.
                    </Text>
                    <View style={[
                      styles.inputContainer,
                      focusedInput === 'phone' && styles.inputFocused
                    ]}>
                      <Ionicons name="call-outline" size={20} color={focusedInput === 'phone' ? '#3a7d55' : '#a0aec0'} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Phone Number"
                        placeholderTextColor="#a0aec0"
                        keyboardType="phone-pad"
                        onFocus={() => setFocusedInput('phone')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                    <TouchableOpacity onPress={handleSendCode} activeOpacity={0.8} style={styles.buttonShadow}>
                      <View style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>Send Code</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.instructionText}>
                      Please enter the verification code sent to {phoneNumber} and your new password.
                    </Text>
                    <View style={[
                      styles.inputContainer,
                      focusedInput === 'code' && styles.inputFocused
                    ]}>
                      <Ionicons name="keypad-outline" size={20} color={focusedInput === 'code' ? '#3a7d55' : '#a0aec0'} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={code}
                        onChangeText={setCode}
                        placeholder="Verification Code"
                        placeholderTextColor="#a0aec0"
                        keyboardType="number-pad"
                        onFocus={() => setFocusedInput('code')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                    <View style={[
                      styles.inputContainer,
                      focusedInput === 'password' && styles.inputFocused
                    ]}>
                      <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#3a7d55' : '#a0aec0'} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="New Password"
                        placeholderTextColor="#a0aec0"
                        secureTextEntry
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                    <TouchableOpacity onPress={handleResetPassword} activeOpacity={0.8} style={styles.buttonShadow}>
                      <View style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>Reset Password</Text>
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
});
