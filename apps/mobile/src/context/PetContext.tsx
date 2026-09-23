import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import { API_URL } from '../config/api';

export type PetProfile = {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | string;
  breed: string;
  age: string;
  weight: string;
  gender: string;
  environment?: string;
  activity?: string;
  avatar: string;
  monitoring?: any[];
  pastIllness?: string;
  previousSurgeries?: string;
  vaccine?: string;
  veterinarian?: string;
  appointments?: any[];
  telemedicine?: any[];
  verificationStatus?: 'PENDING' | 'VERIFIED' | string;
  verifiedAt?: string;
  verifiedBy?: string;
};

export type VaccinationRecord = {
  id: string;
  vaccineName: string;
  vaccineType: string;
  vaccinationDate: string;
  nextDueDate: string;
  vetClinic?: string;
  notifId?: string;
};

type PetContextType = {
  pets: PetProfile[];
  addPet: (pet: PetProfile) => Promise<PetProfile | null>;
  updatePet: (pet: PetProfile) => Promise<PetProfile | null>;
  refreshPets: () => Promise<void>;
};

const PetContext = createContext<PetContextType | undefined>(undefined);

export const usePetContext = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePetContext must be used within a PetProvider');
  }
  return context;
};

export const PetProvider = ({ children }: { children: ReactNode }) => {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const { user } = useUser();

  // 1. Immediately load cached pets from local storage on mount.
  // Only do this for authenticated users — guests see an empty list.
  useEffect(() => {
    const loadCachedPets = async () => {
      // Wait until user context has settled before touching the cache
      if (!user?.id || user.id.trim() === '') {
        // Guest: ensure pets list is empty
        setPets([]);
        return;
      }
      try {
        const storedPets = await AsyncStorage.getItem('@pet_records');
        if (storedPets) {
          const parsed = JSON.parse(storedPets);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPets(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load cached pets on mount:', err);
      }
    };
    loadCachedPets();
  }, [user?.id]);

  const fetchPets = async () => {
    if (!user || !user.id || user.id.trim() === '') {
      // Guest user: show nothing — clear the list so no previous session's
      // pets bleed through.
      setPets([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/pets?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        let combinedPets: PetProfile[] = Array.isArray(data) ? [...data] : [];

        // Check local storage for any unsynced or missing pets
        try {
          const storedPetsStr = await AsyncStorage.getItem('@pet_records');
          if (storedPetsStr) {
            const storedPets: PetProfile[] = JSON.parse(storedPetsStr);
            if (Array.isArray(storedPets)) {
              const unsyncedPets = storedPets.filter(sp =>
                !combinedPets.some(dp => dp.id === sp.id || dp.name?.trim().toLowerCase() === sp.name?.trim().toLowerCase())
              );

              for (const unPet of unsyncedPets) {
                try {
                  const syncRes = await fetch(`${API_URL}/api/pets`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, pet: unPet })
                  });
                  if (syncRes.ok) {
                    const syncData = await syncRes.json();
                    if (syncData.pet) {
                      combinedPets.push(syncData.pet);
                    } else {
                      combinedPets.push(unPet);
                    }
                  } else {
                    combinedPets.push(unPet);
                  }
                } catch (syncErr) {
                  console.warn('Could not sync local pet to server:', syncErr);
                  combinedPets.push(unPet);
                }
              }
            }
          }
        } catch (storageErr) {
          console.error('Error reading offline pets:', storageErr);
        }

        setPets(combinedPets);
        await AsyncStorage.setItem('@pet_records', JSON.stringify(combinedPets));
      } else {
        const storedPets = await AsyncStorage.getItem('@pet_records');
        if (storedPets) setPets(JSON.parse(storedPets));
      }
    } catch (e) {
      console.error('Failed to fetch pets from API', e);
      // Fallback to local storage if offline or server is unreachable
      const storedPets = await AsyncStorage.getItem('@pet_records');
      if (storedPets) setPets(JSON.parse(storedPets));
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPets();
    }
  }, [user?.id]);

  const addPet = async (pet: PetProfile): Promise<PetProfile | null> => {
    // 1. Immediately persist to React state & AsyncStorage
    const newPetWithStatus = { ...pet, verificationStatus: pet.verificationStatus || 'PENDING' };
    setPets(prev => {
      const updated = [...prev.filter(p => p.id !== pet.id), newPetWithStatus];
      AsyncStorage.setItem('@pet_records', JSON.stringify(updated));
      return updated;
    });

    if (!user || !user.id) {
      return newPetWithStatus;
    }
    
    // 2. Persist to PostgreSQL database
    try {
      const res = await fetch(`${API_URL}/api/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, pet })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pet) {
          setPets(prev => {
            const updated = [...prev.filter(p => p.id !== pet.id), data.pet];
            AsyncStorage.setItem('@pet_records', JSON.stringify(updated));
            return updated;
          });
          return data.pet;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('POST /api/pets returned error:', errData);
      }
    } catch (e) {
      console.error('Failed to add pet to API', e);
    }

    return newPetWithStatus;
  };

  const updatePet = async (pet: PetProfile): Promise<PetProfile | null> => {
    // Immediately persist to React state & AsyncStorage
    setPets(prev => {
      const updated = prev.map(p => p.id === pet.id ? pet : p);
      AsyncStorage.setItem('@pet_records', JSON.stringify(updated));
      return updated;
    });

    if (!user || !user.id) return pet;
    
    try {
      const res = await fetch(`${API_URL}/api/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, pet })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pet) {
          setPets(prev => {
            const updated = prev.map(p => p.id === data.pet.id ? data.pet : p);
            AsyncStorage.setItem('@pet_records', JSON.stringify(updated));
            return updated;
          });
          return data.pet;
        }
      }
    } catch (e) {
      console.error('Failed to update pet to API', e);
    }
    return pet;
  };

  return (
    <PetContext.Provider value={{ pets, addPet, updatePet, refreshPets: fetchPets }}>
      {children}
    </PetContext.Provider>
  );
};
