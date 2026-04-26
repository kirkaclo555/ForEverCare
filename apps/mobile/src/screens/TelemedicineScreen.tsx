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
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: any;
};

export default function TelemedicineScreen({ navigation }: Props) {
  // sessionState: 'join' | 'waiting' | 'active' | 'prescription'
  const [sessionState, setSessionState] = useState<'join' | 'waiting' | 'active' | 'prescription'>('join');
  const [sessionCode, setSessionCode] = useState('');
  const [callDuration, setCallDuration] = useState(0);

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

  const handleJoin = () => {
    if (!sessionCode) {
      Alert.alert("Error", "Please enter a valid session code.");
      return;
    }
    setSessionState('waiting');
    
    // Simulate waiting for vet to join for 3 seconds
    setTimeout(() => {
      setSessionState('active');
    }, 3000);
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

  const renderContent = () => {
    if (sessionState === 'join') {
      return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
          <ScrollView contentContainerStyle={styles.scrollCenterContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <View style={styles.iconSquare}>
                <FontAwesome5 name="phone-alt" size={24} color="white" />
              </View>
              <Text style={styles.title}>Join Session</Text>
              <Text style={styles.subtitle}>Enter a session code to connect with your doctor</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Enter session code"
                placeholderTextColor="#a0aec0"
                value={sessionCode}
                onChangeText={setSessionCode}
                autoCapitalize="none"
              />
              
              <TouchableOpacity style={styles.primaryButton} onPress={handleJoin}>
                <Text style={styles.primaryButtonText}>Join Session</Text>
              </TouchableOpacity>
            </View>

            {/* Latest Activity Section */}
            <View style={styles.activitySection}>
              <View style={styles.activityHeader}>
                <FontAwesome5 name="history" size={16} color="#4a5568" />
                <Text style={styles.activityTitle}>Latest Activity</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.historyRow}>
                <View style={styles.historyIconBox}>
                  <FontAwesome5 name="video" size={14} color="#3a7d55" />
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historySessionTitle}>Consultation with Dr. Reyes</Text>
                  <Text style={styles.historySessionDate}>Yesterday, 10:30 AM</Text>
                  <Text style={styles.historyMetaText}>Duration: 15m • Rx Issued</Text>
                </View>
              </View>
            </View>
            <View style={{height: 40}}/>
          </ScrollView>
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
      return (
        <View style={styles.callContainer}>
          <View style={styles.callHeader}>
            <Text style={styles.callVetName}>Dr. Santos</Text>
            <Text style={styles.callTimer}>{formatTime(callDuration)}</Text>
          </View>
          
          {/* Main Video View (Vet) */}
          <View style={styles.mainVideo}>
            <FontAwesome5 name="user-md" size={100} color="#cbd5e0" />
            <Text style={styles.vetVideoTag}>Vet Camera</Text>
          </View>

          {/* PIP Video View (Pet Owner) */}
          <View style={styles.pipVideo}>
            <FontAwesome5 name="dog" size={40} color="#a0aec0" />
          </View>

          {/* Call Controls */}
          <View style={styles.callControls}>
             <TouchableOpacity style={styles.controlCircle}>
               <FontAwesome5 name="microphone-slash" size={20} color="white" />
             </TouchableOpacity>
             <TouchableOpacity style={[styles.controlCircle, styles.endCallCircle]} onPress={handleEndCall}>
               <FontAwesome5 name="phone-slash" size={20} color="white" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.controlCircle}>
               <FontAwesome5 name="video" size={20} color="white" />
             </TouchableOpacity>
          </View>
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={sessionState === 'active' ? "light-content" : "dark-content"} />
      {sessionState !== 'active' && (
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {navigation?.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
                <FontAwesome5 name="arrow-left" size={20} color="white" />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Telemedicine</Text>
          </View>
        </View>
      )}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7fafc' },
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
    backgroundColor: '#2E5E3E',
    borderBottomWidth: 0,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconSquare: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2E5E3E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#2E5E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1a202c', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 30, lineHeight: 22, paddingHorizontal: 10 },
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
  },
  primaryButton: {
    backgroundColor: '#2E5E3E',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2E5E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: { color: 'white', fontSize: 15, fontWeight: '700' },
  
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 15 },
  prescriptionTitle: { fontSize: 20, fontWeight: '700', color: '#2d3748', flex: 1 },
  divider: { height: 1, backgroundColor: '#edf2f7', marginVertical: 15 },
  medRow: { marginBottom: 15 },
  medName: { fontSize: 15, fontWeight: '600', color: '#2d3748', marginBottom: 4 },
  medDose: { fontSize: 13, color: '#718096' },
  vetNote: { fontSize: 14, fontStyle: 'italic', color: '#4a5568', marginBottom: 20 },
  secondaryButton: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c6f6d5',
  },
  secondaryButtonText: { color: '#3a7d55', fontSize: 15, fontWeight: '600' },
  
  // Activity Styles
  activitySection: {
    width: '100%',
    maxWidth: 360,
    marginTop: 30,
    paddingHorizontal: 10,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  activityTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#4a5568',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  historyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historySessionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 2,
  },
  historySessionDate: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  historyMetaText: {
    fontSize: 11,
    color: '#4a5568',
    fontWeight: '600',
  },
});
