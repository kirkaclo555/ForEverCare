import React, { createContext, useState, useContext, ReactNode } from 'react';

type UserProfile = {
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUri: string | null;
};

type UserContextType = {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
};

const defaultUser: UserProfile = {
  fullName: 'Jealene',
  email: 'jealene@fureverpaw.com',
  phoneNumber: '+63 912 345 6789',
  avatarUri: null,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
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
