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

  const [currentDate, setCurrentDate] = useState(new Date());
  const screenWidth = Dimensions.get('window').width;

  const carouselRef = useRef<ScrollView>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselItems = [
    { img: require('../../assets/clinic_photo.png'), text: "FurEver Paw Care - Your pet's second home" },
    { uri: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80', text: "Happy pets inside our care facility" },
    { uri: 'https://images.unsplash.com/photo-1576201836106-db26a575aadd?auto=format&fit=crop&w=800&q=80', text: "Patient and loving staff attending clients" },
    { uri: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=800&q=80', text: "A fun day at the clinic for good boys" },
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

  // Create mock booked dates (fully booked) - for display
  const fullyBookedDates = [5, 12, 14, 18, 22, 25];

  const renderCalendarDays = () => {
    const days = [];
    // Always render 42 slots (6 weeks) so the grid height remains consistent across all months
    const totalSlots = 42;

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
                status === 'past' ? styles.calendarDayInnerPast : styles.calendarDayInnerAvailable
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerLeft, { flex: 1, paddingRight: 10 }]}>
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
            <Text style={styles.greetingTitle} numberOfLines={1}>Welcome, {user.fullName.split(' ')[0]}! 👋</Text>
            <Text style={styles.greetingSubtitle} numberOfLines={1}>Let's check in on your furry babies</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsNotificationsVisible(true)}>
            <FontAwesome5 name="bell" size={18} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>

        {/* Announcements Section - Top */}

        <View style={[styles.sectionContainer, { paddingHorizontal: 0, paddingBottom: 0, overflow: 'hidden' }]}>
          <View style={[styles.sectionHeader, { paddingHorizontal: 16 }]}>
            <View style={styles.sectionTitleRow}>
              <FontAwesome5 name="store-alt" size={16} color="#1E3A8A" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Balingasag Dog and Cat Pet's Clinic</Text>
            </View>
          </View>
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
                  <Image source={item.img ? item.img : { uri: item.uri }} style={styles.clinicImage} resizeMode="cover" />
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

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <FontAwesome5 name="bullhorn" size={16} color="#dd6b20" style={styles.sectionHeaderIcon} />
              <Text style={styles.sectionTitle}>Announcements</Text>
            </View>
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
            <View style={styles.announcementBadge}><Text style={styles.announcementBadgeText}>NEW</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <FontAwesome5 name="calendar-alt" size={14} color="#D4AF37" style={{ marginRight: 6 }} />
              <Text style={[styles.announcementTitle, { marginBottom: 0 }]}>Holiday Schedule 🎄</Text>
            </View>
            <Text style={styles.announcementDesc} numberOfLines={2}>We will be closed on Dec 25th for Christmas. Ensure your pet's prescriptions are refilled beforehand.</Text>
            <Text style={styles.announcementDate}>Posted today</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.announcementCard, { borderBottomWidth: 0, marginBottom: 0 }]}
            onPress={() => setSelectedAnnouncement({
              title: 'Heartworm Prevention Reminder',
              desc: "Don't forget to keep up with your pet's monthly heartworm medication. Visit our clinic for a refill.\n\nHeartworm disease is a serious and potentially fatal condition caused by parasitic worms living in the arteries of the lungs and occasionally in the right side of the heart. Prevention is the best cure!",
              date: 'Posted 2 days ago'
            })}
          >
            <Text style={styles.announcementTitle}>Heartworm Prevention Reminder</Text>
            <Text style={styles.announcementDesc} numberOfLines={2}>Don't forget to keep up with your pet's monthly heartworm medication. Visit our clinic for a refill.</Text>
            <Text style={styles.announcementDate}>Posted 2 days ago</Text>
          </TouchableOpacity>
        </View>


        {/* Calendar Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <FontAwesome5 name="calendar-alt" size={14} color="#3182ce" style={styles.sectionHeaderIcon} />
              <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Appointment Availability</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 3 }}>
                <FontAwesome5 name="chevron-left" size={12} color="#4a5568" />
              </TouchableOpacity>
              <Text style={styles.viewAllText}>{currentMonthName}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={{ padding: 3 }}>
                <FontAwesome5 name="chevron-right" size={12} color="#4a5568" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#e2e8f0' }]} />
              <Text style={styles.legendText}>Past</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#c6f6d5' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#fc8181' }]} />
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

        {/* Quick Navigate Section */}
        <View style={styles.quickNavGrid}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickNavRow}>
            <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Appointments')}>
              <FontAwesome5 name="calendar-alt" size={20} color="#1E3A8A" style={styles.navCardIcon} />
              <Text style={styles.navCardText}>My Appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('MyPets')}>
              <FontAwesome5 name="paw" size={20} color="#1E3A8A" style={styles.navCardIcon} />
              <Text style={styles.navCardText}>My Pets</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
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

            <View style={styles.notificationItem}>
              <View style={[styles.settingIcon, { width: 30, alignItems: 'flex-start', paddingTop: 2 }]}>
                <FontAwesome5 name="calendar-check" size={16} color="#1E3A8A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notificationItemText}>Your pet's vaccination is due next week. Tap to book.</Text>
                <Text style={styles.notificationTimeText}>2 hours ago</Text>
              </View>
            </View>

            <View style={[styles.notificationItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View style={[styles.settingIcon, { width: 30, alignItems: 'flex-start', paddingTop: 2 }]}>
                 <FontAwesome5 name="store-alt" size={16} color="#D4AF37" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notificationItemText}>New dog food brands are available in the clinic products store!</Text>
                <Text style={styles.notificationTimeText}>Yesterday</Text>
              </View>
            </View>
            
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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFBF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2E5E3E',
    borderBottomWidth: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#2E5E3E',
    fontWeight: '700',
    fontSize: 14,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#c6f6d5',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#dd6b20',
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
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  announcementCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    marginBottom: 8,
  },
  announcementBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  announcementBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  announcementDesc: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 18,
    marginBottom: 6,
  },
  announcementDate: {
    fontSize: 11,
    color: '#a0aec0',
  },
  imageCardWrapper: {
    width: '100%',
    backgroundColor: '#edf2f7',
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
    marginBottom: 20,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  navCardIcon: {
    marginBottom: 8,
  },
  navCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a5568',
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
    fontSize: 12,
    color: '#4a5568',
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
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayInnerAvailable: {
    backgroundColor: '#c6f6d5',
  },
  calendarDayInnerBooked: {
    backgroundColor: '#fc8181',
  },
  calendarDayInnerPast: {
    backgroundColor: '#e2e8f0',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarDayTextAvailable: {
    color: '#276749',
  },
  calendarDayTextBooked: {
    color: '#fff',
  },
  calendarDayTextPast: {
    color: '#718096',
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
