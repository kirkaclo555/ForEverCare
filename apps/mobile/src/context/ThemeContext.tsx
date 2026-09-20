import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  headerBackground: string;
  headerText: string;
  tabBarBackground: string;
  inputBackground: string;
  inputText: string;
  placeholderText: string;
  sectionTitleColor: string;
};

type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: Theme;
};

const LightTheme: Theme = {
  background: '#F4F1EC',
  card: '#ffffff',
  text: '#2d3748',
  subtext: '#718096',
  border: 'rgba(0,0,0,0.07)',
  headerBackground: '#2D5016',
  headerText: '#ffffff',
  tabBarBackground: '#FCFBF7',
  inputBackground: '#ffffff',
  inputText: '#2d3748',
  placeholderText: '#a0aec0',
  sectionTitleColor: '#2D5016',
};

const DarkTheme: Theme = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#f7fafc',
  subtext: '#a0aec0',
  border: 'rgba(255,255,255,0.08)',
  headerBackground: '#1c330e',
  headerText: '#f7fafc',
  tabBarBackground: '#1a1a1a',
  inputBackground: '#2d2d2d',
  inputText: '#f7fafc',
  placeholderText: '#718096',
  sectionTitleColor: '#EAF3DE',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@dark_mode').then((val) => {
      if (val !== null) {
        setIsDarkMode(val === 'true');
      }
    });
  }, []);

  const toggleDarkMode = async () => {
    try {
      const newVal = !isDarkMode;
      setIsDarkMode(newVal);
      await AsyncStorage.setItem('@dark_mode', String(newVal));
    } catch (e) {
      console.error(e);
    }
  };

  const theme = isDarkMode ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
