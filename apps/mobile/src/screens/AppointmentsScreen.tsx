import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useUser } from '../context/UserContext';
import { usePetContext } from '../context/PetContext';
import { API_URL } from '../config/api';
import { useTheme } from '../context/ThemeContext';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import GuestRestriction from '../components/GuestRestriction';
import { useLanguage } from '../context/LanguageContext';
import { promptGuestAuth } from '../utils/auth';

const PetAvatar = ({ avatar, species, size = 16, color = 'white', style }: { avatar: string | null | undefined, species: string, size?: number, color?: string, style?: any }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [avatar]);

  const isImage = avatar && 
    (avatar.startsWith('file') || avatar.startsWith('http') || avatar.startsWith('data:image/')) && 
    !hasError;

  if (isImage) {
    return (
      <Image 
        source={{ uri: avatar }} 
        style={style} 
        onError={() => setHasError(true)}
      />
    );
  }

  const iconName = avatar === 'cat' || avatar === 'dog' || avatar === 'paw' 
    ? avatar 
    : (species.toLowerCase() === 'cat' ? 'cat' : 'dog');

  return (
    <FontAwesome5 
      name={iconName} 
      size={size} 
      color={color} 
    />
  );
};

export default function AppointmentsScreen() {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useUser();
  const { language } = useLanguage();
  const { pets, refreshPets } = usePetContext();
  const [filter, setFilter] = useState('All');
  const [selectedPetId, setSelectedPetId] = useState(pets.length > 0 ? pets[0].id : '');

  const [appointments, setAppointments] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [disabledTimeSlots, setDisabledTimeSlots] = useState<Record<string, { time: string, enabled: boolean }[]>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [inpersonPrice, setInpersonPrice] = useState(500);
  const [telemedicinePrice, setTelemedicinePrice] = useState(300);

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Code Copied", "Session code copied to clipboard!");
  };

  const fetchAppointments = () => {
    fetch(`${API_URL}/api/timeslots?t=${Date.now()}`, {
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

    return fetch(`${API_URL}/api/appointments`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setAllAppointments(data);

          const userAppointments = data.filter((app: any) =>
            app.owner === user?.fullName || app.contact === user?.phoneNumber
          );

          const mapped = userAppointments.map((app: any) => ({
            id: app.id,
            petName: app.pet || 'Unknown',
            breed: app.breed || 'Unknown',
            petIcon: app.species?.toLowerCase() === 'cat' ? 'cat' : 'dog',
            vetName: 'Dr. Assigned',
            service: app.purpose || app.type || 'Consultation',
            mode: app.type === 'telemedicine' ? '📹 Telemedicine' : '🏥 In-Person',
            date: app.date,
            time: app.time,
            sessionCode: app.sessionCode,
            createdAt: app.createdAt,
            purpose: app.purpose,
            status: app.purpose?.startsWith('[CANCEL_REQUESTED]') ? 'Cancel Pending' :
              app.status?.toLowerCase() === 'cancelled' ? 'Cancelled' :
                app.status?.toLowerCase() === 'declined' ? 'Declined' :
                (app.status?.toLowerCase() === 'pending' || app.status?.toLowerCase() === 'confirmed' || app.status?.toLowerCase() === 'paid') ? 'Upcoming' :
                  'Completed',
            rawStatus: app.status?.toLowerCase() || 'pending',
            statusLabel: app.status?.toLowerCase() === 'pending' ? 'Awaiting Verification' :
              app.status?.toLowerCase() === 'paid' ? 'Payment Verified' :
                app.status?.toLowerCase() === 'confirmed' ? 'Confirmed' :
                  app.status?.toLowerCase() === 'cancelled' ? 'Cancelled' :
                    app.status?.toLowerCase() === 'declined' ? 'Declined' :
                      app.status?.toLowerCase() === 'completed' ? 'Completed' : app.status,
            statusColor: app.purpose?.startsWith('[CANCEL_REQUESTED]') ? { bg: '#fee2e2', text: '#ef4444' } :
              app.status?.toLowerCase() === 'cancelled' ? { bg: '#fed7d7', text: '#e53e3e' } :
                app.status?.toLowerCase() === 'declined' ? { bg: '#fefcbf', text: '#dd6b20' } :
                app.status?.toLowerCase() === 'confirmed' ? { bg: '#feebc8', text: '#dd6b20' } :
                  app.status?.toLowerCase() === 'paid' ? { bg: '#dbeafe', text: '#2563eb' } :
                    app.status?.toLowerCase() === 'pending' ? { bg: '#edf2f7', text: '#4a5568' } :
                      { bg: '#e6fffa', text: '#319795' }
          }));
          const sorted = [...mapped].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const validA = isNaN(timeA) ? 0 : timeA;
            const validB = isNaN(timeB) ? 0 : timeB;
            return validB - validA;
          });
          setAppointments(sorted);
        }
      })
      .catch(err => console.error('Failed to fetch appointments:', err));
  };

  const fetchPrices = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/prices?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      if (data) {
        if (data.inperson !== undefined) setInpersonPrice(data.inperson);
        if (data.telemedicine !== undefined) setTelemedicinePrice(data.telemedicine);
      }
    } catch (err) {
      console.error('Error fetching appointment prices on mobile:', err);
    }
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPrices();
    fetchAppointments()?.finally(() => setRefreshing(false));
  }, [fetchPrices]);


  const stats = [
    { label: 'My Total', count: appointments.length, icon: 'paw', color: '#3182ce' },
    { label: 'Upcoming', count: appointments.filter(a => a.status === 'Upcoming' || a.status === 'Cancel Pending').length, icon: 'calendar-alt', color: '#dd6b20' },
    { label: 'Completed', count: appointments.filter(a => a.status === 'Completed').length, icon: 'check-circle', color: '#38a169' },
  ];

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'All') return true;
    if (filter === 'Upcoming') return app.status === 'Upcoming' || app.status === 'Cancel Pending';
    if (filter === 'Cancelled') return app.status === 'Cancelled' || app.status === 'Declined';
    return app.status === filter;
  });

  // === BOOKING MODAL STATE ===
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  const [consultType, setConsultType] = useState('In-Person Visit');
  const [selectedDate, setSelectedDate] = useState('Select Date');
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [appointmentReason, setAppointmentReason] = useState('Annual Checkup');
  const [appointmentNote, setAppointmentNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptImage, setReceiptImage] = useState('');

  const handlePickReceiptImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Refused", "You've refused to allow this app to access your photos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.3,
      base64: true,
    });
    const isCancelled = result.canceled !== undefined ? result.canceled : (result as any).cancelled;
    if (!isCancelled) {
      const asset = result.assets ? result.assets[0] : (result as any);
      let newReceiptUri = asset.uri;
      if (asset.base64) {
        newReceiptUri = `data:image/jpeg;base64,${asset.base64}`;
      }
      setReceiptImage(newReceiptUri);

      // Upload to Cloudinary in background to obtain permanent short URL
      try {
        fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: newReceiptUri,
            name: `receipt_${Date.now()}.jpg`,
          }),
        })
          .then(res => res.json())
          .then(uploadData => {
            if (uploadData.success && uploadData.url) {
              setReceiptImage(uploadData.url);
            }
          })
          .catch(upErr => console.warn('Receipt background upload warning:', upErr));
      } catch (uploadCatch) {
        console.warn('Receipt upload exception:', uploadCatch);
      }
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const [isRescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [rescheduleCalendarMonthOffset, setRescheduleCalendarMonthOffset] = useState(0);
  const [rescheduleAppId, setRescheduleAppId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('Select Date');
  const [rescheduleTime, setRescheduleTime] = useState('09:00 AM');

  React.useEffect(() => {
    fetchAppointments();
    fetchPrices();

    const interval = setInterval(() => {
      fetchAppointments();
      fetchPrices();
    }, 8000); // Poll every 8 seconds for dynamic updates

    return () => clearInterval(interval);
  }, [isModalVisible, isRescheduleModalVisible, fetchPrices]);

  const feeAmount = consultType === 'In-Person Visit' ? inpersonPrice : telemedicinePrice;

  // Helpers
  const formatDateForUI = (dateString: string) => {
    if (!dateString || dateString === 'Today' || dateString === 'Select Date') return dateString;
    if (dateString.includes('-')) {
      const [y, m, d] = dateString.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateString;
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      if (!selectedPetId) {
        Alert.alert("Pet Required", "Please select a pet for this appointment.");
        return;
      }
    }

    if (currentStep === 2) {
      if (selectedDate === 'Select Date' || selectedDate === 'Today') {
        Alert.alert("Date Required", "Please select an available date on the calendar.");
        return;
      }
      const bookedTimes = getBookedTimesForDate(selectedDate);
      if (bookedTimes.includes(selectedTime)) {
        Alert.alert("Time Required", "The selected time slot is already booked. Please choose another time.");
        return;
      }
    }

    if (currentStep === 4) {
      if (!paymentMethod) {
        Alert.alert("Required", "Please choose a payment method.");
        return;
      }
      if ((paymentMethod === 'GCash' || paymentMethod === 'Maya') && (!referenceNumber || referenceNumber.trim().length < 13)) {
        Alert.alert("Required", `Please enter a valid 13-digit ${paymentMethod} reference number.`);
        return;
      }
      if ((paymentMethod === 'GCash' || paymentMethod === 'Maya') && !receiptImage) {
        Alert.alert("Required", `Please upload a screenshot of your ${paymentMethod} receipt.`);
        return;
      }

      const formattedDate = selectedDate;
      const selectedPet = pets.find(p => p.id === selectedPetId);

      if (!user?.id || user.id === '' || !selectedPet?.id || selectedPet.id === '') {
        Alert.alert("Error", "Invalid user or pet ID. Please ensure your profile and pets are synced to the database before booking.");
        return;
      }

      // Check duplicate locally in allAppointments
      const isDuplicate = allAppointments.some((app: any) => {
        const isSamePet = app.pet?.toLowerCase() === selectedPet?.name?.toLowerCase();
        const isSameDate = app.date === formattedDate;
        const isSameTime = app.time === selectedTime;
        const isNotCancelled = app.status?.toLowerCase() !== 'cancelled';
        return isSamePet && isSameDate && isSameTime && isNotCancelled;
      });

      if (isDuplicate) {
        Alert.alert(
          "Duplicate Appointment",
          `An appointment for ${selectedPet?.name} on ${formatDateForUI(formattedDate)} at ${selectedTime} already exists.`
        );
        return;
      }

      setPaymentFailed(false);
      setIsProcessing(true);
      setCurrentStep(5);

      // Pre-sync pet if it has an unsynced or temporary ID
      let resolvedPetId = selectedPet.id;
      if (resolvedPetId.startsWith('temp-') || resolvedPetId.includes('.')) {
        try {
          const syncRes = await fetch(`${API_URL}/api/pets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, pet: selectedPet })
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.pet?.id) {
              resolvedPetId = syncData.pet.id;
              refreshPets();
            }
          }
        } catch (syncErr) {
          console.warn('Pre-booking pet sync error:', syncErr);
        }
      }

      const newAppointment = {
        ownerId: user?.id,
        petId: resolvedPetId,
        pet: selectedPet,
        date: formattedDate,
        time: selectedTime,
        type: consultType === 'In-Person Visit' ? 'inperson' : 'telemedicine',
        purpose: appointmentReason,
        status: "pending",
        referenceNumber: (paymentMethod === 'GCash' || paymentMethod === 'Maya') ? referenceNumber : undefined,
        amountPaid: feeAmount,
        receiptImage: (paymentMethod === 'GCash' || paymentMethod === 'Maya') ? receiptImage : undefined,
      };

      fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      })
        .then(async res => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP Error ${res.status}`);
          }
          return res.json();
        })
        .then(() => fetchAppointments())
        .then(() => refreshPets())
        .then(() => {
          setIsProcessing(false);
          setCurrentStep(6); // Success + Receipt
        })
        .catch(err => {
          console.error('Failed to save appointment:', err);
          setIsProcessing(false);
          setPaymentFailed(true);
          setCurrentStep(4); // Kick back to step 4 on failure
          Alert.alert("Booking Failed", err.message || "An unexpected error occurred. Please try again.");
        });

      return;
    }
    setCurrentStep(c => c + 1);
  };
  const prevStep = () => setCurrentStep(c => c > 1 ? c - 1 : 1);
  const resetAndClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      setCurrentStep(1);
      setConsultType('In-Person Visit');
      setSelectedDate('Select Date');
      setSelectedTime('09:00 AM');
      setAppointmentReason('Annual Checkup');
      setAppointmentNote('');
      setPaymentMethod('');
      setReferenceNumber('');
      setReceiptImage('');
      setPaymentFailed(false);
      setIsProcessing(false);
      setCalendarMonthOffset(0);
      setSelectedPetId(pets.length > 0 ? pets[0].id : '');
    }, 500);
  };
  const ALL_TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

  const getBookedTimesForDate = (formattedDate: string) => {
    const booked = allAppointments
      .filter(a => a.date === formattedDate && a.status?.toLowerCase() !== 'cancelled')
      .map(a => a.time);

    const disabledForDate = disabledTimeSlots[formattedDate] || [];
    const disabled = disabledForDate.filter(s => !s.enabled).map(s => s.time);

    // Add past slots for today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

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

  const getFullyBookedDates = (year: number, month: number) => {
    const bookedDates: number[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const totalUnavailable = getBookedTimesForDate(formattedDate).length;
      if (totalUnavailable >= ALL_TIME_SLOTS.length) {
        bookedDates.push(i);
      }
    }
    return bookedDates;
  };

  const handleDoneBooking = () => {
    resetAndClose();
  };

  const processCancel = (appId: string) => {
    fetch(`${API_URL}/api/appointments/${appId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelRequested: true })
    })
      .then(res => res.json())
      .then(() => {
        fetchAppointments();
        Alert.alert("Cancellation Requested", "Your request for cancellation has been sent to the admin.");
      })
      .catch(err => Alert.alert("Error", "Failed to submit cancellation request."));
  };

  const handleCancelClick = (appId: string) => {
    const app = appointments.find(a => a.id === appId);
    const createdTime = app?.createdAt ? new Date(app.createdAt).getTime() : Date.now();
    const now = Date.now();
    const isWithin24Hours = (now - createdTime) < 24 * 60 * 60 * 1000;

    if (!isWithin24Hours) {
      Alert.alert(
        "Cancellation Lapsed",
        "It has been more than 24 hours since you booked this appointment. You may only reschedule it.",
        [{ text: "OK" }]
      );
      return;
    }

    // Look up the raw status from the original appointment data
    const rawApp = allAppointments.find((a: any) => a.id === appId);
    const rawStatus = rawApp?.status?.toLowerCase() || app?.rawStatus || 'pending';
    const isPaymentVerified = rawStatus === 'paid';

    if (isPaymentVerified) {
      Alert.alert(
        "Cancel Appointment",
        "Your payment has been verified by the clinic. If you proceed with cancellation, a refund will be initiated and may take 3-5 business days to process. Do you want to continue?",
        [
          { text: "Go Back", style: "cancel" },
          {
            text: "Continue Cancellation",
            style: "destructive",
            onPress: () => processCancel(appId)
          }
        ]
      );
    } else {
      Alert.alert(
        "Cancel Appointment",
        "Your payment has not yet been verified by the clinic. If you cancel now, no refund will be issued. Do you want to continue?",
        [
          { text: "Go Back", style: "cancel" },
          {
            text: "Continue Cancellation",
            style: "destructive",
            onPress: () => processCancel(appId)
          }
        ]
      );
    }
  };

  const processWithdrawCancel = (appId: string) => {
    fetch(`${API_URL}/api/appointments/${appId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawCancel: true })
    })
      .then(res => res.json())
      .then(() => {
        fetchAppointments();
        Alert.alert("Cancellation Withdrawn", "Your cancellation request has been successfully withdrawn. Your appointment remains active.");
      })
      .catch(err => Alert.alert("Error", "Failed to withdraw cancellation request."));
  };

  const handleWithdrawCancelClick = (appId: string) => {
    Alert.alert(
      "Keep Appointment",
      "Are you sure you want to withdraw your cancellation request and keep this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Withdraw",
          onPress: () => processWithdrawCancel(appId)
        }
      ]
    );
  };

  const handleRescheduleClick = (appId: string) => {
    setRescheduleAppId(appId);
    setRescheduleDate('Select Date');
    setRescheduleTime('09:00 AM');
    setRescheduleCalendarMonthOffset(0);
    setRescheduleModalVisible(true);
  };

  const submitReschedule = () => {
    if (rescheduleDate === 'Select Date' || rescheduleDate === 'Today') {
      Alert.alert("Error", "Please select a valid new date.");
      return;
    }

    const formattedDate = rescheduleDate;

    fetch(`${API_URL}/api/appointments/${rescheduleAppId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: formattedDate, time: rescheduleTime })
    })
      .then(res => res.json())
      .then(() => {
        fetchAppointments();
        setRescheduleModalVisible(false);
        Alert.alert("Success", "Appointment rescheduled successfully!");
      })
      .catch(err => Alert.alert("Error", "Failed to reschedule appointment."));
  };

  const handleDownload = () => Alert.alert("Success", "Receipt saved to your device");
  const handleExport = () => Alert.alert("Success", "Receipt exported as PDF");

  // Renders Modal Content based on step
  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepHeader}>Which pet is this for?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 25 }}>
            {pets.map(pet => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petSelectCard,
                  selectedPetId === pet.id && styles.petSelectCardActive
                ]}
                onPress={() => setSelectedPetId(pet.id)}
              >
                <View style={[styles.petSelectAvatar, selectedPetId === pet.id && styles.petSelectAvatarActive]}>
                  <PetAvatar 
                    avatar={pet.avatar} 
                    species={pet.species} 
                    size={16} 
                    color={selectedPetId === pet.id ? '#3a7d55' : '#718096'} 
                    style={{ width: 30, height: 30, borderRadius: 15 }} 
                  />
                </View>
                <Text style={[styles.petSelectName, selectedPetId === pet.id && styles.petSelectNameActive]}>{pet.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.stepHeader}>Select Consultation Type</Text>
          <TouchableOpacity
            style={[styles.typeCard, consultType === 'In-Person Visit' && styles.typeCardSelected]}
            onPress={() => setConsultType('In-Person Visit')}
          >
            <FontAwesome5 name="hospital" size={24} color={consultType === 'In-Person Visit' ? '#3a7d55' : '#a0aec0'} />
            <View style={styles.typeCardTextGroup}>
              <Text style={[styles.typeCardTitle, consultType === 'In-Person Visit' && styles.typeCardTitleSelected]}>In-Person Visit</Text>
              <Text style={styles.typeCardDesc}>Visit the clinic physically (₱{inpersonPrice})</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeCard, consultType === 'Telemedicine' && styles.typeCardSelected]}
            onPress={() => {
              setConsultType('Telemedicine');
              setAppointmentReason('Consultation');
            }}
          >
            <FontAwesome5 name="video" size={24} color={consultType === 'Telemedicine' ? '#3a7d55' : '#a0aec0'} />
            <View style={styles.typeCardTextGroup}>
              <Text style={[styles.typeCardTitle, consultType === 'Telemedicine' && styles.typeCardTitleSelected]}>Telemedicine</Text>
              <Text style={styles.typeCardDesc}>Consult via video call (₱{telemedicinePrice})</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentStep === 2) {
      const today = new Date();
      const targetDate = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const fullMonthName = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startDayOfWeek = new Date(year, month, 1).getDay();

      const fullyBookedDates = getFullyBookedDates(year, month);

      const minDate = consultType === 'Telemedicine' ? new Date(today.getFullYear(), today.getMonth(), today.getDate()) : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
      minDate.setHours(0, 0, 0, 0);

      const renderCalendarDays = () => {
        const days = [];
        const totalSlots = 42;

        for (let i = 0; i < totalSlots; i++) {
          const dayNumber = i - startDayOfWeek + 1;
          const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

          if (!isCurrentMonth) {
            days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
          } else {
            const slotDate = new Date(year, month, dayNumber);
            slotDate.setHours(0, 0, 0, 0);

            const isPast = slotDate < minDate;
            const isBooked = fullyBookedDates.includes(dayNumber);
            const isAvailable = !isPast && !isBooked;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

            let isSelected = false;
            if (selectedDate === 'Today') {
              const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              isSelected = dateStr === todayDateStr;
            } else {
              isSelected = selectedDate === dateStr;
            }

            days.push(
              <TouchableOpacity
                key={`day-${dayNumber}`}
                style={styles.calendarDay}
                onPress={() => {
                  if (isAvailable) setSelectedDate(dateStr);
                }}
                disabled={!isAvailable}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.calendarDayInner,
                  isSelected ? styles.calendarDayInnerSelected :
                    isBooked ? styles.calendarDayInnerBooked :
                      isPast ? styles.calendarDayInnerPast : styles.calendarDayInnerAvailable
                ]}>
                  <Text style={[
                    styles.calendarDayText,
                    isSelected ? styles.calendarDayTextSelected :
                      isBooked ? styles.calendarDayTextBooked :
                        isPast ? styles.calendarDayTextPast : styles.calendarDayTextAvailable
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

      let formattedSelectedDate = selectedDate;
      if (selectedDate === 'Today') {
        formattedSelectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      }

      const bookedTimes = getBookedTimesForDate(formattedSelectedDate);

      return (
        <View style={styles.stepContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() => setCalendarMonthOffset(prev => prev - 1)}
              disabled={calendarMonthOffset === 0}
              style={{ padding: 10, opacity: calendarMonthOffset === 0 ? 0.3 : 1 }}
            >
              <FontAwesome5 name="chevron-left" size={16} color="#4a5568" />
            </TouchableOpacity>

            <Text style={[styles.stepHeader, { marginBottom: 0 }]}>{fullMonthName}</Text>

            <TouchableOpacity
              onPress={() => setCalendarMonthOffset(prev => prev + 1)}
              style={{ padding: 10 }}
            >
              <FontAwesome5 name="chevron-right" size={16} color="#4a5568" />
            </TouchableOpacity>
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

          <Text style={[styles.stepHeader, { marginTop: 25 }]}>Select Time</Text>
          <View style={styles.timeGrid}>
            {ALL_TIME_SLOTS.map(t => {
              const isTimeBooked = bookedTimes.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeSlot, selectedTime === t && styles.timeSlotActive, isTimeBooked && styles.timeSlotDisabled]}
                  onPress={() => !isTimeBooked && setSelectedTime(t)}
                  activeOpacity={isTimeBooked ? 1 : 0.7}
                >
                  <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive, isTimeBooked && styles.timeTextDisabled]}>{t}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <Text style={styles.hintText}>* Gray slots are fully booked</Text>
        </View>
      );
    }

    if (currentStep === 3) {
      const reasons = ['Annual Checkup', 'Vaccination', 'Consultation', 'Dental Cleaning', 'Grooming', 'Emergency', 'Other'];
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepHeader}>Primary Reason</Text>
          <View style={styles.chipGrid}>
            {reasons.map(r => {
              const isDisabled = consultType === 'Telemedicine' && r !== 'Consultation';
              return (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.reasonChip,
                    appointmentReason === r && !isDisabled && styles.reasonChipActive,
                    isDisabled && { opacity: 0.4, backgroundColor: '#f7fafc', borderColor: '#e2e8f0' }
                  ]}
                  onPress={() => setAppointmentReason(r)}
                  disabled={isDisabled}
                  activeOpacity={isDisabled ? 1 : 0.7}
                >
                  <Text style={[
                    styles.reasonChipText,
                    appointmentReason === r && !isDisabled && styles.reasonChipTextActive,
                    isDisabled && { color: '#a0aec0' }
                  ]}>{r}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <Text style={[styles.stepHeader, { marginTop: 20 }]}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="E.g., My dog hasn't been eating well..."
            placeholderTextColor="#a0aec0"
            value={appointmentNote}
            onChangeText={setAppointmentNote}
            textAlignVertical="top"
          />
        </View>
      );
    }

    if (currentStep === 4) {
      return (
        <View style={styles.stepContainer}>
          {paymentFailed && (
            <View style={styles.errorBox}>
              <FontAwesome5 name="exclamation-circle" size={16} color="#e53e3e" />
              <Text style={styles.errorText}>Payment failed or declined. Please try again or select another method.</Text>
            </View>
          )}

          <Text style={styles.stepHeader}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Pet</Text><Text style={styles.summaryVal}>{pets.find(p => p.id === selectedPetId)?.name || 'Unknown'}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Type</Text><Text style={styles.summaryVal}>{consultType}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Service</Text><Text style={styles.summaryVal}>{appointmentReason}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Schedule</Text><Text style={styles.summaryVal}>{formatDateForUI(selectedDate)} at {selectedTime}</Text></View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total Fee</Text><Text style={styles.summaryTotalVal}>₱{feeAmount.toFixed(2)}</Text></View>
          </View>

          <Text style={styles.stepHeader}>Payment Method</Text>
          {['GCash', 'Maya', 'Credit/Debit Card', 'Pay at Clinic'].map(method => (
            <View key={method}>
               <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  paymentMethod === method && styles.paymentMethodCardActive,
                  (method === 'GCash' || method === 'Maya') && paymentMethod === method && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0, marginBottom: 0 }
                ]}
                onPress={() => setPaymentMethod(method)}
              >
                <View style={[styles.radioOuter, paymentMethod === method && styles.radioOuterActive]}>
                  {paymentMethod === method && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.paymentMethodText}>{method}</Text>
              </TouchableOpacity>

              {method === 'GCash' && paymentMethod === 'GCash' && (
                <View style={{ backgroundColor: 'white', padding: 20, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: '#3182ce', borderTopWidth: 0 }}>
                  <Text style={{ textAlign: 'center', fontFamily: 'Poppins-Bold', color: '#2b6cb0', marginBottom: 15, fontSize: 16 }}>Scan to Pay</Text>
                  <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Image source={require('../../assets/gcash-qr.jpg')} style={{ width: 220, height: 220, borderRadius: 12 }} resizeMode="contain" />
                  </View>

                  <Text style={{ fontSize: 14, fontFamily: 'Poppins-Bold', color: '#4a5568', marginBottom: 10 }}>Reference Number</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: '#f7fafc', marginBottom: 20, color: '#2d3748' }}
                    placeholder="Enter 13-digit Reference No."
                    placeholderTextColor="#a0aec0"
                    keyboardType="numeric"
                    maxLength={13}
                    value={referenceNumber}
                    onChangeText={setReferenceNumber}
                  />

                  {receiptImage ? (
                    <View style={{ marginBottom: 20, alignItems: 'center' }}>
                      <Image source={{ uri: receiptImage }} style={{ width: 200, height: 200, borderRadius: 8, marginBottom: 10 }} resizeMode="cover" />
                      <TouchableOpacity 
                        onPress={() => setReceiptImage('')}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fed7d7', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#feb2b2', width: '100%' }}
                      >
                        <FontAwesome5 name="trash" size={14} color="#c53030" style={{ marginRight: 6 }} />
                        <Text style={{ fontFamily: 'Poppins-Bold', color: '#c53030', fontSize: 14 }}>Remove Screenshot</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={handlePickReceiptImage}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e0', borderStyle: 'dashed' }}
                    >
                      <FontAwesome5 name="upload" size={16} color="#4a5568" style={{ marginRight: 10 }} />
                      <Text style={{ fontFamily: 'Poppins-Bold', color: '#4a5568', fontSize: 15 }}>Upload Screenshot of Receipt</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {method === 'Maya' && paymentMethod === 'Maya' && (
                <View style={{ backgroundColor: 'white', padding: 20, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: '#5ebc16', borderTopWidth: 0 }}>
                  <Text style={{ textAlign: 'center', fontFamily: 'Poppins-Bold', color: '#5ebc16', marginBottom: 15, fontSize: 16 }}>Scan to Pay via Maya</Text>
                  <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Image source={require('../../assets/maya-qr.jpg')} style={{ width: 220, height: 220, borderRadius: 12 }} resizeMode="contain" />
                  </View>

                  <Text style={{ fontSize: 14, fontFamily: 'Poppins-Bold', color: '#4a5568', marginBottom: 10 }}>Reference Number</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: '#f7fafc', marginBottom: 20, color: '#2d3748' }}
                    placeholder="Enter 13-digit Reference No."
                    placeholderTextColor="#a0aec0"
                    keyboardType="numeric"
                    maxLength={13}
                    value={referenceNumber}
                    onChangeText={setReferenceNumber}
                  />

                  {receiptImage ? (
                    <View style={{ marginBottom: 20, alignItems: 'center' }}>
                      <Image source={{ uri: receiptImage }} style={{ width: 200, height: 200, borderRadius: 8, marginBottom: 10 }} resizeMode="cover" />
                      <TouchableOpacity 
                        onPress={() => setReceiptImage('')}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fed7d7', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#feb2b2', width: '100%' }}
                      >
                        <FontAwesome5 name="trash" size={14} color="#c53030" style={{ marginRight: 6 }} />
                        <Text style={{ fontFamily: 'Poppins-Bold', color: '#c53030', fontSize: 14 }}>Remove Screenshot</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={handlePickReceiptImage}
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e0', borderStyle: 'dashed' }}
                    >
                      <FontAwesome5 name="upload" size={16} color="#4a5568" style={{ marginRight: 10 }} />
                      <Text style={{ fontFamily: 'Poppins-Bold', color: '#4a5568', fontSize: 15 }}>Upload Screenshot of Receipt</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      );
    }

    if (currentStep === 5) {
      return (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#3a7d55" />
          <Text style={styles.processingText}>Processing your request...</Text>
        </View>
      );
    }

    if (currentStep === 6) {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.successHeader}>
            <View style={styles.checkCircle}>
              <FontAwesome5 name="check" size={32} color="white" />
            </View>
            <Text style={styles.successTitle}>Appointment Request Submitted!</Text>
            <Text style={styles.successDesc}>You will receive an SMS confirmation shortly to your registered mobile number.</Text>
          </View>

          <View style={styles.receiptCard}>
            <Text style={styles.receiptLabel}>RECEIPT</Text>
            <View style={styles.dividerDashed} />
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Pet</Text><Text style={styles.summaryVal}>{pets.find(p => p.id === selectedPetId)?.name || 'Unknown'}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Type</Text><Text style={styles.summaryVal}>{consultType}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Service</Text><Text style={styles.summaryVal}>{appointmentReason}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Schedule</Text><Text style={styles.summaryVal}>{formatDateForUI(selectedDate)} - {selectedTime}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Payment By</Text><Text style={styles.summaryVal}>{paymentMethod}</Text></View>
            <View style={styles.dividerDashed} />
            <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Paid</Text><Text style={styles.summaryTotalVal}>₱{feeAmount.toFixed(2)}</Text></View>
          </View>

          <View style={styles.actionRowReceipt}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleDownload}>
              <FontAwesome5 name="download" size={14} color="#4a5568" />
              <Text style={styles.secondaryBtnText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleExport}>
              <FontAwesome5 name="file-pdf" size={14} color="#4a5568" />
              <Text style={styles.secondaryBtnText}>Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  const renderRescheduleCalendarDays = () => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + rescheduleCalendarMonthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay();

    const fullyBookedDates = getFullyBookedDates(year, month);

    const appToReschedule = allAppointments.find(a => a.id === rescheduleAppId);
    const isTele = appToReschedule?.type === 'telemedicine';
    const minDate = isTele ? new Date(today.getFullYear(), today.getMonth(), today.getDate()) : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
    minDate.setHours(0, 0, 0, 0);

    const days = [];
    const totalSlots = 42;

    for (let i = 0; i < totalSlots; i++) {
      const dayNumber = i - startDayOfWeek + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

      if (!isCurrentMonth) {
        days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
      } else {
        const slotDate = new Date(year, month, dayNumber);
        slotDate.setHours(0, 0, 0, 0);

        const isPast = slotDate < minDate;
        const isBooked = fullyBookedDates.includes(dayNumber);
        const isAvailable = !isPast && !isBooked;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
        const isSelected = rescheduleDate === dateStr;

        days.push(
          <TouchableOpacity
            key={`day-${dayNumber}`}
            style={styles.calendarDay}
            onPress={() => {
              if (isAvailable) setRescheduleDate(dateStr);
            }}
            disabled={!isAvailable}
            activeOpacity={0.7}
          >
            <View style={[
              styles.calendarDayInner,
              isSelected ? styles.calendarDayInnerSelected :
                isBooked ? styles.calendarDayInnerBooked :
                  isPast ? styles.calendarDayInnerPast : styles.calendarDayInnerAvailable
            ]}>
              <Text style={[
                styles.calendarDayText,
                isSelected ? styles.calendarDayTextSelected :
                  isBooked ? styles.calendarDayTextBooked :
                    isPast ? styles.calendarDayTextPast : styles.calendarDayTextAvailable
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
          <Text style={styles.headerTitle}>My Appointments</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookNowButton} 
          onPress={() => {
            if (!user?.id || user.id.trim() === '') {
              promptGuestAuth(navigation, language);
            } else {
              setModalVisible(true);
            }
          }}
        >
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3a7d55']} />
        }
      >

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {stats.map((stat, idx) => (
            <View key={idx} style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.statIconBadge, { backgroundColor: stat.color + '15' }]}>
                <FontAwesome5 name={stat.icon} size={16} color={stat.color} />
              </View>
              <Text style={[styles.statCount, { color: theme.text }]}>{stat.count}</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['All', 'Upcoming', 'Completed', 'Cancelled'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, { backgroundColor: theme.card, borderColor: theme.border }, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, { color: theme.subtext }, filter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Appointment List */}
        <View style={styles.listContainer}>
          {filteredAppointments.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.emptyStateText, { color: theme.subtext }]}>No appointments yet. Book your first visit! 🐾</Text>
            </View>
          ) : (
            filteredAppointments.map((app) => (
              <View key={app.id} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedAppointment(app);
                    setIsDetailModalVisible(true);
                  }}
                >
                  <View style={[styles.itemHeader, { borderBottomColor: theme.border }]}>
                    <View style={styles.itemDateBadge}>
                      <Text style={[styles.itemDateText, { color: theme.text }]}>{app.date}</Text>
                      <Text style={[styles.itemTimeText, { color: theme.subtext }]}>{app.time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={[styles.statusTag, { backgroundColor: app.statusColor.bg }]}>
                        <Text style={[styles.statusTagText, { color: app.statusColor.text }]}>{app.status === 'Upcoming' ? app.statusLabel : app.status}</Text>
                      </View>
                      <FontAwesome5 name="chevron-right" size={12} color={isDarkMode ? '#718096' : '#a0aec0'} />
                    </View>
                  </View>

                  <View style={styles.itemBody}>
                    <View style={styles.clientSection}>
                      <View style={[styles.petAvatar, { backgroundColor: isDarkMode ? '#1c330e' : '#e6f2eb' }]}>
                        <FontAwesome5 name={app.petIcon} size={20} color={isDarkMode ? '#EAF3DE' : '#2E5E3E'} />
                      </View>
                      <View>
                        <Text style={[styles.petNameHeader, { color: theme.text }]}>{app.petName}</Text>
                        <Text style={[styles.petBreedText, { color: theme.subtext }]}>{app.breed}</Text>
                      </View>
                    </View>
                    <View style={[styles.serviceSection, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc' }]}>
                      <View>
                        <Text style={[styles.serviceType, { color: theme.text }]}>{app.service}</Text>
                        <Text style={[styles.serviceMode, { color: theme.subtext }]}>{app.mode}</Text>
                        {app.sessionCode && (
                          <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#2D5016', marginTop: 4 }}>
                            🔑 Code: {app.sessionCode}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Owner Actions for Upcoming or Cancel Pending Appointments */}
                {(app.status === 'Upcoming' || app.status === 'Cancel Pending') && (() => {
                  if (app.status === 'Cancel Pending') {
                    return (
                      <View style={styles.actionRowList}>
                        <TouchableOpacity style={[styles.actionButtonList, styles.withdrawButtonList]} onPress={() => handleWithdrawCancelClick(app.id)}>
                          <Text style={[styles.actionButtonTextList, styles.withdrawButtonTextList]}>Withdraw Cancellation</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }
                  const createdTime = app.createdAt ? new Date(app.createdAt).getTime() : Date.now();
                  const now = Date.now();
                  const isWithin24Hours = (now - createdTime) < 24 * 60 * 60 * 1000;
                  return (
                    <View style={styles.actionRowList}>
                      <TouchableOpacity style={styles.actionButtonList} onPress={() => handleRescheduleClick(app.id)}>
                        <Text style={styles.actionButtonTextList}>Reschedule</Text>
                      </TouchableOpacity>
                      {isWithin24Hours && (
                        <TouchableOpacity style={[styles.actionButtonList, styles.cancelButtonList]} onPress={() => handleCancelClick(app.id)}>
                          <Text style={[styles.actionButtonTextList, styles.cancelButtonTextList]}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })()}
              </View>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Appointment Detail Modal */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        transparent={Platform.OS === 'android'}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: isDarkMode ? (Platform.OS === 'android' ? 'rgba(0,0,0,0.7)' : theme.background) : undefined }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {selectedAppointment && (
              <>
                {/* Detail Header */}
                <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                  <TouchableOpacity onPress={() => setIsDetailModalVisible(false)} style={styles.backBtn}>
                    <FontAwesome5 name="times" size={20} color={theme.subtext} />
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Appointment Details</Text>
                  <View style={{ width: 20 }} />
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  {/* Status Banner */}
                  <View style={[styles.detailStatusBanner, { backgroundColor: selectedAppointment.statusColor.bg }]}>
                    <FontAwesome5
                      name={selectedAppointment.status === 'Completed' ? 'check-circle' : selectedAppointment.status === 'Cancelled' ? 'times-circle' : selectedAppointment.status === 'Cancel Pending' ? 'exclamation-circle' : 'clock'}
                      size={20}
                      color={selectedAppointment.statusColor.text}
                    />
                    <Text style={[styles.detailStatusText, { color: selectedAppointment.statusColor.text }]}>{selectedAppointment.status === 'Upcoming' ? selectedAppointment.statusLabel : selectedAppointment.status}</Text>
                  </View>

                  {/* Pet Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Pet Information</Text>
                    <View style={styles.detailPetRow}>
                      <View style={styles.detailPetAvatar}>
                        <FontAwesome5 name={selectedAppointment.petIcon} size={28} color="#2E5E3E" />
                      </View>
                      <View>
                        <Text style={styles.detailPetName}>{selectedAppointment.petName}</Text>
                        <Text style={styles.detailPetBreed}>{selectedAppointment.breed}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Schedule */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Schedule</Text>
                    <View style={styles.detailInfoRow}>
                      <View style={styles.detailInfoIcon}>
                        <FontAwesome5 name="calendar-alt" size={14} color="#3a7d55" />
                      </View>
                      <View>
                        <Text style={styles.detailInfoLabel}>Date</Text>
                        <Text style={styles.detailInfoValue}>{formatDateForUI(selectedAppointment.date)}</Text>
                      </View>
                    </View>
                    <View style={styles.detailInfoRow}>
                      <View style={styles.detailInfoIcon}>
                        <FontAwesome5 name="clock" size={14} color="#3a7d55" />
                      </View>
                      <View>
                        <Text style={styles.detailInfoLabel}>Time</Text>
                        <Text style={styles.detailInfoValue}>{selectedAppointment.time}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Service Details */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Service Details</Text>
                    <View style={styles.detailInfoRow}>
                      <View style={styles.detailInfoIcon}>
                        <FontAwesome5 name={selectedAppointment.mode.includes('Telemedicine') ? 'video' : 'hospital'} size={14} color="#3a7d55" />
                      </View>
                      <View>
                        <Text style={styles.detailInfoLabel}>Consultation Type</Text>
                        <Text style={styles.detailInfoValue}>{selectedAppointment.mode}</Text>
                      </View>
                    </View>
                    <View style={styles.detailInfoRow}>
                      <View style={styles.detailInfoIcon}>
                        <FontAwesome5 name="stethoscope" size={14} color="#3a7d55" />
                      </View>
                      <View>
                        <Text style={styles.detailInfoLabel}>Service</Text>
                        <Text style={styles.detailInfoValue}>{selectedAppointment.service}</Text>
                      </View>
                    </View>
                    {selectedAppointment.sessionCode && (
                      <View style={[styles.detailInfoRow, { justifyContent: 'space-between', alignItems: 'center' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <View style={styles.detailInfoIcon}>
                            <FontAwesome5 name="key" size={14} color="#3a7d55" />
                          </View>
                          <View>
                            <Text style={styles.detailInfoLabel}>Session Code</Text>
                            <Text style={[styles.detailInfoValue, { color: '#2D5016', fontFamily: 'Montserrat-Bold' }]}>{selectedAppointment.sessionCode}</Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          style={{
                            padding: 8,
                            backgroundColor: '#EAF3DE',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#D4EDBA',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onPress={() => copyToClipboard(selectedAppointment.sessionCode)}
                        >
                          <FontAwesome5 name="copy" size={14} color="#2D5016" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Booking Info */}
                  {selectedAppointment.createdAt && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Booking Info</Text>
                      <View style={styles.detailInfoRow}>
                        <View style={styles.detailInfoIcon}>
                          <FontAwesome5 name="receipt" size={14} color="#3a7d55" />
                        </View>
                        <View>
                          <Text style={styles.detailInfoLabel}>Booked On</Text>
                          <Text style={styles.detailInfoValue}>{new Date(selectedAppointment.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Actions for Upcoming or Cancel Pending */}
                  {selectedAppointment.status === 'Cancel Pending' && (
                    <View style={{ marginTop: 10, gap: 10 }}>
                      <TouchableOpacity
                        style={{ backgroundColor: '#2D5016', paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                        onPress={() => { setIsDetailModalVisible(false); handleWithdrawCancelClick(selectedAppointment.id); }}
                      >
                        <FontAwesome5 name="undo" size={14} color="white" />
                        <Text style={{ color: 'white', fontFamily: 'Montserrat-Bold', fontSize: 15 }}>Withdraw Cancellation</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedAppointment.status === 'Upcoming' && (() => {
                    const createdTime = selectedAppointment.createdAt ? new Date(selectedAppointment.createdAt).getTime() : Date.now();
                    const now = Date.now();
                    const isWithin24Hours = (now - createdTime) < 24 * 60 * 60 * 1000;
                    return (
                      <View style={{ marginTop: 10, gap: 10 }}>
                        <TouchableOpacity
                          style={{ backgroundColor: '#2D5016', paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                          onPress={() => { setIsDetailModalVisible(false); handleRescheduleClick(selectedAppointment.id); }}
                        >
                          <FontAwesome5 name="calendar-alt" size={14} color="white" />
                          <Text style={{ color: 'white', fontFamily: 'Montserrat-Bold', fontSize: 15 }}>Reschedule</Text>
                        </TouchableOpacity>
                        {isWithin24Hours && (
                          <TouchableOpacity
                            style={{ backgroundColor: '#fff5f5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#fed7d7', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                            onPress={() => { setIsDetailModalVisible(false); handleCancelClick(selectedAppointment.id); }}
                          >
                            <FontAwesome5 name="times-circle" size={14} color="#e53e3e" />
                            <Text style={{ color: '#e53e3e', fontFamily: 'Montserrat-Bold', fontSize: 15 }}>Cancel Appointment</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })()}

                  <View style={{ height: 30 }} />
                </ScrollView>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Reschedule Modal */}
      <Modal visible={isRescheduleModalVisible} animationType="slide" presentationStyle="formSheet" transparent={Platform.OS === 'android'}>
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: isDarkMode ? (Platform.OS === 'android' ? 'rgba(0,0,0,0.7)' : theme.background) : undefined }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setRescheduleModalVisible(false)} style={styles.backBtn}>
                <FontAwesome5 name={'times'} size={20} color={theme.subtext} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Reschedule Appointment</Text>
              <View style={{ width: 20 }} />
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 15 }}>
                <TouchableOpacity
                  onPress={() => setRescheduleCalendarMonthOffset(prev => prev - 1)}
                  disabled={rescheduleCalendarMonthOffset === 0}
                  style={{ padding: 10, opacity: rescheduleCalendarMonthOffset === 0 ? 0.3 : 1 }}
                >
                  <FontAwesome5 name="chevron-left" size={16} color="#4a5568" />
                </TouchableOpacity>

                <Text style={[styles.stepHeader, { marginBottom: 0, marginTop: 0 }]}>
                  {new Date(new Date().getFullYear(), new Date().getMonth() + rescheduleCalendarMonthOffset, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>

                <TouchableOpacity
                  onPress={() => setRescheduleCalendarMonthOffset(prev => prev + 1)}
                  style={{ padding: 10 }}
                >
                  <FontAwesome5 name="chevron-right" size={16} color="#4a5568" />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarGrid}>
                <View style={styles.calendarHeaderRow}>
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <Text key={d} style={styles.calendarDayHeader}>{d}</Text>)}
                </View>
                <View style={styles.calendarDaysContainer}>
                  {renderRescheduleCalendarDays()}
                </View>
              </View>

              <Text style={styles.stepHeader}>Select New Time</Text>
              <View style={styles.timeGrid}>
                {(() => {
                  const formattedRescheduleDate = rescheduleDate !== 'Select Date' ? rescheduleDate : '';
                  const bookedTimes = formattedRescheduleDate ? getBookedTimesForDate(formattedRescheduleDate) : [];

                  return ALL_TIME_SLOTS.map(time => {
                    const isTimeBooked = bookedTimes.includes(time);
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timeSlot, rescheduleTime === time && styles.timeSlotActive, isTimeBooked && styles.timeSlotDisabled]}
                        onPress={() => !isTimeBooked && setRescheduleTime(time)}
                        activeOpacity={isTimeBooked ? 1 : 0.7}
                      >
                        <Text style={[styles.timeText, rescheduleTime === time && styles.timeTextActive, isTimeBooked && styles.timeTextDisabled]}>{time}</Text>
                      </TouchableOpacity>
                    );
                  });
                })()}
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.nextBtn} onPress={submitReschedule}>
                <Text style={styles.nextBtnText}>Confirm Reschedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Booking Flow Modal */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="formSheet" transparent={Platform.OS === 'android'}>
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: isDarkMode ? (Platform.OS === 'android' ? 'rgba(0,0,0,0.7)' : theme.background) : undefined }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>

            {/* Modal Header & Progress */}
            {currentStep < 5 && (
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={currentStep === 1 ? resetAndClose : prevStep} style={styles.backBtn}>
                  <FontAwesome5 name={currentStep === 1 ? 'times' : 'chevron-left'} size={20} color={theme.subtext} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Book Appointment</Text>
                <View style={{ width: 20 }} />
              </View>
            )}

            {currentStep < 5 && (
              <View style={styles.progressContainer}>
                {[1, 2, 3, 4].map(s => (
                  <View key={s} style={[styles.progressDot, currentStep >= s && styles.progressDotActive]} />
                ))}
              </View>
            )}

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {renderStepContent()}
              <View style={{ height: 50 }} />
            </ScrollView>

            {/* Modal Footer */}
            {currentStep < 5 && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.nextBtn, currentStep === 4 && !paymentMethod && styles.nextBtnDisabled]}
                  onPress={nextStep}
                  disabled={currentStep === 4 && !paymentMethod}
                >
                  <Text style={styles.nextBtnText}>
                    {currentStep === 4 ? (paymentMethod === 'Pay at Clinic' ? 'Confirm Booking' : 'Pay Now') : 'Next'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {currentStep === 6 && (
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.nextBtn} onPress={handleDoneBooking}>
                  <Text style={styles.nextBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </SafeAreaView>
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
    paddingVertical: 15,
    backgroundColor: '#2D5016',
    borderBottomWidth: 0,
  },
  headerTitle: { fontFamily: 'Catcut', fontSize: 14, color: 'white' },
  bookNowButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  bookNowText: {
    color: '#2D5016',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  petSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  petSelectCardActive: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  petSelectAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#edf2f7',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  petSelectAvatarActive: {
    backgroundColor: 'white',
  },
  petSelectName: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#4a5568',
  },
  petSelectNameActive: {
    color: 'white',
  },
  mainScroll: { flex: 1, padding: 15 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: 4,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statCount: { fontSize: 20, fontFamily: 'Montserrat-Bold', color: '#2d3748' },
  statLabel: { fontSize: 11, color: '#718096', marginTop: 4, fontFamily: 'Montserrat-Regular' },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  filterChipActive: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  filterText: { fontSize: 13, color: '#4a5568', fontFamily: 'Montserrat-Medium' },
  filterTextActive: { color: 'white' },
  listContainer: { gap: 15 },
  emptyState: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#edf2f7',
    borderStyle: 'dashed'
  },
  emptyStateText: {
    fontSize: 14,
    color: '#a0aec0',
    fontFamily: 'Montserrat-Medium'
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    paddingBottom: 12,
    marginBottom: 12,
  },
  itemDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  itemDateText: { fontSize: 14, fontFamily: 'Montserrat-Bold', color: '#2d3748' },
  itemTimeText: { fontSize: 12, color: '#718096', fontFamily: 'Montserrat-Regular' },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTagText: { fontSize: 11, fontFamily: 'Montserrat-Bold', letterSpacing: 0.3 },
  itemBody: {},
  clientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  petAvatar: {
    width: 44,
    height: 44,
    backgroundColor: '#e6f2eb',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  petNameHeader: { fontSize: 16, fontFamily: 'Catcut', color: '#2d3748', marginBottom: 2 },
  petBreedText: { fontSize: 13, color: '#718096', fontFamily: 'Montserrat-Regular' },
  serviceSection: {
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf2f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6
  },
  vetNameText: { fontSize: 12, fontFamily: 'Montserrat-SemiBold', color: '#4a5568' },
  serviceType: { fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#4a5568', marginBottom: 2 },
  serviceMode: { fontSize: 12, color: '#718096', fontFamily: 'Montserrat-Regular' },
  actionRowList: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
  },
  actionButtonList: {
    flex: 1,
    backgroundColor: '#edf2f7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonTextList: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#4a5568',
  },
  cancelButtonList: {
    backgroundColor: '#fff5f5',
  },
  cancelButtonTextList: {
    color: '#e53e3e',
  },
  withdrawButtonList: {
    backgroundColor: '#EAF3DE',
  },
  withdrawButtonTextList: {
    color: '#2D5016',
  },

  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? 'rgba(0,0,0,0.5)' : '#fff',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    flex: Platform.OS === 'android' ? 0.95 : 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  backBtn: { padding: 5 },
  modalTitle: { fontSize: 18, fontFamily: 'Catcut', color: '#2d3748' },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
  },
  progressDot: {
    width: 30,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#2D5016',
  },
  modalScroll: { flex: 1, padding: 20 },
  stepContainer: { flex: 1 },
  stepHeader: { fontSize: 16, fontFamily: 'Catcut', color: '#2d3748', marginBottom: 15 },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 15,
  },
  typeCardSelected: { borderColor: '#2D5016', backgroundColor: '#EAF3DE', borderWidth: 2 },
  typeCardTextGroup: { marginLeft: 15 },
  typeCardTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#4a5568' },
  typeCardTitleSelected: { color: '#2D5016' },
  typeCardDesc: { fontSize: 13, color: '#718096', marginTop: 2, fontFamily: 'Montserrat-Regular' },

  calendarGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayHeader: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 5,
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
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
  calendarDayInnerSelected: {
    backgroundColor: '#2D5016',
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
  calendarDayText: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
  },
  calendarDayTextSelected: {
    color: '#fff',
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

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  timeSlotActive: { backgroundColor: '#EAF3DE', borderColor: '#7CB342', borderWidth: 1.5 },
  timeSlotDisabled: { backgroundColor: '#edf2f7', opacity: 0.5 },
  timeText: { fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#4a5568' },
  timeTextActive: { color: '#2D5016' },
  timeTextDisabled: { color: '#a0aec0' },
  hintText: { fontSize: 12, color: '#a0aec0', marginTop: 15, fontFamily: 'Montserrat-Regular' },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reasonChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  reasonChipActive: { backgroundColor: '#EAF3DE', borderColor: '#7CB342' },
  reasonChipText: { fontSize: 13, color: '#4a5568', fontFamily: 'Montserrat-Medium' },
  reasonChipTextActive: { color: '#2D5016' },

  textArea: {
    backgroundColor: '#edf2f7',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#2d3748',
    height: 100,
    fontFamily: 'Montserrat-Regular',
  },

  summaryCard: {
    backgroundColor: '#f7fafc',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 13, color: '#718096', fontFamily: 'Montserrat-Regular' },
  summaryVal: { fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#2d3748' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 10 },
  dividerDashed: { height: 1, borderBottomWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', marginVertical: 15 },
  summaryTotalLabel: { fontSize: 15, fontFamily: 'Montserrat-Bold', color: '#2d3748' },
  summaryTotalVal: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#7CB342' },

  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  paymentMethodCardActive: { backgroundColor: '#EAF3DE' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#a0aec0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  radioOuterActive: { borderColor: '#2D5016' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2D5016' },
  paymentMethodText: { fontSize: 15, fontFamily: 'Montserrat-Medium', color: '#2d3748' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#feb2b2',
  },
  errorText: { color: '#c53030', fontSize: 13, marginLeft: 10, flex: 1, fontFamily: 'Montserrat-Medium' },

  processingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 },
  processingText: { marginTop: 20, fontSize: 16, color: '#4a5568', fontFamily: 'Montserrat-Medium' },

  successHeader: { alignItems: 'center', marginVertical: 30 },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7CB342',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: { fontSize: 22, fontFamily: 'Catcut', color: '#2d3748', textAlign: 'center', marginBottom: 10 },
  successDesc: { fontSize: 14, color: '#718096', textAlign: 'center', paddingHorizontal: 20, fontFamily: 'Montserrat-Regular' },

  receiptCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 25,
  },
  receiptLabel: { fontSize: 12, fontFamily: 'Montserrat-Bold', color: '#a0aec0', letterSpacing: 1, alignSelf: 'center', marginBottom: 10 },

  actionRowReceipt: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#edf2f7',
    gap: 8,
  },
  secondaryBtnText: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#4a5568' },

  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    backgroundColor: 'white',
  },
  nextBtn: {
    backgroundColor: '#2D5016',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#a0aec0' },
  nextBtnText: { color: 'white', fontSize: 16, fontFamily: 'Montserrat-Bold' },

  // Detail Modal Styles
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  detailHeaderTitle: {
    fontSize: 17,
    fontFamily: 'Catcut',
    color: '#1a202c',
  },
  detailStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  detailStatusText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailSection: {
    marginTop: 18,
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  detailSectionTitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
    color: '#2D5016',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailPetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  detailPetAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailPetName: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#1a202c',
  },
  detailPetBreed: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#718096',
    marginTop: 2,
  },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailInfoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfoLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailInfoValue: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#2d3748',
    marginTop: 1,
  },
});
