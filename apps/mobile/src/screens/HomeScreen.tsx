import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Modal,
  Switch,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';

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
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  const { user } = useUser();
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{ title: string; desc: string; date: string; isNew?: boolean } | null>(null);
  const [isAllAnnouncementsVisible, setIsAllAnnouncementsVisible] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasSeenNotifications, setHasSeenNotifications] = useState(false);

  const fetchNotifications = () => {
    fetch('http://192.168.100.78:3000/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          // Filter telemedicine appointments that are confirmed and belong to user (we check owner name)
          // Note: Ideally we'd filter by user.id, but since we don't have auth backend, we use user.name
          const teleAppointments = data.filter((app: any) => 
            app.type === 'telemedicine' && 
            app.status === 'confirmed' && 
            app.sessionCode &&
            app.owner === user?.fullName
          );
          
          const dynamicNotifications = teleAppointments.map(app => ({
            id: app.id,
            title: 'Telemedicine Session Confirmed',
            desc: `Your appointment on ${app.date} at ${app.time} is confirmed. Session Code: ${app.sessionCode}`,
            time: 'Just now',
            icon: 'video',
            color: '#3182ce'
          }));
          setNotifications(dynamicNotifications);
          if (!hasSeenNotifications) {
            setUnreadCount(dynamicNotifications.length);
          }
        }
      })
      .catch(err => console.error('Failed to fetch appointments for notifications:', err));
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, isNotificationsVisible]);

  const handleOpenNotifications = () => {
    setIsNotificationsVisible(true);
    setUnreadCount(0);
    setHasSeenNotifications(true);
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

  const fetchCalendarData = () => {
    fetch('http://192.168.100.78:3000/api/timeslots')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          setDisabledTimeSlots(data);
        }
      })
      .catch(err => console.error('Failed to fetch timeslots:', err));

    fetch('http://192.168.100.78:3000/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setAllAppointments(data);
        }
      })
      .catch(err => console.error('Failed to fetch appointments:', err));
  };

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
    const booked = allAppointments
      .filter(a => a.date === formattedDate && a.status !== 'Cancelled')
      .map(a => a.time);
    
    const disabledForDate = disabledTimeSlots[formattedDate] || [];
    const disabled = disabledForDate.filter(s => !s.enabled).map(s => s.time);

    return Array.from(new Set([...booked, ...disabled]));
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
          >
            <View style={[
              styles.calendarDayInner,
              status === 'booked' ? styles.calendarDayInnerBooked :
                status === 'past' ? styles.calendarDayInnerPast : styles.calendarDayInnerAvailable,
              isToday && styles.calendarDayInnerToday
            ]}>
              <Text style={[
                styles.calendarDayText,
                status === 'booked' ? styles.calendarDayTextBooked :
                  status === 'past' ? styles.calendarDayTextPast : styles.calendarDayTextAvailable
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
    <View style={{ flex: 1, backgroundColor: '#F4F1EC' }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        {/* Decorative Circles */}
        <View style={styles.headerDecoCircle1} />
        <View style={styles.headerDecoCircle2} />

        <View style={[styles.headerLeft, { flex: 1, paddingRight: 10, zIndex: 1 }]}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
            {user.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={{ width: '100%', height: '100%', borderRadius: 22 }} />
            ) : (
              <Text style={styles.avatarText}>
                {user.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingTitle} numberOfLines={1}>Welcome, {user.fullName.split(' ')[0]}</Text>
            <Text style={styles.greetingSubtitle} numberOfLines={1}>Let's check in on your furry babies</Text>
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

      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>

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

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <FontAwesome5 name="bullhorn" size={16} color="#7CB342" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Announcements</Text>
            </View>
            <TouchableOpacity onPress={() => setIsAllAnnouncementsVisible(true)}>
              <Text style={styles.viewAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.announcementCard}
            onPress={() => setSelectedAnnouncement({
              title: 'Holiday Schedule 🎄',
              desc: "We will be closed on Dec 25th for Christmas. Ensure your pet's prescriptions are refilled beforehand.\n\nOur emergency lines will be open for critical situations, but regular clinic operations will resume on Dec 26th at 8:00 AM. Thank you for understanding and happy holidays!",
              date: 'Posted today',
              isNew: true
            })}
          >
            <View style={[styles.announcementIconTile, { backgroundColor: '#EAF3DE' }]}>
              <FontAwesome5 name="calendar-alt" size={16} color="#7CB342" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.announcementTitle} numberOfLines={1}>Holiday Schedule 🎄</Text>
                <View style={styles.announcementBadge}><Text style={styles.announcementBadgeText}>NEW</Text></View>
              </View>
              <Text style={styles.announcementDesc} numberOfLines={2}>We will be closed on Dec 25th for Christmas. Ensure your pet's prescriptions are refilled beforehand.</Text>
              <Text style={styles.announcementDate}>Posted today</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.announcementCard, { borderBottomWidth: 0, marginBottom: 0 }]}
            onPress={() => setSelectedAnnouncement({
              title: 'Heartworm Prevention',
              desc: "Don't forget to keep up with your pet's monthly heartworm medication. Visit our clinic for a refill.\n\nHeartworm disease is a serious and potentially fatal condition caused by parasitic worms living in the arteries of the lungs and occasionally in the right side of the heart. Prevention is the best cure!",
              date: 'Posted 2 days ago'
            })}
          >
            <View style={[styles.announcementIconTile, { backgroundColor: '#F4F1EC' }]}>
              <FontAwesome5 name="heartbeat" size={16} color="#A0AEC0" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.announcementTitle} numberOfLines={1}>Heartworm Prevention</Text>
              </View>
              <Text style={styles.announcementDesc} numberOfLines={2}>Don't forget to keep up with your pet's monthly heartworm medication. Visit our clinic for a refill.</Text>
              <Text style={styles.announcementDate}>Posted 2 days ago</Text>
            </View>
          </TouchableOpacity>
        </View>


        {/* Calendar Section */}
        <View style={[styles.sectionContainer, { padding: 12 }]}>
          <View style={{ marginBottom: 15, alignItems: 'center' }}>
            <View style={[styles.sectionTitleRow, { marginBottom: 15, alignSelf: 'center' }]}>
              <FontAwesome5 name="calendar-alt" size={16} color="#7CB342" style={styles.sectionHeaderIcon} />
              <Text style={[styles.sectionTitle, { fontSize: 14 }]} numberOfLines={1} adjustsFontSizeToFit>Appointment Availability</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
              <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 8, backgroundColor: '#edf2f7', borderRadius: 8 }}>
                <FontAwesome5 name="chevron-left" size={14} color="#4a5568" />
              </TouchableOpacity>
              <Text style={[styles.viewAllText, { fontSize: 14, width: 120, textAlign: 'center', color: '#2d3748' }]}>{currentMonthName}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={{ padding: 8, backgroundColor: '#edf2f7', borderRadius: 8 }}>
                <FontAwesome5 name="chevron-right" size={14} color="#4a5568" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E8E8E8' }]} />
              <Text style={styles.legendText}>Past</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#D4EDBA' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FECACA' }]} />
              <Text style={styles.legendText}>Fully Booked</Text>
            </View>
          </View>

          <View style={styles.calendarGrid}>
            <View style={styles.calendarHeaderRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                <Text key={i} style={styles.calendarDayHeader}>{d}</Text>
              ))}
            </View>
            <View style={styles.calendarDaysContainer}>
              {renderCalendarDays()}
            </View>
          </View>
        </View>

        <View style={styles.quickNavGrid}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickNavRow}>
            <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Appointments')}>
              <View style={[styles.navCardIconTile, { backgroundColor: '#EAF3DE' }]}>
                <FontAwesome5 name="calendar-alt" size={24} color="#7CB342" />
              </View>
              <Text style={styles.navCardText}>My Appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('MyPets')}>
              <View style={[styles.navCardIconTile, { backgroundColor: '#FEF3C7' }]}>
                <FontAwesome5 name="paw" size={24} color="#D97706" />
              </View>
              <Text style={styles.navCardText}>My Pets</Text>
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
        onRequestClose={() => setIsNotificationsVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsNotificationsVisible(false)}>
          <View style={[styles.modalContent, { position: 'absolute', top: 80, right: 20, width: 300, padding: 20, paddingTop: 15 }]}>
            <View style={[styles.modalHeader, { marginBottom: 15 }]}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setIsNotificationsVisible(false)}>
                <FontAwesome5 name="times" size={16} color="#a0aec0" />
              </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#a0aec0', fontSize: 14 }}>No new notifications</Text>
              </View>
            ) : (
              notifications.map((notif, index) => (
                <TouchableOpacity 
                  key={notif.id || index} 
                  style={[styles.notificationItem, index === notifications.length - 1 ? { borderBottomWidth: 0, paddingBottom: 0 } : {}]}
                  onPress={() => {
                    setIsNotificationsVisible(false);
                    setSelectedAnnouncement({
                      title: notif.title,
                      desc: notif.desc,
                      date: notif.time
                    });
                  }}
                >
                  <View style={[styles.settingIcon, { width: 30, alignItems: 'flex-start', paddingTop: 2 }]}>
                    <FontAwesome5 name={notif.icon} size={16} color={notif.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notificationItemText} numberOfLines={2}>{notif.desc}</Text>
                    <Text style={styles.notificationTimeText}>{notif.time}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Announcement Modal Component */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedAnnouncement}
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setSelectedAnnouncement(null)}>
          <View style={[styles.modalContent, { position: 'relative', width: '90%', padding: 25 }]}>
            <View style={[styles.modalHeader, { marginBottom: 15 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                {selectedAnnouncement?.isNew && (
                  <View style={[styles.announcementBadge, { marginBottom: 8 }]}><Text style={styles.announcementBadgeText}>NEW</Text></View>
                )}
                <Text style={[styles.modalTitle, { fontSize: 18, color: '#1E3A8A' }]}>{selectedAnnouncement?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedAnnouncement(null)} style={{ alignSelf: 'flex-start' }}>
                <FontAwesome5 name="times" size={18} color="#a0aec0" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={{ fontSize: 15, color: '#4a5568', lineHeight: 24, marginBottom: 20 }}>
                {selectedAnnouncement?.desc}
              </Text>
            </ScrollView>

            <View style={{ borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 15, marginTop: 5 }}>
              <Text style={{ fontSize: 12, color: '#a0aec0' }}>{selectedAnnouncement?.date}</Text>
            </View>
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
        <View style={{ flex: 1, backgroundColor: '#F4F1EC', paddingTop: 50 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
            <TouchableOpacity onPress={() => setIsAllAnnouncementsVisible(false)} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="#2D5016" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontFamily: 'Catcut', color: '#2D5016' }}>All Announcements</Text>
          </View>
          <ScrollView style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity 
              style={[styles.announcementCard, { borderBottomWidth: 0, marginBottom: 15 }]}
              onPress={() => setSelectedAnnouncement({
                title: 'Holiday Schedule 🎄',
                desc: "We will be closed on Dec 25th for Christmas. Ensure your pet's prescriptions are refilled beforehand.\n\nOur emergency lines will be open for critical situations, but regular clinic operations will resume on Dec 26th at 8:00 AM. Thank you for understanding and happy holidays!",
                date: 'Posted today',
                isNew: true
              })}
            >
              <View style={[styles.announcementIconTile, { backgroundColor: '#EAF3DE' }]}>
                <FontAwesome5 name="calendar-alt" size={16} color="#7CB342" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.announcementTitle} numberOfLines={1}>Holiday Schedule 🎄</Text>
                  <View style={styles.announcementBadge}><Text style={styles.announcementBadgeText}>NEW</Text></View>
                </View>
                <Text style={styles.announcementDesc} numberOfLines={2}>We will be closed on Dec 25th for Christmas. Ensure your pet's prescriptions are refilled beforehand.</Text>
                <Text style={styles.announcementDate}>Posted today</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.announcementCard, { borderBottomWidth: 0, marginBottom: 15 }]}
              onPress={() => setSelectedAnnouncement({
                title: 'Heartworm Prevention',
                desc: "Don't forget to keep up with your pet's monthly heartworm medication. Visit our clinic for a refill.\n\nHeartworm disease is a serious and potentially fatal condition caused by parasitic worms living in the arteries of the lungs and occasionally in the right side of the heart. Prevention is the best cure!",
                date: 'Posted 2 days ago'
              })}
            >
              <View style={[styles.announcementIconTile, { backgroundColor: '#F4F1EC' }]}>
                <FontAwesome5 name="heartbeat" size={16} color="#A0AEC0" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.announcementTitle} numberOfLines={1}>Heartworm Prevention</Text>
                </View>
                <Text style={styles.announcementDesc} numberOfLines={2}>Don't forget to keep up with your pet's monthly heartworm medication. Visit our clinic for a refill.</Text>
                <Text style={styles.announcementDate}>Posted 2 days ago</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.announcementCard, { borderBottomWidth: 0, marginBottom: 15 }]}
              onPress={() => setSelectedAnnouncement({
                 title: 'New Clinic Hours',
                 desc: 'Starting next month, we will be extending our clinic hours on weekends to better serve you and your furry friends. We will now be open from 8:00 AM to 5:00 PM on Saturdays and Sundays.',
                 date: 'Posted 1 week ago'
              })}
            >
              <View style={[styles.announcementIconTile, { backgroundColor: '#FEF3C7' }]}>
                <FontAwesome5 name="clock" size={16} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.announcementTitle} numberOfLines={1}>New Clinic Hours</Text>
                </View>
                <Text style={styles.announcementDesc} numberOfLines={2}>Starting next month, we will be extending our clinic hours on weekends to better serve you and your furry friends.</Text>
                <Text style={styles.announcementDate}>Posted 1 week ago</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
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
  }
});
