"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useNotifications } from '../hooks/useNotifications';
import { useAppointments } from '../hooks/useAppointments';

export default function TopBar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  const [profilePic, setProfilePic] = useState<string | null>(null);

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
    if (pathname.includes('/dashboard')) return { title: 'Dashboard', subtitle: 'Overview' };
    if (pathname.includes('/appointment')) return { title: 'Appointments', subtitle: 'Manage Schedule' };
    if (pathname.includes('/products')) return { title: 'Products', subtitle: 'Manage Retail Sales' };
    if (pathname.includes('/sms')) return { title: 'SMS Center', subtitle: 'Client Communications' };
    if (pathname.includes('/reports')) return { title: 'Clinic Reports', subtitle: 'Analytics and Data' };
    if (pathname.includes('/inventory')) return { title: 'Inventory', subtitle: 'Stock Management' };
    if (pathname.includes('/records')) return { title: 'Pet Records', subtitle: 'Detailed Information' };
    if (pathname.includes('/users')) return { title: 'Users', subtitle: 'User Management' };
    if (pathname.includes('/archive')) return { title: 'Archive', subtitle: 'System Archives' };
    if (pathname.includes('/telemedicine')) return { title: 'Telemedicine', subtitle: 'Virtual Consultations' };
    if (pathname.includes('/tutorials')) return { title: 'Tutorials', subtitle: 'Learning Center' };
    if (pathname.includes('/announcement')) return { title: 'Announcements', subtitle: 'System Updates' };
    if (pathname.includes('/billing')) return { title: 'Billing', subtitle: 'Invoices & Payments' };
    if (pathname.includes('/monitor')) return { title: 'Pet Monitor', subtitle: 'AI Diagnostics' };
    
    return { title: 'Admin', subtitle: 'System' };
  };
  const { title, subtitle } = getPageTitle();
  const { notifications, markAllAsRead, unreadCount, addNotification } = useNotifications();
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

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowSettings(false);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.push('/');
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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      addNotification('Error', 'New passwords do not match.', 'fas fa-exclamation-circle');
      return;
    }
    if (passwordData.new.length < 8) {
      addNotification('Error', 'Password must be at least 8 characters long.', 'fas fa-exclamation-circle');
      return;
    }
    // Success scenario
    addNotification('Security Update', 'Password changed successfully.', 'fas fa-check-circle');
    setShowSecurityModal(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  return (
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
          <div className="notifications" onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowSettings(false); }}>
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </div>

          {/* Notification Panel */}
          <div className={`notification-panel ${showNotifications ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && <span className="mark-read" onClick={markAllAsRead} style={{cursor: 'pointer'}}>Mark all as read</span>}
            </div>
            <div className="notification-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#a0aec0', fontSize: '0.9rem' }}>No new notifications</div>
              ) : (
                  notifications.map(notif => (
                      <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} style={{ opacity: notif.read ? 0.7 : 1 }}>
                        <div className="notification-icon">
                          <i className={notif.icon || "fas fa-bell"}></i>
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notif.title}</div>
                          <div className="notification-desc">{notif.description}</div>
                          <div className="notification-time">{notif.time}</div>
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
              <span>Settings</span>
            </div>
            <div className="settings-item">
              <i className="fas fa-sliders-h"></i>
              <span>General Settings</span>
            </div>
            <div className="settings-item" onClick={() => { setShowSettings(false); setShowSecurityModal(true); }}>
              <i className="fas fa-shield-alt"></i>
              <span>Account and Security</span>
            </div>
            <div className="settings-item">
              <i className="fas fa-globe"></i>
              <span>Language</span>
            </div>
            <div className="settings-item">
              <div className="darkmode-toggle">
                <span><i className="fas fa-moon" style={{ marginRight: '12px' }}></i>Darkmode</span>
                <label className="switch">
                  <input type="checkbox" checked={darkMode} onChange={handleToggleDarkMode} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <div className="settings-item">
              <i className="fas fa-gavel"></i>
              <span>Community Rules</span>
            </div>
            <div className="settings-item logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
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
            <div style={{ fontSize: '0.8rem', color: '#ffffff', opacity: 0.9 }}>{pathname.includes('superadmin') ? 'superadmin@furcare.com' : 'admin@furcare.com'}</div>
          </div>
        </div>
      </div>

      {/* Account Security Modal */}
      {showSecurityModal && (
        <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setShowSecurityModal(false); }}>
            <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-shield-alt" style={{color:"#2E5E3E"}}></i> Account Security</h3>
                    <button className="modal-close" onClick={() => setShowSecurityModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#a0aec0', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}><i className="fas fa-lock"></i> Current password</label>
                            <input type="password" required className="form-control" placeholder="Enter current password" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={passwordData.current} onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}><i className="fas fa-key"></i> New password</label>
                            <input type="password" required className="form-control" placeholder="Enter new password" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={passwordData.new} onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}><i className="fas fa-check-circle"></i> Confirm new password</label>
                            <input type="password" required className="form-control" placeholder="Confirm new password" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} />
                        </div>

                        <div className="password-requirements" style={{ background: '#f7fafc', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#4a5568', fontWeight: 600 }}><i className="fas fa-shield-alt" style={{marginRight:"8px"}}></i>Password requirements:</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: passwordData.new.length >= 8 ? '#38a169' : '#a0aec0' }}>
                                <i className={passwordData.new.length >= 8 ? "fas fa-check-circle" : "fas fa-circle"} style={{fontSize: passwordData.new.length >= 8 ? '1rem' : '0.5rem'}}></i>
                                <span>At least 8 characters</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: /[A-Z]/.test(passwordData.new) ? '#38a169' : '#a0aec0', marginTop: '5px' }}>
                                <i className={/[A-Z]/.test(passwordData.new) ? "fas fa-check-circle" : "fas fa-circle"} style={{fontSize: /[A-Z]/.test(passwordData.new) ? '1rem' : '0.5rem'}}></i>
                                <span>One uppercase letter</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: /[0-9]/.test(passwordData.new) ? '#38a169' : '#a0aec0', marginTop: '5px' }}>
                                <i className={/[0-9]/.test(passwordData.new) ? "fas fa-check-circle" : "fas fa-circle"} style={{fontSize: /[0-9]/.test(passwordData.new) ? '1rem' : '0.5rem'}}></i>
                                <span>One number</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: (passwordData.new && passwordData.new === passwordData.confirm) ? '#38a169' : '#a0aec0', marginTop: '5px' }}>
                                <i className={(passwordData.new && passwordData.new === passwordData.confirm) ? "fas fa-check-circle" : "fas fa-circle"} style={{fontSize: (passwordData.new && passwordData.new === passwordData.confirm) ? '1rem' : '0.5rem'}}></i>
                                <span>Passwords match</span>
                            </div>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <button type="button" onClick={() => setShowSecurityModal(false)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#4a5568' }}>Cancel</button>
                            <button type="submit" style={{ padding: '10px 20px', background: '#2E5E3E', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white' }}>Update Password</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content" style={{ background: document.body.classList.contains('dark-mode') ? '#2d3748' : 'white', padding: '25px', borderRadius: '16px', width: '400px', maxWidth: '90%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div className="modal-header" style={{ borderBottom: 'none', justifyContent: 'center', paddingBottom: 0 }}>
              <h3 style={{ color: '#E53E3E', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <i className="fas fa-sign-out-alt"></i>
                Confirm Logout
              </h3>
            </div>
            <div className="modal-body" style={{ padding: '20px 0' }}>
              <p style={{ color: document.body.classList.contains('dark-mode') ? '#a0aec0' : '#4a5568', fontSize: '1.1rem' }}>Are you sure you want to log out?</p>
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: '15px', borderTop: 'none', paddingTop: 0 }}>
              <button className="btn btn-secondary" onClick={() => setShowLogoutModal(false)} style={{ padding: '10px 25px', borderRadius: '8px', border: document.body.classList.contains('dark-mode') ? '1px solid #4a5568' : '1px solid #cbd5e0', background: document.body.classList.contains('dark-mode') ? '#4a5568' : 'white', color: document.body.classList.contains('dark-mode') ? 'white' : '#4a5568', cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmLogout} style={{ padding: '10px 25px', borderRadius: '8px', background: '#E53E3E', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>Log Out</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
