import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserProfile = {
  id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  avatarUri: string | null;
  language?: 'en' | 'tl';
};

type UserContextType = {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
};

const defaultUser: UserProfile = {
  id: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  address: '',
  avatarUri: null,
  language: 'en',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user_profile');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser({
            ...defaultUser,
            ...parsed,
          });
        }
      } catch (e) {
        console.error('Failed to load user profile', e);
      }
    };
    loadUser();
  }, []);

  const updateUser = async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...updates };
      AsyncStorage.setItem('@user_profile', JSON.stringify(updatedUser)).catch((e) => {
        console.error('Failed to save user profile', e);
      });
      return updatedUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
