"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './profile.css';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  category: string;
  icon: string;
  badgeColor: string;
  iconColor: string;
}

export default function ProfilePage() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'clinic' | 'security'>('overview');

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  // Profile Picture
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Joined Date (from database)
  const [joinedDate, setJoinedDate] = useState<string>('');

  // Dynamic Metrics from database
  const [metrics, setMetrics] = useState({
    appointments: 0,
    patients: 0,
    telemedicine: 0,
    inventory: 0,
    loading: true
  });

  // Recent Live Activity Feed from database
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  // Personal and Staff Information
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "System Admin",
    email: "adminfureverpawcare@gmail.com",
    contact: "",
    address: "",
    staffId: "EMP-ADM-0001",
    roleTitle: "Clinic Administrator & Practice Manager",
    department: "Veterinary Operations & Client Care",
    bio: "Senior Clinic Practice Manager coordinating clinical operations, appointment schedules, inventory management, and remote telemedicine consultations at FurEverCare.",
    emergencyName: "Dr. Robert Vance",
    emergencyRelation: "Senior Partner Veterinarian",
    emergencyPhone: ""
  });

  const [editedInfo, setEditedInfo] = useState(personalInfo);
  const isDirty = JSON.stringify(personalInfo) !== JSON.stringify(editedInfo);

  // Security & Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA & Notification Preferences
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    emergencyAlerts: true,
    telemedBookings: true,
    inventoryWarnings: true,
    dailyDigest: false
  });

  // Toast notification helper
  const showToast = (message: string, isError = false) => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}" style="font-size: 1.1rem; color: ${isError ? '#FC8181' : '#68D391'};"></i> ${message}`;
      toast.classList.add('toastShow');
      setTimeout(() => {
        toast.classList.remove('toastShow');
      }, 3500);
    }
  };

  // Fetch admin profile data directly from the database API
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/profile');
      if (!res.ok) {
        throw new Error('Failed to load profile data');
      }
      const data = await res.json();

      // Read local custom preferences or bio if saved locally
      const localStored = localStorage.getItem('adminPersonalInfo');
      let localParsed: any = {};
      if (localStored) {
        try { localParsed = JSON.parse(localStored); } catch {}
      }

      const populated = {
        fullName: data.fullName || localParsed.fullName || "System Admin",
        email: data.email || localParsed.email || "adminfureverpawcare@gmail.com",
        contact: data.phoneNumber || localParsed.contact || "",
        address: data.address || localParsed.address || "",
        staffId: data.staffId || "EMP-ADM-1865",
        roleTitle: data.position || localParsed.roleTitle || "Clinic Administrator & Practice Manager",
        department: localParsed.department || "Veterinary Operations & Client Care",
        bio: localParsed.bio || "Senior Clinic Practice Manager coordinating clinical operations, appointment schedules, inventory management, and remote telemedicine consultations at FurEverCare.",
        emergencyName: localParsed.emergencyName || "Dr. Robert Vance",
        emergencyRelation: localParsed.emergencyRelation || "Senior Partner Veterinarian",
        emergencyPhone: data.recoveryPhone || localParsed.emergencyPhone || ""
      };

      setPersonalInfo(populated);
      setEditedInfo(populated);

      if (data.createdAt) {
        setJoinedDate(data.createdAt);
      }

      if (data.profileImage) {
        setProfilePic(data.profileImage);
        localStorage.setItem('adminProfilePic', data.profileImage);
      } else {
        const localPic = localStorage.getItem('adminProfilePic');
        if (localPic) setProfilePic(localPic);
      }

      if (data.twoFactorEnabled !== undefined) {
        setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
        localStorage.setItem('admin2FA', String(data.twoFactorEnabled));
      }

      if (data.metrics) {
        setMetrics({
          appointments: data.metrics.appointments ?? 0,
          patients: data.metrics.patients ?? 0,
          telemedicine: data.metrics.telemedicine ?? 0,
          inventory: data.metrics.inventory ?? 0,
          loading: false
        });
      }

      if (data.recentActivity && Array.isArray(data.recentActivity)) {
        setRecentActivities(data.recentActivity);
      }
    } catch (err: any) {
      console.error('[Profile] Error loading profile from database:', err);
      showToast("Could not load latest profile from database.", true);
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    fetchProfile();

    const storedPrefs = localStorage.getItem('adminNotificationPrefs');
    if (storedPrefs) {
      try {
        setNotificationPrefs(JSON.parse(storedPrefs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Handle Photo Upload (saves base64 to database & localStorage)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setProfilePic(base64String);
        localStorage.setItem('adminProfilePic', base64String);
        window.dispatchEvent(new Event('profilePicUpdated'));

        try {
          const res = await fetch('/api/admin/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileImage: base64String })
          });
          if (!res.ok) throw new Error();
          showToast("Profile picture saved to database!");
        } catch {
          showToast("Profile picture updated locally.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Personal Info to Database
  const handleSaveInfo = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editedInfo.fullName,
          email: editedInfo.email,
          phoneNumber: editedInfo.contact,
          address: editedInfo.address,
          recoveryPhone: editedInfo.emergencyPhone,
          position: editedInfo.roleTitle
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update admin profile in database.');
      }

      setPersonalInfo(editedInfo);
      localStorage.setItem('adminPersonalInfo', JSON.stringify(editedInfo));
      window.dispatchEvent(new Event('profileInfoUpdated'));
      showToast("Admin profile details saved to database successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to save profile changes.", true);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Update with backend validation & bcrypt hashing
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!passwordForm.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setPasswordError("New password must include at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError("New password must include at least one number.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsPasswordSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const result = await res.json();
      if (!res.ok) {
        setPasswordError(result.error || "Failed to update password.");
        return;
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast("Password updated and encrypted in database!");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setIsPasswordSaving(false);
    }
  };

  // Toggle Notification Preference
  const handleTogglePref = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('adminNotificationPrefs', JSON.stringify(updated));
      return updated;
    });
    showToast("Notification preference updated.");
  };

  // Toggle 2FA in Database
  const handleToggle2FA = async () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    localStorage.setItem('admin2FA', String(nextVal));

    try {
      await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorEnabled: nextVal })
      });
      showToast(nextVal ? "Two-factor authentication enabled in database." : "Two-factor authentication disabled.");
    } catch {
      showToast(nextVal ? "Two-factor authentication enabled." : "Two-factor authentication disabled.");
    }
  };

  // Password validation checks
  const reqLength = passwordForm.newPassword.length >= 8;
  const reqUpper = /[A-Z]/.test(passwordForm.newPassword);
  const reqNum = /[0-9]/.test(passwordForm.newPassword);
  const reqMatch = Boolean(passwordForm.newPassword && passwordForm.newPassword === passwordForm.confirmPassword);

  // Extract initials for fallback avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'AD';
  };

  // Formatted Joined Date
  const formattedJoinedDate = joinedDate 
    ? new Date(joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Active Staff Member';

  return (
    <div className="module-content" style={{ width: "100%", padding: "15px 20px 30px 20px", margin: 0 }}>
      
      {/* SECTION HEADER (Styled consistent with Pet Monitor) */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '30px', fontWeight: 'bold' }}>
            <i className="fas fa-id-card" style={{ color: '#2E5E3E' }}></i> Administrator Profile & Practice Credentials
          </h1>
          <p style={{ color: '#718096', margin: '4px 0 0 42px', fontSize: '15px' }}>
            Manage your clinic staff identity, operational permissions, contact info, and practice security.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('personal')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', 
              borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', 
              color: '#2d3748', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}
          >
            <i className="fas fa-user-edit" style={{ color: '#2E5E3E' }}></i> Edit Profile
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', 
              borderRadius: '10px', border: 'none', background: '#2E5E3E', 
              color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(46, 94, 62, 0.25)'
            }}
          >
            <i className="fas fa-shield-alt"></i> Security
          </button>
        </div>
      </div>

      {/* HERO BANNER CARD */}
      <div className="profile-hero-card">
        <i className="fas fa-paw profile-hero-bg-logo"></i>
        
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          
          {/* Avatar & Core Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div 
              className="profile-avatar-large" 
              style={{ 
                width: '110px', height: '110px', borderRadius: '55px', 
                border: '4px solid rgba(255,255,255,0.85)', background: 'white',
                position: 'relative', overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
              }}
              title="Click to change profile picture"
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} 
              />
              {profilePic ? (
                <img src={profilePic} alt={personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2.4rem', fontWeight: 'bold', color: '#2E5E3E' }}>
                  {getInitials(personalInfo.fullName)}
                </span>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.55)', color: 'white', textAlign: 'center', padding: '4px 0', fontSize: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                <i className="fas fa-camera"></i> Change
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h2 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
                  {personalInfo.fullName}
                </h2>
                <span className="profile-badge-pill">
                  <span className="pulse-dot"></span> On Duty
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.92rem', color: '#E2E8F0', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-user-shield" style={{ color: '#9AE6B4' }}></i> {personalInfo.roleTitle}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-building" style={{ color: '#9AE6B4' }}></i> {personalInfo.department}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-id-badge" style={{ color: '#9AE6B4' }}></i> {personalInfo.staffId}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="profile-badge-pill" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <i className="fas fa-envelope"></i> {personalInfo.email}
                </span>
                {personalInfo.contact && (
                  <span className="profile-badge-pill" style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <i className="fas fa-phone-alt"></i> {personalInfo.contact}
                  </span>
                )}
                <span className="profile-badge-pill" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <i className="fas fa-map-marker-alt"></i> {personalInfo.address || 'Main Clinic Center'}
                </span>
              </div>
            </div>
          </div>

          {/* Shift & Duty Snapshot Widget */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '14px', 
            padding: '16px 20px', minWidth: '240px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#CBD5E0', fontWeight: 700 }}>
                Current Roster
              </span>
              <span style={{ fontSize: '0.75rem', background: '#38A169', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                Shift Active
              </span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>
              <i className="far fa-clock" style={{ marginRight: '6px', color: '#9AE6B4' }}></i> 8:00 AM – 5:00 PM
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#E2E8F0' }}>
              Station: Front Clinic Desk & Telehealth Operations
            </p>
          </div>

        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="profile-nav-tabs">
        <button 
          className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-chart-pie"></i> Overview & Duty Operations
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <i className="fas fa-user-edit"></i> Staff & Personal Details
          {isDirty && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E53E3E' }}></span>}
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'clinic' ? 'active' : ''}`}
          onClick={() => setActiveTab('clinic')}
        >
          <i className="fas fa-clinic-medical"></i> Clinic & Access Permissions
        </button>
        <button 
          className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-shield-alt"></i> Security & Preferences
        </button>
      </div>

      {/* TAB 1: OVERVIEW & DUTY OPERATIONS */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI METRIC CARDS (Direct from Database) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
            <div className="profile-kpi-card">
              <div className="profile-kpi-icon" style={{ background: '#EBF8FF', color: '#2B6CB0' }}>
                <i className="fas fa-calendar-check"></i>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2d3748', lineHeight: 1.2 }}>
                  {metrics.appointments}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Appointments Coordinated</div>
                <div style={{ fontSize: '0.75rem', color: '#38A169', marginTop: '2px', fontWeight: 600 }}>
                  <i className="fas fa-database"></i> Live practice database
                </div>
              </div>
            </div>

            <div className="profile-kpi-card">
              <div className="profile-kpi-icon" style={{ background: '#F0FFF4', color: '#2E5E3E' }}>
                <i className="fas fa-paw"></i>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2d3748', lineHeight: 1.2 }}>
                  {metrics.patients}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Active Pet Medical Records</div>
                <div style={{ fontSize: '0.75rem', color: '#2E5E3E', marginTop: '2px', fontWeight: 600 }}>
                  <i className="fas fa-check-circle"></i> Registered in clinic
                </div>
              </div>
            </div>

            <div className="profile-kpi-card">
              <div className="profile-kpi-icon" style={{ background: '#FEFCBF', color: '#B7791F' }}>
                <i className="fas fa-video"></i>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2d3748', lineHeight: 1.2 }}>
                  {metrics.telemedicine}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Teleconsultations Hosted</div>
                <div style={{ fontSize: '0.75rem', color: '#D69E2E', marginTop: '2px', fontWeight: 600 }}>
                  <i className="fas fa-headset"></i> Remote video hub
                </div>
              </div>
            </div>

            <div className="profile-kpi-card">
              <div className="profile-kpi-icon" style={{ background: '#EDF2F7', color: '#4A5568' }}>
                <i className="fas fa-boxes"></i>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2d3748', lineHeight: 1.2 }}>
                  {metrics.inventory}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>Supplies & Pharmacy Monitored</div>
                <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '2px', fontWeight: 600 }}>
                  <i className="fas fa-box-open"></i> Full stock tracking
                </div>
              </div>
            </div>
          </div>

          {/* TWO COLUMN CONTENT */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Left Column: Scope of Responsibilities & Practice Summary */}
            <div>
              <div className="profile-section-card">
                <h3><i className="fas fa-clipboard-list" style={{ color: '#2E5E3E' }}></i> Administrative Responsibilities</h3>
                <p style={{ color: '#4a5568', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '18px' }}>
                  {personalInfo.bio}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#E6FFED', color: '#2E5E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                      <i className="fas fa-stethoscope"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.92rem' }}>Patient Triage & AI Diagnostics</div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>Monitoring automated pet diagnostics and veterinarian intervention triggers.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EBF8FF', color: '#3182CE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                      <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.92rem' }}>Appointment Rosters & Booking Timeslots</div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>Managing veterinarian schedule availability, reschedules, and client check-ins.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                      <i className="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.92rem' }}>Billing, Invoicing & Pharmacy Dispensing</div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>Processing consultations, medicine charges, and invoice issuance.</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #edf2f7' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: '10px' }}>
                    Quick Access Shortcuts:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => router.push('/admin/appointment')}
                      style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#2d3748', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fas fa-calendar-alt" style={{ color: '#2E5E3E' }}></i> Appointments
                    </button>
                    <button 
                      onClick={() => router.push('/admin/records')}
                      style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#2d3748', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fas fa-folder-open" style={{ color: '#2E5E3E' }}></i> Pet Records
                    </button>
                    <button 
                      onClick={() => router.push('/admin/telemedicine')}
                      style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#2d3748', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fas fa-video" style={{ color: '#2E5E3E' }}></i> Telemedicine
                    </button>
                    <button 
                      onClick={() => router.push('/admin/inventory')}
                      style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#2d3748', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fas fa-boxes" style={{ color: '#2E5E3E' }}></i> Inventory
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Live Activity Feed from Database */}
            <div>
              <div className="profile-section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 style={{ margin: 0 }}><i className="fas fa-history" style={{ color: '#2E5E3E' }}></i> Recent Practice Activity</h3>
                  <span style={{ fontSize: '0.8rem', color: '#2E5E3E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="pulse-dot" style={{ background: '#38A169', width: '7px', height: '7px' }}></span> Live Audit Feed
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act) => (
                      <div key={act.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', paddingBottom: '14px', borderBottom: '1px solid #edf2f7' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: act.badgeColor, color: act.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className={`fas ${act.icon}`}></i>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>
                            {act.title}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#718096', marginTop: '2px' }}>
                            {act.description}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '4px' }}>
                            {new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {act.category}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#a0aec0', fontSize: '0.9rem' }}>
                      <i className="fas fa-inbox" style={{ fontSize: '1.8rem', marginBottom: '8px', display: 'block' }}></i>
                      No recent activity recorded yet in the database.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: STAFF & PERSONAL DETAILS */}
      {activeTab === 'personal' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* Main Edit Form */}
          <div className="profile-section-card">
            <h3><i className="fas fa-user-edit" style={{ color: '#2E5E3E' }}></i> Practice Staff Information</h3>
            <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '20px' }}>
              Keep your contact details and clinic credentials up to date. Changes are stored directly in the database.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="profile-field-group">
                <label><i className="fas fa-user"></i> Full Legal Name</label>
                <input 
                  type="text" 
                  className="profile-input"
                  placeholder="e.g. Juan Dela Cruz"
                  value={editedInfo.fullName}
                  onChange={(e) => setEditedInfo({ ...editedInfo, fullName: e.target.value })}/>
              </div>

              <div className="profile-field-group">
                <label><i className="fas fa-envelope"></i> Professional Email</label>
                <input 
                  type="email" 
                  className="profile-input"
                  placeholder="example@gmail.com"
                  value={editedInfo.email}
                  onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}/>
              </div>

              <div className="profile-field-group">
                <label><i className="fas fa-phone"></i> Contact Phone Number</label>
                <input 
                  type="tel" 
                  className="profile-input"
                  placeholder="+63 9XX XXX XXXX"
                  value={editedInfo.contact}
                  onChange={(e) => setEditedInfo({ ...editedInfo, contact: e.target.value })}
                />
              </div>

              <div className="profile-field-group">
                <label><i className="fas fa-map-marker-alt"></i> Clinic / Practice Office Address</label>
                <input 
                  type="text" 
                  className="profile-input"
                  placeholder="Clinic Address"
                  value={editedInfo.address}
                  onChange={(e) => setEditedInfo({ ...editedInfo, address: e.target.value })}
                />
              </div>

              <div className="profile-field-group">
                <label><i className="fas fa-id-badge"></i> Staff ID Code (Registered)</label>
                <input 
                  type="text" 
                  className="profile-input" 
                  value={editedInfo.staffId} 
                  disabled
                  style={{ background: '#edf2f7', cursor: 'not-allowed', color: '#718096' }}
                />
              </div>

              <div className="profile-field-group">
                <label><i className="fas fa-briefcase"></i> Position Title</label>
                <input 
                  type="text" 
                  className="profile-input"
                  placeholder="e.g. Veterinarian"
                  value={editedInfo.roleTitle}
                  onChange={(e) => setEditedInfo({ ...editedInfo, roleTitle: e.target.value })}/>
              </div>
            </div>

            <div className="profile-field-group">
              <label><i className="fas fa-align-left"></i> Professional Bio & Practice Scope</label>
              <textarea 
                className="profile-input"
                rows={3}
                style={{ resize: 'vertical' }}
                placeholder="e.g. Licensed veterinarian with 5+ years of experience in small animal care..."
                value={editedInfo.bio}
                onChange={(e) => setEditedInfo({ ...editedInfo, bio: e.target.value })}
              />
            </div>

            <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '20px', marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-phone-volume" style={{ color: '#E53E3E' }}></i> Emergency Staff Contact
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="profile-field-group" style={{ margin: 0 }}>
                  <label>Contact Name</label>
                  <input 
                    type="text" 
                    className="profile-input"
                    placeholder="e.g. Maria Santos"
                    value={editedInfo.emergencyName}
                    onChange={(e) => setEditedInfo({ ...editedInfo, emergencyName: e.target.value })}
                  />
                </div>
                <div className="profile-field-group" style={{ margin: 0 }}>
                  <label>Relationship</label>
                  <input 
                    type="text" 
                    className="profile-input"
                    placeholder="e.g. Spouse"
                    value={editedInfo.emergencyRelation}
                    onChange={(e) => setEditedInfo({ ...editedInfo, emergencyRelation: e.target.value })}
                  />
                </div>
                <div className="profile-field-group" style={{ margin: 0 }}>
                  <label>Emergency Phone</label>
                  <input 
                    type="tel" 
                    className="profile-input"
                    placeholder="+63 9XX XXX XXXX"
                    value={editedInfo.emergencyPhone}
                    onChange={(e) => setEditedInfo({ ...editedInfo, emergencyPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid #edf2f7', paddingTop: '18px' }}>
              {isDirty && (
                <span style={{ alignSelf: 'center', marginRight: 'auto', color: '#D69E2E', fontSize: '0.85rem', fontWeight: 600 }}>
                  <i className="fas fa-exclamation-triangle"></i> You have unsaved profile changes
                </span>
              )}
              <button 
                type="button"
                onClick={() => setEditedInfo(personalInfo)}
                disabled={!isDirty || isSaving}
                style={{ 
                  padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', 
                  background: 'white', color: isDirty ? '#4a5568' : '#a0aec0', fontWeight: 600, 
                  cursor: isDirty && !isSaving ? 'pointer' : 'not-allowed', fontSize: '0.95rem'
                }}
              >
                Discard
              </button>
              <button 
                type="button"
                onClick={handleSaveInfo}
                disabled={isSaving}
                style={{ 
                  padding: '10px 24px', borderRadius: '10px', border: 'none', 
                  background: isSaving ? '#68D391' : '#2E5E3E', color: 'white', fontWeight: 600, 
                  cursor: isSaving ? 'wait' : 'pointer', fontSize: '0.95rem', display: 'flex', 
                  alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(46, 94, 62, 0.25)' 
                }}
              >
                <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                {isSaving ? 'Saving to Database...' : 'Save Profile Details'}
              </button>
            </div>
          </div>

          {/* Quick Summary Card & Verification Status */}
          <div>
            <div className="profile-section-card">
              <h3><i className="fas fa-user-check" style={{ color: '#2E5E3E' }}></i> Account Verification</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F0FFF4', borderRadius: '10px', border: '1px solid #C6F6D5' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#22543D', fontSize: '0.9rem' }}>Staff Role Verified</div>
                    <div style={{ fontSize: '0.78rem', color: '#2E5E3E' }}>Authorized Clinic Administrator</div>
                  </div>
                  <i className="fas fa-check-circle" style={{ color: '#38A169', fontSize: '1.2rem' }}></i>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#2d3748', fontSize: '0.9rem' }}>Clinic Affiliation</div>
                    <div style={{ fontSize: '0.78rem', color: '#718096' }}>FurEverCare Animal Clinic Main</div>
                  </div>
                  <i className="fas fa-clinic-medical" style={{ color: '#718096', fontSize: '1.2rem' }}></i>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#2d3748', fontSize: '0.9rem' }}>Joined Date</div>
                    <div style={{ fontSize: '0.78rem', color: '#718096' }}>
                      {formattedJoinedDate}
                    </div>
                  </div>
                  <i className="far fa-calendar-check" style={{ color: '#718096', fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </div>

            <div className="profile-section-card" style={{ background: '#FAF5FF', border: '1px solid #E9D8FD' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#6B46C1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-lightbulb"></i> Practice Tip
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#553C9A', lineHeight: 1.5 }}>
                Your registered email is used for emergency pet monitoring triage alerts and critical inventory stock warnings. Ensure contact details are accurate.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CLINIC & ACCESS PERMISSIONS */}
      {activeTab === 'clinic' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Clinic Information Card */}
          <div className="profile-section-card">
            <h3><i className="fas fa-clinic-medical" style={{ color: '#2E5E3E' }}></i> Practice Clinic Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2d3748' }}>FurEverCare Veterinary Clinic</div>
                  <span style={{ fontSize: '0.75rem', background: '#C6F6D5', color: '#22543D', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>Licensed Facility</span>
                </div>
                <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  <i className="fas fa-map-pin" style={{ color: '#E53E3E', marginRight: '6px' }}></i> 
                  123 Paws Avenue, Pet City, PC 12345
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#718096', textTransform: 'uppercase', fontWeight: 700 }}>Registration License</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2d3748', marginTop: '2px' }}>VET-LIC-2024-9981</div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#718096', textTransform: 'uppercase', fontWeight: 700 }}>Direct Hotline</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2d3748', marginTop: '2px' }}>+1 (555) 123-4567</div>
                </div>
              </div>

              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d3748', marginBottom: '6px' }}>
                  <i className="far fa-clock" style={{ color: '#2E5E3E', marginRight: '6px' }}></i> Clinic Operating Hours
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#4a5568', padding: '4px 0' }}>
                  <span>Monday – Friday:</span>
                  <span style={{ fontWeight: 600 }}>8:00 AM – 6:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#4a5568', padding: '4px 0' }}>
                  <span>Saturday:</span>
                  <span style={{ fontWeight: 600 }}>9:00 AM – 2:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#E53E3E', padding: '4px 0' }}>
                  <span>Sunday:</span>
                  <span style={{ fontWeight: 600 }}>Emergency Triage Only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Privileges & Module Access */}
          <div className="profile-section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}><i className="fas fa-key" style={{ color: '#2E5E3E' }}></i> Role Privileges & Access</h3>
              <span style={{ fontSize: '0.75rem', background: '#EBF8FF', color: '#2B6CB0', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
                Role: Administrator
              </span>
            </div>
            
            <p style={{ color: '#718096', fontSize: '0.88rem', marginBottom: '16px' }}>
              Your account possesses full operational administration rights across clinic modules.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-calendar-alt" style={{ color: '#2E5E3E' }}></i>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Appointments & Booking Roster</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#C6F6D5', color: '#22543D', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Full Control</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-notes-medical" style={{ color: '#2E5E3E' }}></i>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Pet Records & Health History</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#C6F6D5', color: '#22543D', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Verify & Edit</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-video" style={{ color: '#2E5E3E' }}></i>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Telemedicine Consultation Hub</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#C6F6D5', color: '#22543D', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Host & Moderate</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-boxes" style={{ color: '#2E5E3E' }}></i>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Pharmacy & Inventory Auditing</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#C6F6D5', color: '#22543D', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Stock Manager</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-file-invoice-dollar" style={{ color: '#2E5E3E' }}></i>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Billing & Invoicing Suite</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#C6F6D5', color: '#22543D', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Issue Invoices</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-sms" style={{ color: '#2E5E3E' }}></i>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Client SMS Notification System</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#C6F6D5', color: '#22543D', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Broadcast Authorized</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-cog" style={{ color: '#718096' }}></i>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>Master System Configurations</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#EDF2F7', color: '#718096', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Superadmin Only</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: SECURITY & PREFERENCES */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Password Change Card */}
          <div className="profile-section-card">
            <h3><i className="fas fa-lock" style={{ color: '#2E5E3E' }}></i> Change Account Password</h3>
            <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '20px' }}>
              Ensure your administrator account is guarded with a resilient password. Encrypted and saved to database.
            </p>

            <form onSubmit={handlePasswordSubmit}>
              {passwordError && (
                <div style={{ background: '#FED7D7', color: '#C53030', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: 600 }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i> {passwordError}
                </div>
              )}

              <div className="profile-field-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  className="profile-input"
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="profile-field-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  className="profile-input"
                  placeholder="Enter new strong password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>

              <div className="profile-field-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  className="profile-input"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              {/* Password Checklist */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: '8px' }}>
                  Password Strength Requirements:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                  <div style={{ color: reqLength ? '#38A169' : '#A0AEC0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={`fas ${reqLength ? 'fa-check-circle' : 'fa-circle'}`}></i> At least 8 characters
                  </div>
                  <div style={{ color: reqUpper ? '#38A169' : '#A0AEC0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={`fas ${reqUpper ? 'fa-check-circle' : 'fa-circle'}`}></i> At least one uppercase letter (A-Z)
                  </div>
                  <div style={{ color: reqNum ? '#38A169' : '#A0AEC0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={`fas ${reqNum ? 'fa-check-circle' : 'fa-circle'}`}></i> At least one number (0-9)
                  </div>
                  <div style={{ color: reqMatch ? '#38A169' : '#A0AEC0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className={`fas ${reqMatch ? 'fa-check-circle' : 'fa-circle'}`}></i> Passwords match
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isPasswordSaving}
                style={{ 
                  width: '100%', padding: '12px', background: isPasswordSaving ? '#68D391' : '#2E5E3E', color: 'white', 
                  border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', 
                  cursor: isPasswordSaving ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' 
                }}
              >
                <i className={`fas ${isPasswordSaving ? 'fa-spinner fa-spin' : 'fa-key'}`}></i>
                {isPasswordSaving ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Preferences, 2FA & Session Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 2FA Card (Persisted to Database) */}
            <div className="profile-section-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}><i className="fas fa-shield-virus" style={{ color: '#2E5E3E' }}></i> Two-Factor Authentication</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>Require an SMS verification code on login.</p>
                </div>
                <label className="profile-toggle">
                  <input type="checkbox" checked={twoFactorEnabled} onChange={handleToggle2FA} />
                  <span className="profile-toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="profile-section-card" style={{ marginBottom: 0 }}>
              <h3><i className="fas fa-bell" style={{ color: '#2E5E3E' }}></i> Operational Notification Preferences</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Emergency Pet Triage Alerts</div>
                    <div style={{ fontSize: '0.78rem', color: '#718096' }}>Instant notifications when pet diagnostics flag critical status.</div>
                  </div>
                  <label className="profile-toggle">
                    <input type="checkbox" checked={notificationPrefs.emergencyAlerts} onChange={() => handleTogglePref('emergencyAlerts')} />
                    <span className="profile-toggle-slider"></span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Telemedicine Booking Notices</div>
                    <div style={{ fontSize: '0.78rem', color: '#718096' }}>Alerts when a client books or reschedules remote consultations.</div>
                  </div>
                  <label className="profile-toggle">
                    <input type="checkbox" checked={notificationPrefs.telemedBookings} onChange={() => handleTogglePref('telemedBookings')} />
                    <span className="profile-toggle-slider"></span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748' }}>Critical Low Stock Warnings</div>
                    <div style={{ fontSize: '0.78rem', color: '#718096' }}>Warnings when vital medicines fall below minimum reorder thresholds.</div>
                  </div>
                  <label className="profile-toggle">
                    <input type="checkbox" checked={notificationPrefs.inventoryWarnings} onChange={() => handleTogglePref('inventoryWarnings')} />
                    <span className="profile-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Active Session Log */}
            <div className="profile-section-card" style={{ marginBottom: 0 }}>
              <h3><i className="fas fa-laptop" style={{ color: '#2E5E3E' }}></i> Active Staff Login Sessions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <i className="fas fa-desktop" style={{ color: '#2E5E3E', fontSize: '1.2rem' }}></i>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2d3748' }}>Windows 11 Workstation • Chrome</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>IP: 192.168.1.104 • Clinic Admin Desk</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: '#C6F6D5', color: '#22543D', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>Current Session</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <i className="fas fa-mobile-alt" style={{ color: '#718096', fontSize: '1.2rem' }}></i>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2d3748' }}>iOS Staff Companion App</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>Last active today at 4:15 PM</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: 600 }}>Active</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Floating Toast notification container */}
      <div id="toast"></div>

    </div>
  );
}
