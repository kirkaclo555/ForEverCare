import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import Constants from 'expo-constants';

import ScreenHeader from '../components/shared/ScreenHeader';
import SettingsGroup from '../components/settings/SettingsGroup';
import LanguageSheet from '../components/settings/LanguageSheet';
import ConfirmDialog from '../components/settings/ConfirmDialog';
import { SettingsRowConfig } from '../components/settings/SettingsRow';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

type Props = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: Props) {
  const { isDarkMode, toggleDarkMode, theme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const { user, updateUser } = useUser();

  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [aboutUsModalVisible, setAboutUsModalVisible] = useState(false);

  const isGuest = !user?.id || user.id.trim() === '';
  const langLabel = language === 'en' ? 'English' : 'Wikang Filipino';

  // ── Logout handler ────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@user_profile');
      updateUser({
        id: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        avatarUri: null,
      });
      navigation.replace('Welcome');
    } catch (e) {
      console.error('Failed to log out', e);
      navigation.replace('Welcome');
    }
  };

  // ── Group configs ─────────────────────────────────────────────────────────

  const accountRows: SettingsRowConfig[] = [
    {
      id: 'account-security',
      icon: 'shield-checkmark-outline',
      title: language === 'en' ? 'Account security' : 'Seguridad ng account',
      description: language === 'en' ? 'Password and sign-in' : 'Password at pag-sign in',
      type: 'nav',
      onPress: () => {
        if (isGuest) {
          navigation.navigate('Login');
        } else {
          navigation.navigate('AccountSecurity');
        }
      },
      accessibilityLabel: 'Open account security settings',
    },
  ];

  const preferenceRows: SettingsRowConfig[] = [
    {
      id: 'language',
      icon: 'globe-outline',
      title: language === 'en' ? 'Language' : 'Wika',
      description: undefined,
      type: 'value',
      value: langLabel,
      onPress: () => setLanguageSheetVisible(true),
      accessibilityLabel: `Change language, current: ${langLabel}`,
    },
    {
      id: 'dark-mode',
      icon: 'moon-outline',
      title: language === 'en' ? 'Dark mode' : 'Dark mode',
      description: language === 'en' ? 'Switch to a darker theme' : 'Lumipat sa mas madilim na tema',
      type: 'switch',
      switchValue: isDarkMode,
      onSwitchChange: toggleDarkMode,
      accessibilityLabel: `Dark mode, currently ${isDarkMode ? 'on' : 'off'}`,
    },
  ];

  const aboutRows: SettingsRowConfig[] = [
    {
      id: 'community-rules',
      icon: 'people-outline',
      title: language === 'en' ? 'Community rules' : 'Mga patakaran ng komunidad',
      description: language === 'en' ? 'Platform guidelines and standards' : 'Mga alituntunin ng platform',
      type: 'nav',
      onPress: () => setRulesModalVisible(true),
      accessibilityLabel: 'View community rules',
    },
    {
      id: 'about-us',
      icon: 'information-circle-outline',
      title: language === 'en' ? 'About us' : 'Tungkol sa amin',
      description: language === 'en' ? 'FurEver Paw Care clinic info' : 'Impormasyon ng klinika',
      type: 'nav',
      onPress: () => setAboutUsModalVisible(true),
      accessibilityLabel: 'View about us information',
    },
  ];

  const accountActionRows: SettingsRowConfig[] = isGuest
    ? [
        {
          id: 'login',
          icon: 'log-in-outline',
          title: language === 'en' ? 'Log in / Sign up' : 'Mag-login / Mag-sign up',
          description: language === 'en' ? 'Access your account' : 'I-access ang iyong account',
          type: 'nav',
          onPress: () => navigation.navigate('Login'),
          accessibilityLabel: 'Log in or create an account',
          iconBg: '#EAF3DE',
          iconColor: '#27500A',
        },
      ]
    : [
        {
          id: 'logout',
          icon: 'log-out-outline',
          title: language === 'en' ? 'Log out' : 'Mag-logout',
          type: 'danger',
          onPress: () => setLogoutDialogVisible(true),
          accessibilityLabel: 'Log out of your account',
          iconBg: '#FCEBEB',
          iconColor: '#791F1F',
        },
      ];

  const groups = [
    {
      label: language === 'en' ? 'Account' : 'Account',
      rows: accountRows,
    },
    {
      label: language === 'en' ? 'Preferences' : 'Mga kagustuhan',
      rows: preferenceRows,
    },
    {
      label: language === 'en' ? 'About and legal' : 'Tungkol at legal',
      rows: aboutRows,
    },
    {
      label: language === 'en' ? 'Account actions' : 'Mga aksyon sa account',
      rows: accountActionRows,
    },
  ];

  return (
    <SafeAreaView
      edges={[]}
      style={[styles.safeArea, { backgroundColor: isDarkMode ? '#0F172A' : '#FAF8F5' }]}
    >
      <ScreenHeader
        title={t('settings')}
        onBack={() => navigation.goBack()}
        right={<View style={{ width: 40 }} />}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {groups.map((group) => (
          <SettingsGroup
            key={group.label}
            label={group.label}
            rows={group.rows}
          />
        ))}

        {/* Version footer */}
        <Text style={[styles.version, { color: theme.subtext }]}>
          Version {APP_VERSION}
        </Text>
      </ScrollView>

      {/* ── Language bottom sheet ─────────────────────────────────────────── */}
      <LanguageSheet
        visible={languageSheetVisible}
        currentLanguage={language as 'en' | 'tl'}
        onSelect={(lang) => {
          changeLanguage(lang);
          setLanguageSheetVisible(false);
        }}
        onClose={() => setLanguageSheetVisible(false)}
      />

      {/* ── Logout confirmation dialog ────────────────────────────────────── */}
      <ConfirmDialog
        visible={logoutDialogVisible}
        onClose={() => setLogoutDialogVisible(false)}
        onConfirm={handleLogout}
        language={language as 'en' | 'tl'}
      />

      {/* ── Community Rules modal (kept exactly as original) ─────────────── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={rulesModalVisible}
        onRequestClose={() => setRulesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, height: '80%', paddingBottom: 20 }]}>
            <View style={styles.modalHeaderIndicator} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}>
              <FontAwesome5 name="balance-scale" size={20} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
              <Text style={[styles.modalTitle, { color: theme.text, marginBottom: 0 }]}>{t('communityRules')}</Text>
            </View>
            <Text style={[styles.modalSubtitle, { color: theme.subtext, marginBottom: 15 }]}>
              {language === 'en'
                ? 'Standard Guidelines for FurEverPawCare Members'
                : 'Mga Pamantayang Panuntunan para sa mga Kasapi'}
            </Text>

            <ScrollView style={{ flex: 1, marginBottom: 15 }} showsVerticalScrollIndicator={false}>
              {language === 'en' ? (
                <>
                  {[
                    { icon: 'user-shield', title: '1. Professional & Respectful Conduct', text: 'Treat all veterinary staff, clinic administrators, and other pet owners with dignity and respect. Any form of harassment, hate speech, discrimination, or verbal abuse will lead to immediate and permanent account termination.' },
                    { icon: 'file-medical', title: '2. Accurate Pet Medical Records', text: "Provide only truthful and authentic details regarding your pet's name, age, breed, health history, and vaccinations. Submitting fake, altered, or fraudulent medical logs is strictly prohibited and compromises clinical safety." },
                    { icon: 'calendar-check', title: '3. Booking & Cancellation Integrity', text: 'Respect scheduled appointment times. Cancellations are permitted up to 24 hours prior to the slot. Booking fraudulent appointments, spamming slots, or failing to show up repeatedly without notice will result in booking restrictions.' },
                    { icon: 'laptop-medical', title: '4. Appropriate Use of Telemedicine', text: 'Teleconsultation is designed for non-emergency guidance, triages, follow-ups, and general inquiries. In case of severe, life-threatening emergencies, bypass the app and go directly to physical emergency services.' },
                    { icon: 'key', title: '5. Security & Privacy Standards', text: 'Ensure your account password and recovery details remain confidential. Sharing accounts or attempting to exploit platform vulnerabilities is subject to civil and legal action.' },
                  ].map((rule) => (
                    <View key={rule.title} style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                      <View style={styles.ruleHeader}>
                        <FontAwesome5 name={rule.icon as any} size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                        <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>{rule.title}</Text>
                      </View>
                      <Text style={[styles.ruleText, { color: theme.text }]}>{rule.text}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { icon: 'user-shield', title: '1. Magalang at Propesyonal na Pakikitungo', text: 'Tratuhin ang mga beterinaryo, tauhan ng klinika, at iba pang may-ari ng alaga nang may respeto at dignidad. Ang anumang anyo ng panliligalig, poot, diskriminasyon, o pang-aabusong verbal ay magiging sanhi ng agarang pagkansela ng account.' },
                    { icon: 'file-medical', title: '2. Tumpak na Rekord at Medikal na Kasaysayan', text: 'Magbigay lamang ng totoo at tumpak na detalye tungkol sa iyong alaga. Ang pagpapasa ng huwad, binago, o pekeng rekord-medikal ng alaga ay mahigpit na ipinagbabawal.' },
                    { icon: 'calendar-check', title: '3. Integridad sa Pag-book at Pagkansela', text: 'Irespeto ang mga nakatakdang oras ng appointment. Ang pagkansela ay pinapayagan hanggang 24 oras bago ang iskedyul. Ang paulit-ulit na hindi pagsipot ay maaaring limitahan ang iyong booking access.' },
                    { icon: 'laptop-medical', title: '4. Tamang Paggamit ng Telemedicine', text: 'Ang teleconsultation ay para lamang sa hindi-kritikal na konsultasyon. Sa mga malulubhang emergency, huwag gamitin ang app; dumaan agad nang personal sa pinakamalapit na klinika.' },
                    { icon: 'key', title: '5. Pamantayan sa Seguridad at Privacy', text: 'Panatilihing lihim ang iyong account credentials. Ang pagtatangkang i-hack o sirain ang platform ay may kaukulang parusang legal at sibil.' },
                  ].map((rule) => (
                    <View key={rule.title} style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                      <View style={styles.ruleHeader}>
                        <FontAwesome5 name={rule.icon as any} size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                        <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>{rule.title}</Text>
                      </View>
                      <Text style={[styles.ruleText, { color: theme.text }]}>{rule.text}</Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeModalButton, { backgroundColor: isDarkMode ? '#1c330e' : '#2D5016', borderColor: isDarkMode ? '#1c330e' : '#2D5016', marginTop: 5 }]}
              onPress={() => setRulesModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close community rules"
            >
              <Text style={[styles.closeModalButtonText, { color: 'white' }]}>
                {language === 'en' ? 'I Understand' : 'Naiintindihan Ko'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── About Us modal (kept exactly as original) ─────────────────────── */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={aboutUsModalVisible}
        onRequestClose={() => setAboutUsModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <ScreenHeader
            title={t('aboutUs')}
            onBack={() => setAboutUsModalVisible(false)}
            right={<View style={{ width: 40 }} />}
          />
          <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginVertical: 25 }}>
              <FontAwesome5 name="paw" size={64} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginBottom: 15 }} />
              <Text style={{ fontSize: 24, fontFamily: 'Catcut', color: isDarkMode ? '#EAF3DE' : '#2D5016', textAlign: 'center' }}>
                FurEverPawCare
              </Text>
              <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans-Medium', color: theme.subtext, textAlign: 'center', marginTop: 4 }}>
                Balingasag Dog & Cat Pet's Clinic Portal
              </Text>
              <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Regular', color: theme.subtext, opacity: 0.8, textAlign: 'center', marginTop: 2 }}>
                Version {APP_VERSION}
              </Text>
            </View>

            {language === 'en' ? (
              <>
                {[
                  { icon: 'bullseye', title: 'Our Mission', text: 'To deliver high-quality, compassionate, and modern veterinary care to dogs and cats in Balingasag and surrounding communities. Through modern technology and professional expertise, we ensure that every pet lives a happy, healthy, and "furever" loved life.' },
                  { icon: 'eye', title: 'Our Vision', text: 'To be the leading digital partner in pet healthcare across the region, championing the wellness of dogs and cats through modern technology and passionate veterinary care.' },
                ].map((section) => (
                  <View key={section.title} style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <FontAwesome5 name={section.icon as any} size={18} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor, fontSize: 16 }]}>{section.title}</Text>
                    </View>
                    <Text style={[styles.ruleText, { paddingLeft: 0, fontSize: 13.5, lineHeight: 20, color: theme.text }]}>{section.text}</Text>
                  </View>
                ))}
                <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <FontAwesome5 name="hospital" size={18} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                    <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor, fontSize: 16 }]}>Clinic Details</Text>
                  </View>
                  <View style={{ marginTop: 5, gap: 10 }}>
                    {[
                      { icon: 'map-marker-alt', text: 'Balingasag, Misamis Oriental, Philippines' },
                      { icon: 'clock', text: 'Monday - Saturday: 9:00 AM - 5:00 PM' },
                      { icon: 'envelope', text: 'support@fureverpawcare.com' },
                    ].map((item) => (
                      <View key={item.icon} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome5 name={item.icon as any} size={14} color={isDarkMode ? '#7CB342' : '#2D5016'} style={{ width: 24 }} />
                        <Text style={{ fontSize: 13.5, color: theme.text, fontFamily: 'PlusJakartaSans-Medium', flex: 1, marginLeft: 10 }}>{item.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                {[
                  { icon: 'bullseye', title: 'Ang Aming Layunin (Mission)', text: 'Maghatid ng mapagkalinga, ligtas, at modernong pangangalagang medikal para sa mga alagang hayop sa Balingasag at mga karatig-bayan.' },
                  { icon: 'eye', title: 'Ang Aming Pananaw (Vision)', text: 'Ang maging nangungunang digital na katuwang sa pangangalaga ng kalusugan ng mga alaga sa buong rehiyon.' },
                ].map((section) => (
                  <View key={section.title} style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                      <FontAwesome5 name={section.icon as any} size={18} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor, fontSize: 16 }]}>{section.title}</Text>
                    </View>
                    <Text style={[styles.ruleText, { paddingLeft: 0, fontSize: 13.5, lineHeight: 20, color: theme.text }]}>{section.text}</Text>
                  </View>
                ))}
                <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <FontAwesome5 name="hospital" size={18} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                    <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor, fontSize: 16 }]}>Impormasyon ng Klinika</Text>
                  </View>
                  <View style={{ marginTop: 5, gap: 10 }}>
                    {[
                      { icon: 'map-marker-alt', text: 'Balingasag, Misamis Oriental, Philippines' },
                      { icon: 'clock', text: 'Lunes - Sabado: 9:00 AM - 5:00 PM' },
                      { icon: 'envelope', text: 'support@fureverpawcare.com' },
                    ].map((item) => (
                      <View key={item.icon} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome5 name={item.icon as any} size={14} color={isDarkMode ? '#7CB342' : '#2D5016'} style={{ width: 24 }} />
                        <Text style={{ fontSize: 13.5, color: theme.text, fontFamily: 'PlusJakartaSans-Medium', flex: 1, marginLeft: 10 }}>{item.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  version: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  // ── Modals (kept from original) ──────────────────────────────────────────
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
  modalHeaderIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#cbd5e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#718096',
    textAlign: 'center',
    marginBottom: 25,
  },
  closeModalButton: {
    marginTop: 15,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  closeModalButtonText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#4a5568',
  },
  ruleCard: {
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#2D5016',
    flex: 1,
  },
  ruleText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#4a5568',
    lineHeight: 18,
    paddingLeft: 26,
  },
});
