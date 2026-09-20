import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  RefreshControl, 
  KeyboardAvoidingView, 
  Platform, 
  Image, 
  Modal,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { usePetContext, PetProfile } from '../context/PetContext';
import { promptGuestAuth } from '../utils/auth';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Users: undefined;
  Appointments: undefined;
  Pets: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Pets'>;
};

const getAvatarUri = (avatar: string) => {
  if (!avatar) return undefined;
  if (avatar.startsWith('/')) {
    return `${API_URL}${avatar}`;
  }
  if (avatar.startsWith('http') || avatar.startsWith('file') || avatar.startsWith('data:image/')) {
    return avatar;
  }
  return undefined;
};

export default function PetMonitoringScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { user } = useUser();
  const { language } = useLanguage();
  const { pets, refreshPets } = usePetContext();

  // Selection state
  const [selectedPetId, setSelectedPetId] = useState('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Floating Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInputText, setChatInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [requestingVet, setRequestingVet] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);
  const chatInputRef = useRef<TextInput>(null);
  const activeSessionRef = useRef<any>(activeSession);
  activeSessionRef.current = activeSession;

  // Triage / Initiation Modal State
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [triageCategory, setTriageCategory] = useState<'Health' | 'Activity' | 'Behavior'>('Health');
  const [triageSymptoms, setTriageSymptoms] = useState('');
  const [triageSeverity, setTriageSeverity] = useState<'MILD' | 'SEVERE'>('MILD');
  const [submittingTriage, setSubmittingTriage] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  // Filter verified pets vs pending pets
  const verifiedPets = pets.filter(p => p.verificationStatus === 'VERIFIED');
  const selectedPet = pets.find(p => p.id === selectedPetId);

  // Auto-select first verified pet if available, otherwise first pet
  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      if (verifiedPets.length > 0 && verifiedPets[0]) {
        setSelectedPetId(verifiedPets[0].id);
      } else if (pets[0]) {
        setSelectedPetId(pets[0].id);
      }
    }
  }, [pets]);

  // Fetch active session for the selected pet
  // silent=true skips the loading spinner so the active dashboard doesn't flicker
  const fetchActiveSession = async (petId: string, silent = false) => {
    if (!petId) return;
    if (!silent) setLoadingSession(true);
    try {
      const res = await fetch(`${API_URL}/api/monitoring/chat?petId=${petId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.monitor || null);
      } else {
        if (!silent) setActiveSession(null);
      }
    } catch (e) {
      console.error('Error fetching active monitoring session', e);
      if (!silent) setActiveSession(null);
    } finally {
      if (!silent) setLoadingSession(false);
    }
  };

  // Re-fetch silently every time the screen comes into focus
  // This is what restores the session after navigating away and back
  useFocusEffect(
    useCallback(() => {
      if (selectedPetId) {
        fetchActiveSession(selectedPetId, true);
      }
    }, [selectedPetId])
  );

  // Poll for updates if session is active
  const pollActiveSession = async () => {
    const currentId = activeSessionRef.current?.id || activeSession?.id;
    if (!currentId) return;
    try {
      const res = await fetch(`${API_URL}/api/monitoring/chat?monitorId=${currentId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.monitor) {
          setActiveSession((prev: any) => {
            if (!prev) return data.monitor;
            const prevMsgs = prev.chatMessages || [];
            const newMsgs = data.monitor.chatMessages || [];
            // Do not clobber if prev has optimistic temporary message
            const hasTempMsg = prevMsgs.some((m: any) => typeof m.id === 'string' && m.id.startsWith('msg_temp_'));
            if (
              newMsgs.length !== prevMsgs.length ||
              data.monitor.takeoverMode !== prev.takeoverMode ||
              data.monitor.waitingForVet !== prev.waitingForVet ||
              data.monitor.status !== prev.status ||
              data.monitor.chatStep !== prev.chatStep
            ) {
              // If there was a temp message and server has fewer or same, don't overwrite until server confirms
              if (hasTempMsg && newMsgs.length < prevMsgs.length) {
                return prev;
              }
              return data.monitor;
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.error('Error polling session', e);
    }
  };

  useEffect(() => {
    if (selectedPetId) {
      fetchActiveSession(selectedPetId);
    }
  }, [selectedPetId]);

  // Periodic polling for active monitoring session
  // Poll every 2.5s when chat drawer is open, 5s when closed
  useEffect(() => {
    let interval: any;
    if (activeSession && activeSession.status !== 'RESOLVED') {
      const pollDelay = isChatOpen ? 2500 : 5000;
      interval = setInterval(() => {
        pollActiveSession();
      }, pollDelay);
    }
    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.status, isChatOpen]);

  // Countdown timer calculations
  useEffect(() => {
    if (!activeSession || !activeSession.timerStartedAt) return;

    const updateTimer = () => {
      const start = new Date(activeSession.timerStartedAt).getTime();
      const durationMs = (activeSession.countdownDuration || 24) * 60 * 60 * 1000;
      const end = start + durationMs;
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
      } else {
        const hrs = Math.floor(diff / (60 * 60 * 1000));
        const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        const secs = Math.floor((diff % (60 * 1000)) / 1000);
        const pad = (num: number) => String(num).padStart(2, '0');
        setTimeLeft(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [activeSession?.timerStartedAt, activeSession?.countdownDuration]);

  // Auto scroll chat
  useEffect(() => {
    if (isChatOpen && activeSession?.chatMessages) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 250);
    }
  }, [isChatOpen, activeSession?.chatMessages]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshPets();
      if (selectedPetId) {
        await fetchActiveSession(selectedPetId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, [selectedPetId, refreshPets]);

  // Select Pet Handler with Verification Guard
  const handleSelectPet = (pet: PetProfile) => {
    if (pet.verificationStatus !== 'VERIFIED') {
      Alert.alert(
        'Clinic Verification Required 🏥',
        `${pet.name} is currently pending in-person verification.\n\nTo unlock Pet Monitoring, please bring ${pet.name} to FurEverCare Clinic for a walk-in or scheduled appointment so our veterinary staff can verify their physical records.`,
        [
          { text: 'Book Appointment', onPress: () => navigation.navigate('Appointments' as any) },
          { text: 'Got it', style: 'cancel' }
        ]
      );
      return;
    }
    setSelectedPetId(pet.id);
  };

  // Start Monitoring Session
  const handleOpenStartMonitoring = () => {
    if (!user?.id || user.id.trim() === '') {
      promptGuestAuth(navigation, language);
      return;
    }
    if (!selectedPet) return;
    if (selectedPet.verificationStatus !== 'VERIFIED') {
      Alert.alert(
        'Clinic Verification Required',
        'Only verified pets can undergo Pet Health Monitoring. Please complete an in-person clinic visit first.'
      );
      return;
    }
    setTriageSymptoms('');
    setTriageSeverity('MILD');
    setShowTriageModal(true);
  };

  const handleConfirmStartMonitoring = async () => {
    if (!selectedPetId) return;
    setSubmittingTriage(true);

    try {
      const res = await fetch(`${API_URL}/api/monitoring/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          petId: selectedPetId,
          category: triageCategory,
          symptoms: triageSymptoms.trim() || undefined,
          severity: triageSeverity
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.monitor);
        setShowTriageModal(false);
        refreshPets().catch(console.error);

        if (triageSeverity === 'SEVERE') {
          Alert.alert(
            '🚨 Emergency Clinic Visit Required',
            'Based on the severe condition reported, please bring your pet to FurEverCare Clinic immediately for clinical examination.',
            [{ text: 'View Clinic Directions' }]
          );
        } else {
          Alert.alert(
            'Home Monitoring Started 🩺',
            'Active home-care monitoring has begun. Follow the vet directives below and use the floating chat anytime to consult our clinic.'
          );
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        Alert.alert('Error', errData.error || 'Failed to start monitoring session.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Network Error', 'Could not connect to clinic server. Please check your connection.');
    } finally {
      setSubmittingTriage(false);
    }
  };

  // End Monitoring Session
  const handleEndSession = () => {
    if (!activeSession?.id) return;
    Alert.alert(
      'End Monitoring Session 🐾',
      `Has ${selectedPet?.name || 'your pet'} recovered and is feeling better?\n\nThis will conclude the active monitoring session.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, End Session', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/monitoring/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'end_session',
                  monitorId: activeSession.id
                })
              });
              if (res.ok) {
                setActiveSession(null);
                if (selectedPetId) fetchActiveSession(selectedPetId);
                Alert.alert('Session Concluded', 'Monitoring session marked as resolved. Glad your pet is doing better!');
              }
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Failed to end session.');
            }
          }
        }
      ]
    );
  };

  // Emergency Call Action
  const handleEmergencyCall = () => {
    Linking.openURL('tel:09123456789').catch(() => {
      Alert.alert('Emergency Hotline', 'Call FurEverCare Clinic at: (088) 123-4567 or 0912-345-6789');
    });
  };

  // Accept Admission
  const handleAcceptAdmission = async () => {
    if (!activeSession?.id) return;
    try {
      const res = await fetch(`${API_URL}/api/monitoring/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_admission',
          monitorId: activeSession.id
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.monitor);
        Alert.alert(
          'Admission Confirmed 🚨',
          'Clinic admission has been confirmed. Our veterinary team has been notified and is preparing for your arrival.',
          [{ text: 'Understood' }]
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Floating Chat: Send Message
  const handleSendChatMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInputText).trim();
    if (!text || !activeSession?.id) return;

    setIsSendingMessage(true);
    if (!textToSend) setChatInputText('');
    const replyData = replyingTo ? { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.text } : undefined;
    setReplyingTo(null);

    // Optimistic UI update: immediately display owner's message in the chat
    const tempId = 'msg_temp_' + Date.now();
    const optimisticMsg: any = {
      id: tempId,
      sender: 'owner',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString()
    };
    if (replyData) {
      optimisticMsg.replyTo = replyData;
    }

    setActiveSession((prev: any) => {
      if (!prev) return prev;
      const currentMsgs = Array.isArray(prev.chatMessages) ? prev.chatMessages : [];
      return {
        ...prev,
        chatMessages: [...currentMsgs, optimisticMsg]
      };
    });

    try {
      const res = await fetch(`${API_URL}/api/monitoring/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'message',
          monitorId: activeSession.id,
          sender: 'owner',
          text,
          replyTo: replyData
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.monitor);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Failed to send message:', errData);
        Alert.alert('Error', errData.error || 'Failed to send message.');
        // Revert optimistic message on failure
        setActiveSession((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            chatMessages: (prev.chatMessages || []).filter((m: any) => m.id !== tempId)
          };
        });
        if (!textToSend) setChatInputText(text);
      }
    } catch (e) {
      console.error('Network error sending message:', e);
      Alert.alert('Error', 'Could not send message. Please check your network connection.');
      // Revert optimistic message on error
      setActiveSession((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          chatMessages: (prev.chatMessages || []).filter((m: any) => m.id !== tempId)
        };
      });
      if (!textToSend) setChatInputText(text);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Floating Chat: Request Vet
  const handleRequestVet = async () => {
    if (!activeSession?.id || requestingVet) return;
    setRequestingVet(true);
    try {
      const res = await fetch(`${API_URL}/api/monitoring/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_vet', monitorId: activeSession.id })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.monitor);
        setQueuePosition(data.queuePosition || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRequestingVet(false);
    }
  };

  const isSevereSession = activeSession?.status === 'CRITICAL' || activeSession?.severity === 'SEVERE' || activeSession?.admitRecommended;
  const isHomeMonitoring = activeSession && activeSession.status === 'ACTIVE';

  // Quick symptom chips for triage modal
  const SYMPTOM_CHIPS = [
    'Vomiting',
    'Diarrhea',
    'Lethargy / Weakness',
    'Loss of Appetite',
    'Coughing / Sneezing',
    'Limping / Stiffness',
    'Skin Itching',
    'Unusual Restlessness'
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation?.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>Pet Health Monitoring</Text>
            <Text style={styles.headerSubtitle}>Verified home-care directives & vet guidance</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.helpButton} 
          onPress={() => Alert.alert(
            'Pet Monitoring Guidelines',
            '1. Only pets verified in-person at FurEverCare Clinic can be monitored.\n2. If your pet has mild symptoms, you can start home monitoring.\n3. The vet will send medication, diet, and care updates.\n4. If severe, immediately bring your pet to the clinic.\n5. When your pet is okay, tap "End Monitoring Session".'
          )}
        >
          <FontAwesome5 name="question-circle" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E5E3E']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 1. PET SELECTION SECTION */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Pet to Monitor</Text>
            <Text style={{ fontSize: 12, color: theme.subtext }}>
              {verifiedPets.length} verified of {pets.length}
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petSelectorRow}>
            {pets.length > 0 ? (
              pets.map(pet => {
                const isSelected = selectedPetId === pet.id;
                const isVerified = pet.verificationStatus === 'VERIFIED';

                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      styles.petChip,
                      { borderColor: isSelected ? '#2E5E3E' : theme.border, backgroundColor: isSelected ? (isDarkMode ? '#1a3d28' : '#EAF3DE') : theme.card },
                      !isVerified && { opacity: 0.75 }
                    ]}
                    onPress={() => handleSelectPet(pet)}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isVerified ? '#2E5E3E' : '#ecc94b', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {getAvatarUri(pet.avatar) ? (
                        <Image source={{ uri: getAvatarUri(pet.avatar) }} style={{ width: '100%', height: '100%' }} />
                      ) : (
                        <FontAwesome5 name={pet.species?.toLowerCase() === 'cat' ? 'cat' : 'dog'} size={18} color="white" />
                      )}
                    </View>

                    <View style={{ marginLeft: 8 }}>
                      <Text style={[styles.petChipName, { color: theme.text, fontWeight: isSelected ? 'bold' : '600' }]}>
                        {pet.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <FontAwesome5 
                          name={isVerified ? 'check-circle' : 'clock'} 
                          size={10} 
                          color={isVerified ? '#38a169' : '#d69e2e'} 
                        />
                        <Text style={{ fontSize: 10, color: isVerified ? '#38a169' : '#d69e2e', fontFamily: 'Montserrat-Bold' }}>
                          {isVerified ? 'Verified' : 'Pending Walk-in'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={{ color: theme.subtext, fontStyle: 'italic', paddingVertical: 10 }}>
                No pets added yet. Add a pet in Pet Records.
              </Text>
            )}
          </ScrollView>
        </View>

        {/* 2. LOADING STATE */}
        {loadingSession ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2E5E3E" />
            <Text style={{ marginTop: 12, color: theme.subtext, fontSize: 13 }}>Loading monitoring details...</Text>
          </View>
        ) : !selectedPet ? (
          /* Empty state: No pet selected */
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <FontAwesome5 name="paw" size={40} color="#a0aec0" style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Pet Selected</Text>
            <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
              Please add or select a pet above to view their monitoring dashboard.
            </Text>
          </View>
        ) : selectedPet.verificationStatus !== 'VERIFIED' ? (
          /* Locked State: Pet is Pending Verification */
          <View style={[styles.pendingWarningCard, { backgroundColor: isDarkMode ? '#2d2412' : '#fffaf0', borderColor: isDarkMode ? '#744210' : '#fbd38d' }]}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#ecc94b', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <FontAwesome5 name="store-alt" size={26} color="white" />
            </View>
            <Text style={[styles.pendingCardTitle, { color: isDarkMode ? '#faf089' : '#744210' }]}>
              {selectedPet.name} is Pending Clinic Verification
            </Text>
            <Text style={[styles.pendingCardDesc, { color: isDarkMode ? '#fefcbf' : '#975a16' }]}>
              For safety and diagnostic accuracy, Pet Health Monitoring is only available for pets who have had an in-person walk-in appointment at FurEverCare Clinic.
            </Text>
            <View style={styles.pendingStepBox}>
              <Text style={styles.pendingStepText}>1. Book a walk-in or clinic appointment</Text>
              <Text style={styles.pendingStepText}>2. Bring {selectedPet.name} to the clinic</Text>
              <Text style={styles.pendingStepText}>3. Our veterinarians verify your submitted details</Text>
              <Text style={styles.pendingStepText}>4. Pet Monitoring will immediately unlock!</Text>
            </View>
            <TouchableOpacity 
              style={styles.appointmentBtn}
              onPress={() => navigation.navigate('Appointments' as any)}
            >
              <FontAwesome5 name="calendar-plus" size={15} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.appointmentBtnText}>Schedule Clinic Visit</Text>
            </TouchableOpacity>
          </View>
        ) : !activeSession ? (
          /* Verified Pet - Ready to Start Monitoring */
          <View style={[styles.readyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.readyHeaderRow}>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#EAF3DE', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesome5 name="heartbeat" size={22} color="#2E5E3E" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.readyCardTitle, { color: theme.text }]}>No Active Session</Text>
                <Text style={{ fontSize: 13, color: '#38a169', fontWeight: 'bold' }}>✓ Verified for Pet Monitoring</Text>
              </View>
            </View>

            <Text style={[styles.readyCardDesc, { color: theme.subtext }]}>
              If you notice unusual symptoms, reduced appetite, or behavioral changes in {selectedPet.name}, you can immediately initiate monitoring.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <FontAwesome5 name="check" size={12} color="#2E5E3E" style={{ marginTop: 2, marginRight: 8 }} />
                <Text style={[styles.bulletText, { color: theme.text }]}>Mild symptoms: Vet provides home-care meds & diet plans</Text>
              </View>
              <View style={styles.bulletItem}>
                <FontAwesome5 name="check" size={12} color="#2E5E3E" style={{ marginTop: 2, marginRight: 8 }} />
                <Text style={[styles.bulletText, { color: theme.text }]}>Severe symptoms: Instant triage guidance to clinic emergency</Text>
              </View>
              <View style={styles.bulletItem}>
                <FontAwesome5 name="check" size={12} color="#2E5E3E" style={{ marginTop: 2, marginRight: 8 }} />
                <Text style={[styles.bulletText, { color: theme.text }]}>End session anytime once your pet recovers</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.startMonitoringBtn}
              onPress={handleOpenStartMonitoring}
            >
              <FontAwesome5 name="notes-medical" size={16} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.startMonitoringBtnText}>Start Pet Monitoring</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* 3. ACTIVE MONITORING DASHBOARD */
          <View style={{ paddingHorizontal: 16 }}>
            {/* Status Header Banner */}
            <View style={[
              styles.dashboardStatusBanner, 
              { 
                backgroundColor: isSevereSession ? (isDarkMode ? '#3b1818' : '#fff5f5') : (isDarkMode ? '#1a3d28' : '#f0fff4'),
                borderColor: isSevereSession ? '#e53e3e' : '#38a169'
              }
            ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isSevereSession ? '#e53e3e' : '#2E5E3E', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <FontAwesome5 name={isSevereSession ? 'exclamation-triangle' : 'heartbeat'} size={20} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Montserrat-Bold', color: isSevereSession ? '#e53e3e' : '#2E5E3E' }}>
                      {isSevereSession ? '🚨 SEVERE: Clinic Admission Needed' : '🩺 Active Home Monitoring'}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.subtext }}>
                      Pet: {selectedPet.name} • {activeSession.chatCategory || 'Health'} Condition
                    </Text>
                  </View>
                </View>

                {!isSevereSession && (
                  <View style={styles.timerBadge}>
                    <FontAwesome5 name="clock" size={12} color="#2E5E3E" style={{ marginRight: 5 }} />
                    <Text style={styles.timerBadgeText}>{timeLeft}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* SEVERE EMERGENCY CALLOUT */}
            {isSevereSession && (
              <View style={[styles.emergencyBox, { backgroundColor: isDarkMode ? '#441d1d' : '#fff1f0', borderColor: '#f5222d' }]}>
                <Text style={styles.emergencyBoxTitle}>Immediate Veterinary Admission Required</Text>
                <Text style={styles.emergencyBoxDesc}>
                  The veterinarian has flagged {selectedPet.name}'s condition as severe. Please bring your pet to FurEverCare Clinic immediately for clinical examination.
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <TouchableOpacity style={styles.emergencyCallBtn} onPress={handleEmergencyCall}>
                    <FontAwesome5 name="phone-alt" size={14} color="white" style={{ marginRight: 6 }} />
                    <Text style={styles.emergencyCallBtnText}>Call Clinic Now</Text>
                  </TouchableOpacity>

                  {!activeSession.admitAccepted && (
                    <TouchableOpacity style={styles.acceptAdmitBtn} onPress={handleAcceptAdmission}>
                      <FontAwesome5 name="check-circle" size={14} color="#f5222d" style={{ marginRight: 6 }} />
                      <Text style={styles.acceptAdmitBtnText}>Confirm Admission</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* VET DIRECTIVES: WHAT TO DRINK/MEDS, WHAT TO DO, WHAT TO EAT */}
            <Text style={[styles.directivesSectionHeader, { color: theme.text }]}>
              Veterinarian Care Directives
            </Text>

            {/* Card 1: Medications */}
            <View style={[styles.directiveCard, { backgroundColor: theme.card, borderColor: '#38a169', borderLeftColor: '#38a169' }]}>
              <View style={styles.directiveCardHeader}>
                <View style={[styles.directiveIconCircle, { backgroundColor: '#EAF3DE' }]}>
                  <FontAwesome5 name="pills" size={16} color="#2E5E3E" />
                </View>
                <Text style={[styles.directiveCardTitle, { color: '#2E5E3E' }]}>Medications to Drink / Take</Text>
              </View>
              <Text style={[styles.directiveContentText, { color: theme.text }]}>
                {activeSession.medications || 'None prescribed yet. Awaiting veterinarian instructions.'}
              </Text>
            </View>

            {/* Card 2: Diet Instructions */}
            <View style={[styles.directiveCard, { backgroundColor: theme.card, borderColor: '#dd6b20', borderLeftColor: '#dd6b20' }]}>
              <View style={styles.directiveCardHeader}>
                <View style={[styles.directiveIconCircle, { backgroundColor: '#feebc8' }]}>
                  <FontAwesome5 name="utensils" size={16} color="#dd6b20" />
                </View>
                <Text style={[styles.directiveCardTitle, { color: '#dd6b20' }]}>What to Eat / Dietary Plan</Text>
              </View>
              <Text style={[styles.directiveContentText, { color: theme.text }]}>
                {activeSession.dietInstructions || 'Fresh clean water at all times. Bland, easily digestible meals (e.g. boiled chicken with white rice).'}
              </Text>
            </View>

            {/* Card 3: Care Instructions / What to Do */}
            <View style={[styles.directiveCard, { backgroundColor: theme.card, borderColor: '#3182ce', borderLeftColor: '#3182ce' }]}>
              <View style={styles.directiveCardHeader}>
                <View style={[styles.directiveIconCircle, { backgroundColor: '#ebf8ff' }]}>
                  <FontAwesome5 name="clipboard-check" size={16} color="#3182ce" />
                </View>
                <Text style={[styles.directiveCardTitle, { color: '#3182ce' }]}>What to Do / Home Care Steps</Text>
              </View>
              <Text style={[styles.directiveContentText, { color: theme.text }]}>
                {activeSession.careInstructions || 'Keep pet in a quiet, warm area. Limit active running or jumping. Observe respiration and behavior.'}
              </Text>
            </View>

            {/* 4. TIMELINE OF VET UPDATES */}
            <Text style={[styles.directivesSectionHeader, { color: theme.text, marginTop: 24 }]}>
              Veterinarian Updates & Checks
            </Text>

            {activeSession.updatesLog && Array.isArray(activeSession.updatesLog) && activeSession.updatesLog.length > 0 ? (
              <View style={styles.timelineContainer}>
                {activeSession.updatesLog.map((log: any, idx: number) => (
                  <View key={log.id || idx} style={[styles.timelineCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={[styles.timelineTitle, { color: theme.text }]}>
                        {log.title || 'Vet Update'}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.subtext }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Text>
                    </View>
                    <Text style={[styles.timelineNote, { color: theme.subtext }]}>{log.note || log.description}</Text>
                    {log.medications && (
                      <Text style={{ fontSize: 12, color: '#2E5E3E', marginTop: 4, fontFamily: 'Montserrat-Medium' }}>
                        💊 {log.medications}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.timelineEmptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={{ color: theme.subtext, fontStyle: 'italic', textAlign: 'center', fontSize: 13 }}>
                  No updates posted yet. The vet will update your directives here periodically.
                </Text>
              </View>
            )}

            {/* END SESSION BUTTON */}
            <TouchableOpacity 
              style={styles.endMonitoringBtn}
              onPress={handleEndSession}
            >
              <FontAwesome5 name="check-circle" size={16} color="#e53e3e" style={{ marginRight: 8 }} />
              <Text style={styles.endMonitoringBtnText}>End Monitoring Session (Pet is Recovered)</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 5. FLOATING CHAT BUTTON (FAB) */}
      {activeSession && (
        <TouchableOpacity
          style={styles.floatingChatButton}
          onPress={() => setIsChatOpen(true)}
          activeOpacity={0.85}
        >
          <FontAwesome5 name="comments" size={24} color="white" />
          {activeSession.chatMessages?.length > 0 && (
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>
                {Math.min(activeSession.chatMessages.length, 99)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* 6. FLOATING CHAT MODAL / DRAWER */}
      <Modal
        visible={isChatOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsChatOpen(false)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        {/* KeyboardAvoidingView must wrap SafeAreaView for Modals on Android */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background, flex: 1 }]} edges={['top', 'left', 'right']}>
            {/* Chat Modal Header */}
            <View style={[styles.chatModalHeader, { backgroundColor: theme.headerBackground }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <FontAwesome5 name="user-md" size={16} color="white" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontFamily: 'Catcut', color: 'white' }}>
                    {selectedPet?.name}'s Vet Triage Chat
                  </Text>
                  <Text style={{ fontSize: 11, color: '#EAF3DE' }}>
                    {activeSession?.takeoverMode ? '🩺 Attending Veterinarian Online' : '🤖 AI Clinical Assistant Online'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsChatOpen(false)} style={{ padding: 8 }}>
                <FontAwesome5 name="times" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Chat Message Scroll */}
            <ScrollView
              ref={chatScrollRef}
              style={{ flex: 1, backgroundColor: theme.background }}
              contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            >
              {activeSession?.chatMessages?.map((msg: any) => {
                const isOwner = msg.sender === 'owner';
                const isVet = msg.sender === 'admin';
                const isSys = msg.sender === 'system';

                return (
                  <View 
                    key={msg.id}
                    style={[styles.msgRow, isOwner ? styles.msgRowRight : styles.msgRowLeft]}
                  >
                    {!isOwner && (
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isVet ? '#2E5E3E' : '#EAF3DE', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                        <FontAwesome5 name={isVet ? 'user-md' : 'robot'} size={12} color={isVet ? 'white' : '#2E5E3E'} />
                      </View>
                    )}
                    <View style={[
                      styles.msgBubble,
                      isOwner 
                        ? [styles.msgBubbleOwner, { backgroundColor: '#2E5E3E' }] 
                        : [styles.msgBubbleOther, { backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7' }],
                      msg.isUrgent && { borderColor: '#e53e3e', borderWidth: 1 }
                    ]}>
                      <Text style={[
                        styles.msgSenderLabel,
                        { color: isOwner ? '#c6f6d5' : (isDarkMode ? '#a0aec0' : '#718096') }
                      ]}>
                        {isOwner ? selectedPet?.name || 'Owner' : isVet ? 'Veterinarian' : 'AI Assistant'} • {msg.time}
                      </Text>
                      {msg.isUrgent && (
                        <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 11, marginBottom: 4 }}>
                          🚨 URGENT CLINIC NOTICE
                        </Text>
                      )}
                      <Text style={[styles.msgText, { color: isOwner ? 'white' : theme.text }]}>
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {/* Request Vet Directly Button inside Chat */}
              {!activeSession?.takeoverMode && (
                <TouchableOpacity 
                  style={[styles.chatRequestVetBtn, { backgroundColor: isDarkMode ? '#1a3d28' : '#f0fff4' }]}
                  onPress={handleRequestVet}
                  disabled={requestingVet}
                >
                  <FontAwesome5 name="user-md" size={15} color="#2E5E3E" style={{ marginRight: 8 }} />
                  <Text style={styles.chatRequestVetText}>
                    {requestingVet ? 'Connecting...' : '🩺 Request Direct Vet Consultation'}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Chat Input Bar — sits above keyboard */}
            <View style={[styles.chatInputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
              <TextInput
                ref={chatInputRef}
                style={[styles.chatTextInput, { backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', borderColor: theme.border, color: theme.text }]}
                placeholder="Ask a question or update symptoms..."
                placeholderTextColor={theme.subtext}
                value={chatInputText}
                onChangeText={setChatInputText}
                returnKeyType="send"
                onSubmitEditing={() => chatInputText.trim() && handleSendChatMessage()}
                blurOnSubmit={false}
              />
              <TouchableOpacity 
                style={[styles.chatSendBtn, (!chatInputText.trim() || isSendingMessage) && { opacity: 0.5 }]}
                disabled={!chatInputText.trim() || isSendingMessage}
                onPress={() => handleSendChatMessage()}
              >
                {isSendingMessage ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <FontAwesome5 name="paper-plane" size={16} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* 7. START TRIAGE & MONITORING MODAL */}
      <Modal
        visible={showTriageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTriageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.triageModalContent, { backgroundColor: theme.card }]}>
            <View style={styles.triageModalHeader}>
              <Text style={[styles.triageModalTitle, { color: theme.text }]}>
                Start Monitoring {selectedPet?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowTriageModal(false)}>
                <FontAwesome5 name="times" size={18} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Picker */}
              <Text style={[styles.triageLabel, { color: theme.text }]}>Concern Category</Text>
              <View style={styles.categoryRow}>
                {(['Health', 'Activity', 'Behavior'] as const).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryBtn,
                      { borderColor: theme.border },
                      triageCategory === cat && { backgroundColor: '#2E5E3E', borderColor: '#2E5E3E' }
                    ]}
                    onPress={() => setTriageCategory(cat)}
                  >
                    <FontAwesome5 
                      name={cat === 'Health' ? 'heartbeat' : cat === 'Activity' ? 'running' : 'brain'} 
                      size={14} 
                      color={triageCategory === cat ? 'white' : '#2E5E3E'} 
                      style={{ marginRight: 6 }} 
                    />
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: triageCategory === cat ? 'white' : theme.text }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quick Symptom Chips */}
              <Text style={[styles.triageLabel, { color: theme.text, marginTop: 14 }]}>
                Select Observed Symptoms
              </Text>
              <View style={styles.symptomChipsRow}>
                {SYMPTOM_CHIPS.map(chip => {
                  const isSelected = triageSymptoms.includes(chip);
                  return (
                    <TouchableOpacity
                      key={chip}
                      style={[
                        styles.symptomChip,
                        { borderColor: theme.border },
                        isSelected && { backgroundColor: '#2E5E3E', borderColor: '#2E5E3E' }
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setTriageSymptoms(triageSymptoms.replace(chip, '').trim());
                        } else {
                          setTriageSymptoms(triageSymptoms ? `${triageSymptoms}, ${chip}` : chip);
                        }
                      }}
                    >
                      <Text style={{ fontSize: 12, color: isSelected ? 'white' : theme.text }}>{chip}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Symptom Text Input */}
              <TextInput
                style={[styles.symptomInput, { backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', borderColor: theme.border, color: theme.text }]}
                placeholder="Describe details or additional unusual behavior..."
                placeholderTextColor={theme.subtext}
                value={triageSymptoms}
                onChangeText={setTriageSymptoms}
                multiline
                numberOfLines={3}
              />

              {/* Severity Assessment */}
              <Text style={[styles.triageLabel, { color: theme.text, marginTop: 16 }]}>
                Severity Assessment
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[
                    styles.severityBtn,
                    { borderColor: '#38a169', backgroundColor: triageSeverity === 'MILD' ? (isDarkMode ? '#1a3d28' : '#f0fff4') : theme.card },
                    triageSeverity === 'MILD' && { borderWidth: 2 }
                  ]}
                  onPress={() => setTriageSeverity('MILD')}
                >
                  <FontAwesome5 name="home" size={16} color="#38a169" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#38a169' }}>Mild Condition</Text>
                  <Text style={{ fontSize: 11, color: theme.subtext, textAlign: 'center', marginTop: 2 }}>
                    Home Monitored • Vet gives meds & care plans
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.severityBtn,
                    { borderColor: '#e53e3e', backgroundColor: triageSeverity === 'SEVERE' ? (isDarkMode ? '#3b1818' : '#fff5f5') : theme.card },
                    triageSeverity === 'SEVERE' && { borderWidth: 2 }
                  ]}
                  onPress={() => setTriageSeverity('SEVERE')}
                >
                  <FontAwesome5 name="ambulance" size={16} color="#e53e3e" style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e53e3e' }}>Severe Emergency</Text>
                  <Text style={{ fontSize: 11, color: theme.subtext, textAlign: 'center', marginTop: 2 }}>
                    Direct to Clinic • Urgent in-person admission
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Start Confirmation */}
              <TouchableOpacity
                style={[styles.confirmTriageBtn, submittingTriage && { opacity: 0.7 }]}
                disabled={submittingTriage}
                onPress={handleConfirmStartMonitoring}
              >
                {submittingTriage ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <FontAwesome5 name="check-circle" size={16} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.confirmTriageText}>
                      {triageSeverity === 'MILD' ? 'Begin Home Monitoring' : 'Submit Emergency Triage'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 14,
    backgroundColor: '#2E5E3E',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Catcut', color: 'white' },
  headerSubtitle: { fontSize: 12, color: '#EAF3DE', fontFamily: 'Montserrat-Regular', marginTop: 2 },
  helpButton: { padding: 5 },

  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold' },
  petSelectorRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  petChipName: { fontSize: 13, fontFamily: 'Montserrat-SemiBold' },

  emptyCard: {
    margin: 16,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 0.5,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Catcut', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', fontFamily: 'Montserrat-Regular' },

  pendingWarningCard: {
    margin: 16,
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  pendingCardTitle: { fontSize: 17, fontFamily: 'Montserrat-Bold', textAlign: 'center', marginBottom: 8 },
  pendingCardDesc: { fontSize: 13, textAlign: 'center', lineHeight: 19, fontFamily: 'Montserrat-Regular', marginBottom: 16 },
  pendingStepBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    gap: 6
  },
  pendingStepText: { fontSize: 12, color: '#744210', fontFamily: 'Montserrat-Medium' },
  appointmentBtn: {
    backgroundColor: '#2E5E3E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  appointmentBtnText: { color: 'white', fontFamily: 'Montserrat-Bold', fontSize: 14 },

  readyCard: {
    margin: 16,
    padding: 20,
    borderRadius: 18,
    borderWidth: 0.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  readyHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  readyCardTitle: { fontSize: 17, fontFamily: 'Catcut' },
  readyCardDesc: { fontSize: 13, lineHeight: 19, fontFamily: 'Montserrat-Regular', marginBottom: 16 },
  bulletList: { gap: 8, marginBottom: 20 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start' },
  bulletText: { fontSize: 13, fontFamily: 'Montserrat-Medium', flex: 1 },
  startMonitoringBtn: {
    backgroundColor: '#2E5E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  startMonitoringBtnText: { color: 'white', fontFamily: 'Montserrat-Bold', fontSize: 15 },

  dashboardStatusBanner: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3DE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  timerBadgeText: { fontSize: 12, fontFamily: 'Montserrat-Bold', color: '#2E5E3E' },

  emergencyBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  emergencyBoxTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold', color: '#f5222d', marginBottom: 4 },
  emergencyBoxDesc: { fontSize: 13, color: '#a8071a', lineHeight: 18, fontFamily: 'Montserrat-Regular' },
  emergencyCallBtn: {
    flex: 1,
    backgroundColor: '#f5222d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  emergencyCallBtnText: { color: 'white', fontFamily: 'Montserrat-Bold', fontSize: 13 },
  acceptAdmitBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#f5222d',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  acceptAdmitBtnText: { color: '#f5222d', fontFamily: 'Montserrat-Bold', fontSize: 13 },

  directivesSectionHeader: { fontSize: 15, fontFamily: 'Montserrat-Bold', marginBottom: 12 },
  directiveCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 5,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
  },
  directiveCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  directiveIconCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  directiveCardTitle: { fontSize: 14, fontFamily: 'Montserrat-Bold' },
  directiveContentText: { fontSize: 13, lineHeight: 19, fontFamily: 'Montserrat-Regular' },

  timelineContainer: { gap: 10, marginBottom: 16 },
  timelineCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  timelineTitle: { fontSize: 13, fontFamily: 'Montserrat-Bold' },
  timelineNote: { fontSize: 12, fontFamily: 'Montserrat-Regular', lineHeight: 17 },
  timelineEmptyBox: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },

  endMonitoringBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e53e3e',
    backgroundColor: '#fff5f5',
    marginTop: 10,
    marginBottom: 20,
  },
  endMonitoringBtnText: { color: '#e53e3e', fontFamily: 'Montserrat-Bold', fontSize: 14 },

  floatingChatButton: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E5E3E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 100,
  },
  chatBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#e53e3e',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  chatBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },
  msgBubble: { maxWidth: '78%', padding: 12, borderRadius: 14 },
  msgBubbleOwner: { borderBottomRightRadius: 2 },
  msgBubbleOther: { borderBottomLeftRadius: 2 },
  msgSenderLabel: { fontSize: 10, marginBottom: 3 },
  msgText: { fontSize: 13, lineHeight: 18, fontFamily: 'Montserrat-Regular' },
  chatRequestVetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c6f6d5',
    marginTop: 10,
  },
  chatRequestVetText: { color: '#2E5E3E', fontFamily: 'Montserrat-Bold', fontSize: 13 },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  chatTextInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  chatSendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2E5E3E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  triageModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  triageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  triageModalTitle: { fontSize: 18, fontFamily: 'Catcut' },
  triageLabel: { fontSize: 13, fontFamily: 'Montserrat-Bold', marginBottom: 8 },
  categoryRow: { flexDirection: 'row', gap: 10 },
  categoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  symptomChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  symptomChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  symptomInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  severityBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  confirmTriageBtn: {
    backgroundColor: '#2E5E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 10,
  },
  confirmTriageText: { color: 'white', fontFamily: 'Montserrat-Bold', fontSize: 15 },
});
