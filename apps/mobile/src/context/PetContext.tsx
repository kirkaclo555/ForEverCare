import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';

export type PetProfile = {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | string;
  breed: string;
  age: string;
  weight: string;
  gender: string;
  avatar: string;
};

type PetContextType = {
  pets: PetProfile[];
  addPet: (pet: PetProfile) => void;
  updatePet: (pet: PetProfile) => void;
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

  const fetchPets = async () => {
    if (!user || !user.id) return;
    try {
      const res = await fetch(`http://192.168.100.16:3000/api/pets?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setPets(data);
        await AsyncStorage.setItem('@pet_records', JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to fetch pets from API', e);
      // Fallback to local storage if offline
      const storedPets = await AsyncStorage.getItem('@pet_records');
      if (storedPets) setPets(JSON.parse(storedPets));
    }
  };

  useEffect(() => {
    fetchPets();
  }, [user?.id]);

  const addPet = async (pet: PetProfile) => {
    if (!user || !user.id) return;
    // Optimistic update
    const newPets = [...pets, pet];
    setPets(newPets);
    
    try {
      const res = await fetch('http://192.168.100.16:3000/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, pet })
      });
      if (res.ok) {
        fetchPets(); // Refresh with real ID
      }
    } catch (e) {
      console.error('Failed to add pet to API', e);
    }
  };

  const updatePet = async (pet: PetProfile) => {
    if (!user || !user.id) return;
    // Optimistic update
    const newPets = pets.map(p => p.id === pet.id ? pet : p);
    setPets(newPets);
    
    try {
      const res = await fetch('http://192.168.100.16:3000/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, pet })
      });
      if (res.ok) {
        fetchPets(); // Refresh
      }
    } catch (e) {
      console.error('Failed to update pet to API', e);
    }
  };

  return (
    <PetContext.Provider value={{ pets, addPet, updatePet }}>
      {children}
    </PetContext.Provider>
  );
};
