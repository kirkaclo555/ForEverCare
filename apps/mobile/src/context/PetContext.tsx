import React, { createContext, useState, useContext, ReactNode } from 'react';

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
  const [pets, setPets] = useState<PetProfile[]>([
    { id: '1', name: 'Max', species: 'Dog', breed: 'Golden Retriever', age: '3 yrs', weight: '28.5 kg', gender: 'Male', avatar: 'dog' },
    { id: '2', name: 'Luna', species: 'Cat', breed: 'Persian', age: '2.5 yrs', weight: '4.2 kg', gender: 'Female', avatar: 'cat' },
  ]);

  const addPet = (pet: PetProfile) => {
    setPets(prev => [...prev, pet]);
  };

  const updatePet = (pet: PetProfile) => {
    setPets(prev => prev.map(p => p.id === pet.id ? pet : p));
  };

  return (
    <PetContext.Provider value={{ pets, addPet, updatePet }}>
      {children}
    </PetContext.Provider>
  );
};
