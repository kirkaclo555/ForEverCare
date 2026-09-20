import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../../App';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>;
};

export default function MoreMenuScreen({ navigation }: Props) {
  const { t, language } = useLanguage();
  const { theme, isDarkMode } = useTheme();

  const menuOptions = [
    {
      id: 'pet-records',
      title: t('petRecords'),
      subtitle: language === 'en' ? 'Manage pet profiles and medical history' : 'Pamahalaan ang mga profile at kasaysayan ng alaga',
      icon: 'paw',
      color: '#38a169',
      bg: '#f0fff4',
      route: 'PetRecords' as const,
    },
    {
      id: 'pet-monitoring',
      title: t('petMonitoring'),
      subtitle: language === 'en' ? "Track your pet's health stats and vitals" : 'Subaybayan ang kalusugan at buhay ng iyong alaga',
      icon: 'heartbeat',
      color: '#805ad5',
      bg: '#faf5ff',
      route: 'PetMonitoring' as const,
    },
    {
      id: 'tutorials',
      title: t('petTutorials'),
      subtitle: language === 'en' ? 'Watch guides on training, grooming, and care' : 'Manood ng gabay sa pagsasanay at pangangalaga',
      icon: 'photo-video',
      color: '#3182ce',
      bg: '#ebf8ff',
      route: 'Tutorials' as const,
    },
    {
      id: 'feedback',
      title: t('giveFeedback'),
      subtitle: language === 'en' ? 'Tell us how we can improve our services' : 'Sabihin sa amin kung paano mapapabuti ang aming serbisyo',
      icon: 'comment-alt',
      color: '#d69e2e',
      bg: '#fffff0',
      route: 'Feedback' as const,
    },
    {
      id: 'settings',
      title: t('settings'),
      subtitle: language === 'en' ? 'App preferences and account security' : 'Kagustuhan sa app at seguridad ng account',
      icon: 'cog',
      color: '#4a5568',
      bg: '#edf2f7',
      route: 'Settings' as const,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation?.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{t('more')}</Text>
        </View>
      </View>
      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.sectionTitleColor }]}>{language === 'en' ? 'Discover & Connect' : 'Tuklasin at Kumonekta'}</Text>
        <View style={styles.menuContainer}>
          {menuOptions.map(option => (
            <TouchableOpacity 
              key={option.id} 
              style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]} 
              onPress={() => navigation.navigate(option.route)}
            >
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : option.bg }]}>
                <FontAwesome5 name={option.icon} size={20} color={isDarkMode ? theme.sectionTitleColor : option.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: theme.text }]}>{option.title}</Text>
                <Text style={[styles.menuSubtitle, { color: theme.subtext }]}>{option.subtitle}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={16} color={isDarkMode ? '#718096' : '#cbd5e0'} />
            </TouchableOpacity>
          ))}
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
  mainScroll: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Catcut', color: '#4a5568', marginBottom: 15 },
  menuContainer: { gap: 15 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#2d3748', marginBottom: 4 },
  menuSubtitle: { fontSize: 13, color: '#718096', fontFamily: 'Montserrat-Regular' },
});
