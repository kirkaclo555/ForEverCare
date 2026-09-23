import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  RefreshControl,
  PermissionsAndroid,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config/api';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';


// JavaScript injected into the WebView to pre-grant camera/mic access
const CAMERA_MIC_INJECTED_JS = `
  (function() {
    // Override permission query to always return 'granted' for camera/mic
    const origQuery = navigator.permissions ? navigator.permissions.query.bind(navigator.permissions) : null;
    if (origQuery) {
      navigator.permissions.query = function(desc) {
        if (desc.name === 'camera' || desc.name === 'microphone') {
          return Promise.resolve({ state: 'granted', onchange: null });
        }
        return origQuery(desc);
      };
    }

    // Intercept getUserMedia to ensure it always gets triggered
    const origGetUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
      : null;
    
    if (origGetUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        return origGetUserMedia(constraints).catch(function(err) {
          console.warn('getUserMedia error:', err);
          throw err;
        });
      };
    }
    true; // required by react-native-webview injectedJavaScript
  })()
`;

import GuestRestriction from '../components/GuestRestriction';
import GuestAuthModal from '../components/GuestAuthModal';
import { useLanguage } from '../context/LanguageContext';
import { useGuestAuth } from '../utils/auth';

import TelemedHeader from '../components/telemed/TelemedHeader';
import JoinSessionCard from '../components/telemed/JoinSessionCard';
import SessionCard from '../components/telemed/SessionCard';
import SectionLabel from '../components/telemed/SectionLabel';
import EmptyState from '../components/telemed/EmptyState';

type Props = {
  navigation: any;
};

export default function TelemedicineScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { user } = useUser();
  const { language } = useLanguage();
  const { guestModalVisible, promptGuestAuth, closeGuestModal } = useGuestAuth();
  const insets = useSafeAreaInsets();

  // sessionState: 'join' | 'waiting' | 'active' | 'prescription'
  const [sessionState, setSessionState] = useState<'join' | 'waiting' | 'active' | 'prescription'>('join');
  const [sessionCode, setSessionCode] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = () => {
    return fetch(`${API_URL}/api/appointments`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setAppointments(data);
        }
      })
      .catch(err => console.error('Failed to fetch appointments:', err))
      .finally(() => setLoadingInitial(false));
  };

  useEffect(() => {
    fetchAppointments();

    const interval = setInterval(() => {
      fetchAppointments();
    }, 8000); // Poll every 8 seconds to reflect schedule updates or new session codes instantly

    return () => clearInterval(interval);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAppointments()?.finally(() => setRefreshing(false));
  }, []);

  // Timer for active call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionState === 'active') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  const handleJoin = (directCode?: string) => {
    if (!user?.id || user.id.trim() === '') {
      promptGuestAuth();
      return;
    }
    const codeToUse = directCode || sessionCode;
    if (!codeToUse) {
      Alert.alert("Error", "Please enter a valid session code.");
      return;
    }
    const trimmedCode = codeToUse.trim().toUpperCase();
    
    // 1. Find the session purely by sessionCode first
    const sessionByCode = appointments.find(app => 
      app.sessionCode?.toUpperCase() === trimmedCode
    );

    if (!sessionByCode) {
      Alert.alert("Invalid Code", "The session code you entered is invalid. Please double-check the code.");
      return;
    }

    // 2. Check if it is a telemedicine appointment
    if (sessionByCode.type !== 'telemedicine') {
      Alert.alert("Invalid Session", "This session code is not for a telemedicine appointment.");
      return;
    }

    // 3. Check if cancelled or completed
    const statusLower = sessionByCode.status?.toLowerCase();
    if (statusLower === 'cancelled') {
      Alert.alert("Session Cancelled", "This telemedicine session has been cancelled.");
      return;
    }
    if (statusLower === 'completed' || statusLower === 'done') {
      Alert.alert("Session Completed", "This telemedicine session has already been completed.");
      return;
    }

    const validSession = sessionByCode;

    // Time validation
    try {
      const appDateStr = validSession.date; // e.g. "2026-05-18"
      const appTimeStr = validSession.time; // e.g. "09:00 AM"
      
      // Parse time string like "09:00 AM" to hours and minutes
      const match = appTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        const scheduledTime = new Date(`${appDateStr}T00:00:00`);
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        const now = new Date();
        const timeDiffMs = scheduledTime.getTime() - now.getTime();
        const minutesUntil = timeDiffMs / (1000 * 60);
        
        // 15-minute early access window (relaxed to allow joining any timeslot scheduled for today)
        const [appYr, appMon, appDay] = appDateStr.split('-').map(Number);
        const isToday = appYr === now.getFullYear() && (appMon - 1) === now.getMonth() && appDay === now.getDate();
        
        if (minutesUntil > 15 && !isToday) {
           Alert.alert(
             "Too Early", 
             `This code will be valid by ${appDateStr} at ${appTimeStr}. You can join up to 15 minutes before your scheduled time.`
           );
           return;
        }
      }
    } catch (e) {
      console.error("Time validation error", e);
      // Fallback: allow join if time parsing fails for some reason
    }

    // Request camera and microphone permissions before joining the session
    const requestPermissionsAndJoin = async () => {
      try {
        let cameraGranted = false;
        let audioGranted = false;

        // Request both Camera and Microphone permissions explicitly using expo-camera.
        // This ensures system-level media permissions are granted on both Android and iOS,
        // allowing the WebView to seamlessly access device hardware.
        const cameraReq = await Camera.requestCameraPermissionsAsync();
        const audioReq = await Camera.requestMicrophonePermissionsAsync();
        cameraGranted = cameraReq.status === 'granted';
        audioGranted = audioReq.status === 'granted';
        
        if (!cameraGranted || !audioGranted) {
          Alert.alert(
            "Permissions Required",
            "This app requires access to your camera and microphone to join telemedicine video calls. Please enable them in your device settings."
          );
          return;
        }

        setSessionState('waiting');
        
        // Simulate waiting for vet to join for 100ms
        setTimeout(() => {
          setSessionState('active');
        }, 100);
      } catch (err) {
        console.error("Failed to request permissions", err);
        // Fallback: proceed anyway in case of simulation/dev environment issues
        setSessionState('waiting');
        setTimeout(() => {
          setSessionState('active');
        }, 100);
      }
    };

    requestPermissionsAndJoin();
  };

  const handleEndCall = () => {
    setSessionState('prescription');
  };

  const handleDone = () => {
    setSessionState('join');
    setSessionCode('');
    setCallDuration(0);
    navigation.navigate('Home');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const parseApptMs = (date: string, time: string): number => {
    try {
      const [y, m, d] = date.split('-').map(Number);
      const match = time?.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!match) return new Date(y, m - 1, d).getTime();
      let h = parseInt(match[1], 10);
      const min = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return new Date(y, m - 1, d, h, min).getTime();
    } catch {
      return 0;
    }
  };

  const handleCardSubmit = () => {
    if (!user?.id || user.id.trim() === '') {
      promptGuestAuth();
      return;
    }
    const trimmed = sessionCode.trim().toUpperCase();
    if (!trimmed) {
      setInputError('Enter a session code');
      return;
    }

    setIsJoining(true);

    const sessionByCode = appointments.find(
      app => app.sessionCode?.toUpperCase() === trimmed
    );

    if (!sessionByCode) {
      setInputError('Code not found. Check it and try again.');
      setIsJoining(false);
      return;
    }

    if (sessionByCode.type !== 'telemedicine') {
      setInputError('This code is not for a telemedicine appointment.');
      setIsJoining(false);
      return;
    }

    setInputError(null);
    handleJoin(trimmed);
    setIsJoining(false);
  };

  const handleChangeCode = (text: string) => {
    setSessionCode(text);
    if (inputError) {
      setInputError(null);
    }
  };

  const handleRebook = (app: any) => {
    navigation.navigate('Appointments', {
      openBooking: true,
      selectedPet: app.pet || app.petName,
    });
  };

  const handleBookNow = () => {
    navigation.navigate('Appointments', { openBooking: true });
  };

  const renderContent = () => {
    if (sessionState === 'join') {
      const userTelemedAppointments = appointments.filter(
        app =>
          app.type === 'telemedicine' &&
          (app.owner?.toLowerCase() === user?.fullName?.toLowerCase() ||
            (user?.phoneNumber && app.contact === user.phoneNumber) ||
            (user?.id && app.userId === user.id))
      );

      const now = Date.now();
      const upcomingSessions: any[] = [];
      const pastSessions: any[] = [];

      userTelemedAppointments.forEach(app => {
        const apptMs = parseApptMs(app.date, app.time);
        const statusLower = (app.status || '').toLowerCase();
        const isCompletedOrCancelled =
          statusLower === 'completed' ||
          statusLower === 'done' ||
          statusLower === 'cancelled' ||
          statusLower === 'declined';
        const isPast = (apptMs > 0 && apptMs < now) || isCompletedOrCancelled;
        const isMissed = apptMs > 0 && apptMs < now && !isCompletedOrCancelled;

        if (isPast) {
          pastSessions.push({ ...app, isMissed });
        } else {
          upcomingSessions.push(app);
        }
      });

      // Upcoming: soonest first (ascending)
      upcomingSessions.sort((a, b) => {
        const dtA = parseApptMs(a.date, a.time) || new Date(a.date || 0).getTime();
        const dtB = parseApptMs(b.date, b.time) || new Date(b.date || 0).getTime();
        return dtA - dtB;
      });

      // Past: most recent first (descending)
      pastSessions.sort((a, b) => {
        const dtA = parseApptMs(a.date, a.time) || new Date(a.date || 0).getTime();
        const dtB = parseApptMs(b.date, b.time) || new Date(b.date || 0).getTime();
        return dtB - dtA;
      });

      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flexContainer}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
              style={styles.mainScroll}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: Math.max(insets.bottom + 70, 90) },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#35501F']} />
              }
            >
              {/* 1. Compact Join Session Card with Circular Phone-Call Styling */}
              <JoinSessionCard
                sessionCode={sessionCode}
                onChangeCode={handleChangeCode}
                onSubmit={handleCardSubmit}
                loading={isJoining}
                errorMessage={inputError}
              />

              {/* 2. Latest Activity Section */}
              <View style={styles.activitySection}>
                <View style={styles.activityHeader}>
                  <Ionicons name="time-outline" size={18} color="#35501F" style={{ marginRight: 6 }} />
                  <Text style={[styles.activityTitle, { color: theme.text }]}>Latest activity</Text>
                </View>

                {/* Loading skeleton placeholders */}
                {loadingInitial && appointments.length === 0 ? (
                  <View style={{ gap: 10, marginTop: 4 }}>
                    {[1, 2].map(k => (
                      <View key={k} style={styles.skeletonCard}>
                        <View style={styles.skeletonRow}>
                          <View style={styles.skeletonTile} />
                          <View style={{ flex: 1, gap: 8 }}>
                            <View style={[styles.skeletonLine, { width: '60%' }]} />
                            <View style={[styles.skeletonLine, { width: '40%' }]} />
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : upcomingSessions.length === 0 && pastSessions.length === 0 ? (
                  <EmptyState onBookNow={handleBookNow} />
                ) : (
                  <>
                    {/* Upcoming Sessions */}
                    {upcomingSessions.length > 0 && (
                      <View style={styles.groupContainer}>
                        <SectionLabel title="Upcoming" count={upcomingSessions.length} />
                        {upcomingSessions.map((session, index) => (
                          <SessionCard
                            key={session.id ? `${session.id}-${index}` : String(index)}
                            appointment={session}
                            isPast={false}
                            onJoin={code => handleJoin(code)}
                            onRebook={handleRebook}
                          />
                        ))}
                      </View>
                    )}

                    {/* Past Sessions */}
                    {pastSessions.length > 0 && (
                      <View style={styles.groupContainer}>
                        <SectionLabel title="Past" count={pastSessions.length} />
                        {pastSessions.map((session, index) => (
                          <SessionCard
                            key={session.id ? `${session.id}-${index}` : String(index)}
                            appointment={session}
                            isPast={true}
                            isMissed={session.isMissed}
                            onJoin={code => handleJoin(code)}
                            onRebook={handleRebook}
                          />
                        ))}
                      </View>
                    )}
                  </>
                )}
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      );
    }

    if (sessionState === 'waiting') {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3a7d55" style={{ marginBottom: 20 }} />
          <Text style={styles.title}>Waiting for Veterinarian</Text>
          <Text style={styles.subtitle}>Please do not close this screen. Dr. Reyes will admit you shortly.</Text>
        </View>
      );
    }

    if (sessionState === 'active') {
      const jitsiUrl = `https://meet.ffmuc.net/FurEverPawCare-${sessionCode.trim().toUpperCase()}#config.disableDeepLinking=true&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;
      return (
        <View style={{ flex: 1, backgroundColor: '#1a202c' }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: '#2D5016',
            alignItems: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Catcut' }}>Consultation Room</Text>
            <TouchableOpacity 
              style={{
                backgroundColor: '#e53e3e',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
              onPress={handleEndCall}
            >
              <Text style={{ color: 'white', fontSize: 12, fontFamily: 'Montserrat-Bold' }}>End Call</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: jitsiUrl }}
            style={{ flex: 1 }}
            // Media playback props
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            // iOS: Auto-grant WebRTC media capture permissions (iOS 15+)
            mediaCapturePermissionGrantType="grant"
            // JS injection to pre-grant camera/mic inside WebView
            injectedJavaScript={CAMERA_MIC_INJECTED_JS}
            injectedJavaScriptBeforeContentLoaded={CAMERA_MIC_INJECTED_JS}
            // Core WebView settings
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            allowsProtectedMedia={true}
            // Use a standard Desktop Chrome User Agent on both Android and iOS.
            // This bypasses all Jitsi Meet mobile-specific overlays, deep linking redirects,
            // and media capabilities restrictions, forcing the Jitsi client to enable full WebRTC bidirectional publishing.
            userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            // Android: auto-grant all media permission requests from the page
            onPermissionRequest={(request: any) => {
              request.grant(request.resources);
            }}
            // Prevent overscroll interference during video call
            scrollEnabled={false}
            bounces={false}
          />
        </View>
      );
    }

    if (sessionState === 'prescription') {
      return (
        <View style={styles.centerContainer}>
          <View style={styles.prescriptionCard}>
            <View style={styles.headerRow}>
              <FontAwesome5 name="file-medical" size={32} color="#3a7d55" />
              <Text style={styles.prescriptionTitle}>Prescription Received</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.medRow}>
              <Text style={styles.medName}>1. NexGard Spectra (Chewable)</Text>
              <Text style={styles.medDose}>Take 1 tablet every 30 days</Text>
            </View>
            
            <View style={styles.medRow}>
              <Text style={styles.medName}>2. Ear Drops Solution</Text>
              <Text style={styles.medDose}>Apply 2 drops twice a day for 7 days</Text>
            </View>

            <View style={styles.divider} />
            <Text style={styles.vetNote}>"Please make sure Buddy rests for the next 24 hours. Contact the clinic if symptoms persist." - Dr. Santos</Text>

            <TouchableOpacity style={styles.secondaryButton}>
               <FontAwesome5 name="download" size={16} color="#3a7d55" style={{marginRight: 8}}/>
               <Text style={styles.secondaryButtonText}>Download E-Prescription</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.primaryButton, {marginTop: 15}]} onPress={handleDone}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };


  return (
    <View style={styles.screenContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={sessionState === 'active' ? '#1a202c' : '#35501F'}
      />
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: sessionState === 'active' ? '#1a202c' : '#35501F' },
        ]}
        edges={['top']}
      >
        <GuestAuthModal
          visible={guestModalVisible}
          onClose={closeGuestModal}
          onLogin={() => { closeGuestModal(); navigation.navigate('Login'); }}
          onRegister={() => { closeGuestModal(); navigation.navigate('Register'); }}
        />
        {sessionState !== 'active' && (
          <TelemedHeader
            canGoBack={navigation?.canGoBack() ?? false}
            onBack={() => {
              if (navigation?.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Home');
              }
            }}
          />
        )}
        {renderContent()}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#35501F' },
  safeArea: { flex: 1, backgroundColor: '#35501F' },
  mainScroll: { flex: 1, backgroundColor: '#F4F1EC' },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  activitySection: {
    marginTop: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontFamily: 'Catcut',
    fontSize: 16,
    color: '#1F2937',
  },
  groupContainer: {
    marginBottom: 10,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  flexContainer: { flex: 1 },
  scrollCenterContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  simpleHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  iconSquare: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2D5016',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontFamily: 'Catcut', color: '#1a202c', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 30, lineHeight: 22, paddingHorizontal: 10, fontFamily: 'Montserrat-Regular' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1a202c',
    backgroundColor: '#f8fafc',
    marginBottom: 24,
    fontFamily: 'Montserrat-Regular',
  },
  primaryButton: {
    backgroundColor: '#2D5016',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: 'white', fontSize: 15, fontFamily: 'Montserrat-Bold' },
  
  // Call Styles
  callContainer: { flex: 1, backgroundColor: '#1a202c' },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    alignItems: 'center',
    zIndex: 10,
    position: 'absolute',
    top: 0, left: 0, right: 0
  },
  callVetName: { color: 'white', fontSize: 18, fontWeight: '600' },
  callTimer: { color: '#e2e8f0', fontSize: 16, fontWeight: '500' },
  mainVideo: {
    flex: 1,
    backgroundColor: '#2d3748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vetVideoTag: { color: '#a0aec0', marginTop: 15, fontSize: 14 },
  pipVideo: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 100,
    height: 150,
    backgroundColor: '#4a5568',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#718096',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  callControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  controlCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e53e3e',
  },

  // Prescription Card
  prescriptionCard: {
    backgroundColor: 'white',
    width: '100%',
    padding: 25,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 15 },
  prescriptionTitle: { fontSize: 20, fontFamily: 'Catcut', color: '#2d3748', flex: 1 },
  divider: { height: 1, backgroundColor: '#edf2f7', marginVertical: 15 },
  medRow: { marginBottom: 15 },
  medName: { fontSize: 15, fontFamily: 'Montserrat-SemiBold', color: '#2d3748', marginBottom: 4 },
  medDose: { fontSize: 13, color: '#718096', fontFamily: 'Montserrat-Regular' },
  vetNote: { fontSize: 14, fontStyle: 'italic', color: '#4a5568', marginBottom: 20, fontFamily: 'Montserrat-Regular' },
  secondaryButton: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7CB342',
  },
  secondaryButtonText: { color: '#2D5016', fontSize: 15, fontFamily: 'Montserrat-Bold' },
});
