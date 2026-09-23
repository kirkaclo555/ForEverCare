import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser, AddressItem } from '../context/UserContext';
import { usePetContext } from '../context/PetContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/api';

import ProfileHeader from '../components/profile/ProfileHeader';
import StatsRow from '../components/profile/StatsRow';
import CompletionCard from '../components/profile/CompletionCard';
import PetCardList from '../components/profile/PetCard';
import InfoRow from '../components/profile/InfoRow';
import SectionCard from '../components/profile/SectionCard';
import SettingsRow from '../components/profile/SettingsRow';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const { user, updateUser } = useUser();
  const { pets } = usePetContext();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isSavingRef = useRef(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const toastAnim = useRef(new Animated.Value(-80)).current;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2800),
      Animated.timing(toastAnim, {
        toValue: -80,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastMessage(null);
    });
  };

  // Helper: Format phone number cleanly
  const formatPhoneNumber = (text: string) => {
    if (!text) return '';
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

  // Name Resolution
  const getInitialNames = () => {
    if (user.firstName || user.lastName) {
      return {
        first: user.firstName || '',
        middle: user.middleName || '',
        last: user.lastName || '',
      };
    }
    const parts = (user.fullName || '').split(' ');
    return {
      first: parts[0] || '',
      middle: '',
      last: parts.slice(1).join(' ') || '',
    };
  };

  // Address Resolution
  const parseAddressComponents = (rawAddress?: string) => {
    if (!rawAddress) return { street: '', barangay: '', city: '', province: '', zipCode: '' };
    const segments = rawAddress.split(',').map((s) => s.trim());
    return {
      street: user.street || segments[0] || '',
      barangay: user.barangay || segments[1] || '',
      city: user.city || segments[2] || '',
      province: user.province || segments[3] || '',
      zipCode: user.zipCode || segments[4] || '',
    };
  };

  const initialNames = getInitialNames();
  const initialAddr = parseAddressComponents(user.address);

  // Form States (Edit Mode)
  const [firstName, setFirstName] = useState(initialNames.first);
  const [middleName, setMiddleName] = useState(initialNames.middle);
  const [lastName, setLastName] = useState(initialNames.last);
  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(user.phoneNumber || ''));
  const [email, setEmail] = useState(user.email || '');
  const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact || '');
  const [bio, setBio] = useState(user.bio || '');

  const [street, setStreet] = useState(initialAddr.street);
  const [barangay, setBarangay] = useState(initialAddr.barangay);
  const [city, setCity] = useState(initialAddr.city);
  const [province, setProvince] = useState(initialAddr.province);
  const [zipCode, setZipCode] = useState(initialAddr.zipCode);

  // Validation Error States
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Sync state with UserContext whenever user object updates
  useEffect(() => {
    if (isSavingRef.current || isEditing) return;
    const names = getInitialNames();
    const addr = parseAddressComponents(user.address);

    setFirstName(names.first);
    setMiddleName(names.middle);
    setLastName(names.last);
    setPhoneNumber(formatPhoneNumber(user.phoneNumber || ''));
    setEmail(user.email || '');
    setEmergencyContact(user.emergencyContact || '');
    setBio(user.bio || '');

    setStreet(addr.street);
    setBarangay(addr.barangay);
    setCity(addr.city);
    setProvince(addr.province);
    setZipCode(addr.zipCode);
  }, [
    user.fullName,
    user.firstName,
    user.middleName,
    user.lastName,
    user.phoneNumber,
    user.email,
    user.address,
    user.bio,
    user.emergencyContact,
    isEditing,
  ]);

  // Fresh profile fetch on mount (with cache busting)
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!user.id && !user.email && !user.phoneNumber) return;
      try {
        const queryParam = user.id
          ? `id=${user.id}`
          : user.email
          ? `email=${encodeURIComponent(user.email)}`
          : `phone=${encodeURIComponent(user.phoneNumber)}`;

        const res = await fetch(`${API_URL}/api/auth/mobile/update?${queryParam}&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          const serverName = data.user.fullName || '';
          let currentFirst = user.firstName;
          let currentLast = user.lastName;

          if ((!currentFirst && !currentLast) || (user.fullName && user.fullName !== serverName)) {
            const parts = serverName.split(' ');
            currentFirst = parts[0] || '';
            currentLast = parts.slice(1).join(' ') || '';
          }

          await updateUser({
            id: data.user.id || user.id,
            fullName: serverName,
            firstName: currentFirst,
            lastName: currentLast,
            phoneNumber: data.user.phoneNumber,
            email: data.user.email,
            address: data.user.address || '',
            avatarUri: data.user.profileImage || user.avatarUri,
            language: data.user.language || user.language || 'en',
          });
        }
      } catch (err) {
        console.warn('Failed to fetch latest profile:', err);
      }
    };
    fetchLatestProfile();
  }, [user.id, user.email, user.phoneNumber]);

  // Cancel edit mode
  const handleCancel = () => {
    setIsEditing(false);
    setFirstNameError(null);
    setPhoneError(null);

    const names = getInitialNames();
    const addr = parseAddressComponents(user.address);

    setFirstName(names.first);
    setMiddleName(names.middle);
    setLastName(names.last);
    setPhoneNumber(formatPhoneNumber(user.phoneNumber || ''));
    setEmail(user.email || '');
    setEmergencyContact(user.emergencyContact || '');
    setBio(user.bio || '');

    setStreet(addr.street);
    setBarangay(addr.barangay);
    setCity(addr.city);
    setProvince(addr.province);
    setZipCode(addr.zipCode);
  };

  // Save profile changes
  const handleSave = async () => {
    setFirstNameError(null);
    setPhoneError(null);

    const trimmedFirst = firstName.trim();
    const trimmedMiddle = middleName.trim();
    const trimmedLast = lastName.trim();

    // Inline validation checks
    if (!trimmedFirst) {
      setFirstNameError('First name is required');
      showToast('Please provide your first name', 'error');
      return;
    }

    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      showToast('Please enter your phone number', 'error');
      return;
    }

    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('63') && cleanPhone.length === 12) {
      cleanPhone = '0' + cleanPhone.slice(2);
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      cleanPhone = '0' + cleanPhone;
    }

    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('09')) {
      setPhoneError('Must be an 11-digit number starting with 09');
      showToast('Please enter a valid 11-digit mobile number', 'error');
      return;
    }

    const userId = user.id;
    if (!userId && !user.email && !user.phoneNumber) {
      Alert.alert('Authentication Error', 'No user identifier found. Please log in again.');
      return;
    }

    // Build combined full name cleanly
    const nameSegments = [trimmedFirst, trimmedMiddle, trimmedLast].filter(Boolean);
    const finalFullName = nameSegments.join(' ');

    // Build combined address string
    const addressSegments = [street, barangay, city, province, zipCode]
      .map((s) => s.trim())
      .filter(Boolean);
    const finalAddress = addressSegments.join(', ') || user.address || '';
    const finalEmail = email.trim() || user.email;

    isSavingRef.current = true;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/mobile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId || undefined,
          fullName: finalFullName,
          email: finalEmail,
          phoneNumber: cleanPhone,
          address: finalAddress,
          profileImage: user.avatarUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        isSavingRef.current = false;
        showToast(data.error || 'Failed to update profile.', 'error');
        Alert.alert('Update Failed', data.error || 'An error occurred while updating profile.');
      } else {
        const updated = data.user || {};
        const savedName = updated.fullName || finalFullName;
        const savedPhone = updated.phoneNumber || cleanPhone;
        const savedEmail = updated.email || finalEmail;
        const savedAddress = updated.address !== undefined && updated.address !== null ? updated.address : finalAddress;

        // Directly sync local form state
        setFirstName(trimmedFirst);
        setMiddleName(trimmedMiddle);
        setLastName(trimmedLast);
        setPhoneNumber(formatPhoneNumber(savedPhone));
        setEmail(savedEmail);
        setEmergencyContact(emergencyContact.trim());
        setBio(bio.trim());

        // Update UserContext and AsyncStorage
        await updateUser({
          id: updated.id || user.id,
          fullName: savedName,
          firstName: trimmedFirst,
          middleName: trimmedMiddle,
          lastName: trimmedLast,
          phoneNumber: savedPhone,
          email: savedEmail,
          address: savedAddress,
          street: street.trim(),
          barangay: barangay.trim(),
          city: city.trim(),
          province: province.trim(),
          zipCode: zipCode.trim(),
          emergencyContact: emergencyContact.trim(),
          bio: bio.trim(),
          avatarUri: updated.profileImage || user.avatarUri,
          language: updated.language || user.language || 'en',
        });

        setIsEditing(false);
        setTimeout(() => {
          isSavingRef.current = false;
        }, 300);

        showToast('Profile updated successfully! ✨', 'success');
      }
    } catch (error) {
      isSavingRef.current = false;
      console.error('Update profile error:', error);
      showToast('Could not connect to server', 'error');
      Alert.alert('Connection Error', 'Could not connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload or update profile picture
  const uploadImageToServer = async (imageUri: string, base64Data: string) => {
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
      let remoteUrl = imageUri;
      if (uploadData.success && uploadData.url) {
        remoteUrl = uploadData.url;
      }

      await updateUser({ avatarUri: remoteUrl });

      if (user.id || user.email || user.phoneNumber) {
        await fetch(`${API_URL}/api/auth/mobile/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id || undefined,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address || '',
            profileImage: remoteUrl,
          }),
        });
      }

      showToast('Profile photo updated! 📸', 'success');
    } catch (error) {
      console.error('Photo upload error:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Photo handlers
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Camera access is required to take a new profile photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      await uploadImageToServer(asset.uri, base64Data);
    }
  };

  const handleChooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Photos access is required to select a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      await uploadImageToServer(asset.uri, base64Data);
    }
  };

  const handleRemovePhoto = async () => {
    setIsLoading(true);
    try {
      await updateUser({ avatarUri: null });
      if (user.id || user.email || user.phoneNumber) {
        await fetch(`${API_URL}/api/auth/mobile/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id || undefined,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address || '',
            profileImage: '',
          }),
        });
      }
      showToast('Profile photo removed', 'success');
    } catch (e) {
      console.error('Remove photo error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Account Actions
  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('@user_profile');
            await updateUser({
              id: '',
              fullName: '',
              firstName: '',
              middleName: '',
              lastName: '',
              email: '',
              phoneNumber: '',
              address: '',
              avatarUri: null,
            });
            navigation.replace('Welcome');
          } catch (e) {
            console.error('Logout error:', e);
            navigation.replace('Welcome');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will erase your medical records access.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            showToast('Please contact clinic support to permanently delete data.', 'error');
          },
        },
      ]
    );
  };

  // Calculate profile completion percentage dynamically
  const calculateCompletion = () => {
    let score = 0;
    if (user.fullName) score += 20;
    if (user.phoneNumber) score += 20;
    if (user.email) score += 20;
    if (user.address) score += 15;
    if (user.avatarUri) score += 10;
    if (user.emergencyContact) score += 10;
    if (user.bio) score += 5;
    return Math.min(score, 100);
  };

  const completionPercentage = calculateCompletion();
  const completionHint = !user.emergencyContact
    ? 'Add emergency contact'
    : !user.address
    ? 'Add address'
    : !user.bio
    ? 'Add bio'
    : 'Completed';

  // Member Since Year
  const memberSinceYear = user.createdAt ? new Date(user.createdAt).getFullYear() : 2024;
  const visitsCount = pets.reduce((acc, p) => acc + (p.appointments?.length || 0), 0) || 4;

  // Render Address cards
  const currentAddressText =
    user.address || [street, barangay, city, province, zipCode].filter(Boolean).join(', ') || '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#35501F" />

      {/* Floating Animated Toast Banner */}
      {toastMessage && (
        <Animated.View
          style={[
            styles.toastContainer,
            { transform: [{ translateY: toastAnim }] },
            toastType === 'error' ? styles.toastError : styles.toastSuccess,
          ]}
        >
          <Ionicons
            name={toastType === 'error' ? 'alert-circle' : 'checkmark-circle'}
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.toastText} numberOfLines={2}>
            {toastMessage}
          </Text>
        </Animated.View>
      )}

      {/* FIXED HEADER AT THE TOP (Not scrolling) */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerIconButton}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity
          onPress={() => {
            if (isEditing) {
              handleCancel();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={isLoading}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerActionButton}
        >
          <Text style={[styles.headerActionText, isEditing && styles.headerCancelText]}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MAIN SCROLLABLE CONTENT */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[
            styles.scrollContentContainer,
            { paddingBottom: isEditing ? 120 : 60 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Avatar Area Section */}
          <ProfileHeader
            fullName={user.fullName}
            avatarUri={user.avatarUri}
            bio={user.bio}
            onTakePhoto={handleTakePhoto}
            onChooseFromGallery={handleChooseFromGallery}
            onRemovePhoto={handleRemovePhoto}
          />

          {/* VIEW MODE: SECTIONS 2 to 8 */}
          {!isEditing ? (
            <>
              {/* 2. Stats Row Card */}
              <StatsRow
                petsCount={pets.length}
                visitsCount={visitsCount}
                memberSinceYear={memberSinceYear}
              />

              {/* 3. Profile Completion Card */}
              <CompletionCard
                percentage={completionPercentage}
                hintText={completionHint !== 'Completed' ? completionHint : undefined}
                onPressHint={() => setIsEditing(true)}
              />

              {/* 4. My Pets Section */}
              <SectionCard
                title="My Pets"
                iconName="paw-outline"
                rightAction={{
                  label: 'See all',
                  onPress: () => navigation.navigate('PetRecords'),
                }}
              >
                <PetCardList
                  pets={pets.map((p) => ({
                    id: p.id,
                    name: p.name,
                    breed: p.breed,
                    age: p.age,
                    species: p.species,
                    avatar: p.avatar,
                  }))}
                  onPressPet={(pet) => navigation.navigate('PetRecords')}
                  onPressAddPet={() => navigation.navigate('PetRecords')}
                />
              </SectionCard>

              {/* 5. Contact Information Section */}
              <SectionCard title="Contact Information" iconName="call-outline">
                <InfoRow
                  iconName="phone-portrait-outline"
                  label="Phone Number"
                  value={phoneNumber}
                  isVerified={Boolean(phoneNumber)}
                  emptyActionText="Add phone number"
                  onPressEmptyAction={() => setIsEditing(true)}
                />
                <InfoRow
                  iconName="mail-outline"
                  label="Email Address"
                  value={email}
                  isVerified={Boolean(email)}
                  emptyActionText="Add email address"
                  onPressEmptyAction={() => setIsEditing(true)}
                />
                <InfoRow
                  iconName="heart-outline"
                  label="Emergency Contact"
                  value={emergencyContact}
                  isVerified={false}
                  emptyActionText="Add a number"
                  onPressEmptyAction={() => setIsEditing(true)}
                  showDivider={false}
                />
              </SectionCard>

              {/* 6. Addresses Section */}
              <SectionCard
                title="Addresses"
                iconName="location-outline"
                rightAction={{
                  label: '+ Add address',
                  onPress: () => setIsEditing(true),
                }}
              >
                <View style={styles.addressCard}>
                  <View style={styles.addressCardHeader}>
                    <View style={styles.addressTypeRow}>
                      <View style={styles.homeIconCircle}>
                        <Ionicons name="home" size={15} color="#35501F" />
                      </View>
                      <Text style={styles.addressLabel}>Home Address</Text>
                    </View>
                    <View style={styles.defaultBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#047857" style={{ marginRight: 3 }} />
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  </View>
                  <Text style={styles.addressBodyText} numberOfLines={3}>
                    {currentAddressText || 'No address set yet. Tap "+ Add address" to add your home address.'}
                  </Text>
                </View>
              </SectionCard>

              {/* 7. Activity Section */}
              <SectionCard title="Activity" iconName="time-outline">
                <SettingsRow
                  iconName="calendar-outline"
                  title="Upcoming appointments"
                  badge={visitsCount > 0 ? visitsCount : undefined}
                  onPress={() => navigation.navigate('Appointments')}
                />
                <SettingsRow
                  iconName="business-outline"
                  title="Saved clinics"
                  subtitle="FurEverCare Balingasag"
                  onPress={() => Alert.alert('Saved Clinic', 'Primary: FurEverCare Clinic, Balingasag')}
                />
                <SettingsRow
                  iconName="bag-handle-outline"
                  title="Order history"
                  showDivider={false}
                  onPress={() => navigation.navigate('Products')}
                />
              </SectionCard>

              {/* 8. Account Section */}
              <SectionCard title="Account" iconName="shield-checkmark-outline">
                <SettingsRow
                  iconName="lock-closed-outline"
                  title="Change password"
                  onPress={() => navigation.navigate('AccountSecurity')}
                />
                <SettingsRow
                  iconName="notifications-outline"
                  title="Notifications"
                  subtitle="Appointments & reminders"
                  onPress={() => navigation.navigate('Settings')}
                />
                <SettingsRow
                  iconName="log-out-outline"
                  title="Log out"
                  isDestructive
                  onPress={handleLogout}
                />
                <SettingsRow
                  iconName="trash-outline"
                  title="Delete account"
                  isDestructive
                  showDivider={false}
                  onPress={handleDeleteAccount}
                />
              </SectionCard>
            </>
          ) : (
            /* EDIT MODE: STYLED TEXT INPUTS */
            <View style={styles.editFormContainer}>
              {/* Personal Details */}
              <SectionCard title="Edit Personal Details" iconName="person-outline">
                {/* First Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    First Name <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={[styles.inputBox, firstNameError ? styles.inputBoxError : null]}>
                    <Ionicons name="person" size={17} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        if (firstNameError) setFirstNameError(null);
                      }}
                      placeholder="e.g. Jealene Mae"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {Boolean(firstNameError) && (
                    <Text style={styles.inlineErrorText}>{firstNameError}</Text>
                  )}
                </View>

                {/* Middle Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Middle Name (Optional)</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="person-outline" size={17} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={middleName}
                      onChangeText={setMiddleName}
                      placeholder="e.g. Santos"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Last Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="person-outline" size={17} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="e.g. Ranido"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Bio Line */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Short Bio</Text>
                  <View style={[styles.inputBox, styles.inputBoxMultiline]}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={17}
                      color="#6B7280"
                      style={[styles.inputIcon, { marginTop: 12, alignSelf: 'flex-start' }]}
                    />
                    <TextInput
                      style={[styles.textInput, styles.textInputMultiline]}
                      value={bio}
                      onChangeText={setBio}
                      multiline
                      numberOfLines={2}
                      placeholder="e.g. Loving fur mom of 2 rescue dogs 🐾"
                      placeholderTextColor="#9CA3AF"
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </SectionCard>

              {/* Contact Information */}
              <SectionCard title="Edit Contact Information" iconName="call-outline">
                {/* Phone Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Phone Number <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={[styles.inputBox, phoneError ? styles.inputBoxError : null]}>
                    <Ionicons name="phone-portrait-outline" size={17} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={phoneNumber}
                      onChangeText={(text) => {
                        setPhoneNumber(formatPhoneNumber(text));
                        if (phoneError) setPhoneError(null);
                      }}
                      keyboardType="phone-pad"
                      placeholder="e.g. 0912-345-6789"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {Boolean(phoneError) && <Text style={styles.inlineErrorText}>{phoneError}</Text>}
                </View>

                {/* Email Address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={17} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="e.g. petparent@example.com"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Emergency Contact */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Emergency Contact</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="heart-outline" size={17} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={emergencyContact}
                      onChangeText={setEmergencyContact}
                      keyboardType="phone-pad"
                      placeholder="e.g. 0928-111-2222 (Relative / Vet)"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </SectionCard>

              {/* Address Fields */}
              <SectionCard title="Edit Address Details" iconName="home-outline">
                {/* Street */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Street / Building / House No.</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="trail-sign-outline" size={17} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={street}
                      onChangeText={setStreet}
                      placeholder="e.g. Zone 4, Riverside Street"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Barangay */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Barangay</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="navigate-outline" size={17} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={barangay}
                      onChangeText={setBarangay}
                      placeholder="e.g. Barangay Linggangao"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* City & Province Row */}
                <View style={styles.rowTwoInputs}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>City / Municipality</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        value={city}
                        onChangeText={setCity}
                        placeholder="e.g. Balingasag"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Province</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        value={province}
                        onChangeText={setProvince}
                        placeholder="e.g. Misamis Oriental"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                </View>

                {/* ZIP Code */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ZIP Code</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-unread-outline" size={17} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={zipCode}
                      onChangeText={setZipCode}
                      keyboardType="numeric"
                      placeholder="e.g. 9005"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </SectionCard>
            </View>
          )}
        </ScrollView>

        {/* STICKY "SAVE CHANGES" BUTTON AT THE BOTTOM IN EDIT MODE */}
        {isEditing && (
          <View style={[styles.stickyBottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={[styles.saveChangesButton, isLoading && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.saveChangesText}>
                {isLoading ? 'Saving Changes…' : 'Save changes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#35501F', // Seamless with header
  },
  fixedHeader: {
    height: 56,
    backgroundColor: '#35501F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Catcut',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerActionButton: {
    minWidth: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  headerActionText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  headerCancelText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  mainScroll: {
    flex: 1,
    backgroundColor: '#F4F1EC', // Light warm gray background
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Address View Card
  addressCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  addressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  addressLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#1F2937',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: '#047857',
  },
  addressBodyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },

  // Edit Mode Inputs
  editFormContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 14,
  },
  rowTwoInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputBoxMultiline: {
    height: 'auto',
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 8,
  },
  textInputMultiline: {
    height: 'auto',
    minHeight: 64,
  },
  inlineErrorText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },

  // Sticky Save Bar
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(244, 241, 236, 0.95)',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  saveChangesButton: {
    backgroundColor: '#35501F',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#35501F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  saveChangesText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 999,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  toastSuccess: {
    backgroundColor: '#065F46',
  },
  toastError: {
    backgroundColor: '#B91C1C',
  },
  toastText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
  },
});
