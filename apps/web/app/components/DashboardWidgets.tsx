"use client";
import React from 'react';
import { AppointmentItem } from './AppointmentDonutChart';
import { useRouter, usePathname } from 'next/navigation';

export function QuickActionsRow() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith('/superadmin') ? '/superadmin' : '/admin';

  return (
    <div className="quick-actions-row">
      <button className="quick-action-btn primary" onClick={() => router.push(`${basePath}/appointment`)}><i className="fas fa-plus"></i> Walk-In</button>
      <button className="quick-action-btn" onClick={() => router.push(`${basePath}/records`)}><i className="fas fa-paw"></i> New Pet</button>
      <button className="quick-action-btn" onClick={() => router.push(`${basePath}/announcement`)}><i className="fas fa-bullhorn"></i> Broadcast</button>
    </div>
  );
}

export function AlertsFeed() {
  const alerts = [
    { id: 1, type: 'warning', text: 'Rabies Vaccine low stock (2 left)', icon: 'fas fa-exclamation-triangle' },
    { id: 2, type: 'action', text: '3 Payments pending verification', icon: 'fas fa-file-invoice-dollar' },
    { id: 3, type: 'info', text: 'Max requested appointment cancellation', icon: 'fas fa-times-circle' },
  ];

  return (
    <div className="alerts-feed-card">
      <div className="section-header" style={{ marginBottom: '15px' }}>
        <h2 style={{ fontSize: '1rem' }}><i className="fas fa-bell" style={{marginRight:"8px", color: "#e53e3e"}}></i> Action Required</h2>
      </div>
      <div className="alerts-list">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert-item ${alert.type}`}>
            <div className={`alert-icon-wrapper ${alert.type}`}><i className={alert.icon}></i></div>
            <span className="alert-text">{alert.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TelemedicineQueue({ appointments }: { appointments: AppointmentItem[] }) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const upcomingTelemed = appointments
    .filter(a => a.date === todayStr && a.type === 'telemedicine' && (a.status.toLowerCase() === 'paid' || a.status.toLowerCase() === 'confirmed'))
    .sort((a, b) => {
      return a.time.localeCompare(b.time);
    });

  const upNext = upcomingTelemed.length > 0 ? upcomingTelemed[0] : null;

  if (!upNext) return null;

  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith('/superadmin') ? '/superadmin' : '/admin';

  return (
    <div className="telemed-queue-card">
      <div className="telemed-header">
        <div className="telemed-title-row">
          <i className="fas fa-video telemed-icon"></i>
          <div>
            <h3>Telemedicine Queue</h3>
            <p>Up Next</p>
          </div>
        </div>
        <span className="pulse-badge">Live</span>
      </div>
      <div className="telemed-patient-info">
        <div className="patient-avatar"><i className="fas fa-dog"></i></div>
        <div className="patient-details">
          <h4>{upNext.pet}</h4>
          <p>{upNext.time} • {upNext.owner}</p>
        </div>
        <button className="join-room-btn" onClick={() => router.push(`${basePath}/telemedicine`)}>Join Room</button>
      </div>
    </div>
  );
}

export function RevenueTrendChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heights = [40, 65, 30, 80, 50, 90, 70]; // % heights for bars
  
  return (
    <div className="revenue-trend-card">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem' }}><i className="fas fa-chart-bar" style={{marginRight:"8px", color: "#3182ce"}}></i> Revenue Trend (Last 7 Days)</h2>
      </div>
      <div className="bar-chart-container">
        {days.map((day, idx) => (
          <div key={day} className="bar-col">
            <div className="bar-wrapper">
              <div className="bar-fill" style={{ height: `${heights[idx]}%` }}></div>
            </div>
            <span className="bar-label">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeedbackCarousel() {
  return (
    <div className="feedback-card">
      <div className="section-header" style={{ marginBottom: '15px' }}>
        <h2 style={{ fontSize: '1rem' }}><i className="fas fa-star" style={{marginRight:"8px", color: "#ecc94b"}}></i> Recent Feedback</h2>
      </div>
      <div className="feedback-content">
        <div className="stars" style={{ marginBottom: '10px' }}>
          <i className="fas fa-star" style={{color: "#ecc94b"}}></i>
          <i className="fas fa-star" style={{color: "#ecc94b"}}></i>
          <i className="fas fa-star" style={{color: "#ecc94b"}}></i>
          <i className="fas fa-star" style={{color: "#ecc94b"}}></i>
          <i className="fas fa-star" style={{color: "#ecc94b"}}></i>
        </div>
        <p className="feedback-text" style={{ fontStyle: 'italic', color: '#4a5568', fontSize: '0.9rem', marginBottom: '10px' }}>"Dr. Smith was amazing with Bella! The new telemedicine feature saved us a stressful trip to the clinic."</p>
        <p className="feedback-author" style={{ fontWeight: '600', color: '#2d3748', fontSize: '0.85rem' }}>- Jane Doe</p>
      </div>
    </div>
  );
}
