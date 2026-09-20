import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

// Match existing stack types
type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Users: undefined;
  Appointments: undefined;
  Pets: undefined;
  PetRecords: undefined;
};

type PetRecordsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PetRecords'>;

type Props = {
  navigation?: PetRecordsScreenNavigationProp;
};

import { usePetContext, PetProfile } from '../context/PetContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import GuestRestriction from '../components/GuestRestriction';
import { useLanguage } from '../context/LanguageContext';
import { promptGuestAuth } from '../utils/auth';
import {
  VaccinationRecord,
  getVaccineRecords,
  saveVaccineRecord,
  deleteVaccineRecord,
  getVaccineStatus,
} from '../utils/vaccineReminders';

const DOG_BREEDS = ["Aspin", "Golden Retriever", "Labrador", "Poodle", "Bulldog", "Beagle", "Pug", "Chihuahua", "Shih Tzu", "Husky", "German Shepherd", "Rottweiler", "Dachshund", "Boxer", "Doberman", "Great Dane", "Pomeranian", "Corgi", "Shiba Inu", "Chow Chow", "Dalmatian", "Mixed"];
const CAT_BREEDS = ["Puspin", "Persian", "Siamese", "Maine Coon", "Bengal", "Sphynx", "British Shorthair", "Scottish Fold", "Mixed"];
const PET_TYPES = ["Dog", "Cat"];

const PetAvatar = ({ avatar, species, size = 30, style }: { avatar: string | null | undefined, species: string, size?: number, style?: any }) => {
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
      color="white" 
    />
  );
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DatePickerInput = ({
  value,
  onChangeDate,
  placeholder = 'YYYY-MM-DD',
  label,
  isDarkMode,
  style,
  inputStyle,
}: {
  value: string;
  onChangeDate: (val: string) => void;
  placeholder?: string;
  label?: string;
  isDarkMode?: boolean;
  style?: any;
  inputStyle?: any;
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handleSelectDay = (day: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    onChangeDate(dateStr);
    setShowCalendar(false);
  };

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const parseSelectedDay = () => {
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = value.split('-').map(Number);
      if (y === year && m === month + 1) return d;
    }
    return null;
  };
  const selectedDay = parseSelectedDay();

  return (
    <View style={style}>
      {label && (
        <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 12, color: isDarkMode ? '#a0aec0' : '#4a5568', marginBottom: 6 }}>
          {label}
        </Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          style={[
            {
              flex: 1,
              backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc',
              borderWidth: 1,
              borderColor: isDarkMode ? '#4a5568' : '#e2e8f0',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontFamily: 'Montserrat-Medium',
              fontSize: 14,
              color: isDarkMode ? 'white' : '#2d3748',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeDate}
          placeholder={placeholder}
          placeholderTextColor="#a0aec0"
        />
        <TouchableOpacity
          onPress={() => setShowCalendar(true)}
          style={{
            backgroundColor: '#2E5E3E',
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontAwesome5 name="calendar-alt" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: isDarkMode ? '#1a202c' : 'white', borderRadius: 20, width: '100%', maxWidth: 360, padding: 20, elevation: 5 }}>
            
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 8 }}>
                <FontAwesome5 name="chevron-left" size={16} color={isDarkMode ? '#c6f6d5' : '#2E5E3E'} />
              </TouchableOpacity>

              <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, color: isDarkMode ? 'white' : '#2d3748' }}>
                {MONTH_NAMES[month]} {year}
              </Text>

              <TouchableOpacity onPress={handleNextMonth} style={{ padding: 8 }}>
                <FontAwesome5 name="chevron-right" size={16} color={isDarkMode ? '#c6f6d5' : '#2E5E3E'} />
              </TouchableOpacity>
            </View>

            {/* Quick Helper Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
              <TouchableOpacity
                onPress={() => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  onChangeDate(todayStr);
                  setShowCalendar(false);
                }}
                style={{ backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 11, color: isDarkMode ? '#c6f6d5' : '#2E5E3E' }}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const d = new Date();
                  d.setFullYear(d.getFullYear() + 1);
                  onChangeDate(d.toISOString().split('T')[0]);
                  setShowCalendar(false);
                }}
                style={{ backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 11, color: isDarkMode ? '#c6f6d5' : '#2E5E3E' }}>+1 Year</Text>
              </TouchableOpacity>
            </View>

            {/* Days of week header */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((dayName, idx) => (
                <Text key={idx} style={{ flex: 1, textAlign: 'center', fontFamily: 'Montserrat-Bold', fontSize: 12, color: isDarkMode ? '#a0aec0' : '#718096' }}>
                  {dayName}
                </Text>
              ))}
            </View>

            {/* Day grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {daysArray.map((day, idx) => {
                if (day === null) {
                  return <View key={`empty-${idx}`} style={{ width: '14.28%', height: 38 }} />;
                }

                const isSelected = selectedDay === day;

                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    onPress={() => handleSelectDay(day)}
                    style={{
                      width: '14.28%',
                      height: 38,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isSelected ? '#2E5E3E' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{
                        fontFamily: isSelected ? 'Montserrat-Bold' : 'Montserrat-Medium',
                        fontSize: 13,
                        color: isSelected ? 'white' : (isDarkMode ? '#e2e8f0' : '#2d3748'),
                      }}>
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Close button */}
            <TouchableOpacity
              onPress={() => setShowCalendar(false)}
              style={{ marginTop: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: isDarkMode ? '#4a5568' : '#cbd5e0', alignItems: 'center' }}
            >
              <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 13, color: isDarkMode ? '#a0aec0' : '#4a5568' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Vaccines Tab Content Component ─────────────────────────────────────────
const VaccinesTabContent = ({
  petId,
  petName,
  vaccineString,
}: {
  petId: string;
  petName: string;
  vaccineString?: string;
}) => {
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const [records, setRecords] = React.useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal / Form state for Add or Edit vaccine date
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingRecordId, setEditingRecordId] = React.useState<string | null>(null);
  const [vaccineName, setVaccineName] = React.useState('');
  const [vaccineType, setVaccineType] = React.useState('Core');
  const [vaccinationDate, setVaccinationDate] = React.useState('');
  const [nextDueDate, setNextDueDate] = React.useState('');
  const [vetClinic, setVetClinic] = React.useState('');

  const loadRecords = React.useCallback(async () => {
    setLoading(true);
    const r = await getVaccineRecords(petId);
    setRecords(r);
    setLoading(false);
  }, [petId]);

  React.useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleOpenAddModal = () => {
    setEditingRecordId(null);
    setVaccineName('');
    setVaccineType('Core');
    const todayStr = new Date().toISOString().split('T')[0];
    const nextYearDate = new Date();
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    const nextYearStr = nextYearDate.toISOString().split('T')[0];
    setVaccinationDate(todayStr);
    setNextDueDate(nextYearStr);
    setVetClinic('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: VaccinationRecord) => {
    setEditingRecordId(rec.id);
    setVaccineName(rec.vaccineName);
    setVaccineType(rec.vaccineType);
    setVaccinationDate(rec.vaccinationDate);
    setNextDueDate(rec.nextDueDate);
    setVetClinic(rec.vetClinic || '');
    setIsModalOpen(true);
  };

  const handleSaveRecord = async () => {
    if (!vaccineName.trim()) {
      Alert.alert('Validation Error', 'Please enter a vaccine name.');
      return;
    }
    if (!vaccinationDate.trim() && !nextDueDate.trim()) {
      Alert.alert('Validation Error', 'Please enter at least Date Given or Next Due Date.');
      return;
    }

    const record: VaccinationRecord = {
      id: editingRecordId || Date.now().toString(),
      vaccineName: vaccineName.trim(),
      vaccineType: vaccineType || 'Core',
      vaccinationDate: vaccinationDate.trim(),
      nextDueDate: nextDueDate.trim(),
      vetClinic: vetClinic.trim() || undefined,
    };

    await saveVaccineRecord(petId, record, user?.id, petName, user?.email, user?.phoneNumber);
    setIsModalOpen(false);
    loadRecords();
  };

  const handleDeleteRecord = (recordId: string, name: string) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete the "${name}" record?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteVaccineRecord(petId, recordId);
            loadRecords();
          },
        },
      ]
    );
  };

  // Legacy string-based vaccine fallback from clinic
  const legacyVaccines: { name: string; fromClinic: boolean }[] = [];
  if (vaccineString && vaccineString.toLowerCase() !== 'pending' && vaccineString.trim() !== '') {
    vaccineString.split(',').forEach(v => {
      const cleaned = v.trim();
      if (cleaned) legacyVaccines.push({ name: cleaned, fromClinic: true });
    });
  }

  const hasNoRecords = records.length === 0 && legacyVaccines.length === 0;

  return (
    <View>
      {/* Top action bar: Add Vaccine button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#2E5E3E',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
        onPress={handleOpenAddModal}
      >
        <FontAwesome5 name="plus" size={14} color="white" style={{ marginRight: 8 }} />
        <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 13, color: 'white' }}>
          + Add Vaccine Date / Record
        </Text>
      </TouchableOpacity>

      {loading ? (
        <View style={{ alignItems: 'center', padding: 25 }}>
          <Text style={{ color: '#a0aec0', fontFamily: 'Montserrat-Medium' }}>Loading vaccination records…</Text>
        </View>
      ) : (
        <>
          {/* App-registered vaccination records */}
          {records.map(rec => {
            const status = getVaccineStatus(rec.nextDueDate);
            return (
              <View
                key={rec.id}
                style={{
                  backgroundColor: isDarkMode ? '#1a2a1a' : 'white',
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#2d5016' : '#e2e8f0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {/* Header row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#EAF3DE', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                      <FontAwesome5 name="syringe" size={16} color="#2E5E3E" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 14, color: isDarkMode ? '#e2e8f0' : '#2d3748' }}>
                        {rec.vaccineName}
                      </Text>
                      <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 11, color: isDarkMode ? '#a0aec0' : '#718096', marginTop: 1 }}>
                        Type: {rec.vaccineType}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ backgroundColor: status.bgColor, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <FontAwesome5 name={status.icon} size={10} color={status.color} />
                      <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 10, color: status.color }}>{status.label}</Text>
                    </View>

                    {/* Edit button */}
                    <TouchableOpacity
                      onPress={() => handleOpenEditModal(rec)}
                      style={{ padding: 6, backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7', borderRadius: 8 }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <FontAwesome5 name="pen" size={11} color={isDarkMode ? '#a0aec0' : '#4a5568'} />
                    </TouchableOpacity>

                    {/* Delete button */}
                    <TouchableOpacity
                      onPress={() => handleDeleteRecord(rec.id, rec.vaccineName)}
                      style={{ padding: 6, backgroundColor: isDarkMode ? '#3b1d1d' : '#fff5f5', borderRadius: 8 }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <FontAwesome5 name="trash" size={11} color="#e53e3e" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Date info row */}
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ flex: 1, backgroundColor: isDarkMode ? '#1f3320' : '#f7fafc', borderRadius: 8, padding: 10 }}>
                    <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 10, color: isDarkMode ? '#718096' : '#a0aec0', marginBottom: 2 }}>DATE GIVEN</Text>
                    <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: isDarkMode ? '#c6f6d5' : '#2d3748' }}>
                      {rec.vaccinationDate
                        ? new Date(rec.vaccinationDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                        : '—'}
                    </Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: isDarkMode ? '#1f3320' : '#f7fafc', borderRadius: 8, padding: 10 }}>
                    <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 10, color: isDarkMode ? '#718096' : '#a0aec0', marginBottom: 2 }}>NEXT DUE</Text>
                    <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: status.color }}>
                      {rec.nextDueDate
                        ? new Date(rec.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                        : '—'}
                    </Text>
                  </View>
                </View>

                {rec.vetClinic && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: isDarkMode ? '#2d5016' : '#edf2f7' }}>
                    <FontAwesome5 name="clinic-medical" size={11} color="#718096" style={{ marginRight: 6 }} />
                    <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 11, color: isDarkMode ? '#a0aec0' : '#718096' }}>
                      {rec.vetClinic}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Legacy clinic-sourced vaccines */}
          {legacyVaccines.map((v, i) => (
            <View key={`legacy-${i}`} style={{
              backgroundColor: isDarkMode ? '#1a2637' : '#ebf8ff',
              borderRadius: 14, padding: 14, marginBottom: 10,
              borderWidth: 1, borderColor: isDarkMode ? '#2b4a6f' : '#bee3f8',
              flexDirection: 'row', alignItems: 'center', gap: 12,
            }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#3182ce', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesome5 name="check-circle" size={16} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 13, color: isDarkMode ? '#90cdf4' : '#2b6cb0' }}>{v.name}</Text>
                <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 11, color: isDarkMode ? '#718096' : '#4a5568', marginTop: 2 }}>
                  Recorded by FurEverCare Clinic
                </Text>
              </View>
            </View>
          ))}

          {/* Empty state */}
          {hasNoRecords && (
            <View style={{ alignItems: 'center', padding: 28, backgroundColor: isDarkMode ? '#1a2a1a' : 'white', borderRadius: 14, borderWidth: 1, borderColor: isDarkMode ? '#2d5016' : '#e2e8f0' }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#EAF3DE', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <FontAwesome5 name="syringe" size={26} color="#a0aec0" />
              </View>
              <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 14, color: isDarkMode ? '#a0aec0' : '#4a5568', marginBottom: 6 }}>
                No Vaccination Records
              </Text>
              <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 12, color: '#a0aec0', textAlign: 'center', lineHeight: 18 }}>
                Keep track of {petName}'s immunization history by adding a record above.
              </Text>
            </View>
          )}
        </>
      )}

      {/* Modal for Add / Edit Vaccination Record */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: isDarkMode ? '#1a202c' : 'white', borderRadius: 20, width: '100%', maxWidth: 400, padding: 20, elevation: 5 }}>
            
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome5 name="syringe" size={18} color="#2E5E3E" style={{ marginRight: 10 }} />
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, color: isDarkMode ? '#e2e8f0' : '#2d3748' }}>
                  {editingRecordId ? 'Edit Vaccine Date' : 'Add Vaccine Record'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={{ padding: 4 }}>
                <FontAwesome5 name="times" size={16} color="#a0aec0" />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 420 }}>
              {/* Vaccine Name */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 12, color: isDarkMode ? '#a0aec0' : '#4a5568', marginBottom: 6 }}>
                  Vaccine Name *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc',
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#4a5568' : '#e2e8f0',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontFamily: 'Montserrat-Medium',
                    fontSize: 14,
                    color: isDarkMode ? 'white' : '#2d3748',
                  }}
                  value={vaccineName}
                  onChangeText={setVaccineName}
                  placeholder="e.g. Anti-Rabies, 5-in-1, DHPP, FVRCP"
                  placeholderTextColor="#a0aec0"
                />
              </View>

              {/* Vaccine Type */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 12, color: isDarkMode ? '#a0aec0' : '#4a5568', marginBottom: 6 }}>
                  Vaccine Type
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {['Core', 'Non-Core', 'Rabies', 'DHPP', 'FVRCP', 'Other'].map(vt => (
                    <TouchableOpacity
                      key={vt}
                      onPress={() => setVaccineType(vt)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: vaccineType === vt ? '#2E5E3E' : (isDarkMode ? '#2d3748' : '#edf2f7'),
                        borderWidth: 1,
                        borderColor: vaccineType === vt ? '#2E5E3E' : (isDarkMode ? '#4a5568' : '#e2e8f0'),
                      }}
                    >
                      <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 11, color: vaccineType === vt ? 'white' : (isDarkMode ? '#a0aec0' : '#4a5568') }}>
                        {vt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date Given */}
              <DatePickerInput
                style={{ marginBottom: 12 }}
                label="Date Given (YYYY-MM-DD) *"
                value={vaccinationDate}
                onChangeDate={setVaccinationDate}
                isDarkMode={isDarkMode}
              />

              {/* Next Due Date */}
              <DatePickerInput
                style={{ marginBottom: 12 }}
                label="Next Due Date (YYYY-MM-DD) *"
                value={nextDueDate}
                onChangeDate={setNextDueDate}
                isDarkMode={isDarkMode}
              />

              {/* Vet / Clinic */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 12, color: isDarkMode ? '#a0aec0' : '#4a5568', marginBottom: 6 }}>
                  Vet / Clinic Name (optional)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc',
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#4a5568' : '#e2e8f0',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontFamily: 'Montserrat-Medium',
                    fontSize: 14,
                    color: isDarkMode ? 'white' : '#2d3748',
                  }}
                  value={vetClinic}
                  onChangeText={setVetClinic}
                  placeholder="e.g. FurEverCare Clinic"
                  placeholderTextColor="#a0aec0"
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#4a5568' : '#cbd5e0',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 13, color: isDarkMode ? '#a0aec0' : '#4a5568' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveRecord}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: '#2E5E3E',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 13, color: 'white' }}>
                  Save Record
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function PetRecordsScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { user } = useUser();
  const { language } = useLanguage();

  // Navigation states within the component
  const [viewState, setViewState] = useState<'list' | 'create_edit' | 'details'>('list');
  const [activeTab, setActiveTab] = useState<'medical' | 'prescriptions' | 'vaccines' | 'grooming'>('medical');

  // Data States
  const { pets, addPet, updatePet, refreshPets } = usePetContext();
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);

  // Form States (for Create/Edit)
  const [formName, setFormName] = useState('');
  const [formSpecies, setFormSpecies] = useState('Dog');
  const [formBreed, setFormBreed] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formEnvironment, setFormEnvironment] = useState('Indoor');
  const [formActivity, setFormActivity] = useState('Moderate');
  const [formAvatar, setFormAvatar] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'species' | 'breed' | null>(null);

  // --- Vaccination form states ---
  const [isVaccinated, setIsVaccinated] = useState<'yes' | 'no' | null>(null);
  const [vaccName, setVaccName] = useState('');
  const [vaccType, setVaccType] = useState('Core');
  const [vaccDate, setVaccDate] = useState('');
  const [vaccDueDate, setVaccDueDate] = useState('');
  const [vaccVet, setVaccVet] = useState('');
  const [petVaccineRecords, setPetVaccineRecords] = useState<VaccinationRecord[]>([]);

  // --- Handlers ---
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Refused", "You've refused to allow this app to access your photos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });
    const isCancelled = result.canceled !== undefined ? result.canceled : (result as any).cancelled;
    if (!isCancelled) {
      const asset = result.assets ? result.assets[0] : (result as any);
      let newAvatarUri = asset.uri;
      if (asset.base64) {
        newAvatarUri = `data:image/jpeg;base64,${asset.base64}`;
      }
      setFormAvatar(newAvatarUri);
    }
  };

  const handleAddNewPet = () => {
    if (!user?.id || user.id.trim() === '') {
      promptGuestAuth(navigation, language);
      return;
    }
    setSelectedPet(null);
    setFormName('');
    setFormSpecies('');
    setFormBreed('');
    setFormAge('');
    setFormWeight('');
    setFormGender('Male');
    setFormEnvironment('Indoor');
    setFormActivity('Moderate');
    setFormAvatar('');
    setActiveDropdown(null);
    // Reset vaccine form
    setIsVaccinated(null);
    setVaccName('');
    setVaccType('Core');
    setVaccDate('');
    setVaccDueDate('');
    setVaccVet('');
    setPetVaccineRecords([]);
    setViewState('create_edit');
  };

  const handleEditPet = (pet: PetProfile) => {
    setSelectedPet(pet);
    setFormName(pet.name);
    setFormSpecies(pet.species);
    setFormBreed(pet.breed);
    setFormAge(pet.age);
    setFormWeight(pet.weight);
    setFormGender(pet.gender);
    setFormEnvironment(pet.environment || 'Indoor');
    setFormActivity(pet.activity || 'Moderate');
    setFormAvatar(pet.avatar && (pet.avatar.startsWith('file') || pet.avatar.startsWith('http') || pet.avatar.startsWith('data:image/')) ? pet.avatar : '');
    // Reset vaccine form for edit
    setIsVaccinated(null);
    setVaccName('');
    setVaccType('Core');
    setVaccDate('');
    setVaccDueDate('');
    setVaccVet('');
    // Load existing vaccine records for this pet
    getVaccineRecords(pet.id).then(setPetVaccineRecords);
    setViewState('create_edit');
  };

  const handleSaveProfile = async () => {
    if (!formName) {
      Alert.alert('Validation Error', 'Pet name is required.');
      return;
    }
    if (!formSpecies) {
      Alert.alert('Validation Error', 'Please select a Pet type.');
      return;
    }
    if (!formBreed) {
      Alert.alert('Validation Error', 'Please select a Breed.');
      return;
    }

    const vaccineSummaryStr = (isVaccinated === 'yes' && vaccName)
      ? `${vaccName} (${vaccDueDate ? 'Due: ' + vaccDueDate : 'Given: ' + vaccDate})`
      : (isVaccinated === 'no' ? 'Pending' : selectedPet?.vaccine || 'Pending');

    let savedPetObj: PetProfile | null = null;

    if (selectedPet) {
      const petPayload: PetProfile = {
        ...selectedPet,
        name: formName,
        species: formSpecies,
        breed: formBreed,
        age: formAge,
        weight: formWeight,
        gender: formGender,
        environment: formEnvironment,
        activity: formActivity,
        avatar: formAvatar || (formSpecies.toLowerCase() === 'cat' ? 'cat' : 'dog'),
        vaccine: vaccineSummaryStr
      };
      savedPetObj = await updatePet(petPayload);
    } else {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const newPet: PetProfile = {
        id: tempId,
        name: formName,
        species: formSpecies,
        breed: formBreed,
        age: formAge,
        weight: formWeight,
        gender: formGender,
        environment: formEnvironment,
        activity: formActivity,
        avatar: formAvatar || (formSpecies.toLowerCase() === 'cat' ? 'cat' : 'dog'),
        vaccine: vaccineSummaryStr
      };
      savedPetObj = await addPet(newPet);
    }

    const realPetId = savedPetObj?.id || selectedPet?.id;

    // Save detailed vaccine record if user filled it in
    if (realPetId && isVaccinated === 'yes' && vaccName && (vaccDate || vaccDueDate)) {
      const newRecord: VaccinationRecord = {
        id: Date.now().toString(),
        vaccineName: vaccName,
        vaccineType: vaccType || 'Core',
        vaccinationDate: vaccDate,
        nextDueDate: vaccDueDate,
        vetClinic: vaccVet || undefined,
      };
      await saveVaccineRecord(realPetId, newRecord, user?.id, formName, user?.email, user?.phoneNumber);
    }

    if (selectedPet) {
      Alert.alert('Profile Updated', `${formName}'s profile has been updated.`);
    } else {
      if (isVaccinated === 'no') {
        Alert.alert(
          'Profile Created 🐾',
          `${formName} has been added!\n\n💉 Tip: Schedule a vaccination soon to keep ${formName} protected.`,
          [{ text: 'Got it', style: 'default' }]
        );
      } else {
        Alert.alert('Profile Created', `${formName} has been added to your records.`);
      }
    }
    refreshPets();
    setViewState('list');
  };

  const formatDate = (dateStr: string | Date) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return String(dateStr);
    }
  };

  // --- Dynamic Record Data Builders ---
  const renderRecordsContent = () => {
    if (!selectedPet) return null;

    if (activeTab === 'medical') {
      const checkups: any[] = [];

      // 1. Add matching in-person clinic appointments
      if (selectedPet.appointments && Array.isArray(selectedPet.appointments)) {
        selectedPet.appointments.forEach((appt: any) => {
          const purposeLower = (appt.purpose || '').toLowerCase();
          const isGrooming = purposeLower.includes('groom') || purposeLower.includes('bath') || purposeLower.includes('cut') || purposeLower.includes('nail');
          if (!isGrooming) {
            checkups.push({
              id: appt.id,
              date: appt.appointmentDate || appt.createdAt,
              type: appt.purpose || 'Clinic Visit',
              desc: `Status: ${appt.status}. Scheduled on ${formatDate(appt.appointmentDate)} at ${appt.appointmentTime}. Visit type: ${appt.type === 'telemedicine' ? 'Telemedicine Consultation' : 'In-Person Visit'}.`,
              icon: 'calendar-alt',
              color: '#2D5016',
              timestamp: new Date(appt.appointmentDate || appt.createdAt).getTime()
            });
          }
        });
      }

      // 2. Add telemedicine consultations
      if (selectedPet.telemedicine && Array.isArray(selectedPet.telemedicine)) {
        selectedPet.telemedicine.forEach((tele: any) => {
          checkups.push({
            id: tele.id,
            date: tele.consultationDate || tele.createdAt,
            type: `Teleconsultation: ${tele.concern || 'General Concern'}`,
            desc: tele.diagnosis
              ? `Diagnosis: ${tele.diagnosis}. Status: ${tele.status}. Veterinarian ID: ${tele.veterinarianId.substring(0, 8)}...`
              : `Consultation concern: ${tele.concern}. Status: ${tele.status || 'Scheduled'}.`,
            icon: 'video',
            color: '#3182ce',
            timestamp: new Date(tele.consultationDate || tele.createdAt).getTime()
          });
        });
      }

      // 3. Add AI monitoring & triage history
      if (selectedPet.monitoring && Array.isArray(selectedPet.monitoring)) {
        selectedPet.monitoring.forEach((mon: any) => {
          const findings = mon.superAdminFindings || mon.adminFindings;
          checkups.push({
            id: mon.id,
            date: mon.createdAt,
            type: 'AI Triage & Health Monitoring',
            desc: findings
              ? `Professional Vet Findings: ${findings}. Symptoms monitored: ${mon.symptoms || 'None'}. Status: ${mon.status}.`
              : `Monitored symptoms: ${mon.symptoms || 'General checks'}. Behavior changes: ${mon.behaviorChanges || 'None'}. Recommendations: ${mon.recommendations || 'Pending professional review'}.`,
            icon: 'heartbeat',
            color: '#dd6b20',
            timestamp: new Date(mon.createdAt).getTime()
          });
        });
      }

      // Sort by date descending
      checkups.sort((a, b) => b.timestamp - a.timestamp);

      if (checkups.length === 0) {
        return (
          <View style={{ alignItems: 'center', padding: 25, backgroundColor: 'white', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' }}>
            <FontAwesome5 name="folder-open" size={32} color="#a0aec0" style={{ marginBottom: 10 }} />
            <Text style={{ fontFamily: 'Montserrat-SemiBold', color: '#718096', textAlign: 'center' }}>No clinic check-ups or medical records found.</Text>
          </View>
        );
      }

      return (
        <View style={styles.recordsList}>
          {checkups.map(item => (
            <View key={item.id} style={styles.recordItem}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome5 name={item.icon} size={12} color={item.color} style={{ marginRight: 6 }} />
                  <Text style={[styles.recordType, { color: item.color }]}>{item.type}</Text>
                </View>
              </View>
              <Text style={styles.recordDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      );

    } else if (activeTab === 'prescriptions') {
      const prescriptions: any[] = [];

      if (selectedPet.telemedicine && Array.isArray(selectedPet.telemedicine)) {
        selectedPet.telemedicine.forEach((tele: any) => {
          if (tele.prescription && tele.prescription.trim() !== '') {
            prescriptions.push({
              id: tele.id,
              date: tele.consultationDate || tele.createdAt,
              type: `Prescription Detail`,
              desc: `Directions / Meds: ${tele.prescription}\nConsultation concern: ${tele.concern}. Diagnosis: ${tele.diagnosis || 'Non-specified'}.`,
              icon: 'prescription-bottle-alt',
              color: '#3182ce',
              timestamp: new Date(tele.consultationDate || tele.createdAt).getTime()
            });
          }
        });
      }

      // Sort by date descending
      prescriptions.sort((a, b) => b.timestamp - a.timestamp);

      if (prescriptions.length === 0) {
        return (
          <View style={{ alignItems: 'center', padding: 25, backgroundColor: 'white', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' }}>
            <FontAwesome5 name="file-prescription" size={32} color="#a0aec0" style={{ marginBottom: 10 }} />
            <Text style={{ fontFamily: 'Montserrat-SemiBold', color: '#718096', textAlign: 'center' }}>No active prescriptions recorded for this pet.</Text>
          </View>
        );
      }

      return (
        <View style={styles.recordsList}>
          {prescriptions.map(item => (
            <View key={item.id} style={styles.recordItem}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome5 name={item.icon} size={12} color={item.color} style={{ marginRight: 6 }} />
                  <Text style={[styles.recordType, { color: item.color }]}>{item.type}</Text>
                </View>
              </View>
              <Text style={styles.recordDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      );

    } else if (activeTab === 'vaccines') {
      return <VaccinesTabContent petId={selectedPet.id} petName={selectedPet.name} vaccineString={selectedPet.vaccine} />;

    } else {
      const grooming: any[] = [];

      // Extract grooming from appointments
      if (selectedPet.appointments && Array.isArray(selectedPet.appointments)) {
        selectedPet.appointments.forEach((appt: any) => {
          const purposeLower = (appt.purpose || '').toLowerCase();
          const isGrooming = purposeLower.includes('groom') || purposeLower.includes('bath') || purposeLower.includes('cut') || purposeLower.includes('nail');
          if (isGrooming) {
            grooming.push({
              id: appt.id,
              date: appt.appointmentDate || appt.createdAt,
              type: appt.purpose || 'Grooming Visit',
              desc: `Status: ${appt.status}. Scheduled on ${formatDate(appt.appointmentDate)} at ${appt.appointmentTime}. Service rendered at Balingasag Clinic.`,
              icon: 'cut',
              color: '#805ad5',
              timestamp: new Date(appt.appointmentDate || appt.createdAt).getTime()
            });
          }
        });
      }

      // Sort by date descending
      grooming.sort((a, b) => b.timestamp - a.timestamp);

      if (grooming.length === 0) {
        return (
          <View style={{ alignItems: 'center', padding: 25, backgroundColor: 'white', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' }}>
            <FontAwesome5 name="cut" size={32} color="#a0aec0" style={{ marginBottom: 10 }} />
            <Text style={{ fontFamily: 'Montserrat-SemiBold', color: '#718096', textAlign: 'center' }}>No grooming session history found for this pet.</Text>
          </View>
        );
      }

      return (
        <View style={styles.recordsList}>
          {grooming.map(item => (
            <View key={item.id} style={styles.recordItem}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome5 name={item.icon} size={12} color={item.color} style={{ marginRight: 6 }} />
                  <Text style={[styles.recordType, { color: item.color }]}>{item.type}</Text>
                </View>
              </View>
              <Text style={styles.recordDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      );
    }
  };

  // --- Renderers ---

  const renderListView = () => (
    <>
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation?.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>Pet Records</Text>
            <Text style={styles.headerSubtitle}>Manage your pets' profiles and history</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.petListGrid}>
          {pets.map(pet => (
            <TouchableOpacity
              key={pet.id}
              style={[styles.petCardSquare, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => {
                setSelectedPet(pet);
                setViewState('details');
              }}
            >
              <View style={styles.petCardContentSquare}>
                <View style={[styles.avatarCircleSquare, { backgroundColor: pet.species.toLowerCase() === 'cat' ? '#38a169' : '#dd6b20' }]}>
                  <PetAvatar avatar={pet.avatar} species={pet.species} size={30} style={{ width: '100%', height: '100%', borderRadius: 35 }} />
                </View>
                <View style={styles.petCardTextSquare}>
                  <Text style={[styles.petCardNameSquare, { color: theme.text }]} numberOfLines={1}>{pet.name}</Text>
                  <Text style={[styles.petCardBreedSquare, { color: theme.subtext }]} numberOfLines={1}>{pet.breed}</Text>
                  <Text style={[styles.petCardBreedSquare, { color: theme.subtext }]}>{pet.age}</Text>
                  <View style={{
                    marginTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: pet.verificationStatus === 'VERIFIED' ? (isDarkMode ? '#1a3d28' : '#e6fffa') : (isDarkMode ? '#3b3014' : '#fefcbf'),
                    paddingVertical: 3,
                    paddingHorizontal: 10,
                    borderRadius: 12,
                    borderWidth: 0.5,
                    borderColor: pet.verificationStatus === 'VERIFIED' ? '#38a169' : '#d69e2e',
                    gap: 5
                  }}>
                    <FontAwesome5 
                      name={pet.verificationStatus === 'VERIFIED' ? 'check-circle' : 'clock'} 
                      size={10} 
                      color={pet.verificationStatus === 'VERIFIED' ? '#38a169' : '#d69e2e'} 
                    />
                    <Text style={{
                      fontSize: 11,
                      fontFamily: 'Montserrat-Bold',
                      color: pet.verificationStatus === 'VERIFIED' ? (isDarkMode ? '#9ae6b4' : '#22543d') : (isDarkMode ? '#faf089' : '#744210')
                    }}>
                      {pet.verificationStatus === 'VERIFIED' ? 'Verified Pet' : 'Pending Walk-in'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.addPetButton, { borderColor: theme.border }]} onPress={handleAddNewPet}>
          <FontAwesome5 name="plus" size={16} color="#2E5E3E" style={{ marginRight: 10 }} />
          <Text style={styles.addPetText}>Add New Pet Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );

  const renderCreateEditView = () => (
    <View style={[styles.fullScreenView, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <TouchableOpacity onPress={() => { setActiveDropdown(null); setViewState('list'); }} style={{marginRight: 15, padding: 5}}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedPet ? 'Edit Profile' : 'New Profile'}</Text>
        <View style={{width: 34}} />
      </View>

      <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true} scrollEnabled={activeDropdown === null}>
         {activeDropdown !== null && (
           <TouchableOpacity 
             style={[StyleSheet.absoluteFillObject, { zIndex: 5, backgroundColor: 'transparent' }]} 
             activeOpacity={1} 
             onPress={() => setActiveDropdown(null)} 
           />
         )}
         {/* Photo Uploader Mock */}
         <TouchableOpacity style={styles.photoUploadContainer} onPress={handlePickImage}>
            {formAvatar ? (
               <Image source={{ uri: formAvatar }} style={{ width: 100, height: 100, borderRadius: 50 }} />
            ) : (
               <View style={styles.photoCirclePlaceholder}>
                  <FontAwesome5 name="camera" size={30} color="#a0aec0" />
               </View>
            )}
            <Text style={styles.photoUploadText}>Tap to change picture</Text>
         </TouchableOpacity>

         <View style={styles.formGroup}>
           <Text style={styles.label}>Pet Name</Text>
           <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="e.g. Bella" placeholderTextColor="#a0aec0" />
         </View>

        <View style={[styles.rowForm, { zIndex: 10, elevation: 10, position: 'relative' }]}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Pet</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setActiveDropdown(activeDropdown === 'species' ? null : 'species')}
            >
              <Text style={{ color: formSpecies ? theme.text : '#a0aec0', fontSize: 15 }}>{formSpecies || "Select pet"}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Breed</Text>
            <TouchableOpacity
              style={[styles.input, !formSpecies && { backgroundColor: isDarkMode ? '#2d2d2d' : '#edf2f7' }]}
              onPress={() => {
                if (!formSpecies) {
                  Alert.alert("Notice", "Please select a pet type first.");
                  return;
                }
                setActiveDropdown(activeDropdown === 'breed' ? null : 'breed');
              }}
            >
              <Text style={{ color: formBreed ? theme.text : '#a0aec0', fontSize: 15 }} numberOfLines={1}>{formBreed || (formSpecies ? "Select breed" : "Select pet first")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Dropdown Popover (sibling to rowForm inside ScrollView content area) */}
        {activeDropdown !== null && (
          <View style={{
            position: 'absolute',
            top: 310,
            left: activeDropdown === 'species' ? 0 : '52%',
            width: '48%',
            backgroundColor: theme.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 10,
            zIndex: 1000,
            overflow: 'hidden',
          }}>
            <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled" style={{ maxHeight: 250 }}>
              {(activeDropdown === 'species' ? PET_TYPES : (formSpecies === 'Cat' ? CAT_BREEDS : DOG_BREEDS)).map((item) => {
                const isSelected = activeDropdown === 'species' ? formSpecies === item : formBreed === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                      backgroundColor: isSelected ? (isDarkMode ? '#1c330e' : '#EAF3DE') : 'transparent',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => {
                      if (activeDropdown === 'species') {
                        setFormSpecies(item);
                        if (item !== formSpecies) setFormBreed('');
                      } else {
                        setFormBreed(item);
                      }
                      setActiveDropdown(null);
                    }}
                  >
                    <Text style={{ fontSize: 13, fontFamily: isSelected ? 'Montserrat-Bold' : 'Montserrat-Medium', color: isSelected ? (isDarkMode ? '#EAF3DE' : '#2D5016') : theme.text }}>{item}</Text>
                    {isSelected && <FontAwesome5 name="check" size={10} color={isDarkMode ? '#EAF3DE' : '#2D5016'} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.rowForm}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Age</Text>
            <TextInput style={styles.input} value={formAge} onChangeText={setFormAge} placeholder="e.g. 2 yrs" placeholderTextColor="#a0aec0" />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Weight</Text>
            <TextInput style={styles.input} value={formWeight} onChangeText={setFormWeight} placeholder="e.g. 10 kg" placeholderTextColor="#a0aec0" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => setFormGender('Male')} style={[styles.genderBtn, formGender === 'Male' && styles.genderBtnActive]}><Text style={[styles.genderText, formGender === 'Male' && styles.genderTextActive]}>Male</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setFormGender('Female')} style={[styles.genderBtn, formGender === 'Female' && styles.genderBtnActive]}><Text style={[styles.genderText, formGender === 'Female' && styles.genderTextActive]}>Female</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Living Environment</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['Indoor', 'Outdoor', 'Mixed'].map(env => (
              <TouchableOpacity
                key={env}
                onPress={() => setFormEnvironment(env)}
                style={[styles.genderBtn, { flex: 1 }, formEnvironment === env && styles.genderBtnActive]}
              >
                <Text style={[styles.genderText, formEnvironment === env && styles.genderTextActive]}>{env}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Daily Activity Level</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['Low', 'Moderate', 'High'].map(act => (
              <TouchableOpacity
                key={act}
                onPress={() => setFormActivity(act)}
                style={[styles.genderBtn, { flex: 1 }, formActivity === act && styles.genderBtnActive]}
              >
                <Text style={[styles.genderText, formActivity === act && styles.genderTextActive]}>{act}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Vaccination Step (Dogs & Cats only) ── */}
        {(formSpecies === 'Dog' || formSpecies === 'Cat') && (
          <View style={{ backgroundColor: isDarkMode ? '#1a2a1a' : '#f0fff4', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: isDarkMode ? '#2d5016' : '#c6f6d5' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <FontAwesome5 name="syringe" size={16} color="#2E5E3E" style={{ marginRight: 10 }} />
              <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 15, color: isDarkMode ? '#c6f6d5' : '#22543d' }}>Vaccination Record</Text>
            </View>
            <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 13, color: isDarkMode ? '#a0c8a0' : '#276749', marginBottom: 14 }}>
              Has your pet already been vaccinated?
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              <TouchableOpacity
                onPress={() => setIsVaccinated('yes')}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: isVaccinated === 'yes' ? '#2E5E3E' : (isDarkMode ? '#2d2d2d' : 'white'), borderWidth: 1.5, borderColor: isVaccinated === 'yes' ? '#2E5E3E' : (isDarkMode ? '#4a5568' : '#d1d5db') }}
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 13, color: isVaccinated === 'yes' ? 'white' : (isDarkMode ? '#c6f6d5' : '#276749') }}>✓ Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsVaccinated('no')}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: isVaccinated === 'no' ? '#718096' : (isDarkMode ? '#2d2d2d' : 'white'), borderWidth: 1.5, borderColor: isVaccinated === 'no' ? '#718096' : (isDarkMode ? '#4a5568' : '#d1d5db') }}
              >
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 13, color: isVaccinated === 'no' ? 'white' : (isDarkMode ? '#a0aec0' : '#4a5568') }}>✗ Not yet</Text>
              </TouchableOpacity>
            </View>

            {isVaccinated === 'no' && (
              <View style={{ backgroundColor: isDarkMode ? '#2d2020' : '#fff5f5', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: '#fc8181' }}>
                <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: isDarkMode ? '#fc8181' : '#c53030' }}>
                  💡 Reminder: Vaccinations protect against Parvovirus, Rabies, Distemper, and more. Schedule at FurEverCare Clinic soon!
                </Text>
              </View>
            )}

            {isVaccinated === 'yes' && (
              <View style={{ gap: 12 }}>
                <View>
                  <Text style={[styles.label, { marginBottom: 6 }]}>Vaccine Name *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDarkMode ? '#1a2a1a' : 'white' }]}
                    value={vaccName}
                    onChangeText={setVaccName}
                    placeholder="e.g. Anti-Rabies, DHPP, FVRCP"
                    placeholderTextColor="#a0aec0"
                  />
                </View>

                <View>
                  <Text style={[styles.label, { marginBottom: 6 }]}>Vaccine Type</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {['Core', 'Non-Core', 'Rabies', 'DHPP', 'FVRCP', 'Other'].map(vt => (
                      <TouchableOpacity
                        key={vt}
                        onPress={() => setVaccType(vt)}
                        style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: vaccType === vt ? '#2E5E3E' : (isDarkMode ? '#2d3748' : '#edf2f7'), borderWidth: 1, borderColor: vaccType === vt ? '#2E5E3E' : (isDarkMode ? '#4a5568' : '#e2e8f0') }}
                      >
                        <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 11, color: vaccType === vt ? 'white' : (isDarkMode ? '#a0aec0' : '#4a5568') }}>{vt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <DatePickerInput
                      label="Date Given *"
                      value={vaccDate}
                      onChangeDate={setVaccDate}
                      isDarkMode={isDarkMode}
                      inputStyle={{ backgroundColor: isDarkMode ? '#1a2a1a' : 'white' }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <DatePickerInput
                      label="Next Due Date *"
                      value={vaccDueDate}
                      onChangeDate={setVaccDueDate}
                      isDarkMode={isDarkMode}
                      inputStyle={{ backgroundColor: isDarkMode ? '#1a2a1a' : 'white' }}
                    />
                  </View>
                </View>

                <View>
                  <Text style={[styles.label, { marginBottom: 6 }]}>Vet / Clinic (optional)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDarkMode ? '#1a2a1a' : 'white' }]}
                    value={vaccVet}
                    onChangeText={setVaccVet}
                    placeholder="e.g. FurEverCare Clinic"
                    placeholderTextColor="#a0aec0"
                  />
                </View>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
          <Text style={styles.saveBtnText}>Save Pet Profile</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>


    </View>
  );

  const renderDetailsView = () => {
    if (!selectedPet) return null;
    return (
      <View style={[styles.fullScreenView, { backgroundColor: theme.background }]}>
        <View style={[styles.headerNoBorder, { backgroundColor: theme.headerBackground }]}>
          <TouchableOpacity onPress={() => setViewState('list')} style={{ marginRight: 15, padding: 5 }}>
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEditPet(selectedPet)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailsScroll}>
          {/* Profile Header */}
          <View style={[styles.profileHeaderBox, { backgroundColor: theme.card }]}>
            <View style={[styles.avatarHuge, { backgroundColor: selectedPet.species.toLowerCase() === 'cat' ? '#38a169' : '#dd6b20' }]}>
              <PetAvatar avatar={selectedPet.avatar} species={selectedPet.species} size={50} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
            </View>
            <Text style={[styles.profileNameHuge, { color: theme.text }]}>{selectedPet.name}</Text>
            <Text style={[styles.profileBreedText, { color: theme.subtext }]}>{selectedPet.breed}</Text>

            <View style={styles.profileStatsRow}>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc' }]}><Text style={[styles.statPillLabel, { color: theme.subtext }]}>Age</Text><Text style={[styles.statPillValue, { color: theme.text }]}>{selectedPet.age}</Text></View>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc' }]}><Text style={[styles.statPillLabel, { color: theme.subtext }]}>Weight</Text><Text style={[styles.statPillValue, { color: theme.text }]}>{selectedPet.weight}</Text></View>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc' }]}><Text style={[styles.statPillLabel, { color: theme.subtext }]}>Sex</Text><Text style={[styles.statPillValue, { color: theme.text }]}>{selectedPet.gender}</Text></View>
            </View>
            <View style={[styles.profileStatsRow, { marginTop: 8 }]}>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc' }]}><Text style={[styles.statPillLabel, { color: theme.subtext }]}>Environment</Text><Text style={[styles.statPillValue, { color: theme.text }]}>{selectedPet.environment || 'Indoor'}</Text></View>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f7fafc' }]}><Text style={[styles.statPillLabel, { color: theme.subtext }]}>Activity</Text><Text style={[styles.statPillValue, { color: theme.text }]}>{selectedPet.activity || 'Moderate'}</Text></View>
            </View>
          </View>

          {/* Verification Status Banner */}
          <View style={{
            marginHorizontal: 20,
            marginTop: 14,
            padding: 14,
            borderRadius: 14,
            backgroundColor: selectedPet.verificationStatus === 'VERIFIED' ? (isDarkMode ? '#1a3d28' : '#f0fff4') : (isDarkMode ? '#3b3014' : '#fffaf0'),
            borderWidth: 1,
            borderColor: selectedPet.verificationStatus === 'VERIFIED' ? '#38a169' : '#ecc94b',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
          }}>
            <FontAwesome5 
              name={selectedPet.verificationStatus === 'VERIFIED' ? 'check-circle' : 'exclamation-circle'} 
              size={22} 
              color={selectedPet.verificationStatus === 'VERIFIED' ? '#38a169' : '#d69e2e'} 
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 13,
                fontFamily: 'Montserrat-Bold',
                color: selectedPet.verificationStatus === 'VERIFIED' ? (isDarkMode ? '#9ae6b4' : '#22543d') : (isDarkMode ? '#fbd38d' : '#744210'),
                marginBottom: 2
              }}>
                {selectedPet.verificationStatus === 'VERIFIED' ? 'Clinic Verified Pet' : 'Pending In-Person Clinic Verification'}
              </Text>
              <Text style={{
                fontSize: 11,
                fontFamily: 'Montserrat-Regular',
                color: selectedPet.verificationStatus === 'VERIFIED' ? (isDarkMode ? '#c6f6d5' : '#276749') : (isDarkMode ? '#faf089' : '#975a16'),
                lineHeight: 16
              }}>
                {selectedPet.verificationStatus === 'VERIFIED' 
                  ? 'Physical details verified by veterinary staff at FurEverCare Clinic. Pet health monitoring is unlocked.'
                  : 'Please bring your pet to the clinic for an in-person walk-in appointment. The vet will verify your submitted details to unlock pet monitoring.'}
              </Text>
            </View>
          </View>

          {/* Tab Navigation for Records */}
          <View style={styles.recordsTabsBox}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recordsTabsContainer}>
              {[
                { id: 'medical', label: 'Check-ups' },
                { id: 'prescriptions', label: 'Prescriptions' },
                { id: 'vaccines', label: 'Vaccines' },
                { id: 'grooming', label: 'Grooming' }
              ].map(tab => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.recordTabBtn, activeTab === tab.id && styles.recordTabBtnActive]}
                  onPress={() => setActiveTab(tab.id as any)}
                >
                  <Text style={[styles.recordTabText, activeTab === tab.id && styles.recordTabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content Area */}
          <View style={styles.recordsContentArea}>
            {renderRecordsContent()}
          </View>

        </ScrollView>
      </View>
    );
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {viewState === 'list' && renderListView()}
      {viewState === 'create_edit' && renderCreateEditView()}
      {viewState === 'details' && renderDetailsView()}
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
  headerNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2D5016',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Catcut', color: 'white' },
  headerSubtitle: { fontSize: 13, color: '#EAF3DE', marginTop: 2, fontFamily: 'Montserrat-Regular' },
  mainScroll: { padding: 20 },
  fullScreenView: { flex: 1 },

  // List View
  petListGrid: {
    flexDirection: 'column',
  },
  petCardSquare: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  petCardContentSquare: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleSquare: {
    width: 180, height: 180, borderRadius: 90,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 15,
  },
  petCardTextSquare: {
    alignItems: 'center',
    width: '100%',
  },
  petCardNameSquare: { fontSize: 24, fontFamily: 'Catcut', color: '#2d3748', marginBottom: 6, textAlign: 'center' },
  petCardBreedSquare: { fontSize: 16, color: '#718096', textAlign: 'center', marginBottom: 2, fontFamily: 'Montserrat-Regular' },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e0',
    borderRadius: 16,
    backgroundColor: 'white',
    marginTop: 10,
  },
  addPetText: { fontSize: 16, fontFamily: 'Montserrat-SemiBold', color: '#2D5016' },

  // Create/Edit View
  formScroll: { padding: 20 },
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoCirclePlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#edf2f7',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1, borderColor: '#cbd5e0', borderStyle: 'dashed'
  },
  photoUploadText: { fontSize: 14, color: '#3182ce', fontFamily: 'Montserrat-Medium' },
  formGroup: { marginBottom: 20 },
  rowForm: { flexDirection: 'row' },
  label: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#4a5568', marginBottom: 8 },
  input: {
    backgroundColor: 'white',
    borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12,
    fontSize: 15, color: '#2d3748',
    fontFamily: 'Montserrat-Regular',
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 10, backgroundColor: 'white'
  },
  genderBtnActive: { borderColor: '#2D5016', backgroundColor: '#EAF3DE' },
  genderText: { fontSize: 15, color: '#4a5568', fontFamily: 'Montserrat-Medium' },
  genderTextActive: { color: '#2D5016', fontFamily: 'Montserrat-Bold' },
  saveBtn: {
    backgroundColor: '#2D5016',
    paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10
  },
  saveBtnText: { color: 'white', fontSize: 16, fontFamily: 'Montserrat-Bold' },
  editText: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: 'white' },

  // Details View
  detailsScroll: { flex: 1 },
  profileHeaderBox: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1, borderBottomColor: '#edf2f7',
  },
  avatarHuge: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 15,
  },
  profileNameHuge: { fontSize: 26, fontFamily: 'Catcut', color: '#2d3748', marginBottom: 4 },
  profileBreedText: { fontSize: 15, color: '#718096', marginBottom: 20, fontFamily: 'Montserrat-Regular' },
  profileStatsRow: {
    flexDirection: 'row', gap: 15,
  },
  statPill: {
    alignItems: 'center',
    backgroundColor: '#F4F1EC',
    paddingHorizontal: 15, paddingVertical: 10,
    borderRadius: 12, minWidth: 80,
  },
  statPillLabel: { fontSize: 11, color: '#718096', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Montserrat-SemiBold' },
  statPillValue: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#2d3748' },

  recordsTabsBox: {
    backgroundColor: 'white',
    paddingVertical: 15,
  },
  recordsTabsContainer: { paddingHorizontal: 20, gap: 10 },
  recordTabBtn: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#F4F1EC',
    borderWidth: 1, borderColor: '#edf2f7',
  },
  recordTabBtnActive: { backgroundColor: '#2D5016', borderColor: '#2D5016' },
  recordTabText: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#718096' },
  recordTabTextActive: { color: 'white' },

  recordsContentArea: {
    padding: 20,
  },
  recordsList: { gap: 15 },
  recordItem: {
    backgroundColor: 'white',
    padding: 16, borderRadius: 12,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  recordDate: { fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#718096' },
  recordType: { fontSize: 14, fontFamily: 'Montserrat-Bold', color: '#2d3748' },
  recordDesc: { fontSize: 14, color: '#4a5568', lineHeight: 20, fontFamily: 'Montserrat-Regular' },
  addRecordBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 20, paddingVertical: 15,
    backgroundColor: '#EAF3DE', borderRadius: 12,
  },
  addRecordBtnText: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#2D5016' },

  // Floating Dropdown styles
  floatingDropdown: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    zIndex: 100,
  },
  floatingDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  floatingDropdownText: {
    fontSize: 15,
    color: '#4a5568',
    fontFamily: 'Montserrat-Regular',
  }
});
