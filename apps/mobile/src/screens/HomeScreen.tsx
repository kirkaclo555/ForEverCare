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
  Dimensions,
  RefreshControl,
  Platform,
  Vibration,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { usePetContext } from '../context/PetContext';
import { checkAllVaccineAlerts, dismissVaccineAlert, VaccineAlert } from '../utils/vaccineReminders';

import HomeHeader from '../components/home/HomeHeader';
import QuickActionCard from '../components/home/QuickActionCard';
import ClinicBanner from '../components/home/ClinicBanner';
import AnnouncementCard from '../components/home/AnnouncementCard';
import AvailabilityCalendar from '../components/home/AvailabilityCalendar';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Users: undefined;
  Appointments: { openBooking?: boolean; selectedDate?: string } | undefined;
  Pets: undefined;
  MyPets: undefined;
  Monitor: undefined;
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
    Vibration.vibrate([0, 80, 50, 80]);
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
        osc2.frequency.setValueAtTime(1046.5, ctx.currentTime + delay);
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
  const insets = useSafeAreaInsets();
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
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const prevNotificationsRef = useRef<any[]>([]);

  // Announcements API logic
  const fetchAnnouncements = () => {
    setIsLoadingAnnouncements(true);
    const url =
      user?.id && user.id.trim() !== ''
        ? `${API_URL}/api/announcements?userId=${user.id}`
        : `${API_URL}/api/announcements`;
    return fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAnnouncements(data);
        }
      })
      .catch((err) => console.error('Failed to fetch announcements:', err))
      .finally(() => setIsLoadingAnnouncements(false));
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
        body: JSON.stringify({ userId: user.id, type }),
      });
      const data = await res.json();
      if (data.success) {
        const response = await fetch(`${API_URL}/api/announcements?userId=${user?.id}`);
        const freshData = await response.json();
        if (Array.isArray(freshData)) {
          setAnnouncements(freshData);
          const updated = freshData.find((a) => a.id === announcementId);
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

    if (
      combined.includes('vaccin') ||
      combined.includes('shot') ||
      combined.includes('immuniz') ||
      combined.includes('deworm')
    ) {
      return {
        type: 'vaccination',
        icon: 'medkit',
        iconColor: '#D97706',
        iconBg: '#FEF3C7',
      };
    }

    if (
      combined.includes('payment') ||
      combined.includes('paid') ||
      combined.includes('bill') ||
      combined.includes('invoice') ||
      combined.includes('receipt') ||
      combined.includes('fee')
    ) {
      return {
        type: 'payment',
        icon: 'card',
        iconColor: '#2E7D32',
        iconBg: '#EAF4E2',
      };
    }

    if (
      combined.includes('telemedicine') ||
      combined.includes('teleconsult') ||
      combined.includes('video') ||
      combined.includes('call')
    ) {
      return {
        type: 'telemedicine',
        icon: 'videocam',
        iconColor: '#2E7D32',
        iconBg: '#EAF4E2',
      };
    }

    if (
      combined.includes('order') ||
      combined.includes('cart') ||
      combined.includes('product') ||
      combined.includes('purchase') ||
      combined.includes('item')
    ) {
      return {
        type: 'order',
        icon: 'cart',
        iconColor: '#2E7D32',
        iconBg: '#EAF4E2',
      };
    }

    if (
      combined.includes('appointment') ||
      combined.includes('schedule') ||
      combined.includes('booking') ||
      combined.includes('visit') ||
      combined.includes('consultation')
    ) {
      return {
        type: 'appointment',
        icon: 'calendar',
        iconColor: '#2E7D32',
        iconBg: '#EAF4E2',
      };
    }

    if (
      combined.includes('cancel') ||
      combined.includes('warning') ||
      combined.includes('urgent') ||
      combined.includes('alert')
    ) {
      return {
        type: 'warning',
        icon: 'alert-circle',
        iconColor: '#D97706',
        iconBg: '#FEF3C7',
      };
    }

    return {
      type: 'default',
      icon: 'notifications',
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
      .then((res) => res.json())
      .then((data) => {
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
              isRead: notif.isRead,
            };
          });

          if (prevNotificationsRef.current.length > 0) {
            const hasNewUnread = dynamicNotifications.some(
              (n: any) =>
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
      .catch((err) => console.error('Failed to fetch notifications:', err));
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
    fetch(`${API_URL}/api/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markAllRead', userId: user?.id }),
    }).catch((err) => console.error('Failed to mark notifications as read', err));
  };

  const handleCloseNotifications = () => {
    setIsNotificationsVisible(false);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationPress = (notif: any) => {
    const cleanTitle = (notif.title || '')
      .replace(/^New Announcement:\s*/i, '')
      .trim()
      .toLowerCase();
    const matched = announcements.find((a) => {
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
        files: [],
      });
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [disabledTimeSlots, setDisabledTimeSlots] = useState<
    Record<string, { time: string; enabled: boolean }[]>
  >({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchCalendarData = () => {
    setIsLoadingCalendar(true);
    const p1 = fetch(`${API_URL}/api/timeslots?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object' && !data.error) {
          setDisabledTimeSlots(data);
        }
      })
      .catch((err) => console.error('Failed to fetch timeslots:', err));

    const p2 = fetch(`${API_URL}/api/appointments`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setAllAppointments(data);
        }
      })
      .catch((err) => console.error('Failed to fetch appointments:', err));

    return Promise.all([p1, p2]).finally(() => setIsLoadingCalendar(false));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchNotifications(), fetchCalendarData(), fetchAnnouncements()]).finally(() => {
      setRefreshing(false);
    });
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    fetchAnnouncements();
    fetchCalendarData();
  }, [user?.id]);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  // Derived calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getBookedTimesForDate = (formattedDate: string) => {
    const ALL_TIME_SLOTS = [
      '09:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '01:00 PM',
      '02:00 PM',
      '03:00 PM',
      '04:00 PM',
    ];
    const booked = allAppointments
      .filter((a) => a.date === formattedDate && a.status?.toLowerCase() !== 'cancelled')
      .map((a) => a.time);

    const disabledForDate = disabledTimeSlots[formattedDate] || [];
    const disabled = disabledForDate.filter((s) => !s.enabled).map((s) => s.time);

    const today = new Date();
    const yearVal = today.getFullYear();
    const monthVal = String(today.getMonth() + 1).padStart(2, '0');
    const dayVal = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yearVal}-${monthVal}-${dayVal}`;

    const pastSlots: string[] = [];
    if (formattedDate === todayStr) {
      ALL_TIME_SLOTS.forEach((t) => {
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
    const ALL_TIME_SLOTS = [
      '09:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '01:00 PM',
      '02:00 PM',
      '03:00 PM',
      '04:00 PM',
    ];
    for (let i = 1; i <= daysInMonth; i++) {
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(
        2,
        '0'
      )}`;
      const totalUnavailable = getBookedTimesForDate(formattedDate).length;
      if (totalUnavailable >= ALL_TIME_SLOTS.length) {
        bookedDates.push(i);
      }
    }
    return bookedDates;
  };

  const fullyBookedDates = getFullyBookedDates();

  // Upcoming appointments count
  const upcomingAppointmentsCount = allAppointments.filter((app: any) => {
    if (!user?.id && !user?.fullName && !user?.phoneNumber) return false;
    const isOwner =
      (user?.fullName && app.owner === user.fullName) ||
      (user?.phoneNumber && app.contact === user.phoneNumber) ||
      (user?.id && app.userId === user.id);
    const st = (app.status || 'pending').toLowerCase();
    return isOwner && (st === 'pending' || st === 'confirmed' || st === 'paid');
  }).length;

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#35501F" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 1. FIXED WELCOME HEADER */}
        <HomeHeader
          user={user}
          unreadCount={unreadCount}
          onPressAvatar={() => {
            if (user?.id && user.id.trim() !== '') {
              navigation.navigate('Profile');
            } else {
              navigation.navigate('Login');
            }
          }}
          onPressBell={handleOpenNotifications}
          language={language}
        />

        {/* MAIN SCROLLABLE CONTENT */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 70, 90) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#35501F']} />
          }
        >
          {/* Guest Greeting Banner Card (if not logged in) */}
          {(!user?.id || user.id.trim() === '') && (
            <View style={styles.guestCtaCard}>
              <View style={styles.guestCtaHeader}>
                <View style={styles.guestCtaIconBox}>
                  <Ionicons name="sparkles" size={18} color="#35501F" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guestCtaTitle}>
                    {language === 'en' ? 'Get the Full Experience' : 'Karanasan ang Buong Serbisyo'}
                  </Text>
                  <Text style={styles.guestCtaDesc}>
                    {language === 'en'
                      ? 'Sign in or sign up to book appointments, consult vets, and track health!'
                      : 'Mag-sign in o mag-sign up para mag-book, makipag-telekonsulta, at subaybayan ang alaga!'}
                  </Text>
                </View>
              </View>
              <View style={styles.guestCtaButtonsRow}>
                <TouchableOpacity
                  style={styles.guestCtaLoginBtn}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.guestCtaLoginBtnText}>
                    {language === 'en' ? 'Log In' : 'Mag-log In'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.guestCtaRegisterBtn}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.guestCtaRegisterBtnText}>
                    {language === 'en' ? 'Sign Up' : 'Mag-sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 2. QUICK ACTIONS (Moved to top under header) */}
          <QuickActionCard
            upcomingAppointmentsCount={upcomingAppointmentsCount}
            petsCount={pets.length}
            onPressAppointments={() => navigation.navigate('Appointments')}
            onPressPets={() =>
              navigation.navigate('More', { screen: 'PetRecords', initial: false })
            }
          />

          {/* 3. CLINIC BANNER (Reduced height ~96-110px with status & Call/Map) */}
          <ClinicBanner
            clinicPhone="09123456789"
            clinicMapUrl="https://maps.google.com/?q=FurEverCare+Balingasag+Misamis+Oriental"
            hoursText="Open today, 8:00 AM to 5:00 PM"
            isOpenToday
          />

          {/* 4. ANNOUNCEMENTS CARD (Compact, 7-day relevance, Amber Alert rows) */}
          <AnnouncementCard
            announcements={announcements}
            isLoading={isLoadingAnnouncements}
            onPressAnnouncement={(item) => setSelectedAnnouncement(item)}
            onPressSeeAll={() => setIsAllAnnouncementsVisible(true)}
            language={language}
          />

          {/* 5. APPOINTMENT AVAILABILITY CALENDAR (Compact 34px cells, week-hiding, selection, Book button) */}
          <AvailabilityCalendar
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            fullyBookedDates={fullyBookedDates}
            isLoading={isLoadingCalendar}
            onSelectDate={(day) => setSelectedCalendarDay(day)}
            onBookAppointment={(formattedDate) => {
              navigation.navigate('Appointments', {
                openBooking: true,
                selectedDate: formattedDate,
              });
            }}
            language={language}
          />
        </ScrollView>

        {/* NOTIFICATIONS POPOVER MODAL */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isNotificationsVisible}
          onRequestClose={handleCloseNotifications}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={handleCloseNotifications}
          >
            <TouchableWithoutFeedback>
              <View style={styles.notifPopoverPanel}>
                <View style={styles.popoverCaret} />

                {/* Notifications Header */}
                <View style={styles.notifHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.notifHeaderIconCircle}>
                      <Ionicons name="notifications" size={15} color="#35501F" />
                    </View>
                    <Text style={styles.notifHeaderTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                      <View style={styles.notifUnreadBadge}>
                        <Text style={styles.notifUnreadBadgeText}>{unreadCount}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={handleCloseNotifications}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.notifCloseButton}
                  >
                    <Ionicons name="close" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Notification Items */}
                {notifications.length === 0 ? (
                  <View style={styles.notifEmptyState}>
                    <Ionicons name="notifications-off-outline" size={24} color="#9CA3AF" />
                    <Text style={styles.notifEmptyTitle}>No notifications</Text>
                    <Text style={styles.notifEmptySub}>You're all caught up!</Text>
                  </View>
                ) : (
                  <View>
                    <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                      {notifications.slice(0, 5).map((notif, index) => {
                        const isLast = index === Math.min(notifications.length, 5) - 1;
                        const isUnread = !notif.isRead;

                        return (
                          <TouchableOpacity
                            key={notif.id || index}
                            style={[styles.notifItem, isLast && { borderBottomWidth: 0 }]}
                            activeOpacity={0.7}
                            onPress={() => {
                              handleCloseNotifications();
                              handleNotificationPress(notif);
                            }}
                          >
                            <View
                              style={[
                                styles.notifIconCircle,
                                { backgroundColor: notif.iconBg || '#EAF4E2' },
                              ]}
                            >
                              <Ionicons
                                name={notif.icon || 'notifications'}
                                size={16}
                                color={notif.iconColor || '#35501F'}
                              />
                            </View>

                            <View style={{ flex: 1 }}>
                              <View style={styles.notifTitleRow}>
                                <Text
                                  style={[
                                    styles.notifItemTitle,
                                    isUnread && styles.notifItemTitleBold,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {notif.title || 'Notification'}
                                </Text>
                                {isUnread && <View style={styles.unreadGreenDot} />}
                              </View>

                              <Text style={styles.notifItemDesc} numberOfLines={2}>
                                {notif.desc}
                              </Text>

                              <Text style={styles.notifItemTime}>{notif.time}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* View All Button */}
                    <TouchableOpacity
                      style={styles.viewAllNotifsButton}
                      onPress={() => {
                        handleCloseNotifications();
                        setIsAllNotificationsVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.viewAllNotifsText}>View All Notifications →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>

        {/* ALL NOTIFICATIONS FULL-SCREEN MODAL */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={isAllNotificationsVisible}
          onRequestClose={() => setIsAllNotificationsVisible(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1EC' }} edges={['top']}>
            <View style={styles.allNotifsHeader}>
              <TouchableOpacity
                onPress={() => setIsAllNotificationsVisible(false)}
                style={styles.allNotifsBackBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.allNotifsTitle}>Notifications</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {notifications.length === 0 ? (
                <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                  <Ionicons name="notifications-off-outline" size={36} color="#9CA3AF" />
                  <Text
                    style={{
                      color: '#1F2937',
                      fontSize: 15,
                      fontFamily: 'PlusJakartaSans-Bold',
                      marginTop: 8,
                    }}
                  >
                    No notifications yet
                  </Text>
                  <Text
                    style={{
                      color: '#6B7280',
                      fontSize: 12,
                      fontFamily: 'PlusJakartaSans-Regular',
                      marginTop: 2,
                    }}
                  >
                    All your clinic alerts will appear here
                  </Text>
                </View>
              ) : (
                notifications.map((notif, index) => {
                  const isUnread = !notif.isRead;
                  return (
                    <TouchableOpacity
                      key={notif.id || index}
                      style={styles.allNotifsCard}
                      activeOpacity={0.7}
                      onPress={() => {
                        setIsAllNotificationsVisible(false);
                        handleNotificationPress(notif);
                      }}
                    >
                      <View
                        style={[
                          styles.notifIconCircle,
                          { backgroundColor: notif.iconBg || '#EAF4E2', marginRight: 12 },
                        ]}
                      >
                        <Ionicons
                          name={notif.icon || 'notifications'}
                          size={18}
                          color={notif.iconColor || '#35501F'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.notifTitleRow}>
                          <Text
                            style={[
                              styles.notifItemTitle,
                              isUnread && styles.notifItemTitleBold,
                            ]}
                            numberOfLines={1}
                          >
                            {notif.title || 'Notification'}
                          </Text>
                          {isUnread && <View style={styles.unreadGreenDot} />}
                        </View>
                        <Text style={styles.notifItemDesc} numberOfLines={3}>
                          {notif.desc}
                        </Text>
                        <Text style={styles.notifItemTime}>{notif.time}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* ANNOUNCEMENT DETAIL MODAL */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={Boolean(selectedAnnouncement)}
          onRequestClose={() => setSelectedAnnouncement(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setSelectedAnnouncement(null)}
          >
            <View style={styles.announcementDetailModal}>
              <View style={styles.announcementModalHeader}>
                <Text style={styles.announcementModalTitle} numberOfLines={2}>
                  {selectedAnnouncement?.title}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedAnnouncement(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 280 }}>
                <Text style={styles.announcementModalBody}>
                  {selectedAnnouncement?.content || selectedAnnouncement?.desc}
                </Text>

                {/* Attached Media Previews */}
                {selectedAnnouncement?.media && selectedAnnouncement.media.length > 0 && (
                  <View style={{ marginTop: 12, marginBottom: 8 }}>
                    <Text style={styles.modalAttachmentLabel}>Attached Media:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedAnnouncement.media.map((m: any, idx: number) => {
                        const fullUrl = m.url.startsWith('http') ? m.url : `${API_URL}${m.url}`;
                        return (
                          <Image
                            key={idx}
                            source={{ uri: fullUrl }}
                            style={styles.attachedMediaImage}
                            resizeMode="cover"
                          />
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Attached Files List */}
                {selectedAnnouncement?.files && selectedAnnouncement.files.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.modalAttachmentLabel}>Attached Files:</Text>
                    {selectedAnnouncement.files.map((f: any, idx: number) => (
                      <View key={idx} style={styles.fileDownloadItem}>
                        <Ionicons name="document-attach-outline" size={16} color="#35501F" />
                        <Text style={styles.fileDownloadName} numberOfLines={1}>
                          {f.name}
                        </Text>
                        <Ionicons name="download-outline" size={16} color="#35501F" />
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              <View style={styles.announcementModalFooter}>
                <Text style={styles.announcementModalDate}>{selectedAnnouncement?.date}</Text>
              </View>

              {/* Reactions Bar */}
              {selectedAnnouncement?.id && (
                <View style={styles.reactionsBar}>
                  <TouchableOpacity
                    style={[
                      styles.reactionButton,
                      selectedAnnouncement?.userReaction === 'HEART' && styles.reactionButtonActiveHeart,
                    ]}
                    onPress={() => handleReact(selectedAnnouncement.id, 'HEART')}
                  >
                    <Text style={{ fontSize: 16 }}>❤️</Text>
                    <Text
                      style={[
                        styles.reactionCountText,
                        selectedAnnouncement?.userReaction === 'HEART' && { color: '#EF4444' },
                      ]}
                    >
                      {selectedAnnouncement?.hearts || 0}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reactionButton,
                      selectedAnnouncement?.userReaction === 'LIKE' && styles.reactionButtonActiveLike,
                    ]}
                    onPress={() => handleReact(selectedAnnouncement.id, 'LIKE')}
                  >
                    <Text style={{ fontSize: 16 }}>👍</Text>
                    <Text
                      style={[
                        styles.reactionCountText,
                        selectedAnnouncement?.userReaction === 'LIKE' && { color: '#D97706' },
                      ]}
                    >
                      {selectedAnnouncement?.likes || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ALL ANNOUNCEMENTS FULL-SCREEN MODAL */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={isAllAnnouncementsVisible}
          onRequestClose={() => setIsAllAnnouncementsVisible(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F1EC' }} edges={['top']}>
            <View style={styles.allNotifsHeader}>
              <TouchableOpacity
                onPress={() => setIsAllAnnouncementsVisible(false)}
                style={styles.allNotifsBackBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.allNotifsTitle}>All Announcements</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              {announcements.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ color: '#6B7280', fontSize: 14 }}>No announcements available</Text>
                </View>
              ) : (
                announcements.map((announcement) => (
                  <TouchableOpacity
                    key={announcement.id}
                    style={styles.allAnnouncementsCard}
                    onPress={() => setSelectedAnnouncement(announcement)}
                  >
                    <View style={styles.allAnnouncementsIconBox}>
                      <Ionicons name="megaphone" size={16} color="#35501F" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.allAnnouncementsItemTitle} numberOfLines={1}>
                        {announcement.title}
                      </Text>
                      <Text style={styles.allAnnouncementsItemDesc} numberOfLines={2}>
                        {announcement.content}
                      </Text>
                      <View style={styles.allAnnouncementsItemFooter}>
                        <Text style={styles.allAnnouncementsItemDate}>{announcement.date}</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <Text style={{ fontSize: 11, color: '#6B7280' }}>
                            ❤️ {announcement.hearts || 0}
                          </Text>
                          <Text style={{ fontSize: 11, color: '#6B7280' }}>
                            👍 {announcement.likes || 0}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* CALENDAR DAY AVAILABILITY MODAL */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={Boolean(selectedCalendarDay)}
          onRequestClose={() => setSelectedCalendarDay(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setSelectedCalendarDay(null)}
          >
            <View style={styles.calendarDayDetailModal}>
              <View style={styles.calendarModalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.calendarModalDateTitle}>
                    {selectedCalendarDay?.dateObj.toLocaleDateString('default', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.calendarModalSub}>Daily Appointment Availability</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedCalendarDay(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 300, marginBottom: 10 }} showsVerticalScrollIndicator={false}>
                {selectedCalendarDay?.status === 'past' ? (
                  <View style={{ alignItems: 'center', paddingVertical: 20, gap: 8 }}>
                    <Ionicons name="time-outline" size={32} color="#9CA3AF" />
                    <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                      This date is in the past. Appointments cannot be scheduled for past dates.
                    </Text>
                  </View>
                ) : (
                  <View style={{ paddingVertical: 8 }}>
                    {selectedCalendarDay?.status === 'booked' && (
                      <View style={styles.calendarBookedAlert}>
                        <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                        <Text style={styles.calendarBookedText}>
                          Fully Booked: All slots are filled for this date.
                        </Text>
                      </View>
                    )}

                    <Text style={styles.slotsHeaderLabel}>Daily Time Slots:</Text>

                    {(() => {
                      const ALL_TIME_SLOTS = [
                        '09:00 AM',
                        '10:00 AM',
                        '11:00 AM',
                        '12:00 PM',
                        '01:00 PM',
                        '02:00 PM',
                        '03:00 PM',
                        '04:00 PM',
                      ];
                      const unavailable = selectedCalendarDay
                        ? getBookedTimesForDate(selectedCalendarDay.formattedDate)
                        : [];

                      return (
                        <View style={styles.timeSlotsGrid}>
                          {ALL_TIME_SLOTS.map((slot, index) => {
                            const isUnavailable = unavailable.includes(slot);
                            return (
                              <View
                                key={index}
                                style={[
                                  styles.slotItem,
                                  isUnavailable ? styles.slotUnavailable : styles.slotAvailable,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.slotText,
                                    isUnavailable && styles.slotTextUnavailable,
                                  ]}
                                >
                                  {slot}
                                </Text>
                                {isUnavailable && (
                                  <Ionicons
                                    name="lock-closed"
                                    size={11}
                                    color="#9CA3AF"
                                    style={{ marginLeft: 4 }}
                                  />
                                )}
                              </View>
                            );
                          })}
                        </View>
                      );
                    })()}
                  </View>
                )}
              </ScrollView>

              {/* Book button in modal */}
              {selectedCalendarDay?.status === 'available' && (
                <TouchableOpacity
                  style={styles.modalBookButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    const formatted = selectedCalendarDay.formattedDate;
                    setSelectedCalendarDay(null);
                    navigation.navigate('Appointments', {
                      openBooking: true,
                      selectedDate: formatted,
                    });
                  }}
                >
                  <Ionicons name="calendar" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalBookButtonText}>Book Appointment Now</Text>
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
  screenContainer: {
    flex: 1,
    backgroundColor: '#35501F',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#35501F',
  },
  mainScroll: {
    flex: 1,
    backgroundColor: '#F4F1EC', // Light warm gray background
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Guest CTA
  guestCtaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  guestCtaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  guestCtaIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  guestCtaTitle: {
    fontFamily: 'Catcut',
    fontSize: 15,
    color: '#1F2937',
  },
  guestCtaDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 15,
  },
  guestCtaButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  guestCtaLoginBtn: {
    flex: 1,
    backgroundColor: '#35501F',
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestCtaLoginBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  guestCtaRegisterBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#35501F',
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestCtaRegisterBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#35501F',
  },

  // Modals Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Notification Popover
  notifPopoverPanel: {
    position: 'absolute',
    top: 70,
    right: 14,
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  popoverCaret: {
    position: 'absolute',
    top: -8,
    right: 18,
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    borderLeftWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: '#E5E7EB',
    zIndex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  notifHeaderIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  notifHeaderTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#1F2937',
  },
  notifUnreadBadge: {
    marginLeft: 6,
    backgroundColor: '#EAF3DE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  notifUnreadBadgeText: {
    color: '#35501F',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  notifCloseButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifEmptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifEmptyTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#1F2937',
    marginTop: 6,
  },
  notifEmptySub: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  notifIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notifItemTitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  notifItemTitleBold: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#111827',
  },
  unreadGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  notifItemDesc: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#4B5563',
    lineHeight: 15,
    marginBottom: 2,
  },
  notifItemTime: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#9CA3AF',
  },
  viewAllNotifsButton: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
  },
  viewAllNotifsText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: '#35501F',
  },

  // All Notifications Modal
  allNotifsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#35501F',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  allNotifsBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allNotifsTitle: {
    fontFamily: 'Catcut',
    fontSize: 18,
    color: '#FFFFFF',
  },
  allNotifsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
  },

  // Announcement Detail Modal
  announcementDetailModal: {
    backgroundColor: '#FFFFFF',
    width: '88%',
    borderRadius: 18,
    padding: 18,
    maxHeight: '80%',
  },
  announcementModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  announcementModalTitle: {
    fontFamily: 'Catcut',
    fontSize: 17,
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  announcementModalBody: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 10,
  },
  modalAttachmentLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: '#1F2937',
    marginBottom: 6,
  },
  attachedMediaImage: {
    width: 110,
    height: 110,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  fileDownloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3DE',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileDownloadName: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#35501F',
    marginHorizontal: 6,
  },
  announcementModalFooter: {
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    marginTop: 8,
  },
  announcementModalDate: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#9CA3AF',
  },
  reactionsBar: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    marginTop: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 6,
  },
  reactionButtonActiveHeart: {
    backgroundColor: '#FEE2E2',
  },
  reactionButtonActiveLike: {
    backgroundColor: '#FEF3C7',
  },
  reactionCountText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: '#4B5563',
  },

  // All Announcements Modal
  allAnnouncementsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 10,
  },
  allAnnouncementsIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  allAnnouncementsItemTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 2,
  },
  allAnnouncementsItemDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginBottom: 6,
  },
  allAnnouncementsItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allAnnouncementsItemDate: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 10,
    color: '#9CA3AF',
  },

  // Calendar Day Detail Modal
  calendarDayDetailModal: {
    backgroundColor: '#FFFFFF',
    width: '88%',
    borderRadius: 18,
    padding: 18,
    maxHeight: '80%',
  },
  calendarModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarModalDateTitle: {
    fontFamily: 'Catcut',
    fontSize: 17,
    color: '#1F2937',
  },
  calendarModalSub: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  calendarBookedAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  calendarBookedText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: '#DC2626',
    flex: 1,
  },
  slotsHeaderLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: '#1F2937',
    marginBottom: 8,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  slotItem: {
    width: '48%',
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  slotAvailable: {
    backgroundColor: '#EAF3DE',
    borderColor: '#C2E0A3',
  },
  slotUnavailable: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  slotText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: '#35501F',
  },
  slotTextUnavailable: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  modalBookButton: {
    backgroundColor: '#35501F',
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalBookButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
