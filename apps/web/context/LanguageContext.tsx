"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'tl';

export const translations = {
  en: {
    // General
    back: 'Back',
    save: 'Save',
    edit: 'Edit',
    success: 'Success',
    error: 'Error',
    cancel: 'Cancel',
    yes: 'Yes',
    close: 'Close',
    loading: 'Loading...',
    apply: 'Apply',

    // TopBar & Settings Dropdown
    settings: 'Settings',
    generalSettings: 'General Settings',
    accountSecurity: 'Account and Security',
    language: 'Language',
    darkMode: 'Darkmode',
    communityRules: 'Community Rules',
    logout: 'Logout',
    notifications: 'Notifications',
    viewAll: 'View all',
    noNewNotifications: 'No new notifications',
    allNotifications: 'All Notifications',
    notificationDetails: 'Notification Details',
    confirmLogout: 'Confirm Logout',
    logoutConfirmText: 'Are you sure you want to log out?',
    logOutButton: 'Log Out',

    // Section Titles
    management: 'Management',
    clinic: 'Clinic',
    recordsSection: 'Records',

    // Sidebar items
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    products: 'Products',
    billing: 'Billing',
    appointment: 'Appointment',
    telemedicine: 'Telemedicine',
    petMonitor: 'Pet Monitor',
    smsCenter: 'SMS Center',
    petRecords: 'Pet Records',
    users: 'Users',
    reports: 'Clinic Reports',
    tutorials: 'Tutorials',
    announcements: 'Announcements',
    feedback: 'Feedback',
    archive: 'Archive',
    analytics: 'Analytics',

    // Language modal specific
    languageSettings: 'Language Settings',
    selectLanguage: 'Select your preferred language',
    wikangFilipino: 'Wikang Filipino',
    english: 'English',
    tagalog: 'Tagalog',
    currentLanguage: 'Current language',
    applyChanges: 'Apply Changes',

    // Dashboard titles and stats
    goodMorningAdmin: 'Good morning, Admin!',
    goodMorningSuperAdmin: 'Good morning, Super Admin!',
    todayAppointments: "Today's Appointments",
    totalPets: 'Total Pets',
    pendingConsultations: 'Pending Consultations',
    revenue: 'Revenue',
    calendarActivities: 'Calendar Activities',
    editSlots: 'Edit Slots',
    scheduleFor: 'Schedule for',
    timeSlotsStatus: 'Time Slots Status',
    selectedDate: 'Selected Date',
    noAppointments: 'No appointments for this date',
    alreadyBooked: 'Already Booked',
    manuallyDisabled: 'Manually Disabled',
    available: 'Available',
    allSchedules: 'All Schedules for',
    clinicInformation: 'Clinic Information',
    clinicName: 'Clinic name',
    address: 'Address',
    phoneNumber: 'Phone number',
    openingHours: 'Opening hours',
    saveChanges: 'Save Changes',
    updatePassword: 'Update Password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmNewPassword: 'Confirm new password',
    passwordRequirements: 'Password requirements:',
    atLeast8Chars: 'At least 8 characters',
    oneUppercase: 'One uppercase letter',
    oneNumber: 'One number',
    passwordsMatch: 'Passwords match',
    dos: "Do's",
    donts: "Don'ts",
    gotIt: 'Got it',
    VeterinarySystem: 'Veterinary System',
    registeredInSystem: 'Registered in system',
    todaysScheduledVisits: "Today's scheduled visits",
    awaitingConfirmation: 'Awaiting confirmation',
    totalCollected: 'Total collected',
    clickTimeSlot: 'Click on a time slot to enable or disable it for this date.',
    cannotEditBooked: 'Cannot edit a booked slot',
    booked: 'Booked',
    done: 'Done',
  },
  tl: {
    // General
    back: 'Bumalik',
    save: 'I-save',
    edit: 'I-edit',
    success: 'Tagumpay',
    error: 'Kamalian',
    cancel: 'Kanselahin',
    yes: 'Oo',
    close: 'Isara',
    loading: 'Nilo-load...',
    apply: 'I-apply',

    // TopBar & Settings Dropdown
    settings: 'Mga Setting',
    generalSettings: 'Pangkalahatang Setting',
    accountSecurity: 'Seguridad ng Account',
    language: 'Wika',
    darkMode: 'Dark Mode',
    communityRules: 'Panuntunan ng Komunidad',
    logout: 'Mag-logout',
    notifications: 'Mga Abiso',
    viewAll: 'Tingnan Lahat',
    noNewNotifications: 'Walang bagong abiso',
    allNotifications: 'Lahat ng Abiso',
    notificationDetails: 'Detalye ng Abiso',
    confirmLogout: 'Kumpirmahin ang Pag-logout',
    logoutConfirmText: 'Sigurado ka bang gusto mong mag-logout?',
    logOutButton: 'Mag-logout',

    // Section Titles
    management: 'Pamamahala',
    clinic: 'Klinika',
    recordsSection: 'Mga Rekord',

    // Sidebar items
    dashboard: 'Dashboard',
    inventory: 'Imbentaryo',
    products: 'Mga Produkto',
    billing: 'Pagsingil',
    appointment: 'Appointment',
    telemedicine: 'Telemedicine',
    petMonitor: 'Pagsubaybay sa Alaga',
    smsCenter: 'SMS Center',
    petRecords: 'Mga Rekord ng Alaga',
    users: 'Mga User',
    reports: 'Ulat ng Klinika',
    tutorials: 'Mga Tutorial',
    announcements: 'Mga Anunsyo',
    feedback: 'Feedback',
    archive: 'Archive',
    analytics: 'Analytics',

    // Language modal specific
    languageSettings: 'Mga Setting ng Wika',
    selectLanguage: 'Piliin ang iyong gustong wika',
    wikangFilipino: 'Wikang Filipino',
    english: 'Ingles',
    tagalog: 'Tagalog',
    currentLanguage: 'Kasalukuyang wika',
    applyChanges: 'I-apply ang mga Pagbabago',

    // Dashboard titles and stats
    goodMorningAdmin: 'Magandang umaga, Admin!',
    goodMorningSuperAdmin: 'Magandang umaga, Super Admin!',
    todayAppointments: 'Mga Appointment Ngayong Araw',
    totalPets: 'Kabuuang Alaga',
    pendingConsultations: 'Nakabinbing Konsultasyon',
    revenue: 'Kita',
    calendarActivities: 'Mga Aktibidad sa Kalendaryo',
    editSlots: 'I-edit ang Oras',
    scheduleFor: 'Iskedyul para sa',
    timeSlotsStatus: 'Katayuan ng Oras',
    selectedDate: 'Piling Petsa',
    noAppointments: 'Walang appointment sa petsang ito',
    alreadyBooked: 'Nareserba Na',
    manuallyDisabled: 'Hindi Aktibo',
    available: 'Bakante',
    allSchedules: 'Lahat ng Iskedyul para sa',
    clinicInformation: 'Impormasyon ng Klinika',
    clinicName: 'Pangalan ng klinika',
    address: 'Tirahan',
    phoneNumber: 'Numero ng telepono',
    openingHours: 'Oras ng pagbubukas',
    saveChanges: 'I-save ang mga Pagbabago',
    updatePassword: 'I-update ang Password',
    currentPassword: 'Kasalukuyang password',
    newPassword: 'Bagong password',
    confirmNewPassword: 'Kumpirmahin ang bagong password',
    passwordRequirements: 'Mga kinakailangan sa password:',
    atLeast8Chars: 'Hindi bababa sa 8 karakter',
    oneUppercase: 'Isang malaking titik',
    oneNumber: 'Isang numero',
    passwordsMatch: 'Tumutugma ang mga password',
    dos: 'Dapat Gawin (Do\'s)',
    donts: 'Hindi Dapat Gawin (Don\'ts)',
    gotIt: 'Naintindihan ko',
    VeterinarySystem: 'Sistemang Beterinaryo',
    registeredInSystem: 'Nakarehistro sa sistema',
    todaysScheduledVisits: 'Mga nakaiskedyul na pagbisita ngayong araw',
    awaitingConfirmation: 'Naghihintay ng kumpirmasyon',
    totalCollected: 'Kabuuang nakolekta',
    clickTimeSlot: 'I-click ang oras upang i-enable o i-disable ito para sa petsang ito.',
    cannotEditBooked: 'Hindi pwedeng i-edit ang na-book na oras',
    booked: 'Nareserba',
    done: 'Tapos na',
  }
};

type LanguageContextType = {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang === 'en' || storedLang === 'tl') {
      setLanguage(storedLang as Language);
    }
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    // Dispatch custom event to notify other components/windows
    window.dispatchEvent(new Event('languageUpdated'));
  };

  const t = (key: string): string => {
    if (!key) return '';
    
    // Standardize key lookup
    const lowerKey = key.toLowerCase();
    
    // Map custom strings to their keys
    let lookupKey = key;
    if (lowerKey === 'management') lookupKey = 'management';
    else if (lowerKey === 'clinic') lookupKey = 'clinic';
    else if (lowerKey === 'records' || lowerKey === 'recordssection' || lowerKey === 'records section') lookupKey = 'recordsSection';
    else if (lowerKey === 'dashboard') lookupKey = 'dashboard';
    else if (lowerKey === 'inventory') lookupKey = 'inventory';
    else if (lowerKey === 'products') lookupKey = 'products';
    else if (lowerKey === 'billing') lookupKey = 'billing';
    else if (lowerKey === 'appointment') lookupKey = 'appointment';
    else if (lowerKey === 'telemedicine') lookupKey = 'telemedicine';
    else if (lowerKey === 'pet monitor') lookupKey = 'petMonitor';
    else if (lowerKey === 'sms center') lookupKey = 'smsCenter';
    else if (lowerKey === 'pet records') lookupKey = 'petRecords';
    else if (lowerKey === 'users') lookupKey = 'users';
    else if (lowerKey === 'clinic reports' || lowerKey === 'reports') lookupKey = 'reports';
    else if (lowerKey === 'tutorials') lookupKey = 'tutorials';
    else if (lowerKey === 'announcements') lookupKey = 'announcements';
    else if (lowerKey === 'feedback') lookupKey = 'feedback';
    else if (lowerKey === 'archive') lookupKey = 'archive';
    else if (lowerKey === 'analytics') lookupKey = 'analytics';
    else if (lowerKey === 'settings') lookupKey = 'settings';
    else if (lowerKey === 'general settings') lookupKey = 'generalSettings';
    else if (lowerKey === 'account and security') lookupKey = 'accountSecurity';
    else if (lowerKey === 'language') lookupKey = 'language';
    else if (lowerKey === 'darkmode') lookupKey = 'darkMode';
    else if (lowerKey === 'community rules') lookupKey = 'communityRules';
    else if (lowerKey === 'logout') lookupKey = 'logout';
    else if (lowerKey === 'notifications') lookupKey = 'notifications';
    else if (lowerKey === 'view all') lookupKey = 'viewAll';
    else if (lowerKey === 'no new notifications') lookupKey = 'noNewNotifications';
    else if (lowerKey === 'all notifications') lookupKey = 'allNotifications';
    else if (lowerKey === 'notification details') lookupKey = 'notificationDetails';
    else if (lowerKey === 'confirm logout') lookupKey = 'confirmLogout';
    else if (lowerKey === 'are you sure you want to log out?') lookupKey = 'logoutConfirmText';
    else if (lowerKey === 'log out') lookupKey = 'logOutButton';
    else if (lowerKey === 'cancel') lookupKey = 'cancel';
    else if (lowerKey === 'close') lookupKey = 'close';
    else if (lowerKey === 'veterinary system') lookupKey = 'VeterinarySystem';
    else if (lowerKey === "today's appointments" || lowerKey === "today&apos;s appointments") lookupKey = 'todayAppointments';
    else if (lowerKey === 'total pets') lookupKey = 'totalPets';
    else if (lowerKey === 'pending consultations') lookupKey = 'pendingConsultations';
    else if (lowerKey === 'revenue') lookupKey = 'revenue';
    else if (lowerKey === 'calendar activities') lookupKey = 'calendarActivities';
    else if (lowerKey === 'edit slots') lookupKey = 'editSlots';
    else if (lowerKey === 'schedule for') lookupKey = 'scheduleFor';
    else if (lowerKey === 'time slots status') lookupKey = 'timeSlotsStatus';
    else if (lowerKey === 'selected date') lookupKey = 'selectedDate';
    else if (lowerKey === 'no appointments for this date') lookupKey = 'noAppointments';
    else if (lowerKey === 'already booked') lookupKey = 'alreadyBooked';
    else if (lowerKey === 'manually disabled') lookupKey = 'manuallyDisabled';
    else if (lowerKey === 'available') lookupKey = 'available';
    else if (lowerKey === 'all schedules for') lookupKey = 'allSchedules';
    else if (lowerKey === 'clinic information') lookupKey = 'clinicInformation';
    else if (lowerKey === 'clinic name') lookupKey = 'clinicName';
    else if (lowerKey === 'address') lookupKey = 'address';
    else if (lowerKey === 'phone number') lookupKey = 'phoneNumber';
    else if (lowerKey === 'opening hours') lookupKey = 'openingHours';
    else if (lowerKey === 'save changes') lookupKey = 'saveChanges';
    else if (lowerKey === 'update password') lookupKey = 'updatePassword';
    else if (lowerKey === 'current password') lookupKey = 'currentPassword';
    else if (lowerKey === 'new password') lookupKey = 'newPassword';
    else if (lowerKey === 'confirm new password') lookupKey = 'confirmNewPassword';
    else if (lowerKey === 'password requirements:') lookupKey = 'passwordRequirements';
    else if (lowerKey === 'at least 8 characters') lookupKey = 'atLeast8Chars';
    else if (lowerKey === 'one uppercase letter') lookupKey = 'oneUppercase';
    else if (lowerKey === 'one number') lookupKey = 'oneNumber';
    else if (lowerKey === 'passwords match') lookupKey = 'passwordsMatch';
    else if (lowerKey === "do's") lookupKey = 'dos';
    else if (lowerKey === "don'ts") lookupKey = 'donts';
    else if (lowerKey === 'got it') lookupKey = 'gotIt';
    else if (lowerKey === 'registered in system') lookupKey = 'registeredInSystem';
    else if (lowerKey === "today's scheduled visits" || lowerKey === "today&apos;s scheduled visits") lookupKey = 'todaysScheduledVisits';
    else if (lowerKey === 'awaiting confirmation') lookupKey = 'awaitingConfirmation';
    else if (lowerKey === 'total collected') lookupKey = 'totalCollected';
    else if (lowerKey === 'click on a time slot to enable or disable it for this date.') lookupKey = 'clickTimeSlot';
    else if (lowerKey === 'cannot edit a booked slot') lookupKey = 'cannotEditBooked';
    else if (lowerKey === 'booked') lookupKey = 'booked';
    else if (lowerKey === 'done') lookupKey = 'done';

    const translation = translations[language]?.[lookupKey as keyof typeof translations['en']];
    return translation || key;
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
