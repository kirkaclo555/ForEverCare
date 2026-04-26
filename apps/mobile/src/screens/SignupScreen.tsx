import React, { useState } from 'react';
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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

export default function SignupScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSignup = () => {
    if (!fullName || !contactNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    // Simulation of a successful signup leading to the Login screen
    Alert.alert('Success', 'Account created successfully!', [
      { text: 'OK', onPress: () => navigation.replace('Login') }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
          <View style={styles.container}>
            <LinearGradient
              colors={['#3a7d55', '#245237']}
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
              <View style={styles.mainContent}>
                <View style={styles.signupContainerWrapper}>
                  <View style={styles.signupHeader}>
                    <Text style={styles.welcomeText}>Welcome! 🐾</Text>
                    <Text style={styles.instructionText}>Enter your details below to sign up</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedInput === 'fullname' && styles.inputFocused
                      ]}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Jane Doe"
                      placeholderTextColor="#a0aec0"
                      autoCapitalize="words"
                      onFocus={() => setFocusedInput('fullname')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Contact Number</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedInput === 'contactNumber' && styles.inputFocused
                      ]}
                      value={contactNumber}
                      onChangeText={setContactNumber}
                      placeholder="0912 345 6789"
                      placeholderTextColor="#a0aec0"
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      onFocus={() => setFocusedInput('contactNumber')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedInput === 'password' && styles.inputFocused
                      ]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Create a password"
                      placeholderTextColor="#a0aec0"
                      secureTextEntry
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedInput === 'confirm' && styles.inputFocused
                      ]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor="#a0aec0"
                      secureTextEntry
                      onFocus={() => setFocusedInput('confirm')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>

                  <TouchableOpacity onPress={handleSignup} activeOpacity={0.8}>
                    <LinearGradient
                      colors={['#3a7d55', '#245237']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.signupBtn}
                    >
                      <Text style={styles.signupBtnText}>Sign Up</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.loginHintContainer}>
                    <Text style={styles.alreadyAccountText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.loginText}>Sign in</Text>
                    </TouchableOpacity>
                  </View>

                </View>
              </View>
            </ScrollView>
          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3a7d55',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerBrand: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 12,
    opacity: 0.85,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 25,
  },
  signupContainerWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  signupHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    color: '#1a202c',
    fontWeight: '700',
    marginBottom: 8,
  },
  instructionText: {
    color: '#718096',
    fontSize: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    color: '#2d3748',
    fontWeight: '500',
    fontSize: 14,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    fontSize: 15,
    backgroundColor: '#f8fafc',
    color: '#1a202c',
  },
  inputFocused: {
    borderColor: '#3a7d55',
    backgroundColor: '#ffffff',
  },
  signupBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  signupBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginHintContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  alreadyAccountText: {
    color: '#718096',
    fontSize: 14,
  },
  loginText: {
    color: '#3a7d55',
    fontWeight: '600',
    fontSize: 14,
  }
});
