import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { scale, verticalScale, moderateScale, fontSize, wp, hp } from '../utils/responsive';

type Props = {
  navigation: any;
};

export default function GuestRestriction({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { t, language } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        
        {/* Visual Premium Icon Group */}
        <View style={styles.iconContainer}>
          <View style={[styles.pawBg, { backgroundColor: isDarkMode ? '#1a2e1d' : '#f0fdf4' }]}>
            <FontAwesome5 name="paw" size={scale(100)} color={isDarkMode ? 'rgba(126,212,74,0.1)' : 'rgba(46,94,62,0.06)'} />
          </View>
          <View style={[styles.lockBadge, { backgroundColor: '#2E5E3E' }]}>
            <FontAwesome5 name="lock" size={scale(24)} color="#ffffff" />
          </View>
        </View>

        {/* Text Details */}
        <Text style={[styles.title, { color: theme.text }]}>
          {language === 'en' ? 'Unlock Full Access' : 'I-unlock ang Akses'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          {language === 'en' 
            ? 'This is a premium feature. Create a free account or log in to manage your appointments, view pet medical records, use telemedicine, and more.'
            : 'Ito ay isang natatanging tampok. Gumawa ng libreng account o mag-log in upang pamahalaan ang iyong mga appointment, tingnan ang mga rekord ng alaga, at iba pa.'}
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#2E5E3E' }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Login')}
          >
            <FontAwesome5 name="sign-in-alt" size={scale(16)} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>
              {language === 'en' ? 'Log In' : 'Mag-log In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: '#2E5E3E' }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Register')}
          >
            <FontAwesome5 name="user-plus" size={scale(14)} color="#2E5E3E" style={{ marginRight: 8 }} />
            <Text style={[styles.secondaryButtonText, { color: '#2E5E3E' }]}>
              {language === 'en' ? 'Create Account' : 'Gumawa ng Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: scale(340),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  },
  iconContainer: {
    position: 'relative',
    marginBottom: verticalScale(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawBg: {
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  lockBadge: {
    position: 'absolute',
    bottom: scale(5),
    right: scale(5),
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontFamily: 'Catcut',
    fontSize: fontSize(26),
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(15),
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: verticalScale(40),
  },
  buttonContainer: {
    width: '100%',
    gap: verticalScale(14),
  },
  primaryButton: {
    height: verticalScale(52),
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E5E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: fontSize(16),
    color: '#ffffff',
  },
  secondaryButton: {
    height: verticalScale(52),
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: fontSize(16),
  },
});
