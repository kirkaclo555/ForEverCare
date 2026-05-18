import React, { useState } from 'react';
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

const DOG_BREEDS = ["Aspin", "Golden Retriever", "Labrador", "Poodle", "Bulldog", "Beagle", "Pug", "Chihuahua", "Shih Tzu", "Husky", "German Shepherd", "Rottweiler", "Dachshund", "Boxer", "Doberman", "Great Dane", "Pomeranian", "Corgi", "Shiba Inu", "Chow Chow", "Dalmatian", "Mixed"];
const CAT_BREEDS = ["Puspin", "Persian", "Siamese", "Maine Coon", "Bengal", "Sphynx", "British Shorthair", "Scottish Fold", "Mixed"];
const PET_TYPES = ["Dog", "Cat"];

export default function PetRecordsScreen({ navigation }: Props) {
  // Navigation states within the component
  const [viewState, setViewState] = useState<'list' | 'create_edit' | 'details'>('list');
  const [activeTab, setActiveTab] = useState<'medical' | 'prescriptions' | 'vaccines' | 'grooming'>('medical');
  
  // Data States
  const { pets, addPet, updatePet } = usePetContext();
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);

  // Form States (for Create/Edit)
  const [formName, setFormName] = useState('');
  const [formSpecies, setFormSpecies] = useState('Dog');
  const [formBreed, setFormBreed] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formGender, setFormGender] = useState('Male');
  const [formAvatar, setFormAvatar] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'species' | 'breed' | null>(null);

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
      quality: 0.8,
    });
    const isCancelled = result.canceled !== undefined ? result.canceled : (result as any).cancelled;
    if (!isCancelled) {
      const uri = result.assets ? result.assets[0].uri : (result as any).uri;
      setFormAvatar(uri);
    }
  };

  const handleAddNewPet = () => {
    setSelectedPet(null);
    setFormName('');
    setFormSpecies('');
    setFormBreed('');
    setFormAge('');
    setFormWeight('');
    setFormGender('Male');
    setFormAvatar('');
    setActiveDropdown(null);
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
    setFormAvatar(pet.avatar.startsWith('file') || pet.avatar.startsWith('http') ? pet.avatar : '');
    setViewState('create_edit');
  };

  const handleSaveProfile = () => {
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

    if (selectedPet) {
      // Edit existing
      updatePet({
        ...selectedPet, name: formName, species: formSpecies, breed: formBreed, age: formAge, weight: formWeight, gender: formGender, avatar: formAvatar || (formSpecies.toLowerCase() === 'cat' ? 'cat' : 'dog')
      });
      Alert.alert('Profile Updated', `${formName}'s profile has been updated.`);
    } else {
      // Create new
      const newPet: PetProfile = {
        id: Math.random().toString(),
        name: formName,
        species: formSpecies,
        breed: formBreed,
        age: formAge,
        weight: formWeight,
        gender: formGender,
        avatar: formAvatar || (formSpecies.toLowerCase() === 'cat' ? 'cat' : 'dog')
      };
      addPet(newPet);
      Alert.alert('Profile Created', `${formName} has been added to your records.`);
    }
    setViewState('list');
  };

  // --- Mock Record Data Builders ---
  const renderRecordsContent = () => {
    if (activeTab === 'medical') {
      return (
        <View style={styles.recordsList}>
           <View style={styles.recordItem}>
              <View style={styles.recordHeader}><Text style={styles.recordDate}>Oct 12, 2024</Text><Text style={styles.recordType}>General Checkup</Text></View>
              <Text style={styles.recordDesc}>Dr. Smith found no issues. Weight is stable, heart and lungs clear. Advised to continue current diet.</Text>
           </View>
           <View style={styles.recordItem}>
              <View style={styles.recordHeader}><Text style={styles.recordDate}>Mar 04, 2024</Text><Text style={styles.recordType}>Ear Infection</Text></View>
              <Text style={styles.recordDesc}>Mild yeast infection in left ear. Prescribed ear drops to be applied twice daily for 7 days.</Text>
           </View>
        </View>
      );
    } else if (activeTab === 'prescriptions') {
       return (
        <View style={styles.recordsList}>
           <View style={styles.recordItem}>
              <View style={styles.recordHeader}><Text style={styles.recordDate}>Active</Text><Text style={[styles.recordType, {color: '#3182ce'}]}>Heartworm Preventative</Text></View>
              <Text style={styles.recordDesc}>Give one chewable tablet monthly. Next dose due Nov 1st.</Text>
           </View>
        </View>
      );
    } else if (activeTab === 'vaccines') {
       return (
        <View style={styles.recordsList}>
           <View style={styles.recordItem}>
              <View style={styles.recordHeader}><Text style={styles.recordDate}>Expires: Sep 2025</Text><Text style={[styles.recordType, {color: '#38a169'}]}>Rabies (1-Year)</Text></View>
              <Text style={styles.recordDesc}>Administered by Dr. Jane Doe on Sep 10, 2024.</Text>
           </View>
           <View style={styles.recordItem}>
              <View style={styles.recordHeader}><Text style={styles.recordDate}>Expires: Jun 2025</Text><Text style={[styles.recordType, {color: '#38a169'}]}>Bordetella</Text></View>
              <Text style={styles.recordDesc}>Administered prior to boarding.</Text>
           </View>
        </View>
      );
    } else {
       return (
        <View style={styles.recordsList}>
           <View style={styles.recordItem}>
              <View style={styles.recordHeader}><Text style={styles.recordDate}>Sep 02, 2024</Text><Text style={[styles.recordType, {color: '#805ad5'}]}>Full Groom</Text></View>
              <Text style={styles.recordDesc}>Bath, haircut, nail trim, and ear cleaning.</Text>
           </View>
        </View>
      );
    }
  };

  // --- Renderers ---

  const renderListView = () => (
    <>
      <View style={styles.header}>
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
               style={styles.petCardSquare}
               onPress={() => {
                 setSelectedPet(pet);
                 setViewState('details');
               }}
             >
               <View style={styles.petCardContentSquare}>
                 <View style={[styles.avatarCircleSquare, { backgroundColor: pet.species.toLowerCase() === 'cat' ? '#38a169' : '#dd6b20'}]}>
                    {(pet.avatar.startsWith('file') || pet.avatar.startsWith('http')) ? (
                      <Image source={{ uri: pet.avatar }} style={{ width: '100%', height: '100%', borderRadius: 35 }} />
                    ) : (
                      <FontAwesome5 name={pet.avatar} size={30} color="white" />
                    )}
                 </View>
                 <View style={styles.petCardTextSquare}>
                   <Text style={styles.petCardNameSquare} numberOfLines={1}>{pet.name}</Text>
                   <Text style={styles.petCardBreedSquare} numberOfLines={1}>{pet.breed}</Text>
                   <Text style={styles.petCardBreedSquare}>{pet.age}</Text>
                 </View>
               </View>
             </TouchableOpacity>
           ))}
         </View>

         <TouchableOpacity style={styles.addPetButton} onPress={handleAddNewPet}>
           <FontAwesome5 name="plus" size={16} color="#2E5E3E" style={{marginRight: 10}} />
           <Text style={styles.addPetText}>Add New Pet Profile</Text>
         </TouchableOpacity>
      </ScrollView>
    </>
  );

  const renderCreateEditView = () => (
    <View style={styles.fullScreenView}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setViewState('list')} style={{marginRight: 15, padding: 5}}>
          <FontAwesome5 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedPet ? 'Edit Profile' : 'New Profile'}</Text>
        <View style={{width: 34}} />
      </View>

      <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
         {/* Photo Uploader Mock */}
         <TouchableOpacity style={styles.photoUploadContainer} onPress={handlePickImage}>
            {formAvatar ? (
               <Image source={{ uri: formAvatar }} style={styles.photoCirclePlaceholder} />
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

         <View style={[styles.rowForm, {zIndex: 1, elevation: 1}]}>
           <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
             <Text style={styles.label}>Pet</Text>
             <TouchableOpacity 
               style={styles.input} 
               onPress={() => setActiveDropdown('species')}
             >
               <Text style={{ color: formSpecies ? '#2d3748' : '#a0aec0', fontSize: 15 }}>{formSpecies || "Select pet"}</Text>
             </TouchableOpacity>
           </View>
           <View style={[styles.formGroup, {flex: 1}]}>
             <Text style={styles.label}>Breed</Text>
             <TouchableOpacity 
               style={[styles.input, !formSpecies && {backgroundColor: '#edf2f7'}]} 
               onPress={() => {
                  if (!formSpecies) {
                     Alert.alert("Notice", "Please select a pet type first.");
                     return;
                  }
                  setActiveDropdown('breed');
               }}
             >
               <Text style={{ color: formBreed ? '#2d3748' : '#a0aec0', fontSize: 15 }} numberOfLines={1}>{formBreed || (formSpecies ? "Select breed" : "Select pet first")}</Text>
             </TouchableOpacity>
           </View>
         </View>

         <View style={styles.rowForm}>
           <View style={[styles.formGroup, {flex: 1, marginRight: 10}]}>
             <Text style={styles.label}>Age</Text>
             <TextInput style={styles.input} value={formAge} onChangeText={setFormAge} placeholder="e.g. 2 yrs" placeholderTextColor="#a0aec0" />
           </View>
           <View style={[styles.formGroup, {flex: 1}]}>
             <Text style={styles.label}>Weight</Text>
             <TextInput style={styles.input} value={formWeight} onChangeText={setFormWeight} placeholder="e.g. 10 kg" placeholderTextColor="#a0aec0" />
           </View>
         </View>

         <View style={styles.formGroup}>
           <Text style={styles.label}>Gender</Text>
           <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity onPress={()=>setFormGender('Male')} style={[styles.genderBtn, formGender === 'Male' && styles.genderBtnActive]}><Text style={[styles.genderText, formGender==='Male'&&styles.genderTextActive]}>Male</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>setFormGender('Female')} style={[styles.genderBtn, formGender === 'Female' && styles.genderBtnActive]}><Text style={[styles.genderText, formGender==='Female'&&styles.genderTextActive]}>Female</Text></TouchableOpacity>
           </View>
         </View>

         <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
           <Text style={styles.saveBtnText}>Save Pet Profile</Text>
         </TouchableOpacity>
         <View style={{height: 40}}/>
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal visible={activeDropdown !== null} transparent={true} animationType="fade">
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} 
          activeOpacity={1} 
          onPress={() => setActiveDropdown(null)}
        >
          <View style={{ backgroundColor: 'white', width: '80%', maxHeight: '60%', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 }}>
            <Text style={{ fontSize: 18, fontFamily: 'Montserrat-Bold', marginBottom: 15, color: '#2d3748' }}>
              {activeDropdown === 'species' ? 'Select Pet Type' : 'Select Breed'}
            </Text>
            <FlatList
              data={activeDropdown === 'species' ? PET_TYPES : (formSpecies === 'Cat' ? CAT_BREEDS : DOG_BREEDS)}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={{ paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#edf2f7' }}
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
                  <Text style={{ fontSize: 16, fontFamily: 'Montserrat-Medium', color: '#4a5568' }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  const renderDetailsView = () => {
    if (!selectedPet) return null;
    return (
      <View style={styles.fullScreenView}>
        <View style={styles.headerNoBorder}>
          <TouchableOpacity onPress={() => setViewState('list')} style={{marginRight: 15, padding: 5}}>
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEditPet(selectedPet)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailsScroll}>
           {/* Profile Header */}
           <View style={styles.profileHeaderBox}>
             <View style={[styles.avatarHuge, { backgroundColor: selectedPet.species.toLowerCase() === 'cat' ? '#38a169' : '#dd6b20'}]}>
                {(selectedPet.avatar.startsWith('file') || selectedPet.avatar.startsWith('http')) ? (
                  <Image source={{ uri: selectedPet.avatar }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
                ) : (
                  <FontAwesome5 name={selectedPet.avatar} size={50} color="white" />
                )}
             </View>
             <Text style={styles.profileNameHuge}>{selectedPet.name}</Text>
             <Text style={styles.profileBreedText}>{selectedPet.breed}</Text>
             
             <View style={styles.profileStatsRow}>
                <View style={styles.statPill}><Text style={styles.statPillLabel}>Age</Text><Text style={styles.statPillValue}>{selectedPet.age}</Text></View>
                <View style={styles.statPill}><Text style={styles.statPillLabel}>Weight</Text><Text style={styles.statPillValue}>{selectedPet.weight}</Text></View>
                <View style={styles.statPill}><Text style={styles.statPillLabel}>Sex</Text><Text style={styles.statPillValue}>{selectedPet.gender}</Text></View>
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
             
             <TouchableOpacity style={styles.addRecordBtn}>
               <FontAwesome5 name="plus" size={14} color="#3182ce" style={{marginRight: 8}}/>
               <Text style={styles.addRecordBtnText}>Add new record entry</Text>
             </TouchableOpacity>
           </View>

        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
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
