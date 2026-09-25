import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

import { MoreStackParamList } from '../../App';
import { RootStackParamList } from '../../App';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { usePetContext } from '../context/PetContext';

import MoreHeader from '../components/more/MoreHeader';
import ProfileCard from '../components/more/ProfileCard';
import MenuGroup from '../components/more/MenuGroup';
import ContactSheet from '../components/more/ContactSheet';
import { MenuRowConfig } from '../components/more/MenuRow';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>;
};

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('', message);
  }
}

export default function MoreMenuScreen({ navigation }: Props) {
  const { t, language } = useLanguage();
  const { theme, isDarkMode } = useTheme();
  const { user } = useUser();
  const { pets } = usePetContext();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [contactSheetVisible, setContactSheetVisible] = useState(false);

  // Check if at least one pet is verified
  const hasVerifiedPet = useMemo(
    () => pets.some(p => p.verificationStatus === 'VERIFIED'),
    [pets]
  );
  // Only show chip if we actually have pets (i.e., verification data available)
  const hasPets = pets.length > 0;
  const showMonitoringChip = hasPets && !hasVerifiedPet;

  // ── Group config ──────────────────────────────────────────────────────────
  const myPetsItems: MenuRowConfig[] = [
    {
      id: 'pet-records',
      icon: 'paw-outline' as keyof typeof Ionicons.glyphMap,
      title: language === 'en' ? 'Pet records' : 'Rekord ng alagang hayop',
      description: language === 'en'
        ? 'Profiles and medical history'
        : 'Mga profile at kasaysayang medikal',
      onPress: () => navigation.navigate('PetRecords'),
      accessibilityLabel: 'Open pet records',
    },
    {
      id: 'pet-monitoring',
      icon: 'heart-outline' as keyof typeof Ionicons.glyphMap,
      title: language === 'en' ? 'Pet monitoring' : 'Pagmamatyag ng alaga',
      description: language === 'en'
        ? 'Health stats and vitals'
        : 'Mga istatistika at buhay ng kalusugan',
      showVerifyChip: showMonitoringChip,
      onPress: () => {
        if (showMonitoringChip) {
          navigation.navigate('PetRecords');
          showToast('Pet monitoring unlocks after clinic verification.');
        } else {
          navigation.navigate('PetMonitoring');
        }
      },
      accessibilityLabel: showMonitoringChip
        ? 'Pet monitoring locked, verify your pet first'
        : 'Open pet monitoring',
    },
  ];

  const learnItems: MenuRowConfig[] = [
    {
      id: 'tutorials',
      icon: 'book-outline' as keyof typeof Ionicons.glyphMap,
      title: language === 'en' ? 'Pet tutorials' : 'Mga tutorial sa alaga',
      description: language === 'en'
        ? 'Training, grooming and care videos'
        : 'Mga video sa pagsasanay at pangangalaga',
      onPress: () => navigation.navigate('Tutorials'),
      accessibilityLabel: 'Open pet tutorials',
    },
    {
      id: 'contact',
      icon: 'call-outline' as keyof typeof Ionicons.glyphMap,
      title: language === 'en' ? 'Contact the clinic' : 'Makipag-ugnayan sa klinika',
      description: language === 'en'
        ? 'Call or message us'
        : 'Tumawag o mag-mensahe sa amin',
      onPress: () => setContactSheetVisible(true),
      accessibilityLabel: 'Contact the clinic',
    },
    {
      id: 'feedback',
      icon: 'star-outline' as keyof typeof Ionicons.glyphMap,
      title: language === 'en' ? 'Give feedback' : 'Magbigay ng feedback',
      description: language === 'en'
        ? 'Tell us how we can improve'
        : 'Sabihin sa amin kung paano mapapabuti',
      onPress: () => navigation.navigate('Feedback'),
      accessibilityLabel: 'Give feedback about the app',
    },
  ];

  const accountItems: MenuRowConfig[] = [
    {
      id: 'settings',
      icon: 'settings-outline' as keyof typeof Ionicons.glyphMap,
      title: language === 'en' ? 'Settings' : 'Mga setting',
      description: language === 'en'
        ? 'Preferences and account security'
        : 'Mga kagustuhan at seguridad ng account',
      onPress: () => navigation.navigate('Settings'),
      accessibilityLabel: 'Open settings',
    },
  ];

  const groups = [
    { label: language === 'en' ? 'My pets' : 'Aking mga alaga', items: myPetsItems },
    { label: language === 'en' ? 'Learn and support' : 'Matuto at suporta', items: learnItems },
    { label: language === 'en' ? 'Account' : 'Account', items: accountItems },
  ];

  return (
    <SafeAreaView
      edges={[]}
      style={[styles.safeArea, { backgroundColor: isDarkMode ? '#0F172A' : '#FAF8F5' }]}
    >
      {/* Fixed Header */}
      <MoreHeader
        canGoBack={navigation.canGoBack()}
        onBack={() => navigation.goBack()}
      />

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <ProfileCard
          user={user}
          onPress={() => rootNav.navigate('Profile')}
        />

        {/* Spacer between profile card and first group */}
        <View style={{ height: 20 }} />

        {/* Grouped menu sections */}
        {groups.map(group => (
          <MenuGroup
            key={group.label}
            label={group.label}
            items={group.items}
          />
        ))}

        {/* Version footer */}
        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </ScrollView>

      {/* Contact bottom sheet */}
      <ContactSheet
        visible={contactSheetVisible}
        onClose={() => setContactSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // clears the bottom tab bar
  },
  version: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});
