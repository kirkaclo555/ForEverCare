"use client";
import React, { useState, useEffect } from 'react';
import { AppointmentItem } from './AppointmentDonutChart';
import { useRouter, usePathname } from 'next/navigation';

// ─── Shared Client Cache & Request Deduplication ────────────────────────────

export type DashboardPayload = {
  stats: { todayAppointments: number; totalPets: number; pendingConsultations: number; todayRevenue: number };
  alerts: Array<{ id: number; type: string; text: string; icon: string; link?: string }>;
  recentFeedback: Array<{ id: string; rating: number; category?: string; comment: string; author: string; date: string }>;
  revenueTrend: { labels: string[]; data: number[] };
};

let cachedClientData: DashboardPayload | null = null;
let inFlightClientPromise: Promise<DashboardPayload | null> | null = null;
const stateListeners = new Set<(d: DashboardPayload | null) => void>();

function fetchDashboardDataOnce(): Promise<DashboardPayload | null> {
  if (cachedClientData) return Promise.resolve(cachedClientData);
  if (inFlightClientPromise) return inFlightClientPromise;

  inFlightClientPromise = fetch('/api/dashboard')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .then((data: any) => {
      if (data && !data.error) {
        cachedClientData = data;
        stateListeners.forEach((listener) => listener(cachedClientData));
      }
      inFlightClientPromise = null;
      return cachedClientData;
    })
    .catch((err) => {
      console.error('[DashboardWidgets] Error fetching /api/dashboard:', err);
      inFlightClientPromise = null;
      return null;
    });

  return inFlightClientPromise;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardPayload | null>(cachedClientData);
  const [loading, setLoading] = useState(!cachedClientData);

  useEffect(() => {
    const handleUpdate = (updated: DashboardPayload | null) => {
      if (updated) {
        setData(updated);
        setLoading(false);
      }
    };
    stateListeners.add(handleUpdate);

    if (!cachedClientData) {
      fetchDashboardDataOnce().then((res) => {
        if (res) setData(res);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      stateListeners.delete(handleUpdate);
    };
  }, []);

  return { data, loading };
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

export function QuickActionsRow() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith('/superadmin') ? '/superadmin' : '/admin';

  return (
    <div className="quick-actions-row">
      <button className="quick-action-btn primary" onClick={() => router.push(`${basePath}/appointment`)}>
        <i className="fas fa-plus"></i> Walk-In
      </button>
      <button className="quick-action-btn" onClick={() => router.push(`${basePath}/records`)}>
        <i className="fas fa-paw"></i> New Pet
      </button>
      <button className="quick-action-btn" onClick={() => router.push(`${basePath}/announcement`)}>
        <i className="fas fa-bullhorn"></i> Broadcast
      </button>
    </div>
  );
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

export function DashboardStats() {
  const { data, loading } = useDashboardData();
  const stats = data?.stats;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-header">
          <i className="fas fa-calendar-check"></i>
          <h3 id="todayAppointmentsLabel">Today's Appointments</h3>
        </div>
        <div className="stat-value">
          {loading ? <span className="stat-loading">—</span> : (stats?.todayAppointments ?? 0)}
        </div>
        <div className="stat-trend positive">Active today</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <i className="fas fa-paw"></i>
          <h3 id="totalPatientsLabel">Total Pets</h3>
        </div>
        <div className="stat-value">
          {loading ? <span className="stat-loading">—</span> : (stats?.totalPets ?? 0)}
        </div>
        <div className="stat-trend positive">Registered patients</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <i className="fas fa-video"></i>
          <h3 id="pendingConsultationsLabel">Pending Consultations</h3>
        </div>
        <div className="stat-value">
          {loading ? <span className="stat-loading">—</span> : (stats?.pendingConsultations ?? 0)}
        </div>
        <div className="stat-trend neutral">Telemedicine queue</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <i className="fas fa-peso-sign"></i>
          <h3 id="todayRevenueLabel">Revenue Today</h3>
        </div>
        <div className="stat-value">
          {loading
            ? <span className="stat-loading">—</span>
            : `₱${(stats?.todayRevenue ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`}
        </div>
        <div className="stat-trend positive">Paid transactions today</div>
      </div>
    </div>
  );
}

// ─── Alerts Feed (Action Required) ───────────────────────────────────────────

export function AlertsFeed() {
  const { data, loading } = useDashboardData();
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith('/superadmin') ? '/superadmin' : '/admin';

  const alerts = data?.alerts ?? [];

  const handleAlertClick = (link?: string) => {
    if (!link) return;
    const target = link.startsWith('/admin') && basePath === '/superadmin'
      ? link.replace('/admin', '/superadmin')
      : link;
    router.push(target);
  };

  return (
    <div className="alerts-feed-card">
      <div className="section-header" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1rem', margin: 0 }}>
          <i className="fas fa-bell" style={{ marginRight: '8px', color: '#e53e3e' }}></i> Action Required
        </h2>
        {alerts.length > 0 && alerts[0]?.icon !== 'fas fa-check-circle' && (
          <span style={{ fontSize: '0.75rem', background: '#FED7D7', color: '#C53030', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
            {alerts.length} Pending
          </span>
        )}
      </div>
      <div className="alerts-list">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#a0aec0' }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading live action items...
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#a0aec0' }}>
            <i className="fas fa-check-circle" style={{ marginRight: '8px', color: '#48bb78' }}></i> All clear — no action items
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-item ${alert.type}`}
              onClick={() => handleAlertClick(alert.link)}
              style={{ cursor: alert.link ? 'pointer' : 'default', transition: 'transform 0.15s ease' }}
              title={alert.link ? 'Click to view and take action' : undefined}
            >
              <div className={`alert-icon-wrapper ${alert.type}`}>
                <i className={alert.icon}></i>
              </div>
              <span className="alert-text" style={{ flex: 1 }}>{alert.text}</span>
              {alert.link && (
                <i className="fas fa-chevron-right" style={{ fontSize: '0.7rem', color: '#a0aec0', marginLeft: '8px' }}></i>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Telemedicine Queue ───────────────────────────────────────────────────────

export function TelemedicineQueue({ appointments }: { appointments: AppointmentItem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const telemedPath = isAdmin ? '/admin/telemedicine' : '/superadmin/telemedicine';

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const upcomingTelemed = (appointments || [])
    .filter(a => {
      const isTelemed = a.type?.toLowerCase() === 'telemedicine';
      const isToday = a.date && a.date.startsWith(todayStr);
      const isActionable = ['paid', 'confirmed', 'pending'].includes(a.status?.toLowerCase() || '');
      return isTelemed && isToday && isActionable;
    })
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const upNext = upcomingTelemed.length > 0 ? upcomingTelemed[0] : null;
  const remainingCount = upcomingTelemed.length - 1;

  const handleStartSession = (app: AppointmentItem) => {
    router.push(telemedPath);
  };

  return (
    <div className="telemed-card">
      <div className="telemed-header">
        <h2>
          <i className="fas fa-video" style={{ color: '#319795' }}></i> Telemedicine Queue
        </h2>
        {upcomingTelemed.length > 0 ? (
          <span className="telemed-badge">{upcomingTelemed.length} Queued Today</span>
        ) : (
          <button 
            type="button" 
            onClick={() => router.push(telemedPath)} 
            className="telemed-view-link"
          >
            Hub <i className="fas fa-arrow-right"></i>
          </button>
        )}
      </div>
      <div className="telemed-content">
        {!upNext ? (
          <div className="empty-telemed">
            <i className="fas fa-laptop-medical"></i>
            <p>No telemedicine consultations queued for today</p>
            <button 
              type="button" 
              className="empty-telemed-btn" 
              onClick={() => router.push(telemedPath)}
            >
              <i className="fas fa-external-link-alt" style={{ marginRight: '6px', fontSize: '0.75rem' }}></i>
              Go to Telemedicine
            </button>
          </div>
        ) : (
          <div>
            <div className="active-call-preview">
              <div className="patient-avatar-placeholder">
                <i className="fas fa-paw"></i>
              </div>
              <div className="call-details">
                <h4>{upNext.pet || 'Patient'}</h4>
                <p>Client: {upNext.owner || 'Unknown'}</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="call-time-badge">
                    <i className="far fa-clock"></i> {upNext.time || 'Scheduled'}
                  </div>
                  {upNext.sessionCode && (
                    <span style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#4a5568', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {upNext.sessionCode}
                    </span>
                  )}
                </div>
              </div>
              <button 
                type="button" 
                className="join-call-btn"
                onClick={() => handleStartSession(upNext)}
                title="Open Telemedicine consultation"
              >
                <i className="fas fa-video"></i> Start Session
              </button>
            </div>

            {remainingCount > 0 && (
              <div className="telemed-more-queue">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#718096', fontWeight: 600, marginTop: '8px' }}>
                  <span>Next in queue ({remainingCount})</span>
                  <button 
                    type="button"
                    onClick={() => router.push(telemedPath)} 
                    className="telemed-view-link"
                    style={{ fontSize: '0.72rem' }}
                  >
                    View All
                  </button>
                </div>
                {upcomingTelemed.slice(1, 3).map((item) => (
                  <div key={item.id} className="telemed-mini-item">
                    <span><strong>{item.pet}</strong> ({item.owner})</span>
                    <span style={{ color: '#319795', fontWeight: 600 }}>{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Revenue Trend Chart ──────────────────────────────────────────────────────

export function RevenueTrendChart() {
  const { data, loading } = useDashboardData();

  const labels = data?.revenueTrend?.labels ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = data?.revenueTrend?.data ?? [0, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...values, 1);

  return (
    <div className="revenue-trend-card">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem' }}>
          <i className="fas fa-chart-bar" style={{ marginRight: '8px', color: '#3182ce' }}></i> Revenue Trend (Last 7 Days)
        </h2>
      </div>
      <div className="bar-chart-container">
        {labels.map((day, idx) => {
          const heightPct = loading ? 0 : Math.round(((values[idx] ?? 0) / maxVal) * 100);
          return (
            <div key={day} className="bar-col" title={`₱${(values[idx] ?? 0).toLocaleString('en-PH')}`}>
              <div className="bar-wrapper">
                <div className="bar-fill" style={{ height: `${heightPct || 2}%`, transition: 'height 0.6s ease' }}></div>
              </div>
              <span className="bar-label">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Feedback Carousel (Latest Feedback) ─────────────────────────────────────

export function FeedbackCarousel() {
  const { data, loading } = useDashboardData();
  const [idx, setIdx] = useState(0);

  const feedbacks = data?.recentFeedback ?? [];

  useEffect(() => {
    if (feedbacks.length <= 1) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % feedbacks.length), 5500);
    return () => clearInterval(timer);
  }, [feedbacks.length]);

  const current = feedbacks[idx];

  const handlePrev = () => {
    setIdx((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
  };

  const handleNext = () => {
    setIdx((prev) => (prev + 1) % feedbacks.length);
  };

  return (
    <div className="feedback-card">
      <div className="section-header" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1rem', margin: 0 }}>
          <i className="fas fa-star" style={{ marginRight: '8px', color: '#ecc94b' }}></i> Latest Feedback
        </h2>
        {feedbacks.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {feedbacks.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Go to feedback ${i + 1}`}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    background: i === idx ? '#2E5E3E' : '#cbd5e0',
                    padding: 0,
                    transition: 'background 0.2s ease',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '2px', marginLeft: '4px' }}>
              <button
                onClick={handlePrev}
                aria-label="Previous feedback"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#718096',
                  fontSize: '0.75rem',
                  padding: '2px 4px',
                }}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                onClick={handleNext}
                aria-label="Next feedback"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#718096',
                  fontSize: '0.75rem',
                  padding: '2px 4px',
                }}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="feedback-content" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#a0aec0', padding: '20px' }}>
            <i className="fas fa-spinner fa-spin"></i> Loading live feedback...
          </div>
        ) : !current ? (
          <div style={{ textAlign: 'center', color: '#a0aec0', padding: '20px' }}>
            <i className="fas fa-comment-slash" style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}></i>
            No client feedback recorded yet
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={i < current.rating ? 'fas fa-star' : 'far fa-star'}
                    style={{ color: i < current.rating ? '#ecc94b' : '#cbd5e0', fontSize: '0.9rem' }}
                  />
                ))}
              </div>
              {current.category && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: current.category === 'Product Order' ? '#EBF8FF' : '#F0FFF4',
                    color: current.category === 'Product Order' ? '#2B6CB0' : '#22543D',
                    fontWeight: 600,
                  }}
                >
                  {current.category}
                </span>
              )}
            </div>

            <p
              className="feedback-text"
              style={{
                fontStyle: 'italic',
                color: '#2d3748',
                fontSize: '0.92rem',
                lineHeight: '1.45',
                marginBottom: '10px',
              }}
            >
              &ldquo;{current.comment || 'No additional comments provided.'}&rdquo;
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <p className="feedback-author" style={{ fontWeight: '600', color: '#2d3748', fontSize: '0.85rem', margin: 0 }}>
                — {current.author}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#a0aec0', margin: 0 }}>
                {new Date(current.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
