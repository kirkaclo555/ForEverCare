import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AddressItem = {
  id: string;
  label: 'Home' | 'Work' | string;
  text: string;
  isDefault: boolean;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
};

export type UserProfile = {
  id?: string;
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  address?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  addresses?: AddressItem[];
  bio?: string;
  emergencyContact?: string;
  avatarUri: string | null;
  language?: 'en' | 'tl';
  createdAt?: string;
};

type UserContextType = {
  user: UserProfile;
  isGuest: boolean;
  setIsGuest: (val: boolean) => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
};

const defaultUser: UserProfile = {
  id: '',
  fullName: '',
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  address: '',
  street: '',
  barangay: '',
  city: '',
  province: '',
  zipCode: '',
  bio: '',
  emergencyContact: '',
  avatarUri: null,
  language: 'en',
  createdAt: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user_profile');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id && parsed.id.trim() !== '') {
            setUser({
              ...defaultUser,
              ...parsed,
            });
            setGuestMode(false);
          } else {
            setUser(defaultUser);
          }
        }
      } catch (e) {
        console.error('Failed to load user profile', e);
      }
    };
    loadUser();
  }, []);

  const isGuest = guestMode || !user?.id || user.id.trim() === '';

  const setIsGuest = (val: boolean) => {
    setGuestMode(val);
    if (val) {
      setUser(defaultUser);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('@user_profile');
    } catch (e) {
      console.error('Failed to clear stored profile', e);
    }
    setUser(defaultUser);
    setGuestMode(false);
  };

  const updateUser = async (updates: Partial<UserProfile>): Promise<void> => {
    return new Promise<void>((resolve) => {
      setUser((prev) => {
        const updatedUser = { ...prev, ...updates };
        if (updatedUser.id && updatedUser.id.trim() !== '') {
          setGuestMode(false);
        }
        AsyncStorage.setItem('@user_profile', JSON.stringify(updatedUser))
          .catch((e) => {
            console.error('Failed to save user profile', e);
          })
          .finally(() => {
            resolve();
          });
        return updatedUser;
      });
    });
  };

  return (
    <UserContext.Provider value={{ user, isGuest, setIsGuest, updateUser, logout }}>
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
