"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useNotifications } from '../hooks/useNotifications';
import { useAppointments } from '../hooks/useAppointments';
import { useLanguage } from '../context/LanguageContext';

export default function TopBar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [systemPopups, setSystemPopups] = useState<any[]>([]);

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const { language, changeLanguage, t } = useLanguage();

  useEffect(() => {
    const handleNewPopup = (e: any) => {
      const popup = e.detail;
      setSystemPopups(prev => {
        if (prev.some(p => p.id === popup.id)) return prev;
        return [...prev, popup];
      });

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setSystemPopups(prev => prev.filter(p => p.id !== popup.id));
      }, 8000);
    };

    window.addEventListener('newSystemPopup', handleNewPopup);
    return () => window.removeEventListener('newSystemPopup', handleNewPopup);
  }, []);

  useEffect(() => {
    // Load initial profile pic
    const loadProfilePic = () => {
      const key = pathname.includes('superadmin') ? 'superadminProfilePic' : 'adminProfilePic';
      const pic = localStorage.getItem(key);
      setProfilePic(pic || null);
    };
    loadProfilePic();

    // Listen for updates from other components
    window.addEventListener('profilePicUpdated', loadProfilePic);
    return () => window.removeEventListener('profilePicUpdated', loadProfilePic);
  }, [pathname]);


  // Determine Title based on current path
  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return { title: t('Dashboard'), subtitle: language === 'tl' ? 'Pangkalahatan' : 'Overview' };
    if (pathname.includes('/appointment')) return { title: t('Appointment'), subtitle: language === 'tl' ? 'Pamahalaan ang Iskedyul' : 'Manage Schedule' };
    if (pathname.includes('/products')) return { title: t('Products'), subtitle: language === 'tl' ? 'Pamahalaan ang Pagbebenta' : 'Manage Retail Sales' };
    if (pathname.includes('/sms')) return { title: t('SMS Center'), subtitle: language === 'tl' ? 'Komunikasyon sa Kliyente' : 'Client Communications' };
    if (pathname.includes('/reports')) return { title: t('Clinic Reports'), subtitle: language === 'tl' ? 'Tingnan at suriin ang datos at aktibidad ng klinika' : 'View and analyze clinic data and activity' };
    if (pathname.includes('/inventory')) return { title: t('Inventory'), subtitle: language === 'tl' ? 'Pamamahala ng Stock' : 'Stock Management' };
    if (pathname.includes('/records')) return { title: t('Pet Records'), subtitle: language === 'tl' ? 'Detalyadong Impormasyon' : 'Detailed Information' };
    if (pathname.includes('/users')) return { title: t('Users'), subtitle: language === 'tl' ? 'Pamamahala ng User' : 'User Management' };
    if (pathname.includes('/archive')) return { title: t('Archive'), subtitle: language === 'tl' ? 'Mga Archive ng Sistema' : 'System Archives' };
    if (pathname.includes('/telemedicine')) return { title: t('Telemedicine'), subtitle: language === 'tl' ? 'Mga Online na Konsultasyon' : 'Virtual Consultations' };
    if (pathname.includes('/tutorials')) return { title: t('Tutorials'), subtitle: language === 'tl' ? 'Sentro ng Kaalaman' : 'Learning Center' };
    if (pathname.includes('/announcement')) return { title: t('Announcements'), subtitle: language === 'tl' ? 'Mga Balita sa Sistema' : 'System Updates' };
    if (pathname.includes('/billing')) return { title: t('Billing'), subtitle: language === 'tl' ? 'Mga Invoice at Bayad' : 'Invoices & Payments' };
    if (pathname.includes('/monitor')) return { title: t('Pet Monitor'), subtitle: language === 'tl' ? 'Mga AI na Pagsusuri' : 'AI Diagnostics' };
    if (pathname.includes('/analytics')) return { title: t('Analytics'), subtitle: language === 'tl' ? 'Pagsusuri ng Datos at Karamdaman' : 'Sickness & Dietary Analytics' };
    if (pathname.includes('/feedback')) {
      return { title: t('Feedback'), subtitle: language === 'tl' ? 'Sistema' : 'System' };
    }

    const isSuper = pathname.includes('superadmin');
    return { title: isSuper ? 'Superadmin' : 'Admin', subtitle: language === 'tl' ? 'Sistema' : 'System' };
  };
  const { title, subtitle } = getPageTitle();
  const { notifications, markAllAsRead, markAsRead, unreadCount, addNotification } = useNotifications();
  const { appointments } = useAppointments();

  useEffect(() => {
    const checkUpcomingAppointments = () => {
      if (!pathname.includes('superadmin')) return;

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      appointments.forEach(app => {
        if (app.date !== todayStr || app.status.toLowerCase() !== 'confirmed') return;

        const timeParts = app.time.match(/(\d+):(\d+)\s+(AM|PM)/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1] as string, 10);
          const mins = parseInt(timeParts[2] as string, 10);
          const modifier = (timeParts[3] || '').toUpperCase();
          if (hours === 12) hours = 0;
          if (modifier === 'PM') hours += 12;

          const appTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
          const diffMs = appTime.getTime() - now.getTime();
          const diffMins = Math.floor(diffMs / 60000);

          // Notify if appointment is between 0 and 15 mins away
          if (diffMins >= 0 && diffMins <= 15) {
            const notifId = `upcoming-${app.id}`;
            if (!localStorage.getItem(notifId)) {
              addNotification(
                "Upcoming Appointment Reminder",
                `Appointment with ${app.owner} for ${app.pet} is starting in ${diffMins} minute(s).`,
                "fas fa-clock"
              );
              localStorage.setItem(notifId, 'true');
            }
          }
        }
      });
    };

    const interval = setInterval(checkUpcomingAppointments, 60000); // Check every minute
    checkUpcomingAppointments();
    return () => clearInterval(interval);
  }, [appointments, pathname]);

  // Initialize dark mode from localStorage on mount
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.body.classList.add('dark-mode');
      setDarkMode(true);
    }
  }, []);

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowSettings(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    setShowSettings(false);
    try {
      localStorage.removeItem('user_role');
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
    } catch (_) {}
    window.location.replace('/login');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notifications') && !target.closest('.notification-panel')) {
        setShowNotifications(false);
      }
      if (!target.closest('.settings-container')) {
        setShowSettings(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      addNotification('Error', 'New passwords do not match.', 'fas fa-exclamation-circle');
      return;
    }
    if (passwordData.new.length < 8) {
      addNotification('Error', 'Password must be at least 8 characters long.', 'fas fa-exclamation-circle');
      return;
    }

    setIsChangingPassword(true);
    try {
      const role = pathname.includes('superadmin') ? 'superadmin' : 'admin';
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        addNotification('Security Update', 'Password changed successfully. Use your new password next time you log in.', 'fas fa-check-circle');
        setShowSecurityModal(false);
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        addNotification('Error', data.message || 'Failed to change password.', 'fas fa-exclamation-circle');
      }
    } catch (err) {
      addNotification('Error', 'An error occurred. Please try again.', 'fas fa-exclamation-circle');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        /* ── Notification panel items ── */
        .notification-item-interactive {
          transition: background 0.18s ease, box-shadow 0.18s ease;
          cursor: pointer;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 12px;
        }
        .notification-item-interactive.unread {
          background: #EAF4E2 !important;
          border-color: #c3e6cb !important;
        }
        .notification-item-interactive:hover {
          background: #f4f6f8 !important;
          border-color: #e5e7eb !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .notification-item-interactive.unread:hover {
          background: #d9eecc !important;
          border-color: #a8d5a2 !important;
          box-shadow: 0 2px 10px rgba(46,125,50,0.12);
        }
        /* ── Dark mode ── */
        .dark-mode .notification-item-interactive {
          background: transparent !important;
          border-color: transparent !important;
        }
        .dark-mode .notification-item-interactive.unread {
          background: rgba(46,125,50,0.18) !important;
          border-color: rgba(46,125,50,0.4) !important;
        }
        .dark-mode .notification-item-interactive:hover {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .dark-mode .notification-item-interactive.unread:hover {
          background: rgba(46,125,50,0.28) !important;
          border-color: rgba(46,125,50,0.55) !important;
        }
        /* ── Modal header gradient ── */
        .modal-header-gradient {
          background: linear-gradient(135deg, #2E7D32, #1B5E20);
          border-radius: 20px 20px 0 0;
          padding: 20px 30px !important;
          margin: -30px -30px 20px -30px !important;
        }
        .modal-header-gradient h3 { color: white !important; }
        .modal-header-gradient button { color: rgba(255,255,255,0.8) !important; }
        .modal-header-gradient button:hover { color: white !important; }
      `}} />
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center' }}>

          <div className="page-title">
            <h1>{title}</h1>
            <span>{subtitle}</span>
          </div>
        </div>

        <div className="user-info">
          {/* Search Bar Removed */}

          {/* Notifications */}
          <div className="notifications-container" style={{ position: 'relative' }}>
            <div className="notifications" onClick={(e) => {
              e.stopPropagation();
              const nextShow = !showNotifications;
              setShowNotifications(nextShow);
              setShowSettings(false);
              if (nextShow) {
                markAllAsRead();
              }
            }}>
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && <span className="badge" style={{ backgroundColor: '#2E7D32', color: '#ffffff', fontWeight: 'bold' }}>{unreadCount}</span>}
            </div>

            {/* Notification Panel */}
            <div className={`notification-panel ${showNotifications ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
              <div className="notification-header" style={{ borderBottom: '2px solid #EAF4E2', paddingBottom: '12px', marginBottom: '4px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-bell" style={{ color: '#2E7D32', fontSize: '1rem' }}></i>
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{ fontSize: '0.72rem', background: '#2E7D32', color: 'white', borderRadius: '999px', padding: '1px 8px', fontWeight: 700, letterSpacing: '0.02em' }}>
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="view-all" onClick={(e) => { e.stopPropagation(); setShowAllNotificationsModal(true); setShowNotifications(false); }} style={{ cursor: 'pointer', color: '#2E7D32', fontSize: '0.85rem', fontWeight: 600 }}>View all</span>
                </div>
              </div>
              <div className="notification-list" style={{ maxHeight: '380px', overflowY: 'auto', padding: '4px 0' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-bell-slash" style={{ fontSize: '2rem', color: '#d1d5db' }}></i>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => { if (!notif.read) markAsRead(notif.id); setSelectedNotification(notif); setShowNotifications(false); }}
                      className={`notification-item notification-item-interactive ${!notif.read ? 'unread' : ''}`}
                      style={{ padding: '12px 14px', marginBottom: '6px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                    >
                      {/* Icon circle */}
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                        background: !notif.read ? '#2E7D32' : '#f3f4f6',
                        color: !notif.read ? 'white' : '#6b7280',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem'
                      }}>
                        <i className={notif.icon || 'fas fa-bell'}></i>
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1f2937', marginBottom: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <span>{notif.title}</span>
                          {!notif.read && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E7D32', flexShrink: 0, marginTop: '4px' }}></span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: '1.45', marginBottom: '4px', wordBreak: 'break-word' }}>{notif.description}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <i className="far fa-clock"></i> {notif.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Settings Dropdown */}
          <div className="settings-container">
            <div className="settings-icon" onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); setShowNotifications(false); }}>
              <i className="fas fa-cog"></i>
            </div>

            <div className={`settings-dropdown ${showSettings ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
              <div className="settings-header">
                <span>{t('settings')}</span>
              </div>
              <div className="settings-item">
                <i className="fas fa-sliders-h"></i>
                <span>{t('generalSettings')}</span>
              </div>
              <div className="settings-item" onClick={() => { setShowSettings(false); setShowSecurityModal(true); }}>
                <i className="fas fa-shield-alt"></i>
                <span>{t('accountSecurity')}</span>
              </div>
              <div className="settings-item" onClick={() => { setShowSettings(false); setShowLanguageModal(true); }}>
                <i className="fas fa-globe"></i>
                <span>{t('language')}</span>
              </div>
              <div className="settings-item" onClick={() => { setShowSettings(false); router.push(pathname.includes('superadmin') ? '/superadmin/archive' : '/admin/archive'); }}>
                <i className="fas fa-archive"></i>
                <span>{t('archive')}</span>
              </div>
              <div className="settings-item">
                <div className="darkmode-toggle">
                  <span><i className="fas fa-moon" style={{ marginRight: '12px' }}></i>{t('darkMode')}</span>
                  <label className="switch">
                    <input type="checkbox" checked={darkMode} onChange={handleToggleDarkMode} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              <div className="settings-item">
                <i className="fas fa-gavel"></i>
                <span>{t('communityRules')}</span>
              </div>
              <div 
                className="settings-item logout" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout(e);
                }}
                style={{ cursor: 'pointer' }}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>{t('logout') || 'Log Out'}</span>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="user-profile" onClick={() => router.push(pathname.includes('superadmin') ? '/superadmin/profile' : '/admin/profile')} style={{ cursor: 'pointer' }}>
            <div className="avatar" style={{ overflow: 'hidden' }}>
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{pathname.includes('superadmin') ? 'S' : 'A'}</span>
              )}
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>{pathname.includes('superadmin') ? 'Superadmin' : 'Admin'}</div>
              <div style={{ fontSize: '0.65rem', color: '#ffffff', opacity: 0.9 }}>{pathname.includes('superadmin') ? 'fureverpawcaresuperadmin@gmail.com' : 'fureverpawcareadmin@gmail.com'}</div>
            </div>
          </div>
        </div>

        {/* Language Selection Modal */}
        {showLanguageModal && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setShowLanguageModal(false); }}>
            <div className="modal-content" style={{ background: darkMode ? '#2d3748' : 'white', color: darkMode ? '#e2e8f0' : '#2d3748', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${darkMode ? '#4a5568' : '#edf2f7'}`, paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: darkMode ? '#e2e8f0' : '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-globe" style={{ color: "#2E5E3E" }}></i> {t('languageSettings')}</h3>
                <button className="modal-close" onClick={() => setShowLanguageModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#a0aec0', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                <p style={{ color: darkMode ? '#a0aec0' : '#718096', marginBottom: '20px', fontSize: '0.95rem' }}>{t('selectLanguage')}</p>

                <div className="language-options" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  <div
                    className={`language-option-card ${language === 'en' ? 'selected' : ''}`}
                    onClick={() => changeLanguage('en')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${language === 'en' ? '#2E5E3E' : (darkMode ? '#4a5568' : '#e2e8f0')}`,
                      background: language === 'en' ? (darkMode ? 'rgba(46, 94, 62, 0.2)' : '#f0fdf4') : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '1.8rem' }}>🇺🇸</span>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 600, color: darkMode ? '#f7fafc' : '#2d3748' }}>English</h4>
                        <span style={{ fontSize: '0.8rem', color: darkMode ? '#a0aec0' : '#718096' }}>US English</span>
                      </div>
                    </div>
                    {language === 'en' && <i className="fas fa-check-circle" style={{ color: '#2E5E3E', fontSize: '1.3rem' }}></i>}
                  </div>

                  <div
                    className={`language-option-card ${language === 'tl' ? 'selected' : ''}`}
                    onClick={() => changeLanguage('tl')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      border: `2px solid ${language === 'tl' ? '#2E5E3E' : (darkMode ? '#4a5568' : '#e2e8f0')}`,
                      background: language === 'tl' ? (darkMode ? 'rgba(46, 94, 62, 0.2)' : '#f0fdf4') : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '1.8rem' }}>🇵🇭</span>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 600, color: darkMode ? '#f7fafc' : '#2d3748' }}>Wikang Filipino</h4>
                        <span style={{ fontSize: '0.8rem', color: darkMode ? '#a0aec0' : '#718096' }}>Tagalog</span>
                      </div>
                    </div>
                    {language === 'tl' && <i className="fas fa-check-circle" style={{ color: '#2E5E3E', fontSize: '1.3rem' }}></i>}
                  </div>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', background: darkMode ? 'rgba(255,255,255,0.05)' : '#f7fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-info-circle" style={{ color: '#2E5E3E' }}></i>
                  <span style={{ fontSize: '0.9rem', color: darkMode ? '#a0aec0' : '#4a5568' }}>
                    {t('currentLanguage')}: <strong>{language === 'en' ? 'English' : 'Wikang Filipino'}</strong>
                  </span>
                </div>
              </div>
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', borderTop: `1px solid ${darkMode ? '#4a5568' : '#edf2f7'}`, paddingTop: '15px' }}>
                <button className="btn btn-secondary" onClick={() => setShowLanguageModal(false)} style={{ padding: '10px 20px', background: darkMode ? '#4a5568' : 'white', border: `1px solid ${darkMode ? '#4a5568' : '#cbd5e0'}`, color: darkMode ? 'white' : '#4a5568', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{t('close')}</button>
              </div>
            </div>
          </div>
        )}

        {/* Account Security Modal */}
        {showSecurityModal && (

          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setShowSecurityModal(false); }}>
            <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px' }}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-shield-alt" style={{ color: "#2E5E3E" }}></i> Account Security</h3>
                <button className="modal-close" onClick={() => setShowSecurityModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#a0aec0', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}><i className="fas fa-lock"></i> Current password</label>
                    <input type="password" required className="form-control" placeholder="Enter current password" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={passwordData.current} onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}><i className="fas fa-key"></i> New password</label>
                    <input type="password" required className="form-control" placeholder="Enter new password" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={passwordData.new} onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}><i className="fas fa-check-circle"></i> Confirm new password</label>
                    <input type="password" required className="form-control" placeholder="Confirm new password" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} />
                  </div>

                  <div className="password-requirements" style={{ background: '#f7fafc', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#4a5568', fontWeight: 600 }}><i className="fas fa-shield-alt" style={{ marginRight: "8px" }}></i>Password requirements:</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: passwordData.new.length >= 8 ? '#38a169' : '#a0aec0' }}>
                      <i className={passwordData.new.length >= 8 ? "fas fa-check-circle" : "fas fa-circle"} style={{ fontSize: passwordData.new.length >= 8 ? '1rem' : '0.5rem' }}></i>
                      <span>At least 8 characters</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: /[A-Z]/.test(passwordData.new) ? '#38a169' : '#a0aec0', marginTop: '5px' }}>
                      <i className={/[A-Z]/.test(passwordData.new) ? "fas fa-check-circle" : "fas fa-circle"} style={{ fontSize: /[A-Z]/.test(passwordData.new) ? '1rem' : '0.5rem' }}></i>
                      <span>One uppercase letter</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: /[0-9]/.test(passwordData.new) ? '#38a169' : '#a0aec0', marginTop: '5px' }}>
                      <i className={/[0-9]/.test(passwordData.new) ? "fas fa-check-circle" : "fas fa-circle"} style={{ fontSize: /[0-9]/.test(passwordData.new) ? '1rem' : '0.5rem' }}></i>
                      <span>One number</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: (passwordData.new && passwordData.new === passwordData.confirm) ? '#38a169' : '#a0aec0', marginTop: '5px' }}>
                      <i className={(passwordData.new && passwordData.new === passwordData.confirm) ? "fas fa-check-circle" : "fas fa-circle"} style={{ fontSize: (passwordData.new && passwordData.new === passwordData.confirm) ? '1rem' : '0.5rem' }}></i>
                      <span>Passwords match</span>
                    </div>
                  </div>

                  <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setShowSecurityModal(false)} disabled={isChangingPassword} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#4a5568', opacity: isChangingPassword ? 0.5 : 1 }}>Cancel</button>
                    <button type="submit" disabled={isChangingPassword} style={{ padding: '10px 20px', background: isChangingPassword ? '#6b8f7b' : '#2E5E3E', border: 'none', borderRadius: '8px', cursor: isChangingPassword ? 'wait' : 'pointer', fontWeight: 600, color: 'white' }}>{isChangingPassword ? 'Updating...' : 'Update Password'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div 
            className="modal show" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 999999, 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(3px)'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutModal(false); }}
          >
            <div 
              className="modal-content" 
              style={{ 
                background: darkMode ? '#2d3748' : 'white', 
                color: darkMode ? '#e2e8f0' : '#2d3748',
                padding: '28px', 
                borderRadius: '16px', 
                width: '420px', 
                maxWidth: '90%', 
                textAlign: 'center', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                zIndex: 1000000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header" style={{ borderBottom: 'none', justifyContent: 'center', paddingBottom: 0 }}>
                <h3 style={{ color: '#E53E3E', fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <i className="fas fa-sign-out-alt"></i>
                  {t('confirmLogout') || 'Confirm Logout'}
                </h3>
              </div>
              <div className="modal-body" style={{ padding: '20px 0' }}>
                <p style={{ color: darkMode ? '#cbd5e0' : '#4a5568', fontSize: '1.05rem', margin: 0 }}>
                  {t('logoutConfirmText') || 'Are you sure you want to log out of your account?'}
                </p>
              </div>
              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: '14px', borderTop: 'none', paddingTop: '10px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={() => setShowLogoutModal(false)} 
                  style={{ 
                    padding: '10px 24px', 
                    borderRadius: '8px', 
                    border: '1px solid #cbd5e0', 
                    background: darkMode ? '#4a5568' : 'white', 
                    color: darkMode ? 'white' : '#4a5568', 
                    cursor: 'pointer', 
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={confirmLogout} 
                  style={{ 
                    padding: '10px 24px', 
                    borderRadius: '8px', 
                    background: '#E53E3E', 
                    border: 'none', 
                    color: 'white', 
                    cursor: 'pointer', 
                    fontSize: '0.95rem', 
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)'
                  }}
                >
                  {t('logOutButton') || 'Log Out'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View All Notifications Modal */}
        {showAllNotificationsModal && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={(e) => { if (e.target === e.currentTarget) setShowAllNotificationsModal(false); }}>
            <div className="modal-content" style={{ background: document.body.classList.contains('dark-mode') ? '#2d3748' : 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '650px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div className="modal-header modal-header-gradient" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-bell" style={{ color: 'rgba(255,255,255,0.9)' }}></i> All Notifications</h3>
                <button className="modal-close" onClick={() => setShowAllNotificationsModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', transition: 'all 0.2s' }}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#a0aec0', fontSize: '1.1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <i className="fas fa-bell-slash" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => { if (!notif.read) markAsRead(notif.id); setSelectedNotification(notif); setShowAllNotificationsModal(false); }}
                      className={`notification-item notification-item-interactive ${!notif.read ? 'unread' : ''}`}
                      style={{ display: 'flex', gap: '14px', padding: '16px', marginBottom: '10px', alignItems: 'flex-start' }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                        background: !notif.read ? '#2E7D32' : (document.body.classList.contains('dark-mode') ? '#4a5568' : '#f3f4f6'),
                        color: !notif.read ? 'white' : (document.body.classList.contains('dark-mode') ? '#a0aec0' : '#6b7280'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transition: 'all 0.2s'
                      }}>
                        <i className={notif.icon || 'fas fa-bell'}></i>
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '5px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.97rem', color: document.body.classList.contains('dark-mode') ? '#e2e8f0' : '#1f2937' }}>{notif.title}</span>
                          {!notif.read && (
                            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#2E7D32', flexShrink: 0, marginTop: '4px' }}></span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: document.body.classList.contains('dark-mode') ? '#a0aec0' : '#4b5563', marginBottom: '8px', lineHeight: '1.55', wordBreak: 'break-word' }}>{notif.description}</div>
                        <div style={{ fontSize: '0.8rem', color: document.body.classList.contains('dark-mode') ? '#718096' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <i className="far fa-clock"></i>{notif.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notification Details Modal */}
        {selectedNotification && (
          <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1050, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedNotification(null); }}>
            <div className="modal-content" style={{ background: document.body.classList.contains('dark-mode') ? '#2d3748' : 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div className="modal-header modal-header-gradient" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><i className={selectedNotification.icon || "fas fa-bell"} style={{ color: "rgba(255,255,255,0.9)" }}></i> Notification Details</h3>
                <button className="modal-close" onClick={() => setSelectedNotification(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', transition: 'all 0.2s' }}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: document.body.classList.contains('dark-mode') ? '#e2e8f0' : '#2d3748' }}>{selectedNotification.title}</h4>
                <div style={{ fontSize: '1rem', color: document.body.classList.contains('dark-mode') ? '#a0aec0' : '#4a5568', lineHeight: '1.6', background: document.body.classList.contains('dark-mode') ? 'rgba(0,0,0,0.1)' : '#f7fafc', padding: '15px', borderRadius: '12px' }}>
                  {selectedNotification.description}
                </div>
                <div style={{ fontSize: '0.9rem', color: document.body.classList.contains('dark-mode') ? '#718096' : '#a0aec0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="far fa-clock"></i> {selectedNotification.time}
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                {selectedNotification.title === 'New Order Received' ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedNotification(null);
                      const match = selectedNotification.description.match(/Order #([A-Za-z0-9]+)/);
                      const orderId = match ? match[1] : '';
                      const basePath = window.location.pathname.includes('superadmin') ? '/superadmin/products' : '/admin/products';
                      router.push(`${basePath}?highlightOrder=${orderId}`);
                    }}
                    style={{ padding: '10px 20px', borderRadius: '8px', background: '#2E5E3E', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fas fa-external-link-alt"></i> View Pending Order
                  </button>
                ) : selectedNotification.title === 'New Appointment Received' ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedNotification(null);
                      const basePath = window.location.pathname.includes('superadmin') ? '/superadmin/appointment' : '/admin/appointment';
                      router.push(basePath);
                    }}
                    style={{ padding: '10px 20px', borderRadius: '8px', background: '#2E5E3E', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fas fa-calendar-check"></i> View Pending Appointment
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setSelectedNotification(null)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#2E5E3E', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Close</button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Real-time Order / Notification Popups (Bottom Right) */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {systemPopups.map((popup) => (
          <div key={popup.id} style={{
            background: document.body.classList.contains('dark-mode') ? '#2d3748' : 'white',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            borderRadius: '12px',
            padding: '16px',
            width: '300px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            animation: 'slideUp 0.3s ease-out forwards',
            borderLeft: '4px solid #2E5E3E'
          }}>
            <div style={{
              background: '#EAF3DE',
              color: '#2E5E3E',
              width: '40px', height: '40px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', flexShrink: 0
            }}>
              <i className={popup.icon || "fas fa-bell"}></i>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: document.body.classList.contains('dark-mode') ? '#e2e8f0' : '#2d3748' }}>{popup.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: document.body.classList.contains('dark-mode') ? '#a0aec0' : '#4a5568', lineHeight: '1.4' }}>{popup.description}</p>
            </div>
            <button onClick={() => setSystemPopups(prev => prev.filter(p => p.id !== popup.id))} style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', padding: '4px' }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `}} />
    </>
  );
}
