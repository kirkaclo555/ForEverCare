"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { useAdminProfile } from '../context/AdminProfileContext';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const { t } = useLanguage();
  const { profile, profilePic: contextPic } = useAdminProfile();

  useEffect(() => {
    const loadProfilePic = () => {
      const isSuperAdmin = (pathname || '').startsWith('/superadmin');
      const key = isSuperAdmin ? 'superadminProfilePic' : 'adminProfilePic';
      const pic = localStorage.getItem(key);
      setProfilePic(pic || null);
    };
    loadProfilePic();
    window.addEventListener('profilePicUpdated', loadProfilePic);
    return () => window.removeEventListener('profilePicUpdated', loadProfilePic);
  }, [pathname]);

  const activePic = contextPic || profilePic;
  const safePathname = pathname || '';
  const basePath = safePathname.startsWith('/superadmin') ? '/superadmin' : '/admin';
  const adminName = profile?.fullName || (basePath === '/superadmin' ? 'Superadmin' : 'Admin');
  const adminRole = profile?.position || (basePath === '/superadmin' ? 'Super Administrator' : 'Clinic Administrator');

  const sections = [
    {
      title: 'Management',
      items: [
        { name: 'Dashboard', path: `${basePath}/dashboard`, icon: 'fa-home' },
        { name: 'Inventory', path: `${basePath}/inventory`, icon: 'fa-boxes' },
        { name: 'Products', path: `${basePath}/products`, icon: 'fa-store' },
        { name: 'Billing', path: `${basePath}/billing`, icon: 'fa-file-invoice-dollar' },
      ]
    },
    {
      title: 'Clinic',
      items: [
        { name: 'Appointment', path: `${basePath}/appointment`, icon: 'fa-calendar-check' },
        { name: 'Telemedicine', path: `${basePath}/telemedicine`, icon: 'fa-video' },
        { name: 'Pet Monitor', path: `${basePath}/monitor`, icon: 'fa-heartbeat' },
        { name: 'SMS Center', path: `${basePath}/sms`, icon: 'fa-sms' },
      ]
    },
    {
      title: 'Records',
      items: [
        { name: 'Pet Records', path: `${basePath}/records`, icon: 'fa-paw' },
        { name: 'Users', path: `${basePath}/users`, icon: 'fa-users' },
        { name: 'Reports', path: `${basePath}/reports`, icon: 'fa-chart-bar' },
        { name: 'Analytics', path: `${basePath}/analytics`, icon: 'fa-chart-line' },
        { name: 'Tutorials', path: `${basePath}/tutorials`, icon: 'fa-graduation-cap' },
        { name: 'Announcements', path: `${basePath}/announcement`, icon: 'fa-bullhorn' },
        { name: 'Feedback', path: `${basePath}/feedback`, icon: 'fa-comments' },
      ]
    }
  ];

  return (
    <div 
      className={`sidebar ${isOpen ? 'active' : ''}`} 
      id="sidebar" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        height: '100%',
        maxHeight: '100dvh',
        overflow: 'hidden',
        zIndex: 1000,
        backgroundColor: '#2E5E3E'
      }}
    >
      <div 
        className="sidebar-header" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '18px 20px', 
          borderBottom: '1px solid rgba(255,255,255,0.1)', 
          flexShrink: 0 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '45px', height: 'auto', objectFit: 'contain' }} />
          <h2 style={{ margin: 0, textAlign: 'left', lineHeight: '1.2', fontSize: '1.15rem' }}>
            FurEver Paw Care
            <span style={{ display: 'block', fontSize: '0.7rem', marginTop: '2px' }}>{t('VeterinarySystem')}</span>
          </h2>
        </div>
        <button className="close-sidebar" onClick={onClose} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div 
        className="sidebar-menu" 
        style={{ 
          padding: '10px 20px', 
          flex: '1 1 0%', 
          minHeight: 0, 
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px', marginBottom: '10px', paddingLeft: '15px' }}>
              {t(section.title)}
            </div>
            {section.items.map((item) => {
              const isActive = safePathname === item.path || (safePathname === '/' && item.path === '/dashboard');
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`menu-item ${isActive ? 'active' : ''}`}
                >
                  <i className={`fas ${item.icon}`}></i>
                  <span>{t(item.name)}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Profile Footer */}
      <div
        onClick={() => router.push(basePath === '/superadmin' ? '/superadmin/profile' : '/admin/profile')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 20px',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer',
          transition: 'background 0.2s',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.12)'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.12)')}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.25)'
        }}>
          {activePic ? (
            <img src={activePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
              {basePath === '/superadmin' ? 'SA' : 'A'}
            </span>
          )}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {adminName}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {adminRole}
          </div>
        </div>
        <i className="fas fa-chevron-right" style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}></i>
      </div>

    </div>
  );
}
