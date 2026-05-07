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
  const [isEditing, setIsEditing] = useState(false);

  const nameParts = user.fullName.split(' ');
  const initialFirst = nameParts[0] || '';
  const initialLast = nameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation Error', 'First name and Last name are required.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Phone number is required.');
      return;
    }
    updateUser({
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      phoneNumber: phoneNumber.trim(),
      email: email.trim()
    });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

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

    const isCancelled = result.canceled !== undefined ? result.canceled : (result as any).cancelled;
    if (!isCancelled) {
      const uri = result.assets ? result.assets[0].uri : (result as any).uri;
      updateUser({ avatarUri: uri });
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
        <TouchableOpacity onPress={() => {
          if (isEditing) {
            handleSave();
          } else {
            setIsEditing(true);
          }
        }}>
          <Text style={[styles.headerAction, { color: 'white' }]}>{isEditing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
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
            <Text style={styles.inputLabel}>First Name <Text style={{color: 'red'}}>*</Text></Text>
            <View style={[styles.inputBox, !isEditing && styles.inputBoxDisabled]}>
              <FontAwesome5 name="user" size={16} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                editable={isEditing}
                placeholder="Enter first name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name <Text style={{color: 'red'}}>*</Text></Text>
            <View style={[styles.inputBox, !isEditing && styles.inputBoxDisabled]}>
              <FontAwesome5 name="user" size={16} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={lastName}
                onChangeText={setLastName}
                editable={isEditing}
                placeholder="Enter last name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number <Text style={{color: 'red'}}>*</Text></Text>
            <View style={[styles.inputBox, !isEditing && styles.inputBoxDisabled]}>
              <FontAwesome5 name="phone" size={16} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={isEditing}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputBox, !isEditing && styles.inputBoxDisabled]}>
              <FontAwesome5 name="envelope" size={16} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter email address"
              />
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F1EC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2D5016',
    borderBottomWidth: 0,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Catcut', color: 'white' },
  headerAction: { fontSize: 16, fontFamily: 'Montserrat-SemiBold', color: '#1E3A8A' },
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
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 15,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#2D5016',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Montserrat-Bold',
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
    backgroundColor: '#2D5016',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F4F1EC',
  },
  profileName: { fontSize: 24, fontFamily: 'Catcut', color: '#2d3748' },
  profileSubtitle: { fontSize: 14, color: '#718096', marginTop: 4, fontFamily: 'Montserrat-Regular' },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 30,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'Catcut', color: '#2d3748', marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#4a5568', marginBottom: 8 },
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
  inputBoxDisabled: {
    backgroundColor: '#f7fafc',
    borderColor: '#edf2f7',
  },
  inputIcon: { marginRight: 10, width: 20, textAlign: 'center' },
  textInput: { flex: 1, fontSize: 15, color: '#2d3748', fontFamily: 'Montserrat-Regular' },
  saveButton: {
    backgroundColor: '#2D5016',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});
