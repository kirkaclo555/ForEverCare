import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  Image,
  Modal,
  Switch,
  Dimensions,
  RefreshControl,
  Platform,
  Vibration,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { usePetContext } from '../context/PetContext';
import { checkAllVaccineAlerts, dismissVaccineAlert, VaccineAlert } from '../utils/vaccineReminders';


type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Users: undefined;
  Appointments: undefined;
  Pets: undefined; // Old one for Monitor
  MyPets: undefined; // New one for PetRecords
  Monitor: undefined; // New one for PetMonitor
  Products: undefined;
  Telemedicine: undefined;
  Profile: undefined;
  AccountSecurity: undefined;
  More: { screen: string; initial?: boolean };
  Register: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const playMobileNotificationNotification = () => {
  try {
    // Premium Messenger-style arpeggiated dual vibration pulse
    Vibration.vibrate([0, 80, 50, 80]);
    
    // Play synthetic WebAudio chime if on web runtime
    if (Platform.OS === 'web') {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(830.61, ctx.currentTime);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.3);
        
        const delay = 0.08;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + delay);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + delay);
        osc2.stop(ctx.currentTime + delay + 0.4);
      }
    }
  } catch (e) {
    console.log('Mobile notification chime failed', e);
  }
};

export default function HomeScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { user } = useUser();
  const { t, language } = useLanguage();
  const { pets } = usePetContext();
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [isAllNotificationsVisible, setIsAllNotificationsVisible] = useState(false);
  const [vaccineAlerts, setVaccineAlerts] = useState<VaccineAlert[]>([]);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<{
    day: number;
    status: string;
    formattedDate: string;
    dateObj: Date;
  } | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
  const [isAllAnnouncementsVisible, setIsAllAnnouncementsVisible] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasSeenNotifications, setHasSeenNotifications] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const prevNotificationsRef = useRef<any[]>([]);

  const fetchAnnouncements = () => {
    const url = user?.id && user.id.trim() !== ''
      ? `${API_URL}/api/announcements?userId=${user.id}`
      : `${API_URL}/api/announcements`;
    return fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAnnouncements(data);
        }
      })
      .catch(err => console.error('Failed to fetch announcements:', err));
  };

  const handleReact = async (announcementId: string, type: 'HEART' | 'LIKE') => {
    if (!user?.id || user.id.trim() === '') {
      Alert.alert(
        language === 'en' ? 'Authentication Required' : 'Kinakailangan ang Pautentikasyon',
        language === 'en'
          ? 'Please log in or create an account to react to announcements.'
          : 'Mangyaring mag-log in o gumawa ng account upang mag-react sa mga balita.'
      );
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/announcements/${announcementId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, type })
      });
      const data = await res.json();
      if (data.success) {
        const response = await fetch(`${API_URL}/api/announcements?userId=${user?.id}`);
        const freshData = await response.json();
        if (Array.isArray(freshData)) {
          setAnnouncements(freshData);
          const updated = freshData.find(a => a.id === announcementId);
          if (updated) {
            setSelectedAnnouncement(updated);
          }
        }
      }
    } catch (err) {
      console.error('Failed to react to announcement:', err);
    }
  };

  const getNotificationMeta = (title: string = '', message: string = '') => {
    const combined = (title + ' ' + message).toLowerCase();

    // Vaccination / Immunization - subtle yellow/orange secondary accent
    if (combined.includes('vaccin') || combined.includes('shot') || combined.includes('immuniz') || combined.includes('deworm')) {
      return {
        type: 'vaccination',
        icon: 'syringe',
        iconColor: '#D97706',
        iconBg: '#FEF3C7',
      };
    }

    // Payment / Billing / Invoice - primary green
    if (combined.includes('payment') || combined.includes('paid') || combined.includes('bill') || combined.includes('invoice') || combined.includes('receipt') || combined.includes('fee')) {
      return {
        type: 'payment',
        icon: 'credit-card',
        iconColor: '#2E7D32',
        iconBg: '#EAF4E2',
      };
    }

    // Telemedicine / Video consultation
    if (combined.includes('telemedicine') || combined.includes('teleconsult') || combined.includes('video') || combined.includes('call')) {
      return {
        type: 'telemedicine',
        icon: 'video',
        iconColor: '#2E7D32',
        iconBg: '#EAF4E2',
      };
    }

    // Order / Shopping / Products / Store
    if (combined.includes('order') || combined.includes('cart') || combined.includes('product') || combined.includes('purchase') || combined.includes('item')) {
      return {
        type: 'order',
        icon: 'shopping-cart',
        iconColor: '#2E7D32',
        iconBg: '#EAF4E2',
      };
    }

    // Appointment / Booking / Reschedule
    if (combined.includes('appointment') || combined.includes('schedule') || combined.includes('booking') || combined.includes('visit') || combined.includes('consultation')) {
      return {
        type: 'appointment',
        icon: 'calendar-alt',
        iconColor: '#2E7D32',
        iconBg: '#EAF4E2',
      };
    }

    // Warnings / Cancellations / Urgent
    if (combined.includes('cancel') || combined.includes('warning') || combined.includes('urgent') || combined.includes('alert')) {
      return {
        type: 'warning',
        icon: 'exclamation-circle',
        iconColor: '#D97706',
        iconBg: '#FEF3C7',
      };
    }

    // Default general notification
    return {
      type: 'default',
      icon: 'bell',
      iconColor: '#2E7D32',
      iconBg: '#EAF4E2',
    };
  };

  const formatNotificationTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const fetchNotifications = () => {
    if (!user?.id || user.id.trim() === '') {
      setNotifications([]);
      setUnreadCount(0);
      return Promise.resolve();
    }
    return fetch(`${API_URL}/api/notifications?userId=${user?.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.notifications)) {
          const dynamicNotifications = data.notifications.map((notif: any) => {
            const meta = getNotificationMeta(notif.title, notif.message);
            return {
              id: notif.id,
              title: notif.title,
              desc: notif.message,
              time: formatNotificationTime(notif.createdAt),
              rawDate: notif.createdAt,
              icon: meta.icon,
              iconColor: meta.iconColor,
              iconBg: meta.iconBg,
              type: meta.type,
              isRead: notif.isRead
            };
          });

          // sound chime and vibrate when new unread notifications are received
          if (prevNotificationsRef.current.length > 0) {
            const hasNewUnread = dynamicNotifications.some((n: any) => 
              !n.isRead && !prevNotificationsRef.current.some((prev) => prev.id === n.id)
            );
            if (hasNewUnread) {
              playMobileNotificationNotification();
            }
          }

          prevNotificationsRef.current = dynamicNotifications;
          setNotifications(dynamicNotifications);
          setUnreadCount(dynamicNotifications.filter((n: any) => !n.isRead).length);
        }
      })
      .catch(err => console.error('Failed to fetch notifications:', err));
  };

  const handleOpenNotifications = () => {
    if (!user?.id || user.id.trim() === '') {
      Alert.alert(
        language === 'en' ? 'Authentication Required' : 'Kinakailangan ang Pautentikasyon',
        language === 'en'
          ? 'Please log in or create an account to view notifications.'
          : 'Mangyaring mag-log in o gumawa ng account upang makita ang mga abiso.'
      );
      return;
    }
    setIsNotificationsVisible(true);
    setHasSeenNotifications(true);
    fetch(`${API_URL}/api/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markAllRead', userId: user?.id })
    }).catch(err => console.error('Failed to mark notifications as read', err));
  };

  const handleCloseNotifications = () => {
    setIsNotificationsVisible(false);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationPress = (notif: any) => {
    const cleanTitle = (notif.title || '').replace(/^New Announcement:\s*/i, '').trim().toLowerCase();
    const matched = announcements.find(a => {
      const aTitle = (a.title || '').trim().toLowerCase();
      const aContent = (a.content || '').toLowerCase();
      const notifDesc = (notif.desc || '').replace('...', '').trim().toLowerCase();
      return aTitle === cleanTitle || (notifDesc && aContent.includes(notifDesc));
    });

    if (matched) {
      setSelectedAnnouncement(matched);
    } else {
      setSelectedAnnouncement({
        title: notif.title,
        content: notif.desc,
        date: notif.time,
        media: [],
        files: []
      });
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const screenWidth = Dimensions.get('window').width;

  const carouselRef = useRef<ScrollView>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselItems = [
    { img: require('../../assets/balingasag.jpg'), text: "Balingasag Dog and Cat Clinic" },
    { img: require('../../assets/balingasag2.jpg'), text: "Expert Care for Your Furry Friends" },
    { img: require('../../assets/balingasag3.jpg'), text: "Your Pet's Second Home" },
    { img: require('../../assets/balingasag4.jpg'), text: "Professional Veterinary Services" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1;
        if (carouselRef.current) {
          carouselRef.current.scrollTo({
            x: nextIndex * (screenWidth - 30),
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [screenWidth]);

  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [disabledTimeSlots, setDisabledTimeSlots] = useState<Record<string, {time: string, enabled: boolean}[]>>({});

  const [refreshing, setRefreshing] = useState(false);

  const fetchCalendarData = () => {
    const p1 = fetch(`${API_URL}/api/timeslots?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          setDisabledTimeSlots(data);
        }
      })
      .catch(err => console.error('Failed to fetch timeslots:', err));

    const p2 = fetch(`${API_URL}/api/appointments`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setAllAppointments(data);
        }
      })
      .catch(err => console.error('Failed to fetch appointments:', err));

    return Promise.all([p1, p2]);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchNotifications(), fetchCalendarData(), fetchAnnouncements()]).finally(() => {
      setRefreshing(false);
    });
  }, [user]);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  // Derived calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getBookedTimesForDate = (formattedDate: string) => {
    const ALL_TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
    const booked = allAppointments
      .filter(a => a.date === formattedDate && a.status?.toLowerCase() !== 'cancelled')
      .map(a => a.time);
    
    const disabledForDate = disabledTimeSlots[formattedDate] || [];
    const disabled = disabledForDate.filter(s => !s.enabled).map(s => s.time);

    // Add past slots for today
    const today = new Date();
    const yearVal = today.getFullYear();
    const monthVal = String(today.getMonth() + 1).padStart(2, '0');
    const dayVal = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yearVal}-${monthVal}-${dayVal}`;

    const pastSlots: string[] = [];
    if (formattedDate === todayStr) {
      ALL_TIME_SLOTS.forEach(t => {
        const match = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const ampm = match[3].toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;

          const currentHours = today.getHours();
          const currentMinutes = today.getMinutes();
          if (hours < currentHours || (hours === currentHours && minutes <= currentMinutes)) {
            pastSlots.push(t);
          }
        }
      });
    }

    return Array.from(new Set([...booked, ...disabled, ...pastSlots]));
  };

  const getFullyBookedDates = () => {
    const bookedDates: number[] = [];
    const ALL_TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
    for (let i = 1; i <= daysInMonth; i++) {
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const totalUnavailable = getBookedTimesForDate(formattedDate).length;
      if (totalUnavailable >= ALL_TIME_SLOTS.length) {
        bookedDates.push(i);
      }
    }
    return bookedDates;
  };

  const fullyBookedDates = getFullyBookedDates();

  const renderCalendarDays = () => {
    const days = [];
    // Calculate required slots dynamically to avoid empty footer rows
    const totalSlots = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;

    const today = new Date();
    const isCurrentPhysicalMonth = today.getFullYear() === year && today.getMonth() === month;
    const isPastMonth = year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());

    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - startDayOfWeek + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

      let status = 'available';
      if (isPastMonth || (isCurrentPhysicalMonth && dayNumber < today.getDate())) {
        status = 'past';
      } else if (fullyBookedDates.includes(dayNumber)) {
        status = 'booked';
      }
      
      const isToday = isCurrentPhysicalMonth && dayNumber === today.getDate();

      if (!isCurrentMonth) {
        days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
      } else {
        days.push(
          <TouchableOpacity
            key={`day-${dayNumber}`}
            style={styles.calendarDay}
            onPress={() => {
              const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
              setSelectedCalendarDay({
                day: dayNumber,
                status,
                formattedDate,
                dateObj: new Date(year, month, dayNumber)
              });
            }}
          >
            <View style={[
              styles.calendarDayInner,
              status === 'booked' ? styles.calendarDayInnerBooked :
                status === 'past' ? styles.calendarDayInnerPast : styles.calendarDayInnerAvailable,
              isToday && styles.calendarDayInnerToday,
              isDarkMode && { backgroundColor: status === 'booked' ? '#5a1f1f' : status === 'past' ? '#222' : '#223e15' }
            ]}>
              <Text style={[
                styles.calendarDayText,
                status === 'booked' ? styles.calendarDayTextBooked :
                  status === 'past' ? styles.calendarDayTextPast : styles.calendarDayTextAvailable,
                isDarkMode && { color: status === 'booked' ? '#feb7b7' : status === 'past' ? '#718096' : '#d4edba' }
              ]}>
                {dayNumber}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }
    }
    return days;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        {/* Decorative Circles */}
        <View style={styles.headerDecoCircle1} />
        <View style={styles.headerDecoCircle2} />

        <View style={[styles.headerLeft, { flex: 1, paddingRight: 10, zIndex: 1 }]}>
          {user?.id && user.id.trim() !== '' ? (
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
              {user.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} style={{ width: '100%', height: '100%', borderRadius: 22 }} />
              ) : (
                <Text style={styles.avatarText}>
                  {user.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }]}>
              <FontAwesome5 name="user" size={16} color="white" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTitle} numberOfLines={1}>
              {(!user?.id || user.id.trim() === '')
                ? (language === 'en' ? 'Welcome, Guest!' : 'Mabuhay, Panauhin!')
                : `${language === 'en' ? 'Welcome' : 'Mabuhay'}, ${user.fullName.split(' ')[0] || t('petParent')}`}
            </Text>
            <Text style={styles.greetingSubtitle} numberOfLines={1}>
              {(!user?.id || user.id.trim() === '')
                ? (language === 'en' ? 'Sign in to unlock all features' : 'Mag-sign in upang i-unlock ang lahat')
                : (language === 'en' ? "Let's check in on your furry babies" : 'Kamustahin natin ang iyong mga alaga')}
            </Text>
          </View>
        </View>

        <View style={[styles.headerRight, { zIndex: 1 }]}>
          <TouchableOpacity style={styles.iconButton} onPress={handleOpenNotifications}>
            <FontAwesome5 name="bell" size={16} color="white" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.mainScroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3a7d55']} />
        }
      >

        {(!user?.id || user.id.trim() === '') && (
          <View style={[styles.guestCtaCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.guestCtaHeader}>
              <View style={[styles.guestCtaIconContainer, { backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE' }]}>
                <FontAwesome5 name="heartbeat" size={20} color={isDarkMode ? '#EAF3DE' : '#2D5016'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.guestCtaTitle, { color: theme.text }]}>
                  {language === 'en' ? 'Get the Full Experience' : 'Karanasan ang Buong Serbisyo'}
                </Text>
                <Text style={[styles.guestCtaDesc, { color: theme.subtext }]}>
                  {language === 'en' 
                    ? 'Log in or sign up to book appointments, access telemedicine consultations, track pet health vitals, and more!'
                    : 'Mag-log in o mag-sign up para mag-book ng appointment, makipag-telekonsulta, subaybayan ang kalusugan ng alaga, at iba pa!'}
                </Text>
              </View>
            </View>
            <View style={styles.guestCtaButtonsRow}>
              <TouchableOpacity 
                style={[styles.guestCtaLoginBtn, { backgroundColor: '#2E5E3E' }]} 
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.guestCtaLoginBtnText}>{language === 'en' ? 'Log In' : 'Mag-log In'}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.guestCtaRegisterBtn, { borderColor: '#2E5E3E' }]} 
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={[styles.guestCtaRegisterBtnText, { color: '#2E5E3E' }]}>{language === 'en' ? 'Sign Up' : 'Mag-sign Up'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Announcements Section - Top */}

        <View style={{ marginBottom: 25 }}>
          <View style={{ borderRadius: 16, overflow: 'hidden' }}>
            <ScrollView 
              ref={carouselRef}
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              style={{ width: screenWidth - 30 }}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 30));
                setCurrentImageIndex(newIndex);
              }}
            >
              {carouselItems.map((item, index) => (
                <View key={index} style={{ width: screenWidth - 30 }}>
                  <View style={styles.imageCardWrapper}>
                    <Image source={item.img ? item.img : { uri: (item as any).uri }} style={styles.clinicImage} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.85)']}
                      style={styles.imageOverlayGradient}
                    >
                      <Text style={styles.clinicImageCaption}>{item.text}</Text>
                    </LinearGradient>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <FontAwesome5 name="bullhorn" size={16} color={isDarkMode ? theme.sectionTitleColor : "#7CB342"} style={styles.sectionHeaderIcon} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('announcements')}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsAllAnnouncementsVisible(true)}>
              <Text style={styles.viewAllText}>{language === 'en' ? 'See all' : 'Tingnan lahat'}</Text>
            </TouchableOpacity>
          </View>

                    {announcements.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: '#9CA3AF', fontFamily: 'Poppins-Regular', fontSize: 13 }}>{t('noAnnouncements')}</Text>
            </View>
          ) : (
            announcements.slice(0, 2).map((announcement, idx) => (
              <TouchableOpacity 
                key={announcement.id}
                style={[styles.announcementCard, { backgroundColor: theme.card, borderColor: theme.border }, idx === announcements.slice(0, 2).length - 1 ? { borderBottomWidth: 0, marginBottom: 0 } : {}]}
                onPress={() => setSelectedAnnouncement(announcement)}
              >
                <View style={[styles.announcementIconTile, { backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE' }]}>
                  <FontAwesome5 name="bullhorn" size={16} color={isDarkMode ? '#EAF3DE' : '#7CB342'} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[styles.announcementTitle, { color: theme.text }]} numberOfLines={1}>{announcement.title}</Text>
                    {idx === 0 && <View style={styles.announcementBadge}><Text style={styles.announcementBadgeText}>{language === 'en' ? 'LATEST' : 'PINAKABAGO'}</Text></View>}
                  </View>
                  <Text style={[styles.announcementDesc, { color: theme.subtext }]} numberOfLines={2}>{announcement.content}</Text>
                  
                  {/* Attachment indicators */}
                  {(announcement.media?.length > 0 || announcement.files?.length > 0) && (
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 4 }}>
                      {announcement.media?.length > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <FontAwesome5 name="image" size={10} color="#7CB342" />
                          <Text style={{ fontSize: 10, color: '#7CB342', fontWeight: '600' }}>
                            {announcement.media.length} {language === 'en' ? 'media' : 'larawan'}
                          </Text>
                        </View>
                      )}
                      {announcement.files?.length > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <FontAwesome5 name="paperclip" size={10} color="#3182CE" />
                          <Text style={{ fontSize: 10, color: '#3182CE', fontWeight: '600' }}>
                            {announcement.files.length} {language === 'en' ? 'files' : 'dokumento'}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.announcementDate}>{announcement.date}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Text style={{ fontSize: 11, color: '#718096' }}>❤️ {announcement.hearts}</Text>
                      <Text style={{ fontSize: 11, color: '#718096' }}>👍 {announcement.likes}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>


        {/* Calendar Section */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border, padding: 12 }]}>
          <View style={{ marginBottom: 15, alignItems: 'center' }}>
            <View style={[styles.sectionTitleRow, { marginBottom: 15, alignSelf: 'center' }]}>
              <FontAwesome5 name="calendar-alt" size={16} color={isDarkMode ? theme.sectionTitleColor : "#7CB342"} style={styles.sectionHeaderIcon} />
              <Text style={[styles.sectionTitle, { fontSize: 14, color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
                {language === 'en' ? 'Appointment Availability' : 'Bakanteng Iskedyul'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
              <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 8, backgroundColor: isDarkMode ? '#2d2d2d' : '#edf2f7', borderRadius: 8 }}>
                <FontAwesome5 name="chevron-left" size={14} color={isDarkMode ? '#cbd5e0' : '#4a5568'} />
              </TouchableOpacity>
              <Text style={[styles.viewAllText, { fontSize: 14, width: 120, textAlign: 'center', color: theme.text }]}>{currentMonthName}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={{ padding: 8, backgroundColor: isDarkMode ? '#2d2d2d' : '#edf2f7', borderRadius: 8 }}>
                <FontAwesome5 name="chevron-right" size={14} color={isDarkMode ? '#cbd5e0' : '#4a5568'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: isDarkMode ? '#333' : '#E8E8E8' }]} />
              <Text style={[styles.legendText, { color: theme.subtext }]}>{language === 'en' ? 'Past' : 'Nakalipas'}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#D4EDBA' }]} />
              <Text style={[styles.legendText, { color: theme.subtext }]}>{language === 'en' ? 'Available' : 'Pwede pa'}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FECACA' }]} />
              <Text style={[styles.legendText, { color: theme.subtext }]}>{language === 'en' ? 'Fully Booked' : 'Puno na'}</Text>
            </View>
          </View>

          <View style={[styles.calendarGrid, { backgroundColor: theme.card }]}>
            <View style={styles.calendarHeaderRow}>
              {(language === 'en' ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['Li', 'Lu', 'Ma', 'Mi', 'Hu', 'Bi', 'Sa']).map((d, i) => (
                <Text key={i} style={styles.calendarDayHeader}>{d}</Text>
              ))}
            </View>
            <View style={styles.calendarDaysContainer}>
              {renderCalendarDays()}
            </View>
          </View>
        </View>

        <View style={styles.quickNavGrid}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('quickActions')}</Text>
          <View style={styles.quickNavRow}>
            <TouchableOpacity style={[styles.navCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => navigation.navigate('Appointments')}>
              <View style={[styles.navCardIconTile, { backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE' }]}>
                <FontAwesome5 name="calendar-alt" size={24} color={isDarkMode ? '#EAF3DE' : '#7CB342'} />
              </View>
              <Text style={[styles.navCardText, { color: theme.text }]}>{language === 'en' ? 'My Appointments' : 'Aking Appointments'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => navigation.navigate('More', { screen: 'PetRecords', initial: false })}>
              <View style={[styles.navCardIconTile, { backgroundColor: isDarkMode ? '#3a2b0f' : '#FEF3C7' }]}>
                <FontAwesome5 name="paw" size={24} color={isDarkMode ? '#FEF3C7' : '#D97706'} />
              </View>
              <Text style={[styles.navCardText, { color: theme.text }]}>{language === 'en' ? 'My Pets' : 'Aking mga Alaga'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>



      {/* Notifications Modal Component */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isNotificationsVisible}
        onRequestClose={handleCloseNotifications}
      >
        {/* Full-screen dismiss layer */}
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }}
          activeOpacity={1}
          onPressOut={handleCloseNotifications}
        >
          {/* Popover panel anchored to top-right, below bell icon */}
          <TouchableWithoutFeedback>
            <View
              style={{
                position: 'absolute',
                top: 72,
                right: 12,
                width: 318,
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.14,
                shadowRadius: 20,
                elevation: 10,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              {/* Upward-pointing caret arrow — points to the bell icon */}
              <View
                style={{
                  position: 'absolute',
                  top: -9,
                  right: 18,
                  width: 16,
                  height: 16,
                  backgroundColor: '#FFFFFF',
                  transform: [{ rotate: '45deg' }],
                  borderLeftWidth: 1,
                  borderTopWidth: 1,
                  borderColor: '#E5E7EB',
                  zIndex: 1,
                }}
              />

              {/* Notifications Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingTop: 16,
                  paddingBottom: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: '#EAF4E2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    <FontAwesome5 name="bell" size={14} color="#2E7D32" />
                  </View>
                  <Text style={{ fontSize: 15, fontFamily: 'Montserrat-Bold', color: '#1F2937' }}>
                    Notifications
                  </Text>
                  {unreadCount > 0 && (
                    <View
                      style={{
                        marginLeft: 7,
                        backgroundColor: '#EAF4E2',
                        paddingHorizontal: 7,
                        paddingVertical: 1,
                        borderRadius: 9,
                      }}
                    >
                      <Text style={{ color: '#2E7D32', fontSize: 11, fontFamily: 'Montserrat-Bold' }}>
                        {unreadCount}
                      </Text>
                    </View>
                  )}
                </View>

                {/* X close button */}
                <TouchableOpacity
                  onPress={handleCloseNotifications}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome5 name="times" size={12} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Notification Items */}
              {notifications.length === 0 ? (
                <View style={{ paddingVertical: 28, paddingHorizontal: 16, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#EAF4E2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <FontAwesome5 name="bell" size={18} color="#2E7D32" />
                  </View>
                  <Text style={{ color: '#1F2937', fontSize: 14, fontFamily: 'Montserrat-Bold', marginBottom: 3 }}>
                    No notifications
                  </Text>
                  <Text style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Montserrat-Regular', textAlign: 'center' }}>
                    You're all caught up!
                  </Text>
                </View>
              ) : (
                <View>
                  <ScrollView
                    style={{ maxHeight: Dimensions.get('window').height * 0.48 }}
                    showsVerticalScrollIndicator={false}
                  >
                    {notifications.slice(0, 5).map((notif, index) => {
                      const displayLimit = Math.min(notifications.length, 5);
                      const isLast = index === displayLimit - 1;
                      const isUnread = !notif.isRead;

                      return (
                        <TouchableOpacity
                          key={notif.id || index}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: '#FFFFFF',
                            borderBottomWidth: isLast ? 0 : 1,
                            borderBottomColor: '#E5E7EB',
                          }}
                          activeOpacity={0.7}
                          onPress={() => {
                            handleCloseNotifications();
                            handleNotificationPress(notif);
                          }}
                        >
                          {/* Circular icon */}
                          <View
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 19,
                              backgroundColor: notif.iconBg || '#EAF4E2',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 10,
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          >
                            <FontAwesome5
                              name={notif.icon || 'bell'}
                              size={15}
                              color={notif.iconColor || '#2E7D32'}
                            />
                          </View>

                          {/* Text */}
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: isUnread ? 'Montserrat-Bold' : 'Montserrat-SemiBold',
                                  color: '#1F2937',
                                  flex: 1,
                                }}
                                numberOfLines={1}
                              >
                                {notif.title || 'Notification'}
                              </Text>
                              {/* Green unread dot */}
                              {isUnread && (
                                <View
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 3.5,
                                    backgroundColor: '#2E7D32',
                                    marginLeft: 6,
                                    alignSelf: 'center',
                                  }}
                                />
                              )}
                            </View>

                            <Text
                              style={{
                                fontSize: 12,
                                color: '#374151',
                                fontFamily: isUnread ? 'Montserrat-Medium' : 'Montserrat-Regular',
                                lineHeight: 17,
                                marginBottom: 3,
                              }}
                              numberOfLines={2}
                            >
                              {notif.desc}
                            </Text>

                            <Text style={{ fontSize: 10, color: '#6B7280', fontFamily: 'Montserrat-Regular' }}>
                              {notif.time}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* View All Button */}
                  <TouchableOpacity
                    style={{
                      paddingVertical: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderTopWidth: 1,
                      borderTopColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }}
                    onPress={() => {
                      handleCloseNotifications();
                      setIsAllNotificationsVisible(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: '#2E7D32', fontSize: 12, fontFamily: 'Montserrat-Bold' }}>
                      View All Notifications →
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* All Notifications Modal Component */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isAllNotificationsVisible}
        onRequestClose={() => setIsAllNotificationsVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingHorizontal: 20, 
            paddingVertical: 16, 
            backgroundColor: '#2E7D32', 
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <TouchableOpacity 
              onPress={() => setIsAllNotificationsVisible(false)} 
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome5 name="arrow-left" size={16} color="white" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontFamily: 'Montserrat-Bold', color: 'white' }}>Notifications</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* List */}
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#EAF4E2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <FontAwesome5 name="bell-slash" size={24} color="#2E7D32" />
                </View>
                <Text style={{ color: '#1F2937', fontSize: 16, fontFamily: 'Montserrat-Bold', marginBottom: 4 }}>No notifications yet</Text>
                <Text style={{ color: '#6B7280', fontSize: 13, fontFamily: 'Montserrat-Regular' }}>All your clinic alerts will appear here</Text>
              </View>
            ) : (
              notifications.map((notif, index) => {
                const isUnread = !notif.isRead;
                return (
                  <TouchableOpacity 
                    key={notif.id || index} 
                    style={{ 
                      flexDirection: 'row',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 2,
                      alignItems: 'flex-start'
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                      setIsAllNotificationsVisible(false);
                      handleNotificationPress(notif);
                    }}
                  >
                    <View style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 22, 
                      backgroundColor: notif.iconBg || '#EAF4E2',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: 14,
                      marginTop: 2,
                    }}>
                      <FontAwesome5 name={notif.icon || 'bell'} size={18} color={notif.iconColor || '#2E7D32'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 15, fontFamily: isUnread ? 'Montserrat-Bold' : 'Montserrat-SemiBold', color: '#1F2937', flex: 1 }} numberOfLines={1}>
                          {notif.title || 'Notification'}
                        </Text>
                        {isUnread && (
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2E7D32', marginLeft: 8, alignSelf: 'center' }} />
                        )}
                      </View>
                      <Text style={{ fontSize: 13, color: '#1F2937', fontFamily: isUnread ? 'Montserrat-Medium' : 'Montserrat-Regular', lineHeight: 18, marginBottom: 6 }}>
                        {notif.desc}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#6B7280', fontFamily: 'Montserrat-Regular' }}>
                        {notif.time}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

            {/* Announcement Modal Component */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedAnnouncement}
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setSelectedAnnouncement(null)}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, position: 'relative', width: '90%', padding: 25 }]}>
            <View style={[styles.modalHeader, { marginBottom: 15 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.modalTitle, { fontSize: 18, color: isDarkMode ? theme.text : '#2D5016' }]}>{selectedAnnouncement?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedAnnouncement(null)} style={{ alignSelf: 'flex-start' }}>
                <FontAwesome5 name="times" size={18} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={{ fontSize: 14, color: theme.subtext, lineHeight: 22, marginBottom: 20 }}>
                {selectedAnnouncement?.content || selectedAnnouncement?.desc}
              </Text>

              {/* Attached Media Previews */}
              {selectedAnnouncement?.media && selectedAnnouncement.media.length > 0 && (
                <View style={{ marginTop: 15, marginBottom: 15 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 8, fontFamily: 'Poppins-Regular' }}>Attached Media:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                    {selectedAnnouncement.media.map((m: any, idx: number) => {
                      const fullUrl = m.url.startsWith('http') ? m.url : `${API_URL}${m.url}`;
                      return (
                        <Image 
                          key={idx} 
                          source={{ uri: fullUrl }} 
                          style={{ width: 120, height: 120, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: theme.border }} 
                          resizeMode="cover"
                        />
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Attached Files List */}
              {selectedAnnouncement?.files && selectedAnnouncement.files.length > 0 && (
                <View style={{ marginTop: 15, marginBottom: 15 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 8, fontFamily: 'Poppins-Regular' }}>Attached Files:</Text>
                  {selectedAnnouncement.files.map((f: any, idx: number) => {
                    const fullUrl = f.url.startsWith('http') ? f.url : `${API_URL}${f.url}`;
                    return (
                      <TouchableOpacity 
                        key={idx} 
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#1a2b3c' : '#EBF8FF', padding: 10, borderRadius: 8, gap: 8, marginBottom: 6, borderWidth: 1, borderColor: isDarkMode ? '#2b6cb0' : '#BEE3F8' }}
                        onPress={() => console.log('Downloading file:', fullUrl)}
                      >
                        <FontAwesome5 name="paperclip" size={14} color="#3182CE" />
                        <Text style={{ fontSize: 13, color: isDarkMode ? '#90cdf4' : '#2B6CB0', fontWeight: '500', flex: 1 }} numberOfLines={1}>{f.name}</Text>
                        <FontAwesome5 name="download" size={12} color="#3182CE" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 15, marginTop: 5 }}>
              <Text style={{ fontSize: 12, color: theme.subtext }}>{selectedAnnouncement?.date}</Text>
            </View>

            {/* Reactions Bar */}
            {selectedAnnouncement?.id && (
              <View style={{ flexDirection: 'row', gap: 15, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 15, marginTop: 15 }}>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: selectedAnnouncement?.userReaction === 'HEART' ? (isDarkMode ? '#5c1a1a' : '#FEE2E2') : (isDarkMode ? '#2d2d2d' : '#F3F4F6'), paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, gap: 8 }}
                  onPress={() => handleReact(selectedAnnouncement.id, 'HEART')}
                >
                  <Text style={{ fontSize: 16 }}>❤️</Text>
                  <Text style={{ color: selectedAnnouncement?.userReaction === 'HEART' ? '#EF4444' : theme.subtext, fontWeight: '600', fontSize: 12 }}>
                    {selectedAnnouncement?.hearts || 0}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: selectedAnnouncement?.userReaction === 'LIKE' ? (isDarkMode ? '#5c4a1a' : '#FEF3C7') : (isDarkMode ? '#2d2d2d' : '#F3F4F6'), paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, gap: 8 }}
                  onPress={() => handleReact(selectedAnnouncement.id, 'LIKE')}
                >
                  <Text style={{ fontSize: 16 }}>👍</Text>
                  <Text style={{ color: selectedAnnouncement?.userReaction === 'LIKE' ? '#D97706' : theme.subtext, fontWeight: '600', fontSize: 12 }}>
                    {selectedAnnouncement?.likes || 0}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

            {/* All Announcements Modal Component */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAllAnnouncementsVisible}
        onRequestClose={() => setIsAllAnnouncementsVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingHorizontal: 20, 
            paddingVertical: 15, 
            backgroundColor: theme.headerBackground, 
            justifyContent: 'space-between' 
          }}>
            <TouchableOpacity onPress={() => setIsAllAnnouncementsVisible(false)} style={{ padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontFamily: 'Catcut', color: 'white' }}>All Announcements</Text>
            <View style={{ width: 30 }} />
          </View>
          <ScrollView style={{ paddingHorizontal: 20 }}>
            {announcements.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: theme.subtext, fontSize: 14 }}>No announcements available</Text>
              </View>
            ) : (
              announcements.map((announcement) => (
                <TouchableOpacity 
                  key={announcement.id}
                  style={[styles.announcementCard, { borderBottomWidth: 0, marginBottom: 15, backgroundColor: theme.card, padding: 15, borderRadius: 12, borderColor: theme.border, borderWidth: 1 }]}
                  onPress={() => setSelectedAnnouncement(announcement)}
                >
                  <View style={[styles.announcementIconTile, { backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE' }]}>
                    <FontAwesome5 name="bullhorn" size={16} color="#7CB342" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={[styles.announcementTitle, { color: theme.text }]} numberOfLines={1}>{announcement.title}</Text>
                    </View>
                    <Text style={[styles.announcementDesc, { color: theme.subtext }]} numberOfLines={2}>{announcement.content}</Text>
                    
                    {/* Attachment indicators */}
                    {(announcement.media?.length > 0 || announcement.files?.length > 0) && (
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 4 }}>
                        {announcement.media?.length > 0 && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <FontAwesome5 name="image" size={10} color="#7CB342" />
                            <Text style={{ fontSize: 10, color: '#7CB342', fontWeight: '600' }}>{announcement.media.length} media</Text>
                          </View>
                        )}
                        {announcement.files?.length > 0 && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <FontAwesome5 name="paperclip" size={10} color="#3182CE" />
                            <Text style={{ fontSize: 10, color: '#3182CE', fontWeight: '600' }}>{announcement.files.length} files</Text>
                          </View>
                        )}
                      </View>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.announcementDate, { color: theme.subtext }]}>{announcement.date}</Text>
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Text style={{ fontSize: 11, color: theme.subtext }}>❤️ {announcement.hearts}</Text>
                        <Text style={{ fontSize: 11, color: theme.subtext }}>👍 {announcement.likes}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Calendar Day Availability Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedCalendarDay}
        onRequestClose={() => setSelectedCalendarDay(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPressOut={() => setSelectedCalendarDay(null)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card, width: '85%', padding: 24, borderRadius: 20 }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { marginBottom: 15 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.modalTitle, { fontSize: 18, color: isDarkMode ? theme.text : '#2D5016', fontWeight: '700' }]}>
                  {selectedCalendarDay?.dateObj.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={{ fontSize: 13, color: theme.subtext, marginTop: 2 }}>Daily Appointment Availability</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCalendarDay(null)} style={{ alignSelf: 'flex-start' }}>
                <FontAwesome5 name="times" size={18} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={{ maxHeight: 320, marginBottom: 10 }} showsVerticalScrollIndicator={false}>
              {selectedCalendarDay?.status === 'past' ? (
                <View style={{ alignItems: 'center', paddingVertical: 20, gap: 10 }}>
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: isDarkMode ? '#2d2d2d' : '#EDF2F7', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="history" size={20} color={theme.subtext} />
                  </View>
                  <Text style={{ fontSize: 14, color: theme.subtext, fontWeight: '500', textAlign: 'center' }}>
                    This date is in the past. You cannot schedule appointments for past dates.
                  </Text>
                </View>
              ) : (
                <View style={{ paddingVertical: 10 }}>
                  {selectedCalendarDay?.status === 'booked' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#5a1f1f' : '#FED7D7', padding: 12, borderRadius: 10, gap: 8, marginBottom: 15 }}>
                      <FontAwesome5 name="ban" size={14} color="#E53E3E" />
                      <Text style={{ fontSize: 13, color: '#E53E3E', fontWeight: '700', flex: 1 }} numberOfLines={2}>
                        Fully Booked: All slots are taken on this date.
                      </Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 12 }}>
                    Daily Time Slots:
                  </Text>
                  
                  {(() => {
                    const ALL_TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
                    const unavailable = selectedCalendarDay ? getBookedTimesForDate(selectedCalendarDay.formattedDate) : [];

                    return (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
                        {ALL_TIME_SLOTS.map((slot, index) => {
                          const isUnavailable = unavailable.includes(slot);
                          return (
                            <View 
                              key={index}
                              style={{
                                backgroundColor: isUnavailable 
                                  ? (isDarkMode ? '#2d2d2d' : '#f7fafc') 
                                  : (isDarkMode ? '#1c330e' : '#EAF3DE'),
                                borderWidth: 1,
                                borderColor: isUnavailable 
                                  ? (isDarkMode ? '#3d3d3d' : '#edf2f7') 
                                  : (isDarkMode ? '#2E5E3E' : '#D4EDBA'),
                                borderRadius: 10,
                                paddingVertical: 10,
                                width: '47%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isUnavailable ? 0.65 : 1
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={{ 
                                  fontSize: 13, 
                                  color: isUnavailable 
                                    ? (isDarkMode ? '#718096' : '#a0aec0') 
                                    : (isDarkMode ? '#C6F6D5' : '#2D5016'), 
                                  fontWeight: '700',
                                  textDecorationLine: isUnavailable ? 'line-through' : 'none'
                                }}>
                                  {slot}
                                </Text>
                                {isUnavailable && (
                                  <FontAwesome5 name="lock" size={10} color={isDarkMode ? '#718096' : '#a0aec0'} />
                                )}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })()}
                </View>
              )}
            </ScrollView>

            {/* Bottom Actions */}
            {selectedCalendarDay?.status === 'available' && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#7CB342',
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 15,
                  flexDirection: 'row',
                  gap: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2
                }}
                onPress={() => {
                  setSelectedCalendarDay(null);
                  navigation.navigate('Appointments');
                }}
              >
                <FontAwesome5 name="calendar-check" size={16} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>
                  Book Appointment Now
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2D5016',
    borderBottomWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecoCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerDecoCircle2: {
    position: 'absolute',
    bottom: -30,
    right: 60,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    backgroundColor: '#EAF3DE',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#2D5016',
    fontSize: 16,
    fontFamily: 'Catcut',
  },
  greetingTitle: {
    fontFamily: 'Catcut',
    fontSize: 18,
    color: 'white',
  },
  greetingSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#EAF3DE',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F97316',
    width: 14,
    height: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  mainScroll: {
    flex: 1,
    padding: 15,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: 'Catcut',
    fontSize: 16,
    color: '#2D5016',
  },
  viewAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#7CB342',
  },
  announcementCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.07)',
    marginBottom: 8,
  },
  announcementIconTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  announcementBadge: {
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  announcementBadgeText: {
    color: '#2D5016',
    fontSize: 9,
    fontWeight: '700',
  },
  announcementTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#111827',
  },
  announcementDesc: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  announcementDate: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#9CA3AF',
  },
  imageCardWrapper: {
    width: '100%',
    backgroundColor: '#edf2f7',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  clinicImage: {
    width: '100%',
    height: 200,
  },
  imageOverlayGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    paddingTop: 40,
  },
  clinicImageCaption: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  quickNavGrid: {
    marginBottom: 0,
  },
  quickNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  navCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  navCardIconTile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  navCardText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#111827',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#6B7280',
  },
  calendarGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayHeader: {
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    fontSize: 11,
    color: '#9CA3AF',
  },
  calendarDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayEmpty: {
    width: '14.28%',
    aspectRatio: 1,
    backgroundColor: 'transparent',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  calendarDayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayInnerAvailable: {
    backgroundColor: '#D4EDBA',
  },
  calendarDayInnerBooked: {
    backgroundColor: '#FECACA',
  },
  calendarDayInnerPast: {
    backgroundColor: '#E8E8E8',
  },
  calendarDayInnerToday: {
    borderWidth: 2,
    borderColor: '#2D5016',
  },
  calendarDayText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  calendarDayTextAvailable: {
    color: '#2D5016',
  },
  calendarDayTextBooked: {
    color: '#DC2626',
  },
  calendarDayTextPast: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 24,
  },
  settingText: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: '#a0aec0',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  notificationItemText: {
    fontSize: 14,
    color: '#2d3748',
    lineHeight: 20,
  },
  notificationTimeText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
  },
  guestCtaCard: {
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  guestCtaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  guestCtaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCtaTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  guestCtaDesc: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  guestCtaButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  guestCtaLoginBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCtaLoginBtnText: {
    fontFamily: 'Montserrat-Bold',
    color: '#ffffff',
    fontSize: 14,
  },
  guestCtaRegisterBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCtaRegisterBtnText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  }
});
