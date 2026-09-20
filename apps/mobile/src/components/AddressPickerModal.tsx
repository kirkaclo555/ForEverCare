import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export interface LocationData {
  code: string;
  name: string;
}

interface AddressPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectComplete: (addressInfo: {
    region: string;
    province: string;
    city: string;
    barangay: string;
  }) => void;
}

export default function AddressPickerModal({
  visible,
  onClose,
  onSelectComplete,
}: AddressPickerModalProps) {
  const [step, setStep] = useState<number>(0); // 0: Region, 1: Province, 2: City, 3: Barangay
  const [loading, setLoading] = useState<boolean>(false);
  const [dataList, setDataList] = useState<LocationData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Selections
  const [selectedRegion, setSelectedRegion] = useState<LocationData | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<LocationData | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationData | null>(null);

  useEffect(() => {
    if (visible && step === 0) {
      fetchRegions();
    }
  }, [visible, step]);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://psgc.gitlab.io/api/regions/');
      const data = await res.json();
      // Sort alphabetically
      data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setDataList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async (regionCode: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`);
      const data = await res.json();
      if (data && data.length > 0) {
        data.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setDataList(data);
        setStep(1);
      } else {
        // No provinces (e.g., NCR), skip directly to cities
        setSelectedProvince({ code: 'none', name: 'Metro Manila' });
        fetchCities(regionCode, true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (code: string, isRegion: boolean = false) => {
    setLoading(true);
    try {
      const endpoint = isRegion 
        ? `https://psgc.gitlab.io/api/regions/${code}/cities-municipalities/`
        : `https://psgc.gitlab.io/api/provinces/${code}/cities-municipalities/`;
      const res = await fetch(endpoint);
      const data = await res.json();
      data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setDataList(data);
      setStep(2);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarangays = async (cityCode: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`);
      const data = await res.json();
      data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setDataList(data);
      setStep(3);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: LocationData) => {
    setSearchQuery('');
    if (step === 0) {
      setSelectedRegion(item);
      fetchProvinces(item.code);
    } else if (step === 1) {
      setSelectedProvince(item);
      fetchCities(item.code, false);
    } else if (step === 2) {
      setSelectedCity(item);
      fetchBarangays(item.code);
    } else if (step === 3) {
      // Completed selection
      onSelectComplete({
        region: selectedRegion?.name || '',
        province: selectedProvince?.code === 'none' ? '' : (selectedProvince?.name || ''),
        city: selectedCity?.name || '',
        barangay: item.name
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(0);
    setSearchQuery('');
    setSelectedRegion(null);
    setSelectedProvince(null);
    setSelectedCity(null);
    onClose();
  };

  const goBack = () => {
    setSearchQuery('');
    if (step === 3) {
      if (selectedProvince?.code === 'none' && selectedRegion) {
        fetchCities(selectedRegion.code, true);
      } else if (selectedProvince) {
        fetchCities(selectedProvince.code, false);
      }
    } else if (step === 2) {
      if (selectedRegion) {
        fetchProvinces(selectedRegion.code);
      }
    } else if (step === 1) {
      setStep(0);
      fetchRegions();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 0: return 'Select Region';
      case 1: return 'Select Province';
      case 2: return 'Select City / Municipality';
      case 3: return 'Select Barangay';
      default: return 'Select Location';
    }
  };

  const filteredData = dataList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        style={styles.modalOverlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.bottomSheet}>
          <View style={styles.header}>
            {step > 0 ? (
              <TouchableOpacity onPress={goBack} style={styles.headerIcon}>
                <FontAwesome5 name="arrow-left" size={18} color="#2d3748" />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerIcon} />
            )}
            <Text style={styles.headerTitle}>{getStepTitle()}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.headerIcon}>
              <FontAwesome5 name="times" size={20} color="#2d3748" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <FontAwesome5 name="search" size={14} color="#a0aec0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${getStepTitle().split(' ')[1]}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#a0aec0"
            />
          </View>

          <View style={styles.listContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#2E5E3E" style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.listItem} onPress={() => handleSelectItem(item)}>
                    <Text style={styles.listItemText}>{item.name}</Text>
                    <FontAwesome5 name="chevron-right" size={12} color="#cbd5e0" />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No results found.</Text>
                }
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#1a202c',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#2d3748',
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  listItemText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 15,
    color: '#2d3748',
  },
  emptyText: {
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    color: '#a0aec0',
    marginTop: 20,
  }
});
