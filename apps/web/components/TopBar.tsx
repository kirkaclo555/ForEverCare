"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function TopBar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Determine Title based on current path
  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Overview' };
      case '/appointment':
        return { title: 'Appointments', subtitle: 'Manage Schedule' };
      case '/store':
        return { title: 'Clinic Store', subtitle: 'Manage Retail Sales' };
      case '/sms':
        return { title: 'SMS Center', subtitle: 'Client Communications' };
      case '/reports':
        return { title: 'Clinic Reports', subtitle: 'Analytics and Data' };
      case '/inventory':
        return { title: 'Inventory', subtitle: 'Stock Management' };
      case '/records':
        return { title: 'Patient Records', subtitle: 'Detailed Information' };
      default:
        return { title: 'Admin', subtitle: 'System' };
    }
  };
  const { title, subtitle } = getPageTitle();

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
    if (window.confirm('Are you sure you want to logout?')) {
      router.push('/');
    }
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

  return (
    <div className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button className="menu-toggle" onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}>
          <i className="fas fa-bars"></i>
        </button>
        <div className="page-title">
          <h1>{title}</h1>
          <span>{subtitle}</span>
        </div>
      </div>

      <div className="user-info">
        {/* Search Bar */}
        <div className="search-container">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search appointments, patients..." />
        </div>

        {/* Notifications */}
        <div className="notifications" onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowSettings(false); }}>
          <i className="far fa-bell"></i>
          <span className="badge">3</span>
        </div>

        {/* Notification Panel */}
        <div className={`notification-panel ${showNotifications ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="notification-header">
            <h3>Notifications</h3>
            <span className="mark-read">Mark all as read</span>
          </div>
          <div className="notification-list">
            <div className="notification-item unread">
              <div className="notification-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="notification-content">
                <div className="notification-title">New Appointment Request</div>
                <div className="notification-desc">Max (Golden Retriever) - Checkup</div>
                <div className="notification-time">5 minutes ago</div>
              </div>
            </div>
            {/* Additional notifications would go here */}
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
            <div className="settings-item">
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
        <div className="user-profile">
          <div className="avatar">
            <span>A</span>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#2d3748' }}>Admin</div>
            <div style={{ fontSize: '0.8rem', color: '#718096' }}>admin@furcare.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
