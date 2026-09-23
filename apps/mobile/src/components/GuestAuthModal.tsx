import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
};

export default function GuestAuthModal({ visible, onClose, onLogin, onRegister }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { language } = useLanguage();

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: isDarkMode ? '#1a1f1b' : '#ffffff', transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Drag Handle */}
        <View style={[styles.dragHandle, { backgroundColor: isDarkMode ? '#3a4a3d' : '#e0e7e3' }]} />

        {/* Icon Area */}
        <View style={styles.iconArea}>
          <View style={[styles.iconRingOuter, { borderColor: isDarkMode ? '#2E5E3E40' : '#2E5E3E20' }]}>
            <View style={[styles.iconRingInner, { borderColor: isDarkMode ? '#2E5E3E60' : '#2E5E3E35' }]}>
              <LinearGradient
                colors={isDarkMode ? ['#1c3a24', '#2E5E3E'] : ['#3a7d52', '#2E5E3E']}
                style={styles.iconCircle}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome5 name="lock" size={scale(28)} color="#ffffff" />
              </LinearGradient>
            </View>
          </View>

          <FontAwesome5
            name="paw"
            size={scale(14)}
            color={isDarkMode ? '#2E5E3E50' : '#2E5E3E30'}
            style={styles.pawTopRight}
          />
          <FontAwesome5
            name="paw"
            size={scale(10)}
            color={isDarkMode ? '#2E5E3E40' : '#2E5E3E20'}
            style={styles.pawBottomLeft}
          />
        </View>

        {/* Text Content */}
        <Text style={[styles.title, { color: theme.text }]}>
          {language === 'en' ? 'Members Only Feature' : 'Para sa mga Miyembro'}
        </Text>

        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          {language === 'en'
            ? 'Log in or create a free account to access appointments, pet records, telemedicine, and more.'
            : 'Mag-log in o gumawa ng libreng account para ma-access ang appointments, rekord ng alaga, at iba pa.'}
        </Text>

        {/* Feature Pills */}
        <View style={styles.pillsRow}>
          {[
            { icon: 'calendar-check', label: language === 'en' ? 'Appointments' : 'Appointment' },
            { icon: 'file-medical', label: language === 'en' ? 'Pet Records' : 'Rekord' },
            { icon: 'video', label: language === 'en' ? 'Telemed' : 'Telemed' },
          ].map((item) => (
            <View
              key={item.icon}
              style={[
                styles.pill,
                { backgroundColor: isDarkMode ? '#1c3328' : '#edf7f0', borderColor: isDarkMode ? '#2E5E3E40' : '#2E5E3E25' },
              ]}
            >
              <FontAwesome5 name={item.icon} size={scale(11)} color="#2E5E3E" style={{ marginRight: 4 }} />
              <Text style={[styles.pillText, { color: isDarkMode ? '#7ec84a' : '#2E5E3E' }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity activeOpacity={0.85} onPress={onLogin} style={styles.loginBtnWrapper}>
            <LinearGradient
              colors={['#3a7d52', '#2E5E3E']}
              style={styles.loginBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome5 name="sign-in-alt" size={scale(15)} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.loginBtnText}>
                {language === 'en' ? 'Log In' : 'Mag-log In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onRegister}
            style={[
              styles.registerBtn,
              { borderColor: '#2E5E3E', backgroundColor: isDarkMode ? '#1c3328' : 'transparent' },
            ]}
          >
            <FontAwesome5 name="user-plus" size={scale(14)} color="#2E5E3E" style={{ marginRight: 8 }} />
            <Text style={[styles.registerBtnText, { color: '#2E5E3E' }]}>
              {language === 'en' ? 'Create Free Account' : 'Gumawa ng Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: theme.subtext }]}>
              {language === 'en' ? 'Maybe Later' : 'Mamaya Na Lang'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Platform.OS === 'ios' ? verticalScale(24) : verticalScale(12) }} />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandle: {
    width: scale(42),
    height: scale(5),
    borderRadius: scale(3),
    alignSelf: 'center',
    marginBottom: verticalScale(20),
  },
  iconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
    height: scale(120),
  },
  iconRingOuter: {
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRingInner: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawTopRight: {
    position: 'absolute',
    top: scale(4),
    right: scale(20),
    transform: [{ rotate: '25deg' }],
  },
  pawBottomLeft: {
    position: 'absolute',
    bottom: scale(4),
    left: scale(24),
    transform: [{ rotate: '-15deg' }],
  },
  title: {
    fontFamily: 'Catcut',
    fontSize: fontSize(22),
    textAlign: 'center',
    marginBottom: verticalScale(10),
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(13),
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: verticalScale(18),
    paddingHorizontal: moderateScale(4),
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(8),
    marginBottom: verticalScale(24),
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(5),
    borderRadius: scale(20),
    borderWidth: 1,
  },
  pillText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: fontSize(11),
  },
  buttonsContainer: {
    width: '100%',
    gap: verticalScale(10),
  },
  loginBtnWrapper: {
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    shadowColor: '#2E5E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtn: {
    height: verticalScale(52),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(14),
  },
  loginBtnText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: fontSize(16),
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  registerBtn: {
    height: verticalScale(52),
    borderRadius: moderateScale(14),
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: fontSize(15),
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  cancelText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: fontSize(13),
  },
});
