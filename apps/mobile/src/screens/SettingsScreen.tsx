import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// We will add Settings to MoreStackParamList in App.tsx
type Props = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: Props) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.settingRow} 
            onPress={() => navigation.navigate('AccountSecurity')}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e2e8f0' }]}>
                <FontAwesome5 name="shield-alt" size={16} color="#4a5568" />
              </View>
              <Text style={styles.settingText}>Account Security</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#cbd5e0" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e2e8f0' }]}>
                <FontAwesome5 name="globe" size={16} color="#4a5568" />
              </View>
              <Text style={styles.settingText}>Language</Text>
            </View>
            <Text style={styles.settingValue}>English <FontAwesome5 name="chevron-right" size={14} color="#cbd5e0" /></Text>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e2e8f0' }]}>
                <FontAwesome5 name="moon" size={16} color="#4a5568" />
              </View>
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#cbd5e0", true: "#2D5016" }}
              thumbColor={"#fff"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e2e8f0' }]}>
                <FontAwesome5 name="users" size={16} color="#4a5568" />
              </View>
              <Text style={styles.settingText}>Community Rules</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#cbd5e0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e2e8f0' }]}>
                <FontAwesome5 name="info-circle" size={16} color="#4a5568" />
              </View>
              <Text style={styles.settingText}>About Us</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#cbd5e0" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.settingRow, { marginTop: 10 }]} 
            onPress={() => {
              // Usually we'd reset the stack to Login
              navigation.replace('Login');
            }}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#fed7d7' }]}>
                <FontAwesome5 name="sign-out-alt" size={16} color="#e53e3e" />
              </View>
              <Text style={[styles.settingText, { color: '#e53e3e', fontWeight: '700' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Catcut',
    color: '#2D5016',
    marginBottom: 10,
    marginLeft: 5,
  },
  settingRow: {
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
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#2d3748',
    fontFamily: 'Montserrat-SemiBold',
  },
  settingValue: {
    fontSize: 14,
    color: '#a0aec0',
    fontFamily: 'Montserrat-Regular',
  },
});
