import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';

type Props = {
  navigation: NativeStackNavigationProp<any, any>; // Relaxed type for simplicity here
};

export default function ProfileScreen({ navigation }: Props) {
  const { user, updateUser } = useUser();

  const handlePickImage = async () => {
    // Ask for permission explicitly
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Refused", "You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Corrected MediaTypes -> MediaTypeOptions
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateUser({ avatarUri: result.assets[0].uri });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
      </View>

      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
            {user.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>{getInitials(user.fullName)}</Text>
              </View>
            )}
            <View style={styles.editIconBadge}>
              <FontAwesome5 name="camera" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{user.fullName}</Text>
          <Text style={styles.profileSubtitle}>Pet Parent</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputBox}>
              <FontAwesome5 name="user" size={16} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={user.fullName}
                onChangeText={(text) => updateUser({ fullName: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputBox}>
              <FontAwesome5 name="phone" size={16} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={user.phoneNumber}
                onChangeText={(text) => updateUser({ phoneNumber: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputBox}>
              <FontAwesome5 name="envelope" size={16} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={user.email}
                onChangeText={(text) => updateUser({ email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FCFBF7' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2E5E3E',
    borderBottomWidth: 0,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  headerAction: { fontSize: 16, fontWeight: '600', color: '#1E3A8A' },
  mainScroll: { flex: 1, padding: 20 },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 36,
    height: 36,
    backgroundColor: '#2E5E3E',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FCFBF7',
  },
  profileName: { fontSize: 24, fontWeight: '700', color: '#2d3748' },
  profileSubtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2d3748', marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4a5568', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: { marginRight: 10, width: 20, textAlign: 'center' },
  textInput: { flex: 1, fontSize: 15, color: '#2d3748' },
});
