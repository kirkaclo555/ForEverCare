"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export interface AdminProfileData {
  id?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  recoveryPhone?: string;
  profileImage?: string | null;
  role?: string;
  staffId?: string;
  position?: string;
  createdAt?: string;
  twoFactorEnabled?: boolean;
}

export interface AdminProfileContextProps {
  profile: AdminProfileData | null;
  profilePic: string | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileLocally: (updated: Partial<AdminProfileData>) => void;
}

const AdminProfileContext = createContext<AdminProfileContextProps | undefined>(undefined);

export function AdminProfileProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '';
  const isSuperAdmin = pathname.startsWith('/superadmin');
  const picKey = isSuperAdmin ? 'superadminProfilePic' : 'adminProfilePic';
  const infoKey = isSuperAdmin ? 'superadminPersonalInfo' : 'adminPersonalInfo';

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from local storage immediately on mount or path change
  const loadLocalCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    const cachedPic = localStorage.getItem(picKey);
    if (cachedPic) {
      setProfilePic(cachedPic);
    }
    const cachedInfo = localStorage.getItem(infoKey);
    if (cachedInfo) {
      try {
        const parsed = JSON.parse(cachedInfo);
        setProfile(prev => ({
          fullName: parsed.fullName || (isSuperAdmin ? 'Super Admin' : 'System Admin'),
          email: parsed.email || (isSuperAdmin ? 'fureverpawcare@gmail.com' : 'adminfureverpawcare@gmail.com'),
          position: parsed.position || parsed.roleTitle || (isSuperAdmin ? 'System Superadmin' : 'Clinic Administrator'),
          profileImage: cachedPic || null,
          ...parsed,
          ...prev
        }));
      } catch (e) {
        // ignore parse error
      }
    }
  }, [picKey, infoKey, isSuperAdmin]);

  // Fetch live from database API
  const refreshProfile = useCallback(async () => {
    try {
      const roleQuery = isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN';
      const res = await fetch(`/api/admin/profile?role=${roleQuery}`, {
        cache: 'no-store'
      });
      if (!res.ok) return;

      const data = await res.json();
      if (!data || data.error) return;

      setProfile(data);

      if (data.profileImage) {
        setProfilePic(data.profileImage);
        try {
          localStorage.setItem(picKey, data.profileImage);
        } catch {
          // localStorage quota exception fallback
        }
      }

      // Sync name & email cache
      try {
        localStorage.setItem(infoKey, JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          position: data.position,
          staffId: data.staffId,
          phoneNumber: data.phoneNumber,
          address: data.address
        }));
      } catch {}
    } catch (err) {
      console.error('[AdminProfileContext] Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin, picKey, infoKey]);

  const updateProfileLocally = useCallback((updated: Partial<AdminProfileData>) => {
    setProfile(prev => prev ? { ...prev, ...updated } : (updated as AdminProfileData));
    if (updated.profileImage !== undefined) {
      setProfilePic(updated.profileImage);
      if (updated.profileImage) {
        try {
          localStorage.setItem(picKey, updated.profileImage);
        } catch {}
      }
    }
  }, [picKey]);

  // Mount effect
  useEffect(() => {
    loadLocalCache();
    refreshProfile();

    const handlePicUpdated = () => {
      const pic = localStorage.getItem(picKey);
      setProfilePic(pic || null);
    };

    const handleInfoUpdated = () => {
      refreshProfile();
    };

    window.addEventListener('profilePicUpdated', handlePicUpdated);
    window.addEventListener('profileInfoUpdated', handleInfoUpdated);

    return () => {
      window.removeEventListener('profilePicUpdated', handlePicUpdated);
      window.removeEventListener('profileInfoUpdated', handleInfoUpdated);
    };
  }, [loadLocalCache, refreshProfile, picKey]);

  return (
    <AdminProfileContext.Provider
      value={{
        profile,
        profilePic,
        isLoading,
        refreshProfile,
        updateProfileLocally
      }}
    >
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  const context = useContext(AdminProfileContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      profile: null,
      profilePic: null,
      isLoading: false,
      refreshProfile: async () => {},
      updateProfileLocally: () => {}
    };
  }
  return context;
}
