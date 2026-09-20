"use client";

import React, { useState } from 'react';
import { useAppointments } from '../../../hooks/useAppointments';
import './telemedicine.css';

export default function TelemedicinePage() {
  const { appointments, updateAppointmentStatus, updateAppointmentDetails, getAvailableTimeSlots } = useAppointments();
  
  const [activeSession, setActiveSession] = useState<any>(null);
  const [copyToast, setCopyToast] = useState(false);
  const handleCopyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 3000);
  };

  const [activeFilter, setActiveFilter] = useState<'All' | 'Today' | 'Upcoming' | 'Past'>('All');
  const [viewSessionModal, setViewSessionModal] = useState<any>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [notifyModal, setNotifyModal] = useState<{ show: boolean; status: 'sending' | 'success' | 'error'; session: any; email?: string; errorMsg?: string }>({ show: false, status: 'sending', session: null });

  const handleNotify = async (session: any) => {
    if (notifyingId === session.id) return;
    setNotifyingId(session.id);
    setNotifyModal({ show: true, status: 'sending', session });
    try {
      const res = await fetch(`/api/appointments/${session.id}/notify`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifyModal({ show: true, status: 'success', session, email: data.email });
      } else {
        setNotifyModal({ show: true, status: 'error', session, errorMsg: data.message || 'Unknown error' });
      }
    } catch (err: any) {
      setNotifyModal({ show: true, status: 'error', session, errorMsg: err.message });
    } finally {
      setNotifyingId(null);
    }
  };

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleStatus, setRescheduleStatus] = useState<'form' | 'success'>('form');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const availableRescheduleSlots = newDate ? getAvailableTimeSlots(newDate) : [];

  const openRescheduleModal = (session: any) => {
    setSessionToReschedule(session);
    setNewDate(session.date);
    setNewTime(session.time);
    setRescheduleStatus('form');
    setRescheduleModalOpen(true);
  };

  const closeRescheduleModal = () => {
    setRescheduleModalOpen(false);
    setSessionToReschedule(null);
    setRescheduleStatus('form');
  };

  const confirmReschedule = async () => {
    if (sessionToReschedule && newDate && newTime) {
       setIsRescheduling(true);
       try {
         // Update the database details
         await updateAppointmentDetails(sessionToReschedule.id, { date: newDate, time: newTime });

         // Call the notify endpoint to notify client by email and in-app notification
         await fetch(`/api/appointments/${sessionToReschedule.id}/reschedule-notify`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ newDate, newTime })
         });

         setRescheduleStatus('success');
       } catch (err: any) {
         console.error('Failed to reschedule:', err);
         alert(`❌ Failed to reschedule: ${err.message || 'Unknown error'}`);
       } finally {
         setIsRescheduling(false);
       }
    }
  };

  const handleJoinSession = () => {
    if (!joinCodeInput.trim()) {
      setJoinError('Please enter a session code before starting.');
      return;
    }
    setJoinError('');

    const session = appointments.find(app => 
      app.sessionCode?.trim().toUpperCase() === joinCodeInput.trim().toUpperCase()
    );
    if (session && session.sessionCode) {
       const url = `https://meet.ffmuc.net/FurEverPawCare-${session.sessionCode.trim().toUpperCase()}`;
       window.open(url, '_blank');
       setShowJoinModal(false);
       setJoinCodeInput('');
    } else {
       setShowErrorModal(true);
    }
  };

  const sortSessions = (sessions: any[], asc: boolean = true) => {
    return sessions.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`).getTime();
      const dateB = new Date(`${b.date} ${b.time}`).getTime();
      return asc ? dateA - dateB : dateB - dateA;
    });
  };

  const teleAppointments = appointments.filter(app => app.type === 'telemedicine');

  const now = new Date();
  const futureSessions = sortSessions(teleAppointments.filter(s => {
    const sDate = new Date(`${s.date} ${s.time}`);
    return sDate > now && s.status.toLowerCase() === 'paid';
  }));
  const nextSession = futureSessions[0];

  let nextSessionHours = 0;
  let nextSessionRelativeDate = '';
  if (nextSession) {
    const nextDate = new Date(`${nextSession.date} ${nextSession.time}`);
    const diffMs = nextDate.getTime() - now.getTime();
    nextSessionHours = Math.round(diffMs / (1000 * 60 * 60));
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(nextDate);
    target.setHours(0,0,0,0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) nextSessionRelativeDate = `Today, ${nextSession.date}`;
    else if (diffDays === 1) nextSessionRelativeDate = `Tomorrow, ${nextSession.date}`;
    else nextSessionRelativeDate = `In ${diffDays} days, ${nextSession.date}`;
  }

  const todaySessions = sortSessions(teleAppointments.filter(s => s.date === todayStr && s.status.toLowerCase() === 'paid'));
  const upcomingSessions = sortSessions(teleAppointments.filter(s => s.date > todayStr && s.status.toLowerCase() === 'paid'));
  const pastSessions = sortSessions(teleAppointments.filter(s => s.date < todayStr || s.status.toLowerCase() === 'done' || s.status.toLowerCase() === 'completed'), false);

  const renderSessionListItem = (session: any, isPast: boolean) => {
    const isToday = session.date === todayStr;
    const isNext = nextSession && session.id === nextSession.id;

    return (
        <div key={session.id} className={`tele-row ${isToday ? 'is-today' : ''} clickable`} onClick={() => setViewSessionModal(session)}>
            <div className="tele-gutter">
                <div className="tele-time">{session.time}</div>
                <div className="tele-date">{session.date}</div>
            </div>
            
            <div className="tele-avatar">{session.owner.charAt(0)}</div>
            
            <div className="tele-details">
                <div className="tele-client">{session.owner}</div>
                <div className="tele-meta">Pet: <strong>{session.pet}</strong> {session.sessionCode ? `· ${session.sessionCode}` : ''}</div>
            </div>
            
            {isPast ? (
                <div className="tele-chip completed">Completed</div>
            ) : isNext ? (
                <div className="tele-chip next">Next Up</div>
            ) : (
                <div className="tele-chip upcoming">Upcoming</div>
            )}
            
            <div className="tele-row-actions">
                {isPast ? (
                    <button className="tele-btn" onClick={(e) => { e.stopPropagation(); setViewSessionModal(session); }}>
                        <i className="fas fa-file-alt"></i> View
                    </button>
                ) : (
                    <>
                        {session.sessionCode && (
                            <button className="tele-btn primary" onClick={(e) => {
                                e.stopPropagation();
                                const url = `https://meet.ffmuc.net/FurEverPawCare-${session.sessionCode!.trim().toUpperCase()}`;
                                window.open(url, '_blank');
                            }}>
                                <i className="fas fa-video"></i> Join
                            </button>
                        )}
                        <button className="tele-btn" onClick={(e) => { e.stopPropagation(); handleNotify(session); }} disabled={notifyingId === session.id}>
                            <i className={notifyingId === session.id ? "fas fa-spinner fa-spin" : "fas fa-bell"}></i> {notifyingId === session.id ? '...' : 'Notify'}
                        </button>
                        <button className="tele-btn" onClick={(e) => { e.stopPropagation(); openRescheduleModal(session); }}>
                            <i className="fas fa-calendar-alt"></i> Shift
                        </button>
                    </>
                )}
            </div>
        </div>
    );
  };

  const renderList = () => {
      let filtered: any[] = [];
      if (activeFilter === 'All') {
          return (
              <>
                  <div className="tele-group-header is-today">
                      Today · {todayStr}
                      <div className="tele-rule"></div>
                  </div>
                  {todaySessions.length === 0 ? (
                      <div className="tele-empty-state">No sessions today</div>
                  ) : todaySessions.map(s => renderSessionListItem(s, false))}
                  
                  <div className="tele-group-header">
                      Upcoming Bookings
                      <div className="tele-rule"></div>
                  </div>
                  {upcomingSessions.length === 0 ? (
                      <div className="tele-empty-state">No upcoming bookings</div>
                  ) : upcomingSessions.map(s => renderSessionListItem(s, false))}

                  <div className="tele-group-header">
                      Past Sessions
                      <div className="tele-rule"></div>
                  </div>
                  {pastSessions.length === 0 ? (
                      <div className="tele-empty-state">No past sessions</div>
                  ) : pastSessions.map(s => renderSessionListItem(s, true))}
              </>
          );
      } else if (activeFilter === 'Today') {
          return (
              <>
                  <div className="tele-group-header is-today">
                      Today · {todayStr}
                      <div className="tele-rule"></div>
                  </div>
                  {todaySessions.length === 0 ? (
                      <div className="tele-empty-state">No sessions today</div>
                  ) : todaySessions.map(s => renderSessionListItem(s, false))}
              </>
          );
      } else if (activeFilter === 'Upcoming') {
          return (
              <>
                  <div className="tele-group-header">
                      Upcoming Bookings
                      <div className="tele-rule"></div>
                  </div>
                  {upcomingSessions.length === 0 ? (
                      <div className="tele-empty-state">No upcoming bookings</div>
                  ) : upcomingSessions.map(s => renderSessionListItem(s, false))}
              </>
          );
      } else {
          return (
              <>
                  <div className="tele-group-header">
                      Past Sessions
                      <div className="tele-rule"></div>
                  </div>
                  {pastSessions.length === 0 ? (
                      <div className="tele-empty-state">No past sessions</div>
                  ) : pastSessions.map(s => renderSessionListItem(s, true))}
              </>
          );
      }
  };

  return (
    <>
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} id="mainContent">
        <div className="tele-wrapper">
            
            <div className="tele-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 className="tele-title" style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '30px', fontWeight: 'bold', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                    <i className="fas fa-video" style={{ color: '#2E5E3E' }}></i> Telemedicine Administration
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {nextSession && (
                        <div className="tele-hero-strip" style={{ borderBottom: 'none', padding: '6px 14px', fontSize: '0.9rem', borderRadius: '8px', background: '#e6ffed', color: '#2E5E3E' }}>
                            <div className="pulsing-dot"></div>
                            NEXT SESSION · IN {nextSessionHours} HOURS
                        </div>
                    )}
                    <button className="tele-btn-primary" onClick={() => setShowJoinModal(true)}>
                        Start New Session
                    </button>
                </div>
            </div>

            {nextSession && (
                <div className="tele-hero">

                    <div className="tele-hero-content">
                        <div>
                            <div className="tele-hero-time">{nextSession.time}</div>
                            <div className="tele-hero-relative">{nextSessionRelativeDate}</div>
                            
                            <div className="tele-hero-client">
                                {nextSession.owner} <span className="tele-hero-pet">Pet: {nextSession.pet}</span>
                            </div>
                            
                            <div className="tele-hero-fields">
                                <div className="tele-field">
                                    <div className="tele-field-label">Date</div>
                                    <div className="tele-field-val"><i className="far fa-calendar-alt"></i> {nextSession.date}</div>
                                </div>
                                <div className="tele-field">
                                    <div className="tele-field-label">Time</div>
                                    <div className="tele-field-val"><i className="far fa-clock"></i> {nextSession.time}</div>
                                </div>
                                {nextSession.sessionCode && (
                                    <div className="tele-field" style={{cursor: 'pointer'}} onClick={() => handleCopyCode(nextSession.sessionCode)}>
                                        <div className="tele-field-label">Session Code</div>
                                        <div className="tele-field-val"><i className="far fa-copy"></i> {nextSession.sessionCode}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="tele-hero-actions">
                            {nextSession.sessionCode && (
                                <button className="tele-btn primary" onClick={() => {
                                    const url = `https://meet.ffmuc.net/FurEverPawCare-${nextSession.sessionCode!.trim().toUpperCase()}`;
                                    window.open(url, '_blank');
                                }}>
                                    <i className="fas fa-video"></i> Join
                                </button>
                            )}
                            <button className="tele-btn" onClick={(e) => { e.stopPropagation(); handleNotify(nextSession); }} disabled={notifyingId === nextSession.id}>
                                <i className={notifyingId === nextSession.id ? "fas fa-spinner fa-spin" : "fas fa-bell"}></i> Notify
                            </button>
                            <button className="tele-btn" onClick={(e) => { e.stopPropagation(); openRescheduleModal(nextSession); }}>
                                <i className="fas fa-calendar-alt"></i> Shift
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="tele-list-header">
                <div className="tele-list-title">Sessions</div>
                <div className="tele-filters">
                    <button className={`tele-filter-btn ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>
                        All <span style={{opacity: 0.6}}>{teleAppointments.length}</span>
                    </button>
                    <button className={`tele-filter-btn ${activeFilter === 'Today' ? 'active' : ''}`} onClick={() => setActiveFilter('Today')}>
                        Today's <span style={{opacity: 0.6}}>{todaySessions.length}</span>
                    </button>
                    <button className={`tele-filter-btn ${activeFilter === 'Upcoming' ? 'active' : ''}`} onClick={() => setActiveFilter('Upcoming')}>
                        Upcoming <span style={{opacity: 0.6}}>{upcomingSessions.length}</span>
                    </button>
                    <button className={`tele-filter-btn ${activeFilter === 'Past' ? 'active' : ''}`} onClick={() => setActiveFilter('Past')}>
                        Past <span style={{opacity: 0.6}}>{pastSessions.length}</span>
                    </button>
                </div>
            </div>

            {renderList()}

        </div>

        {/* Reschedule Modal */}
        {rescheduleModalOpen && sessionToReschedule && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                <div style={{ background: 'white', padding: '0', borderRadius: '20px', width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'modalFadeIn 0.3s ease-out' }}>
                    {rescheduleStatus === 'form' ? (
                        <>
                            {/* Header */}
                            <div style={{ background: 'linear-gradient(135deg, #2E5E3E 0%, #3a7a50 100%)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <i className="fas fa-calendar-alt" style={{ color: 'white', fontSize: '1.1rem' }}></i>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>Reschedule Session</h3>
                                        <p style={{ margin: '2px 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>Change appointment date & time</p>
                                    </div>
                                </div>
                                <button onClick={closeRescheduleModal} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><i className="fas fa-times"></i></button>
                            </div>

                            <div style={{ padding: '24px 28px' }}>
                                {/* Current Schedule Card */}
                                <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#a0aec0', fontWeight: 700 }}>Current Schedule</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2E5E3E, #48bb78)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{sessionToReschedule.owner?.charAt(0)}</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 600, color: '#2d3748', fontSize: '1rem' }}>{sessionToReschedule.owner} <span style={{ color: '#a0aec0', fontWeight: 'normal' }}>({sessionToReschedule.pet})</span></p>
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '4px' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#718096' }}><i className="far fa-calendar-alt" style={{ marginRight: '5px', color: '#2E5E3E' }}></i>{sessionToReschedule.date}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#718096' }}><i className="far fa-clock" style={{ marginRight: '5px', color: '#2E5E3E' }}></i>{sessionToReschedule.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div style={{ textAlign: 'center', margin: '-5px 0', color: '#2E5E3E' }}>
                                    <i className="fas fa-arrow-down" style={{ fontSize: '1.2rem', opacity: 0.5 }}></i>
                                </div>

                                {/* New Date */}
                                <div style={{ marginTop: '15px', marginBottom: '18px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#4a5568', fontWeight: 600, fontSize: '0.95rem' }}><i className="far fa-calendar-alt" style={{ color: '#2E5E3E' }}></i> Select New Date</label>
                                    <input type="date" value={newDate} onChange={e => { setNewDate(e.target.value); setNewTime(''); }} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '2px solid #e2e8f0', boxSizing: 'border-box', fontSize: '1rem', outline: 'none', transition: '0.2s', color: '#2d3748' }} />
                                </div>

                                {/* New Time Slots */}
                                <div style={{ marginBottom: '22px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#4a5568', fontWeight: 600, fontSize: '0.95rem' }}><i className="far fa-clock" style={{ color: '#2E5E3E' }}></i> Select New Time</label>
                                    {!newDate ? (
                                        <div style={{ color: '#a0aec0', fontSize: '0.9rem', padding: '12px', textAlign: 'center', background: '#f7fafc', borderRadius: '10px', border: '1px dashed #e2e8f0' }}>Please select a date first</div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                            {availableRescheduleSlots.map((slot: any) => (
                                                <button
                                                    type="button"
                                                    key={slot.time}
                                                    disabled={!slot.available && newTime !== slot.time}
                                                    title={!slot.available && newTime !== slot.time ? (!slot.enabled ? 'Disabled' : 'Booked') : ''}
                                                    onClick={() => setNewTime(slot.time)}
                                                    style={{
                                                        padding: '10px 4px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: newTime === slot.time ? 700 : 500, transition: '0.2s',
                                                        border: newTime === slot.time ? '2px solid #2E5E3E' : (slot.available ? '1px solid #e2e8f0' : '1px solid #f7fafc'),
                                                        background: newTime === slot.time ? '#f0fff4' : (slot.available ? 'white' : '#f7fafc'),
                                                        color: newTime === slot.time ? '#2E5E3E' : (slot.available ? '#4a5568' : '#cbd5e0'),
                                                        cursor: (slot.available || newTime === slot.time) ? 'pointer' : 'not-allowed',
                                                        opacity: (slot.available || newTime === slot.time) ? 1 : 0.5,
                                                    }}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Buttons */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={closeRescheduleModal} disabled={isRescheduling} style={{ flex: 1, padding: '13px', background: '#f7fafc', color: '#718096', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, cursor: isRescheduling ? 'not-allowed' : 'pointer', fontSize: '0.95rem', transition: '0.2s' }}>Cancel</button>
                                    <button onClick={confirmReschedule} disabled={!newTime || !newDate || isRescheduling} style={{ flex: 1, padding: '13px', background: (!newTime || !newDate || isRescheduling) ? '#a0aec0' : '#2E5E3E', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: (!newTime || !newDate || isRescheduling) ? 'not-allowed' : 'pointer', fontSize: '0.95rem', transition: '0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                        <i className={isRescheduling ? "fas fa-spinner fa-spin" : "fas fa-check"}></i> {isRescheduling ? 'Rescheduling...' : 'Confirm'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Success State */
                        <div style={{ padding: '40px 28px', textAlign: 'center' }}>
                            <div style={{ width: '70px', height: '70px', margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <i className="fas fa-check" style={{ fontSize: '2rem', color: 'white' }}></i>
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '1.4rem' }}>Rescheduled Successfully!</h3>
                            <p style={{ color: '#718096', marginBottom: '22px', lineHeight: '1.6' }}>The appointment for <strong>{sessionToReschedule.owner}</strong> has been updated.</p>
                            <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '12px', padding: '16px', marginBottom: '22px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Date</p>
                                        <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2E5E3E' }}>{newDate}</p>
                                    </div>
                                    <div style={{ width: '1px', background: '#c6f6d5' }}></div>
                                    <div>
                                        <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Time</p>
                                        <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#2E5E3E' }}>{newTime}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={closeRescheduleModal} style={{ width: '100%', padding: '13px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Done</button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>

    {/* Join Session Modal */}
    {showJoinModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.4rem' }}>Join Telemedicine Session</h3>
                    <button onClick={() => setShowJoinModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#a0aec0' }}><i className="fas fa-times"></i></button>
                </div>
                <p style={{ color: '#718096', marginBottom: '20px' }}>Please enter the session code provided to the patient to start the consultation.</p>
                <input 
                    type="text" 
                    placeholder="e.g. FC-A1B2C3" 
                    value={joinCodeInput}
                    onChange={(e) => { setJoinCodeInput(e.target.value); setJoinError(''); }}
                    style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: joinError ? '2px solid #e53e3e' : '1px solid #cbd5e0', fontSize: '1.1rem', marginBottom: joinError ? '8px' : '20px', boxSizing: 'border-box', outline: 'none' }}
                />
                {joinError && <p style={{ color: '#e53e3e', fontSize: '0.9rem', margin: '0 0 15px 0', fontWeight: '500' }}>{joinError}</p>}
                <button 
                    onClick={handleJoinSession}
                    style={{ width: '100%', background: '#2E5E3E', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Start Call
                </button>
            </div>
        </div>
    )}

    {activeSession && (
        <div style={{ 
            position: 'fixed', 
            ...(isVideoMinimized 
                ? { bottom: '20px', right: '20px', width: '350px', height: '250px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' } 
                : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85%', maxWidth: '1200px', height: '85%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 0 0 9999px rgba(0,0,0,0.75), 0 20px 60px rgba(0,0,0,0.5)' }
            ), 
            background: '#1a202c', zIndex: 9999, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' 
        }}>
            {/* Video Call Header */}
            <div style={{ padding: isVideoMinimized ? '10px' : '20px 30px', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {!isVideoMinimized && (
                        <div style={{ background: '#2E5E3E', padding: '10px 15px', borderRadius: '8px', color: 'white', fontWeight: 'bold', letterSpacing: '1px' }}>
                            {activeSession.sessionCode}
                        </div>
                    )}
                    <div>
                        <h2 style={{ color: 'white', margin: 0, fontSize: isVideoMinimized ? '1rem' : '1.2rem' }}>{isVideoMinimized ? activeSession.owner : `Consultation with ${activeSession.owner}`}</h2>
                        {!isVideoMinimized && <span style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Pet: {activeSession.pet} • {activeSession.time}</span>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => setIsVideoMinimized(!isVideoMinimized)}
                        style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                        title={isVideoMinimized ? "Fullscreen" : "Minimize"}
                    >
                        <i className={`fas ${isVideoMinimized ? 'fa-expand' : 'fa-compress'}`}></i>
                    </button>
                    <button 
                        onClick={() => setActiveSession(null)}
                        style={{ background: '#e53e3e', color: 'white', border: 'none', padding: isVideoMinimized ? '8px 12px' : '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        <i className="fas fa-phone-slash" style={!isVideoMinimized ? {marginRight: '8px'} : {}}></i> {!isVideoMinimized && "End Call"}
                    </button>
                </div>
            </div>

            {/* Video Area */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <iframe
                    src={`https://meet.ffmuc.net/FurEverPawCare-${activeSession.sessionCode?.trim().toUpperCase()}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                ></iframe>
            </div>
        </div>
    )}

    {/* Error Modal */}
    {showErrorModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'modalFadeIn 0.2s ease-out' }}>
                <i className="fas fa-exclamation-circle" style={{ fontSize: '4rem', color: '#e53e3e', marginBottom: '20px' }}></i>
                <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem' }}>Invalid Session Code</h3>
                <p style={{ color: '#718096', marginBottom: '25px', lineHeight: '1.5' }}>The session code you entered does not match any active appointments. Please try again.</p>
                <button 
                    onClick={() => setShowErrorModal(false)}
                    style={{ width: '100%', background: '#2E5E3E', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Try Again
                </button>
            </div>
        </div>
    )}
    {/* Notify User Modal */}
    {notifyModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', padding: '35px', borderRadius: '20px', width: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'modalFadeIn 0.3s ease-out' }}>
                {notifyModal.status === 'sending' && (
                    <>
                        <div style={{ width: '70px', height: '70px', margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg, #2E5E3E 0%, #48bb78 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'pulse 1.5s ease-in-out infinite' }}>
                            <i className="fas fa-paper-plane" style={{ fontSize: '1.8rem', color: 'white' }}></i>
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem' }}>Sending Notification...</h3>
                        <p style={{ color: '#718096', marginBottom: '8px', lineHeight: '1.5' }}>Delivering email reminder to <strong>{notifyModal.session?.owner}</strong></p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '15px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E5E3E', animation: 'bounce 1.4s ease-in-out 0s infinite' }}></span>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E5E3E', animation: 'bounce 1.4s ease-in-out 0.2s infinite' }}></span>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2E5E3E', animation: 'bounce 1.4s ease-in-out 0.4s infinite' }}></span>
                        </div>
                    </>
                )}
                {notifyModal.status === 'success' && (
                    <>
                        <div style={{ width: '70px', height: '70px', margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <i className="fas fa-check" style={{ fontSize: '2rem', color: 'white' }}></i>
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem' }}>Email Sent Successfully!</h3>
                        <p style={{ color: '#718096', marginBottom: '20px', lineHeight: '1.6' }}>A telemedicine session reminder has been sent to:</p>
                        <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '12px', padding: '15px', marginBottom: '20px' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#718096' }}>Recipient</p>
                            <p style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#2d3748', fontWeight: 600 }}>{notifyModal.session?.owner}</p>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#718096' }}>Email Address</p>
                            <p style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#2E5E3E', fontWeight: 600 }}>{notifyModal.email}</p>
                            <div style={{ borderTop: '1px solid #c6f6d5', paddingTop: '12px', marginTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.85rem', color: '#718096' }}><i className="far fa-calendar-alt" style={{ marginRight: '5px' }}></i>{notifyModal.session?.date}</span>
                                <span style={{ fontSize: '0.85rem', color: '#718096' }}><i className="far fa-clock" style={{ marginRight: '5px' }}></i>{notifyModal.session?.time}</span>
                                {notifyModal.session?.sessionCode && <span style={{ fontSize: '0.85rem', color: '#2E5E3E', fontWeight: 600 }}><i className="fas fa-key" style={{ marginRight: '5px' }}></i>{notifyModal.session?.sessionCode}</span>}
                            </div>
                        </div>
                        <button onClick={() => setNotifyModal({ show: false, status: 'sending', session: null })} style={{ width: '100%', background: '#2E5E3E', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Done</button>
                    </>
                )}
                {notifyModal.status === 'error' && (
                    <>
                        <div style={{ width: '70px', height: '70px', margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg, #e53e3e 0%, #fc8181 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <i className="fas fa-times" style={{ fontSize: '2rem', color: 'white' }}></i>
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem' }}>Failed to Send</h3>
                        <p style={{ color: '#718096', marginBottom: '15px', lineHeight: '1.5' }}>Could not send the notification email to <strong>{notifyModal.session?.owner}</strong>.</p>
                        <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '10px', padding: '12px', marginBottom: '20px', textAlign: 'left' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#c53030' }}><i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>{notifyModal.errorMsg}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setNotifyModal({ show: false, status: 'sending', session: null })} style={{ flex: 1, padding: '12px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
                            <button onClick={() => handleNotify(notifyModal.session)} style={{ flex: 1, padding: '12px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Retry</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )}


    {/* View Session Modal */}
    {viewSessionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setViewSessionModal(null)}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.4rem' }}>Session Details</h3>
                    <button onClick={() => setViewSessionModal(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#a0aec0' }}><i className="fas fa-times"></i></button>
                </div>
                
                <div style={{ background: '#f7fafc', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, #1B4D33, #3AB472)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                            {viewSessionModal.owner?.charAt(0)}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 700, color: '#2d3748', fontSize: '1.1rem' }}>{viewSessionModal.owner}</p>
                            <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>Pet: <strong>{viewSessionModal.pet}</strong></p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#a0aec0', textTransform: 'uppercase', fontWeight: 700 }}>Date</p>
                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#2d3748' }}><i className="far fa-calendar-alt" style={{marginRight: '6px', color: '#1B4D33'}}></i>{viewSessionModal.date}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#a0aec0', textTransform: 'uppercase', fontWeight: 700 }}>Time</p>
                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#2d3748' }}><i className="far fa-clock" style={{marginRight: '6px', color: '#1B4D33'}}></i>{viewSessionModal.time}</p>
                        </div>
                        {viewSessionModal.sessionCode && (
                            <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#a0aec0', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Session Code</p>
                                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1B4D33', letterSpacing: '1px' }}>{viewSessionModal.sessionCode}</p>
                                </div>
                                <button onClick={() => handleCopyCode(viewSessionModal.sessionCode)} style={{ background: '#e7f0e8', color: '#1B4D33', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' }}>
                                    <i className="far fa-copy"></i> Copy
                                </button>
                            </div>
                        )}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#a0aec0', textTransform: 'uppercase', fontWeight: 700 }}>Status</p>
                            <span style={{ padding: '6px 12px', background: viewSessionModal.status.toLowerCase() === 'completed' || viewSessionModal.status.toLowerCase() === 'done' ? '#edf2f7' : '#e7f0e8', color: viewSessionModal.status.toLowerCase() === 'completed' || viewSessionModal.status.toLowerCase() === 'done' ? '#4a5568' : '#1b4d33', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                                {viewSessionModal.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    {viewSessionModal.sessionCode && (viewSessionModal.status.toLowerCase() !== 'completed' && viewSessionModal.status.toLowerCase() !== 'done') && (
                        <button onClick={() => {
                            const url = `https://meet.ffmuc.net/FurEverPawCare-${viewSessionModal.sessionCode!.trim().toUpperCase()}`;
                            window.open(url, '_blank');
                        }} style={{ flex: 1, padding: '12px', background: '#1B4D33', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                            <i className="fas fa-video"></i> Join Call
                        </button>
                    )}
                    <button onClick={() => setViewSessionModal(null)} style={{ flex: 1, padding: '12px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )}


    {/* Copy Toast Notification */}
    {copyToast && (
        <div style={{
            position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
            background: '#1B4D33', color: 'white', padding: '14px 28px', borderRadius: '30px',
            boxShadow: '0 10px 25px rgba(27,77,51,0.3)', display: 'flex', alignItems: 'center', gap: '12px',
            zIndex: 10001, animation: 'toastSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), toastFadeOut 0.3s ease-in 2.7s forwards',
            fontWeight: '600', fontSize: '0.95rem'
        }}>
            <i className="fas fa-check-circle" style={{fontSize: '1.2rem', color: '#3AB472'}}></i>
            Session code copied to clipboard!
        </div>
    )}

    <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.85; } }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    `}</style>
    </>
  );
}
