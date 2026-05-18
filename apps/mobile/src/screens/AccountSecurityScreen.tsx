import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

type RootStackParamList = {
  Home: undefined;
  AccountSecurity: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AccountSecurity'>;

type Props = {
  navigation: NavigationProp;
};

export default function AccountSecurityScreen({ navigation }: Props) {
  const { user } = useUser();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Phone state
  const [newPhone, setNewPhone] = useState('');
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkBiometricStatus();
  }, []);

  const fetchSettings = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`http://192.168.100.16:3000/api/auth/mobile/security-settings?userId=${user.id}`);
      const data = await res.json();
      if (!data.error) {
        setTwoFactorEnabled(data.twoFactorEnabled);
        setRecoveryPhone(data.recoveryPhone || '');
      }
    } catch (error) {
      console.error('Failed to fetch security settings', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBiometricStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(`biometric_enabled_${user?.id}`);
      setBiometricEnabled(value === 'true');
    } catch (e) {
      console.error('Failed to get biometric status', e);
    }
  };

  const handleToggle2FA = async (value: boolean) => {
    setTwoFactorEnabled(value); // Optimistic UI
    if (!user?.id) return;
    try {
      await fetch('http://192.168.100.16:3000/api/auth/mobile/security-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, twoFactorEnabled: value })
      });
    } catch (error) {
      setTwoFactorEnabled(!value); // Revert on error
      Alert.alert('Error', 'Failed to update 2FA settings.');
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    try {
      if (value) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) {
          Alert.alert('Not Supported', 'Biometric authentication is not set up on this device.');
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable Biometric Login',
        });

        if (result.success) {
          await AsyncStorage.setItem(`biometric_enabled_${user?.id}`, 'true');
          setBiometricEnabled(true);
        } else {
          setBiometricEnabled(false);
        }
      } else {
        await AsyncStorage.removeItem(`biometric_enabled_${user?.id}`);
        // Optionally remove stored credentials
        await AsyncStorage.removeItem(`biometric_credentials_${user?.id}`);
        setBiometricEnabled(false);
      }
    } catch (error) {
      console.error('Biometric error:', error);
      Alert.alert('Error', 'An error occurred while configuring biometrics.');
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await fetch('http://192.168.100.16:3000/api/auth/mobile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Password has been updated.');
        setIsPasswordModalVisible(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.error || 'Failed to update password.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again later.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleUpdateRecoveryPhone = async () => {
    if (!newPhone) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    setIsSubmittingPhone(true);
    try {
      const res = await fetch('http://192.168.100.16:3000/api/auth/mobile/security-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, recoveryPhone: newPhone })
      });
      if (res.ok) {
        setRecoveryPhone(newPhone);
        setIsPhoneModalVisible(false);
        setNewPhone('');
        Alert.alert('Success', 'Recovery phone updated.');
      } else {
        Alert.alert('Error', 'Failed to update recovery phone.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error.');
    } finally {
      setIsSubmittingPhone(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2D5016" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Login & Recovery</Text>
          
          <TouchableOpacity style={styles.optionRow} onPress={() => setIsPasswordModalVisible(true)}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="key" size={16} color="#1E3A8A" />
              </View>
              <View>
                <Text style={styles.optionTitle}>Change Password</Text>
                <Text style={styles.optionSubtitle}>Update your password regularly</Text>
              </View>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} onPress={() => setIsPhoneModalVisible(true)}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="mobile-alt" size={16} color="#1E3A8A" />
              </View>
              <View>
                <Text style={styles.optionTitle}>Recovery Phone</Text>
                <Text style={styles.optionSubtitle}>{recoveryPhone || 'Add a recovery phone'}</Text>
              </View>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#a0aec0" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Security</Text>
          
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="shield-alt" size={16} color="#1E3A8A" />
              </View>
              <View>
                <Text style={styles.optionTitle}>Two-Factor Authentication</Text>
                <Text style={styles.optionSubtitle}>Extra layer of security</Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggle2FA}
              trackColor={{ false: "#cbd5e0", true: "#2D5016" }}
              thumbColor={"#fff"}
            />
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="fingerprint" size={16} color="#1E3A8A" />
              </View>
              <View>
                <Text style={styles.optionTitle}>Biometric Login</Text>
                <Text style={styles.optionSubtitle}>Sign in with fingerprint or face</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: "#cbd5e0", true: "#2D5016" }}
              thumbColor={"#fff"}
            />
          </View>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={isPasswordModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsPasswordModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={isSubmittingPassword}>
                <Text style={styles.saveBtnText}>{isSubmittingPassword ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recovery Phone Modal */}
      <Modal visible={isPhoneModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Recovery Phone</Text>
            <Text style={{marginBottom: 15, color: '#718096', fontSize: 13}}>Add a phone number to help recover your account if you lose access.</Text>
            <TextInput
              style={styles.input}
              placeholder="+63 9XX XXX XXXX"
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={setNewPhone}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsPhoneModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateRecoveryPhone} disabled={isSubmittingPhone}>
                <Text style={styles.saveBtnText}>{isSubmittingPhone ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1EC',
  },
  header: {
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Catcut',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Catcut',
    color: '#2D5016',
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#edf2f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#2d3748',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Montserrat-Regular',
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
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 15,
    color: '#2d3748',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    marginTop: 10,
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
