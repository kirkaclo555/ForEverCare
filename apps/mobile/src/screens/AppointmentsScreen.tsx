import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

export default function AppointmentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState('All');
  
  // MOCK APPOINTMENTS DATA
  const [appointments, setAppointments] = useState([
    {
      id: "1",
      petName: "Buddy",
      breed: "Shih Tzu",
      petIcon: "dog",
      vetName: "Dr. Santos",
      service: "Annual Checkup",
      mode: "🏥 In-Person",
      date: "Mar 15",
      time: "09:00 AM",
      status: "Upcoming",
      statusColor: { bg: '#e6fffa', text: '#319795' }
    },
    {
      id: "2",
      petName: "Luna",
      breed: "Persian Cat",
      petIcon: "cat",
      vetName: "Dr. Reyes",
      service: "Consultation",
      mode: "📹 Telemedicine",
      date: "Mar 18",
      time: "02:00 PM",
      status: "Upcoming",
      statusColor: { bg: '#feebc8', text: '#dd6b20' }
    },
    {
      id: "3",
      petName: "Buddy",
      breed: "Shih Tzu",
      petIcon: "dog",
      vetName: "Dr. Reyes",
      service: "Vaccination",
      mode: "🏥 In-Person",
      date: "Jan 10",
      time: "10:30 AM",
      status: "Completed",
      statusColor: { bg: '#f0fff4', text: '#38a169' }
    }
  ]);

  const stats = [
    { label: 'My Total', count: appointments.length, icon: 'paw', color: '#3182ce' },
    { label: 'Upcoming', count: appointments.filter(a => a.status === 'Upcoming').length, icon: 'calendar-alt', color: '#dd6b20' },
    { label: 'Completed', count: appointments.filter(a => a.status === 'Completed').length, icon: 'check-circle', color: '#38a169' },
  ];

  const filteredAppointments = appointments.filter(app => 
    filter === 'All' ? true : app.status === filter
  );

  // === BOOKING MODAL STATE ===
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [consultType, setConsultType] = useState('In-Person Visit');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [appointmentReason, setAppointmentReason] = useState('Annual Checkup');
  const [appointmentNote, setAppointmentNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  const feeAmount = consultType === 'In-Person Visit' ? 500 : 300;

  // Helpers
  const nextStep = () => {
    if (currentStep === 4) {
      if (!paymentMethod) return;
      // Simulate Payment
      setPaymentFailed(false);
      setIsProcessing(true);
      setCurrentStep(5);
      
      setTimeout(() => {
        setIsProcessing(false);
        // Simulate arbitrary failure for demo unless Pay at Clinic is selected
        if (paymentMethod !== 'Pay at Clinic' && Math.random() < 0.2) {
          setPaymentFailed(true);
          setCurrentStep(4); // Kick back to step 4
        } else {
          setCurrentStep(6); // Success + Receipt
        }
      }, 1500);
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
      setSelectedDate('Today');
      setSelectedTime('09:00 AM');
      setAppointmentReason('Annual Checkup');
      setAppointmentNote('');
      setPaymentMethod('');
      setPaymentFailed(false);
      setIsProcessing(false);
    }, 500);
  };

  const handleDoneBooking = () => {
    // Add new dummy appt
    setAppointments([
       {
         id: Math.random().toString(),
         petName: "Buddy",
         breed: "Shih Tzu",
         petIcon: "dog",
         vetName: "Dr. Assigned",
         service: appointmentReason,
         mode: consultType === 'In-Person Visit' ? '🏥 In-Person' : '📹 Telemedicine',
         date: selectedDate,
         time: selectedTime,
         status: "Upcoming",
         statusColor: { bg: '#e6fffa', text: '#319795' }
       },
       ...appointments
    ]);
    resetAndClose();
  };

  const handleDownload = () => Alert.alert("Success", "Receipt saved to your device");
  const handleExport = () => Alert.alert("Success", "Receipt exported as PDF");

  // Renders Modal Content based on step
  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepHeader}>Select Consultation Type</Text>
          <TouchableOpacity 
             style={[styles.typeCard, consultType === 'In-Person Visit' && styles.typeCardSelected]}
             onPress={() => setConsultType('In-Person Visit')}
          >
             <FontAwesome5 name="hospital" size={24} color={consultType === 'In-Person Visit' ? '#3a7d55' : '#a0aec0'} />
             <View style={styles.typeCardTextGroup}>
               <Text style={[styles.typeCardTitle, consultType === 'In-Person Visit' && styles.typeCardTitleSelected]}>In-Person Visit</Text>
               <Text style={styles.typeCardDesc}>Visit the clinic physically (₱500)</Text>
             </View>
          </TouchableOpacity>

          <TouchableOpacity 
             style={[styles.typeCard, consultType === 'Telemedicine' && styles.typeCardSelected]}
             onPress={() => setConsultType('Telemedicine')}
          >
             <FontAwesome5 name="video" size={24} color={consultType === 'Telemedicine' ? '#3a7d55' : '#a0aec0'} />
             <View style={styles.typeCardTextGroup}>
               <Text style={[styles.typeCardTitle, consultType === 'Telemedicine' && styles.typeCardTitleSelected]}>Telemedicine</Text>
               <Text style={styles.typeCardDesc}>Consult via video call (₱300)</Text>
             </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentStep === 2) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const monthName = today.toLocaleString('default', { month: 'short' });
      const fullMonthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startDayOfWeek = new Date(year, month, 1).getDay();
      const todayDate = today.getDate();
      const fullyBookedDates = [5, 12, 14, 18, 22, 25];

      const renderCalendarDays = () => {
        const days = [];
        const totalSlots = 42;
        
        for (let i = 0; i < totalSlots; i++) {
          const dayNumber = i - startDayOfWeek + 1;
          const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

          if (!isCurrentMonth) {
            days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
          } else {
            const isPast = dayNumber < todayDate;
            const isBooked = fullyBookedDates.includes(dayNumber);
            const isAvailable = !isPast && !isBooked;
            
            const dateStr = `${monthName} ${dayNumber}`;
            const isSelected = selectedDate === dateStr || (selectedDate === 'Today' && dayNumber === todayDate);

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

      const times = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'];
      return (
        <View style={styles.stepContainer}>
          <Text style={[styles.stepHeader, { marginBottom: 10 }]}>{fullMonthName}</Text>
          
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
            {times.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.timeSlot, selectedTime === t && styles.timeSlotActive, t === '11:00 AM' && styles.timeSlotDisabled]}
                onPress={() => t !== '11:00 AM' && setSelectedTime(t)}
                activeOpacity={t === '11:00 AM' ? 1 : 0.7}
              >
                <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive, t === '11:00 AM' && styles.timeTextDisabled]}>{t}</Text>
              </TouchableOpacity>
            ))}
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
            {reasons.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.reasonChip, appointmentReason === r && styles.reasonChipActive]}
                onPress={() => setAppointmentReason(r)}
              >
                <Text style={[styles.reasonChipText, appointmentReason === r && styles.reasonChipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.stepHeader, {marginTop: 20}]}>Additional Notes (Optional)</Text>
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
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Pet</Text><Text style={styles.summaryVal}>Buddy</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Type</Text><Text style={styles.summaryVal}>{consultType}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Service</Text><Text style={styles.summaryVal}>{appointmentReason}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Schedule</Text><Text style={styles.summaryVal}>{selectedDate} at {selectedTime}</Text></View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total Fee</Text><Text style={styles.summaryTotalVal}>₱{feeAmount.toFixed(2)}</Text></View>
          </View>

          <Text style={styles.stepHeader}>Payment Method</Text>
          {['GCash', 'Maya', 'Credit/Debit Card', 'Pay at Clinic'].map(method => (
            <TouchableOpacity 
              key={method} 
              style={[styles.paymentMethodCard, paymentMethod === method && styles.paymentMethodCardActive]}
              onPress={() => setPaymentMethod(method)}
            >
              <View style={[styles.radioOuter, paymentMethod === method && styles.radioOuterActive]}>
                {paymentMethod === method && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.paymentMethodText}>{method}</Text>
            </TouchableOpacity>
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
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Pet</Text><Text style={styles.summaryVal}>Buddy</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Type</Text><Text style={styles.summaryVal}>{consultType}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Service</Text><Text style={styles.summaryVal}>{appointmentReason}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Schedule</Text><Text style={styles.summaryVal}>{selectedDate} - {selectedTime}</Text></View>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation?.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>My Appointments</Text>
        </View>
        <TouchableOpacity style={styles.bookNowButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
        
        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <View style={[styles.statIconBadge, { backgroundColor: stat.color + '15' }]}>
                <FontAwesome5 name={stat.icon} size={16} color={stat.color} />
              </View>
              <Text style={styles.statCount}>{stat.count}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['All', 'Upcoming', 'Completed', 'Cancelled'].map((f) => (
              <TouchableOpacity 
                key={f} 
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Appointment List */}
        <View style={styles.listContainer}>
          {filteredAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No appointments yet. Book your first visit! 🐾</Text>
            </View>
          ) : (
            filteredAppointments.map((app) => (
              <View key={app.id} style={styles.listItem}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemDateBadge}>
                    <Text style={styles.itemDateText}>{app.date}</Text>
                    <Text style={styles.itemTimeText}>{app.time}</Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: app.statusColor.bg }]}>
                    <Text style={[styles.statusTagText, { color: app.statusColor.text }]}>{app.status}</Text>
                  </View>
                </View>
                
                <View style={styles.itemBody}>
                  <View style={styles.clientSection}>
                    <View style={styles.petAvatar}>
                      <FontAwesome5 name={app.petIcon} size={20} color="#2E5E3E" />
                    </View>
                    <View>
                      <Text style={styles.petNameHeader}>{app.petName}</Text>
                      <Text style={styles.petBreedText}>{app.breed}</Text>
                    </View>
                  </View>
                  <View style={styles.serviceSection}>
                    <View>
                      <Text style={styles.serviceType}>{app.service}</Text>
                      <Text style={styles.serviceMode}>{app.mode}</Text>
                    </View>
                    <View style={styles.vetContainer}>
                      <FontAwesome5 name="user-md" size={12} color="#718096" />
                      <Text style={styles.vetNameText}>{app.vetName}</Text>
                    </View>
                  </View>
                </View>

                {/* Owner Actions for Upcoming Appointments */}
                {app.status === 'Upcoming' && (
                  <View style={styles.actionRowList}>
                    <TouchableOpacity style={styles.actionButtonList}>
                      <Text style={styles.actionButtonTextList}>Reschedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButtonList, styles.cancelButtonList]}>
                      <Text style={[styles.actionButtonTextList, styles.cancelButtonTextList]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
        <View style={{height: 40}} />
      </ScrollView>

      {/* Booking Flow Modal */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="formSheet" transparent={Platform.OS === 'android'}>
        <SafeAreaView style={styles.modalSafeArea}>
           <View style={styles.modalContent}>
             
             {/* Modal Header & Progress */}
             {currentStep < 5 && (
               <View style={styles.modalHeader}>
                 <TouchableOpacity onPress={currentStep === 1 ? resetAndClose : prevStep} style={styles.backBtn}>
                   <FontAwesome5 name={currentStep === 1 ? 'times' : 'chevron-left'} size={20} color="#4a5568" />
                 </TouchableOpacity>
                 <Text style={styles.modalTitle}>Book Appointment</Text>
                 <View style={{width: 20}} />
               </View>
             )}
             
             {currentStep < 5 && (
               <View style={styles.progressContainer}>
                 {[1,2,3,4].map(s => (
                   <View key={s} style={[styles.progressDot, currentStep >= s && styles.progressDotActive]} />
                 ))}
               </View>
             )}

             <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
               {renderStepContent()}
               <View style={{height: 50}} />
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
  safeArea: { flex: 1, backgroundColor: '#f7fafc' },
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
  bookNowButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookNowText: {
    color: '#2E5E3E',
    fontSize: 14,
    fontWeight: '700',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statCount: { fontSize: 20, fontWeight: '700', color: '#2d3748' },
  statLabel: { fontSize: 11, color: '#718096', marginTop: 4 },
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#2E5E3E',
    borderColor: '#2E5E3E',
  },
  filterText: { fontSize: 13, color: '#4a5568', fontWeight: '500' },
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
    fontWeight: '500'
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
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
  },
  itemDateText: { fontSize: 14, fontWeight: '700', color: '#2d3748' },
  itemTimeText: { fontSize: 12, color: '#718096' },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: { fontSize: 11, fontWeight: '700' },
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
  petNameHeader: { fontSize: 16, fontWeight: '700', color: '#2d3748', marginBottom: 2 },
  petBreedText: { fontSize: 13, color: '#718096' },
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
  vetNameText: { fontSize: 12, fontWeight: '600', color: '#4a5568' },
  serviceType: { fontSize: 13, fontWeight: '600', color: '#4a5568', marginBottom: 2 },
  serviceMode: { fontSize: 12, color: '#718096' },
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
    fontWeight: '600',
    color: '#4a5568',
  },
  cancelButtonList: {
    backgroundColor: '#fff5f5',
  },
  cancelButtonTextList: {
    color: '#e53e3e',
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
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2d3748' },
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
    backgroundColor: '#3a7d55',
  },
  modalScroll: { flex: 1, padding: 20 },
  stepContainer: { flex: 1 },
  stepHeader: { fontSize: 16, fontWeight: '700', color: '#2d3748', marginBottom: 15 },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 15,
  },
  typeCardSelected: { borderColor: '#3a7d55', backgroundColor: '#f0fdf4' },
  typeCardTextGroup: { marginLeft: 15 },
  typeCardTitle: { fontSize: 16, fontWeight: '700', color: '#4a5568' },
  typeCardTitleSelected: { color: '#3a7d55' },
  typeCardDesc: { fontSize: 13, color: '#718096', marginTop: 2 },
  
  calendarGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayInnerSelected: {
    backgroundColor: '#2E5E3E',
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
  calendarDayTextSelected: {
    color: '#fff',
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
  
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  timeSlotActive: { backgroundColor: '#e6fffa', borderColor: '#319795' },
  timeSlotDisabled: { backgroundColor: '#edf2f7', opacity: 0.5 },
  timeText: { fontSize: 13, fontWeight: '600', color: '#4a5568' },
  timeTextActive: { color: '#319795' },
  timeTextDisabled: { color: '#a0aec0' },
  hintText: { fontSize: 12, color: '#a0aec0', marginTop: 15 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reasonChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#edf2f7',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonChipActive: { backgroundColor: '#e6fffa', borderColor: '#319795' },
  reasonChipText: { fontSize: 13, color: '#4a5568', fontWeight: '500' },
  reasonChipTextActive: { color: '#319795' },

  textArea: {
    backgroundColor: '#edf2f7',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#2d3748',
    height: 100,
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
  summaryLabel: { fontSize: 13, color: '#718096' },
  summaryVal: { fontSize: 13, fontWeight: '600', color: '#2d3748' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 10 },
  dividerDashed: { height: 1, borderBottomWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', marginVertical: 15 },
  summaryTotalLabel: { fontSize: 15, fontWeight: '700', color: '#2d3748' },
  summaryTotalVal: { fontSize: 16, fontWeight: '700', color: '#319795' },

  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  paymentMethodCardActive: { backgroundColor: '#f0fdf4' },
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
  radioOuterActive: { borderColor: '#3a7d55' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3a7d55' },
  paymentMethodText: { fontSize: 15, fontWeight: '500', color: '#2d3748' },

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
  errorText: { color: '#c53030', fontSize: 13, marginLeft: 10, flex: 1 },

  processingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 },
  processingText: { marginTop: 20, fontSize: 16, color: '#4a5568', fontWeight: '500' },

  successHeader: { alignItems: 'center', marginVertical: 30 },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#38a169',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#2d3748', textAlign: 'center', marginBottom: 10 },
  successDesc: { fontSize: 14, color: '#718096', textAlign: 'center', paddingHorizontal: 20 },

  receiptCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 25,
  },
  receiptLabel: { fontSize: 12, fontWeight: '700', color: '#a0aec0', letterSpacing: 1, alignSelf: 'center', marginBottom: 10 },

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
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: '#4a5568' },

  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    backgroundColor: 'white',
  },
  nextBtn: {
    backgroundColor: '#2E5E3E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#a0aec0' },
  nextBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
