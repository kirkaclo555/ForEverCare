import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import LabeledInput from '../components/shared/LabeledInput';

type RootStackParamList = {
  Home: undefined;
  AccountSecurity: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AccountSecurity'>;

type Props = {
  navigation: NavigationProp;
};

export default function AccountSecurityScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { user } = useUser();
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Phone state
  const [newPhone, setNewPhone] = useState('');
  const [newPhoneError, setNewPhoneError] = useState('');
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/mobile/security-settings?userId=${user.id}`);
      const data = await res.json();
      if (!data.error) {
        setRecoveryPhone(data.recoveryPhone || '');
      }
    } catch (error) {
      console.error('Failed to fetch security settings', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    let valid = true;
    setShakeTrigger((prev) => prev + 1);

    if (!oldPassword) {
      setOldPasswordError('Current password is required');
      valid = false;
    } else {
      setOldPasswordError('');
    }

    if (!newPassword) {
      setNewPasswordError('New password is required');
      valid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      valid = false;
    } else {
      setNewPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!valid) return;

    setIsSubmittingPassword(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/mobile/change-password`, {
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
        setShakeTrigger((prev) => prev + 1);
        setOldPasswordError(data.error || 'Failed to update password.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again later.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleUpdateRecoveryPhone = async () => {
    if (!newPhone.trim()) {
      setShakeTrigger((prev) => prev + 1);
      setNewPhoneError('Please enter a valid phone number.');
      return;
    }

    const cleanPhone = newPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      setShakeTrigger((prev) => prev + 1);
      setNewPhoneError('Enter a valid 11-digit mobile number (e.g. 0912-345-6789)');
      return;
    }

    setNewPhoneError('');
    setIsSubmittingPhone(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/mobile/security-settings`, {
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2D5016" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Login & Recovery</Text>
          
          <TouchableOpacity style={[styles.optionRow, { borderColor: theme.border }]} onPress={() => setIsPasswordModalVisible(true)}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1a2744' : '#EBF5FF' }]}>
                <FontAwesome5 name="key" size={16} color="#1E3A8A" />
              </View>
              <View>
                <Text style={[styles.optionTitle, { color: theme.text }]}>Change Password</Text>
                <Text style={[styles.optionSubtitle, { color: theme.subtext }]}>Update your password regularly</Text>
              </View>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color={theme.subtext} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionRow, { borderColor: theme.border }]} onPress={() => setIsPhoneModalVisible(true)}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1a2744' : '#EBF5FF' }]}>
                <FontAwesome5 name="mobile-alt" size={16} color="#1E3A8A" />
              </View>
              <View>
                <Text style={[styles.optionTitle, { color: theme.text }]}>Recovery Phone</Text>
                <Text style={[styles.optionSubtitle, { color: theme.subtext }]}>{recoveryPhone || 'Add a recovery phone'}</Text>
              </View>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color={theme.subtext} />
          </TouchableOpacity>
        </View>


      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={isPasswordModalVisible} animationType="slide" transparent>
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setIsPasswordModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHandleIndicator} />
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <View style={[styles.modalIconCircle, { backgroundColor: isDarkMode ? '#1a2744' : '#EBF5FF' }]}>
                <FontAwesome5 name="key" size={22} color="#1E3A8A" />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Change Password</Text>
              <Text style={[styles.modalSubtitle, { color: theme.subtext }]}>Update your account password for better security</Text>
            </View>
            <LabeledInput
              label="Current Password"
              placeholder="Enter current password"
              secureTextEntry
              value={oldPassword}
              onChangeText={(t) => {
                setOldPassword(t);
                if (oldPasswordError) setOldPasswordError('');
              }}
              error={oldPasswordError}
              shakeTrigger={shakeTrigger}
              isDarkMode={isDarkMode}
              themeText={theme.text}
              themeBorder={theme.border}
              themeSubtext={theme.subtext}
            />
            <LabeledInput
              label="New Password"
              placeholder="Enter new password"
              secureTextEntry
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                if (newPasswordError) setNewPasswordError('');
              }}
              error={newPasswordError}
              shakeTrigger={shakeTrigger}
              isDarkMode={isDarkMode}
              themeText={theme.text}
              themeBorder={theme.border}
              themeSubtext={theme.subtext}
            />
            <LabeledInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              error={confirmPasswordError}
              shakeTrigger={shakeTrigger}
              isDarkMode={isDarkMode}
              themeText={theme.text}
              themeBorder={theme.border}
              themeSubtext={theme.subtext}
            />

            {/* Password Requirements */}
            <View style={[styles.passwordRequirements, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc', borderColor: theme.border }]}>
              <Text style={[styles.reqHeader, { color: isDarkMode ? theme.text : '#2D5016' }]}>
                <FontAwesome5 name="shield-alt" size={12} color={isDarkMode ? theme.text : '#2D5016'} />  Password Requirements
              </Text>
              <View style={styles.reqRow}>
                <FontAwesome5 
                  name={newPassword.length >= 8 ? "check-circle" : "circle"} 
                  size={newPassword.length >= 8 ? 14 : 6} 
                  color={newPassword.length >= 8 ? '#38a169' : '#a0aec0'} 
                  solid={newPassword.length >= 8}
                />
                <Text style={[styles.reqText, newPassword.length >= 8 && styles.reqMet]}>At least 8 characters</Text>
              </View>
              <View style={styles.reqRow}>
                <FontAwesome5 
                  name={/[A-Z]/.test(newPassword) ? "check-circle" : "circle"} 
                  size={/[A-Z]/.test(newPassword) ? 14 : 6} 
                  color={/[A-Z]/.test(newPassword) ? '#38a169' : '#a0aec0'} 
                  solid={/[A-Z]/.test(newPassword)}
                />
                <Text style={[styles.reqText, /[A-Z]/.test(newPassword) && styles.reqMet]}>One uppercase letter</Text>
              </View>
              <View style={styles.reqRow}>
                <FontAwesome5 
                  name={/[0-9]/.test(newPassword) ? "check-circle" : "circle"} 
                  size={/[0-9]/.test(newPassword) ? 14 : 6} 
                  color={/[0-9]/.test(newPassword) ? '#38a169' : '#a0aec0'} 
                  solid={/[0-9]/.test(newPassword)}
                />
                <Text style={[styles.reqText, /[0-9]/.test(newPassword) && styles.reqMet]}>One number</Text>
              </View>
              <View style={styles.reqRow}>
                <FontAwesome5 
                  name={(newPassword && newPassword === confirmPassword) ? "check-circle" : "circle"} 
                  size={(newPassword && newPassword === confirmPassword) ? 14 : 6} 
                  color={(newPassword && newPassword === confirmPassword) ? '#38a169' : '#a0aec0'} 
                  solid={!!(newPassword && newPassword === confirmPassword)}
                />
                <Text style={[styles.reqText, (newPassword && newPassword === confirmPassword) && styles.reqMet]}>Passwords match</Text>
              </View>
            </View>

            <View style={{ gap: 10, marginTop: 10 }}>
              <TouchableOpacity 
                style={{ backgroundColor: '#2D5016', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }} 
                onPress={handleChangePassword} 
                disabled={isSubmittingPassword}
              >
                <Text style={{ color: 'white', fontSize: 15, fontFamily: 'Montserrat-Bold' }}>
                  {isSubmittingPassword ? 'Saving...' : 'Update Password'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border }} 
                onPress={() => setIsPasswordModalVisible(false)}
              >
                <Text style={{ color: theme.text, fontSize: 15, fontFamily: 'Montserrat-SemiBold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Recovery Phone Modal */}
      <Modal visible={isPhoneModalVisible} animationType="fade" transparent>
        <View style={[styles.modalOverlay, { justifyContent: 'center', paddingHorizontal: 24 }]}>
          <View style={[styles.modalContentCenter, { backgroundColor: theme.card }]}>
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <View style={[styles.modalIconCircle, { backgroundColor: isDarkMode ? '#1a2744' : '#EBF5FF' }]}>
                <FontAwesome5 name="mobile-alt" size={22} color="#1E3A8A" />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Recovery Phone</Text>
              <Text style={[styles.modalSubtitle, { color: theme.subtext }]}>
                Add a phone number to help recover your account if you lose access.
              </Text>
            </View>
            <LabeledInput
              label="Recovery Mobile Number"
              placeholder="0912-345-6789"
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={(t) => {
                setNewPhone(t);
                if (newPhoneError) setNewPhoneError('');
              }}
              error={newPhoneError}
              shakeTrigger={shakeTrigger}
              isDarkMode={isDarkMode}
              themeText={theme.text}
              themeBorder={theme.border}
              themeSubtext={theme.subtext}
            />
            <View style={{ gap: 10, marginTop: 5 }}>
              <TouchableOpacity 
                style={{ backgroundColor: '#2D5016', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }} 
                onPress={handleUpdateRecoveryPhone} 
                disabled={isSubmittingPhone}
              >
                <Text style={{ color: 'white', fontSize: 15, fontFamily: 'Montserrat-Bold' }}>
                  {isSubmittingPhone ? 'Saving...' : 'Save Phone Number'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border }} 
                onPress={() => setIsPhoneModalVisible(false)}
              >
                <Text style={{ color: theme.text, fontSize: 15, fontFamily: 'Montserrat-SemiBold' }}>Cancel</Text>
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 25,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalContentCenter: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHandleIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#cbd5e0',
    borderRadius: 3,
    alignSelf: 'center' as any,
    marginBottom: 20,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#2D5016',
    marginBottom: 5,
    textAlign: 'center' as any,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center' as any,
    lineHeight: 20,
    marginBottom: 10,
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
  },
  passwordRequirements: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
});
