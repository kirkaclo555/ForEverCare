import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

type Props = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: Props) {
  const { isDarkMode, toggleDarkMode, theme } = useTheme();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [isRulesModalVisible, setIsRulesModalVisible] = useState(false);
  const [isAboutUsModalVisible, setIsAboutUsModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const { language, changeLanguage, t } = useLanguage();
  const { user, updateUser } = useUser();

  const handleLanguageSelect = () => {
    setIsLanguageModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.sectionTitleColor }]}>{t('account')}</Text>
          
          <TouchableOpacity 
            style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]} 
            onPress={() => {
              if (!user?.id || user.id.trim() === '') {
                Alert.alert(
                  language === 'en' ? 'Authentication Required' : 'Kinakailangan ang Pautentikasyon',
                  language === 'en'
                    ? 'Please log in or create an account to access account security settings.'
                    : 'Mangyaring mag-log in o gumawa ng account upang ma-access ang mga setting ng seguridad ng account.'
                );
              } else {
                navigation.navigate('AccountSecurity');
              }
            }}
          >
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#e2e8f0' }]}>
                <FontAwesome5 name="shield-alt" size={16} color={isDarkMode ? '#a0aec0' : '#4a5568'} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>{t('accountSecurity')}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color={isDarkMode ? '#718096' : '#cbd5e0'} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.sectionTitleColor }]}>{t('preferences')}</Text>

          <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handleLanguageSelect}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#e2e8f0' }]}>
                <FontAwesome5 name="globe" size={16} color={isDarkMode ? '#a0aec0' : '#4a5568'} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>{t('language')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: theme.subtext }]}>
              {language === 'en' ? 'English' : 'Wikang Filipino'} <FontAwesome5 name="chevron-right" size={14} color={isDarkMode ? '#718096' : '#cbd5e0'} />
            </Text>
          </TouchableOpacity>

          <View style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#e2e8f0' }]}>
                <FontAwesome5 name="moon" size={16} color={isDarkMode ? '#a0aec0' : '#4a5568'} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>{t('darkMode')}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#cbd5e0", true: "#2D5016" }}
              thumbColor={"#fff"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.sectionTitleColor }]}>{t('more')}</Text>

          <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setIsRulesModalVisible(true)}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#e2e8f0' }]}>
                <FontAwesome5 name="users" size={16} color={isDarkMode ? '#a0aec0' : '#4a5568'} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>{t('communityRules')}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color={isDarkMode ? '#718096' : '#cbd5e0'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setIsAboutUsModalVisible(true)}>
            <View style={styles.settingRowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#2d2d2d' : '#e2e8f0' }]}>
                <FontAwesome5 name="info-circle" size={16} color={isDarkMode ? '#a0aec0' : '#4a5568'} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>{t('aboutUs')}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color={isDarkMode ? '#718096' : '#cbd5e0'} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {(!user?.id || user.id.trim() === '') ? (
            <TouchableOpacity 
              style={[styles.settingRow, { marginTop: 10, backgroundColor: theme.card, borderColor: theme.border }]} 
              onPress={() => navigation.navigate('Login')}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#c6f6d5' }]}>
                  <FontAwesome5 name="sign-in-alt" size={16} color="#2E5E3E" />
                </View>
                <Text style={[styles.settingText, { color: '#2E5E3E', fontWeight: '700' }]}>
                  {language === 'en' ? 'Log In / Sign Up' : 'Mag-log In / Mag-sign Up'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.settingRow, { marginTop: 10, backgroundColor: theme.card, borderColor: theme.border }]} 
              onPress={() => setIsLogoutModalVisible(true)}
            >
              <View style={styles.settingRowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#fed7d7' }]}>
                  <FontAwesome5 name="sign-out-alt" size={16} color="#e53e3e" />
                </View>
                <Text style={[styles.settingText, { color: '#e53e3e', fontWeight: '700' }]}>{t('logout')}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Premium Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isLanguageModalVisible}
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setIsLanguageModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeaderIndicator} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('language')}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.subtext }]}>
              {language === 'en' ? 'Select your preferred language' : 'Piliin ang iyong gustong wika'}
            </Text>

            <TouchableOpacity 
              style={[
                styles.languageOptionRow, 
                { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc', borderColor: theme.border },
                language === 'en' && { backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE', borderColor: '#7CB342' }
              ]}
              onPress={() => {
                changeLanguage('en');
                setIsLanguageModalVisible(false);
              }}
            >
              <View style={styles.languageOptionLeft}>
                <Text style={styles.flagEmoji}>🇺🇸</Text>
                <View>
                  <Text style={[styles.languageOptionText, { color: theme.text }]}>English</Text>
                  <Text style={[styles.languageOptionSubtext, { color: theme.subtext }]}>United States</Text>
                </View>
              </View>
              <View style={[styles.radioButton, language === 'en' && styles.radioButtonSelected]}>
                {language === 'en' && <View style={styles.radioButtonDot} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.languageOptionRow, 
                { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc', borderColor: theme.border },
                language === 'tl' && { backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE', borderColor: '#7CB342' }
              ]}
              onPress={() => {
                changeLanguage('tl');
                setIsLanguageModalVisible(false);
              }}
            >
              <View style={styles.languageOptionLeft}>
                <Text style={styles.flagEmoji}>🇵🇭</Text>
                <View>
                  <Text style={[styles.languageOptionText, { color: theme.text }]}>Wikang Filipino</Text>
                  <Text style={[styles.languageOptionSubtext, { color: theme.subtext }]}>Tagalog</Text>
                </View>
              </View>
              <View style={[styles.radioButton, language === 'tl' && styles.radioButtonSelected]}>
                {language === 'tl' && <View style={styles.radioButtonDot} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.closeModalButton, { backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc', borderColor: theme.border }]}
              onPress={() => setIsLanguageModalVisible(false)}
            >
              <Text style={[styles.closeModalButtonText, { color: theme.text }]}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Realistic & Standard Community Rules Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRulesModalVisible}
        onRequestClose={() => setIsRulesModalVisible(false)}
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
                  <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={styles.ruleHeader}>
                      <FontAwesome5 name="user-shield" size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>1. Professional & Respectful Conduct</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      Treat all veterinary staff, clinic administrators, and other pet owners with dignity and respect. Any form of harassment, hate speech, discrimination, or verbal abuse will lead to immediate and permanent account termination.
                    </Text>
                  </View>

                  <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={styles.ruleHeader}>
                      <FontAwesome5 name="file-medical" size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>2. Accurate Pet Medical Records</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      Provide only truthful and authentic details regarding your pet's name, age, breed, health history, and vaccinations. Submitting fake, altered, or fraudulent medical logs is strictly prohibited and compromises clinical safety.
                    </Text>
                  </View>

                  <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={styles.ruleHeader}>
                      <FontAwesome5 name="calendar-check" size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>3. Booking & Cancellation Integrity</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      Respect scheduled appointment times. Cancellations are permitted up to 24 hours prior to the slot. Booking fraudulent appointments, spamming slots, or failing to show up repeatedly without notice will result in booking restrictions.
                    </Text>
                  </View>

                  <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={styles.ruleHeader}>
                      <FontAwesome5 name="laptop-medical" size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>4. Appropriate Use of Telemedicine</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      Teleconsultation is designed for non-emergency guidance, triages, follow-ups, and general inquiries. In case of severe, life-threatening emergencies (e.g., severe bleeding, poisoning, breathing issues), bypass the app and go directly to physical emergency services.
                    </Text>
                  </View>

                  <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={styles.ruleHeader}>
                      <FontAwesome5 name="key" size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>5. Security & Privacy Standards</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      Ensure your account password and recovery details remain confidential. Sharing accounts or attempting to exploit platform vulnerabilities, scrape database records, or manipulate the scheduling algorithms is subject to civil and legal action.
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={styles.ruleHeader}>
                      <FontAwesome5 name="user-shield" size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>1. Magalang at Propesyonal na Pakikitungo</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      Tratuhin ang mga beterinaryo, tauhan ng klinika, at iba pang may-ari ng alaga nang may respeto at dignidad. Ang anumang anyo ng panliligalig, poot, diskriminasyon, o pang-aabusong verbal ay magiging sanhi ng agarang pagkansela ng account.
                    </Text>
                  </View>

                  <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={styles.ruleHeader}>
                      <FontAwesome5 name="file-medical" size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>2. Tumpak na Rekord at Medikal na Kasaysayan</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      Magbigay lamang ng totoo at tumpak na detalye tungkol sa iyong alaga. Ang pagpapasa ng huwad, binago, o pekeng rekord-medikal ng alaga ay mahigpit na ipinagbabawal dahil maaari itong maglagay sa panganib sa buhay ng alaga.
                    </Text>
                  </View>

                  <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={styles.ruleHeader}>
                      <FontAwesome5 name="calendar-check" size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>3. Integridad sa Pag-book at Pagkansela</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      Irespeto ang mga nakatakdang oras ng appointment. Ang pagkansela ay pinapayagan hanggang 24 oras bago ang iskedyul. Ang paulit-ulit na hindi pagsipot (no-show) o pag-book ng pekeng appointment ay maaaring limitahan ang iyong booking access.
                    </Text>
                  </View>

                  <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={styles.ruleHeader}>
                      <FontAwesome5 name="laptop-medical" size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>4. Tamang Paggamit ng Telemedicine</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      Ang teleconsultation ay para lamang sa hindi-kritikal na konsultasyon, triage, at follow-up. Sa mga malulubhang emergency na nagbabanta sa buhay ng alaga, huwag gamitin ang app; dumaan agad nang personal sa pinakamalapit na klinika.
                    </Text>
                  </View>

                  <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                    <View style={styles.ruleHeader}>
                      <FontAwesome5 name="key" size={16} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                      <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor }]}>5. Pamantayan sa Seguridad at Privacy</Text>
                    </View>
                    <Text style={[styles.ruleText, { color: theme.text }]}>
                      Panatilihing lihim ang iyong account credentials. Ang pagtatangkang i-hack, sirain ang platform, o kunin ang mga database records nang walang pahintulot ay may kaukulang parusang legal at sibil.
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.closeModalButton, { backgroundColor: isDarkMode ? '#1c330e' : '#2D5016', borderColor: isDarkMode ? '#1c330e' : '#2D5016', marginTop: 5 }]}
              onPress={() => setIsRulesModalVisible(false)}
            >
              <Text style={[styles.closeModalButtonText, { color: 'white', fontWeight: '700' }]}>
                {language === 'en' ? 'I Understand' : 'Naiintindihan Ko'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Realistic & Authentic About Us Full Screen Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isAboutUsModalVisible}
        onRequestClose={() => setIsAboutUsModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => setIsAboutUsModalVisible(false)}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('aboutUs')}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginVertical: 25 }}>
              <FontAwesome5 name="paw" size={64} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginBottom: 15 }} />
              <Text style={{ fontSize: 24, fontFamily: 'Montserrat-Bold', color: isDarkMode ? '#EAF3DE' : '#2D5016', textAlign: 'center' }}>
                FurEverPawCare
              </Text>
              <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Medium', color: theme.subtext, textAlign: 'center', marginTop: 4 }}>
                Balingasag Dog & Cat Pet's Clinic Portal
              </Text>
              <Text style={{ fontSize: 12, fontFamily: 'Montserrat-Regular', color: theme.subtext, opacity: 0.8, textAlign: 'center', marginTop: 2 }}>
                Version 1.0.0
              </Text>
            </View>

            {language === 'en' ? (
              <>
                <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <FontAwesome5 name="bullseye" size={18} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                    <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor, fontSize: 16 }]}>Our Mission</Text>
                  </View>
                  <Text style={[styles.ruleText, { paddingLeft: 0, fontSize: 13.5, lineHeight: 20, color: theme.text }]}>
                    To deliver high-quality, compassionate, and modern veterinary care to dogs and cats in Balingasag and surrounding communities. Through modern technology and professional expertise, we ensure that every pet lives a happy, healthy, and "furever" loved life.
                  </Text>
                </View>

                <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <FontAwesome5 name="eye" size={18} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                    <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor, fontSize: 16 }]}>Our Vision</Text>
                  </View>
                  <Text style={[styles.ruleText, { paddingLeft: 0, fontSize: 13.5, lineHeight: 20, color: theme.text }]}>
                    To be the leading digital partner in pet healthcare across the region, championing the wellness of dogs and cats through modern technology and passionate veterinary care.
                  </Text>
                </View>

                <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <FontAwesome5 name="hospital" size={18} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                    <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor, fontSize: 16 }]}>Clinic Details</Text>
                  </View>
                  <View style={{ marginTop: 5, gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FontAwesome5 name="map-marker-alt" size={14} color={isDarkMode ? '#7CB342' : '#2D5016'} style={{ width: 24 }} />
                      <Text style={{ fontSize: 13.5, color: theme.text, fontFamily: 'Montserrat-Medium', flex: 1, marginLeft: 10 }}>
                        Balingasag, Misamis Oriental, Philippines
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FontAwesome5 name="clock" size={14} color={isDarkMode ? '#7CB342' : '#2D5016'} style={{ width: 24 }} />
                      <Text style={{ fontSize: 13.5, color: theme.text, fontFamily: 'Montserrat-Medium', flex: 1, marginLeft: 10 }}>
                        Monday - Saturday: 9:00 AM - 5:00 PM
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FontAwesome5 name="envelope" size={14} color={isDarkMode ? '#7CB342' : '#2D5016'} style={{ width: 24 }} />
                      <Text style={{ fontSize: 13.5, color: theme.text, fontFamily: 'Montserrat-Medium', flex: 1, marginLeft: 10 }}>
                        support@fureverpawcare.com
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <FontAwesome5 name="bullseye" size={18} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                    <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor, fontSize: 16 }]}>Ang Aming Layunin (Mission)</Text>
                  </View>
                  <Text style={[styles.ruleText, { paddingLeft: 0, fontSize: 13.5, lineHeight: 20, color: theme.text }]}>
                    Maghatid ng mapagkalinga, ligtas, at modernong pangangalagang medikal para sa mga alagang hayop sa Balingasag at mga karatig-bayan. Gamit ang makabagong teknolohiya at propesyonal na kasanayan, sinisiguro naming ang inyong mga alaga ay mamumuhay nang masaya, malusog, at may sapat na pagkalinga.
                  </Text>
                </View>

                <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <FontAwesome5 name="eye" size={18} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                    <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor, fontSize: 16 }]}>Ang Aming Pananaw (Vision)</Text>
                  </View>
                  <Text style={[styles.ruleText, { paddingLeft: 0, fontSize: 13.5, lineHeight: 20, color: theme.text }]}>
                    Ang maging nangungunang digital na katuwang sa pangangalaga ng kalusugan ng mga alaga sa buong rehiyon, na nagtataguyod sa kagalingan ng mga aso at pusa sa pamamagitan ng makabagong teknolohiya at mapagmahal na pagkalingang medikal.
                  </Text>
                </View>

                <View style={[styles.ruleCard, { backgroundColor: isDarkMode ? '#252525' : '#f8faf9', borderColor: theme.border }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <FontAwesome5 name="hospital" size={18} color={isDarkMode ? '#EAF3DE' : '#2D5016'} style={{ marginRight: 10 }} />
                    <Text style={[styles.ruleTitle, { color: theme.sectionTitleColor, fontSize: 16 }]}>Impormasyon ng Klinika</Text>
                  </View>
                  <View style={{ marginTop: 5, gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FontAwesome5 name="map-marker-alt" size={14} color={isDarkMode ? '#7CB342' : '#2D5016'} style={{ width: 24 }} />
                      <Text style={{ fontSize: 13.5, color: theme.text, fontFamily: 'Montserrat-Medium', flex: 1, marginLeft: 10 }}>
                        Balingasag, Misamis Oriental, Philippines
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FontAwesome5 name="clock" size={14} color={isDarkMode ? '#7CB342' : '#2D5016'} style={{ width: 24 }} />
                      <Text style={{ fontSize: 13.5, color: theme.text, fontFamily: 'Montserrat-Medium', flex: 1, marginLeft: 10 }}>
                        Lunes - Sabado: 9:00 AM - 5:00 PM
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FontAwesome5 name="envelope" size={14} color={isDarkMode ? '#7CB342' : '#2D5016'} style={{ width: 24 }} />
                      <Text style={{ fontSize: 13.5, color: theme.text, fontFamily: 'Montserrat-Medium', flex: 1, marginLeft: 10 }}>
                        support@fureverpawcare.com
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Premium Stylized Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 24 }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderRadius: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 25, shadowOffset: { width: 0, height: 10 } }]}>
            <View style={{ alignItems: 'center', marginVertical: 15 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fed7d7', justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                <FontAwesome5 name="exclamation-triangle" size={28} color="#e53e3e" />
              </View>
              
              <Text style={[styles.modalTitle, { fontSize: 20, color: '#e53e3e' }]}>
                {language === 'en' ? 'Confirm Logout' : 'Kumpirmahin ang Pag-logout'}
              </Text>
              
              <Text style={[styles.modalSubtitle, { fontSize: 14, color: theme.subtext, marginTop: 10, marginBottom: 20, paddingHorizontal: 10, lineHeight: 20 }]}>
                {language === 'en' 
                  ? 'Are you sure you want to log out of your FurEverPawCare account?' 
                  : 'Sigurado ka ba na gusto mong mag-logout sa iyong FurEverPawCare account?'}
              </Text>

              <View style={{ width: '100%', gap: 10 }}>
                <TouchableOpacity 
                  style={{
                    backgroundColor: '#e53e3e',
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                  onPress={async () => {
                    setIsLogoutModalVisible(false);
                    try {
                      await AsyncStorage.removeItem('@user_profile');
                      updateUser({
                        id: '',
                        fullName: '',
                        email: '',
                        phoneNumber: '',
                        avatarUri: null,
                      });
                      navigation.replace('PetOwnerTabs');
                    } catch (e) {
                      console.error('Failed to log out', e);
                      navigation.replace('PetOwnerTabs');
                    }
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: 'Montserrat-Bold', color: 'white' }}>
                    {language === 'en' ? 'Yes, Log Out' : 'Oo, Mag-logout'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.closeModalButton,
                    {
                      backgroundColor: isDarkMode ? '#2d2d2d' : '#f7fafc',
                      borderColor: theme.border,
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      marginTop: 0
                    }
                  ]}
                  onPress={() => setIsLogoutModalVisible(false)}
                >
                  <Text style={{ fontSize: 16, fontFamily: 'Montserrat-SemiBold', color: theme.text }}>
                    {language === 'en' ? 'Cancel' : 'Kanselahin'}
                  </Text>
                </TouchableOpacity>
              </View>
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
    fontFamily: 'Montserrat-Bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#718096',
    textAlign: 'center',
    marginBottom: 25,
  },
  languageOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#f7fafc',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#edf2f7',
  },
  languageOptionRowSelected: {
    backgroundColor: '#EAF3DE',
    borderColor: '#7CB342',
  },
  languageOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  languageOptionText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#2d3748',
  },
  languageOptionSubtext: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#718096',
    marginTop: 2,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#7CB342',
  },
  radioButtonDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7CB342',
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
    fontFamily: 'Montserrat-SemiBold',
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
    fontFamily: 'Montserrat-SemiBold',
    color: '#2D5016',
    flex: 1,
  },
  ruleText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#4a5568',
    lineHeight: 18,
    paddingLeft: 26,
  },
});
