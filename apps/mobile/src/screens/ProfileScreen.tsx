"use client";
import React, { useState, useEffect } from 'react';
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
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function ProfileScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const nameParts = (user.fullName || '').split(' ');
  const initialFirst = nameParts[0] || '';
  const initialLast = nameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [email, setEmail] = useState(user.email || '');
  const [address, setAddress] = useState(user.address || '');
  const [isLoading, setIsLoading] = useState(false);

  // Sync state whenever user in context updates and not currently editing
  useEffect(() => {
    if (!isEditing) {
      const parts = (user.fullName || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setPhoneNumber(user.phoneNumber || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
    }
  }, [user, isEditing]);

  // Fetch latest profile from server on mount to ensure address and details are fresh
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!user.id) return;
      try {
        const res = await fetch(`${API_URL}/api/auth/mobile/update?id=${user.id}`);
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          updateUser({
            fullName: data.user.fullName,
            phoneNumber: data.user.phoneNumber,
            email: data.user.email,
            address: data.user.address || '',
            avatarUri: data.user.profileImage || null,
            language: data.user.language || 'en',
          });
        }
      } catch (err) {
        console.warn('Failed to fetch latest profile:', err);
      }
    };
    fetchLatestProfile();
  }, [user.id]);

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

  const handleCancel = () => {
    setIsEditing(false);
    const parts = (user.fullName || '').split(' ');
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setPhoneNumber(user.phoneNumber || '');
    setEmail(user.email || '');
    setAddress(user.address || '');
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation Error', 'First name and Last name are required.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Phone number is required.');
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      Alert.alert('Validation Error', 'Please enter a valid 11-digit phone number (e.g. 0912-345-6789).');
      return;
    }

    if (!user.id) {
      Alert.alert('Error', 'No user ID found. Please log out and log back in.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/mobile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
          profileImage: user.avatarUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Update Failed', data.error || 'An error occurred while updating profile.');
      } else {
        updateUser({
          fullName: data.user.fullName,
          phoneNumber: data.user.phoneNumber,
          email: data.user.email,
          address: data.user.address || '',
        });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Could not connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Refused", "You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    const isCancelled = result.canceled !== undefined ? result.canceled : (result as any).cancelled;
    if (!isCancelled) {
      const asset = result.assets ? result.assets[0] : (result as any);
      let localUri = asset.uri;
      let base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : localUri;

      setIsLoading(true);
      try {
        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: base64Data,
            name: 'profile.jpg',
          }),
        });

        const uploadData = await uploadRes.json();
        let imageUrl = localUri;
        if (uploadData.success && uploadData.url) {
          imageUrl = uploadData.url;
        }

        updateUser({ avatarUri: imageUrl });

        if (user.id) {
          const response = await fetch(`${API_URL}/api/auth/mobile/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              address: user.address || '',
              profileImage: imageUrl,
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            Alert.alert('Upload Failed', data.error || 'Failed to save profile picture to database.');
          } else {
            Alert.alert('Success', 'Profile picture saved successfully!');
          }
        }
      } catch (error) {
        console.error('Update error:', error);
        Alert.alert('Error', 'Could not connect to the server or upload image.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getInitials = (name: string) => {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const disabledStyle = isDarkMode
    ? { backgroundColor: '#1a1a1a', borderColor: '#2d2d2d' }
    : styles.inputBoxDisabled;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {isEditing && (
            <TouchableOpacity onPress={handleCancel} disabled={isLoading} style={{ padding: 4 }}>
              <Text style={[styles.headerAction, { color: 'rgba(255,255,255,0.75)' }]}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isLoading}
            style={{ padding: 4 }}
          >
            <Text style={[styles.headerAction, { color: 'white' }]}>
              {isLoading ? 'Saving…' : isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
            {user.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>{getInitials(user.fullName)}</Text>
              </View>
            )}
            <View style={[styles.editIconBadge, { borderColor: theme.background }]}>
              <FontAwesome5 name="camera" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: theme.text }]}>{user.fullName || 'User Profile'}</Text>
          <Text style={[styles.profileSubtitle, { color: theme.subtext }]}>Pet Parent</Text>
        </View>

        {/* Contact Information */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome5 name="id-card" size={15} color="#2D5016" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Information</Text>
          </View>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.subtext }]}>
              First Name <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }, !isEditing && disabledStyle]}>
              <FontAwesome5 name="user" size={15} color={theme.subtext} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                value={firstName}
                onChangeText={setFirstName}
                editable={isEditing}
                placeholder="Enter first name"
                placeholderTextColor={theme.subtext}
              />
            </View>
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.subtext }]}>
              Last Name <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }, !isEditing && disabledStyle]}>
              <FontAwesome5 name="user" size={15} color={theme.subtext} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                value={lastName}
                onChangeText={setLastName}
                editable={isEditing}
                placeholder="Enter last name"
                placeholderTextColor={theme.subtext}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.subtext }]}>
              Phone Number <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }, !isEditing && disabledStyle]}>
              <FontAwesome5 name="phone-alt" size={15} color={theme.subtext} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                editable={isEditing}
                keyboardType="phone-pad"
                placeholder="e.g. 0912-345-6789"
                placeholderTextColor={theme.subtext}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.subtext }]}>Email Address</Text>
            <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.border }, !isEditing && disabledStyle]}>
              <FontAwesome5 name="envelope" size={15} color={theme.subtext} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                value={email}
                onChangeText={setEmail}
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter email address"
                placeholderTextColor={theme.subtext}
              />
            </View>
          </View>
        </View>

        {/* Address Information */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionTitleRow}>
            <FontAwesome5 name="map-marker-alt" size={15} color="#2D5016" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Address Information</Text>
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.subtext }]}>Home Address</Text>
            <View style={[
              styles.inputBox,
              styles.inputBoxMultiline,
              { backgroundColor: theme.card, borderColor: theme.border },
              !isEditing && disabledStyle
            ]}>
              <FontAwesome5 name="home" size={15} color={theme.subtext} style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 13 }]} />
              <TextInput
                style={[styles.textInput, styles.textInputMultiline, { color: theme.text }]}
                value={address}
                onChangeText={setAddress}
                editable={isEditing}
                multiline
                numberOfLines={3}
                placeholder="Enter your home address&#10;(Street, Barangay, City, Province)"
                placeholderTextColor={theme.subtext}
                textAlignVertical="top"
              />
            </View>
            {!isEditing && !address && (
              <Text style={[styles.emptyHint, { color: theme.subtext }]}>
                <FontAwesome5 name="info-circle" size={11} color={theme.subtext} />  Tap Edit to add your address
              </Text>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.saveButton, isLoading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <FontAwesome5 name="check" size={14} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>{isLoading ? 'Saving…' : 'Save Changes'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 30 }} />
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
  },
  headerTitle: { fontSize: 18, fontFamily: 'Catcut', color: 'white' },
  headerAction: { fontSize: 16, fontFamily: 'Montserrat-SemiBold' },
  mainScroll: { flex: 1, padding: 20 },

  profileHeader: {
    alignItems: 'center',
    marginBottom: 26,
    marginTop: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 14,
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
    marginBottom: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: { fontSize: 16, fontFamily: 'Catcut', color: '#2d3748' },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#4a5568', marginBottom: 7 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputBoxMultiline: {
    height: 'auto',
    minHeight: 80,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  inputBoxDisabled: {
    backgroundColor: '#f7fafc',
    borderColor: '#edf2f7',
  },
  inputIcon: { marginRight: 10, width: 18, textAlign: 'center' },
  textInput: { flex: 1, fontSize: 15, color: '#2d3748', fontFamily: 'Montserrat-Regular' },
  textInputMultiline: {
    height: 'auto',
    minHeight: 60,
    paddingTop: 2,
  },
  emptyHint: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 6,
    marginLeft: 2,
  },
  saveButton: {
    backgroundColor: '#2D5016',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});
