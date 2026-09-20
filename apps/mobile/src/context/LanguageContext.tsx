import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import { API_URL } from '../config/api';
import { Language, getTranslation } from '../utils/translations';

type LanguageContextType = {
  language: Language;
  changeLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const { user, updateUser } = useUser();

  // Load language from AsyncStorage or User profile
  useEffect(() => {
    const loadLang = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('@app_language');
        if (storedLang === 'en' || storedLang === 'tl') {
          setLanguage(storedLang as Language);
        } else if (user?.language) {
          setLanguage(user.language as Language);
        }
      } catch (e) {
        console.error('Failed to load language preference', e);
      }
    };
    loadLang();
  }, [user?.language]);

  const changeLanguage = async (newLang: Language) => {
    setLanguage(newLang);
    try {
      await AsyncStorage.setItem('@app_language', newLang);
      
      // Update local UserContext if available
      updateUser({ language: newLang });

      // Sync to database via API update if user is logged in
      if (user?.id) {
        await fetch(`${API_URL}/api/auth/mobile/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profileImage: user.avatarUri,
            language: newLang // Pass selected language
          }),
        }).catch(err => console.log('Failed to sync language to server DB:', err));
      }
    } catch (e) {
      console.error('Failed to save language preference', e);
    }
  };

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
