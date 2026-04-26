import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  AccountSecurity: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AccountSecurity'>;

type Props = {
  navigation: NavigationProp;
};

export default function AccountSecurityScreen({ navigation }: Props) {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Standardized */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Security</Text>
        <View style={{ width: 40 }} /> {/* Spacer for centering */}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Login & Recovery</Text>
          
          <TouchableOpacity style={styles.optionRow}>
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

          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="mobile-alt" size={16} color="#1E3A8A" />
              </View>
              <View>
                <Text style={styles.optionTitle}>Recovery Phone</Text>
                <Text style={styles.optionSubtitle}>+63 ••• ••• 4567</Text>
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
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: "#cbd5e0", true: "#2E5E3E" }}
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
              onValueChange={setBiometricEnabled}
              trackColor={{ false: "#cbd5e0", true: "#2E5E3E" }}
              thumbColor={"#fff"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Management</Text>
          
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="laptop" size={16} color="#1E3A8A" />
              </View>
              <View>
                <Text style={styles.optionTitle}>Active Sessions</Text>
                <Text style={styles.optionSubtitle}>Manage your logged-in devices</Text>
              </View>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#a0aec0" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFBF7',
  },
  header: {
    backgroundColor: '#2E5E3E',
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#2E5E3E',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#718096',
  },
});
