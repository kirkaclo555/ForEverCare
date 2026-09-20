"use client";

import React, { useState } from 'react';
import { useAppointments } from '../../../hooks/useAppointments';
import { useNotifications } from '../../../hooks/useNotifications';
import './telemedicine.css';

export default function TelemedicinePage() {
  const { appointments, updateAppointmentDetails, getAvailableTimeSlots } = useAppointments();
  const { addNotification } = useNotifications();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  
  const todayStr = new Date().toISOString().split('T')[0]!;

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
         // Update database details
         await updateAppointmentDetails(sessionToReschedule.id, { date: newDate, time: newTime });

         // Post message to reschedule-notify route
         await fetch(`/api/appointments/${sessionToReschedule.id}/reschedule-notify`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ newDate, newTime })
         });

         addNotification('Session Rescheduled', `Telemedicine session for ${sessionToReschedule.owner} was rescheduled to ${newDate} at ${newTime}.`, 'fas fa-calendar-alt');
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

  const todaySessions = sortSessions(teleAppointments.filter(s => s.date === todayStr && s.status.toLowerCase() === 'paid'));
  const upcomingSessions = sortSessions(teleAppointments.filter(s => s.date > todayStr && s.status.toLowerCase() === 'paid'));
  const pastSessions = sortSessions(teleAppointments.filter(s => s.date < todayStr || s.status.toLowerCase() === 'done' || s.status.toLowerCase() === 'completed'), false);

  const renderSessionCard = (session: any, isPast: boolean) => (
    <div key={session.id} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '25px', marginBottom: '15px', borderRadius: '16px', border: '1px solid rgba(46, 94, 62, 0.1)', background: 'rgba(46, 94, 62, 0.05)', transition: 'all 0.3s ease' }} className="admin-tele-list-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ margin: 0, color: '#2d3748', fontSize: '1.25rem' }}>{session.owner} <span style={{ color: '#718096', fontSize: '1.05rem', fontWeight: 'normal' }}>({session.pet})</span></h4>
            {isPast && (
                 <span style={{ padding: '8px 16px', background: 'rgba(46, 94, 62, 0.1)', color: '#2E5E3E', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600 }}>
                     Completed
                 </span>
            )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#4a5568', fontSize: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="far fa-calendar-alt" style={{ width: '20px', textAlign: 'center', color: '#2E5E3E' }}></i> {session.date}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><i className="far fa-clock" style={{ width: '20px', textAlign: 'center', color: '#2E5E3E' }}></i> {session.time}</span>
            {!isPast && session.sessionCode && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2E5E3E', fontWeight: 600 }}><i className="fas fa-key" style={{ width: '20px', textAlign: 'center' }}></i> {session.sessionCode}</span>
            )}
        </div>

        {!isPast && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                {session.sessionCode && (
                    <button 
                        onClick={() => {
                          const url = `https://meet.ffmuc.net/FurEverPawCare-${session.sessionCode!.trim().toUpperCase()}`;
                          window.open(url, '_blank');
                        }}
                        style={{ flex: 1, padding: '10px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: '0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                        <i className="fas fa-video"></i> Join Call
                    </button>
                )}
                <button 
                    onClick={() => handleNotify(session)}
                    disabled={notifyingId === session.id}
                    style={{ flex: 1, padding: '10px', background: notifyingId === session.id ? '#c6f6d5' : 'rgba(255, 255, 255, 0.5)', color: '#2E5E3E', border: '1px solid rgba(46, 94, 62, 0.2)', borderRadius: '8px', cursor: notifyingId === session.id ? 'wait' : 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: '0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: notifyingId === session.id ? 0.7 : 1 }}
                >
                    <i className={notifyingId === session.id ? "fas fa-spinner fa-spin" : "fas fa-bell"}></i> {notifyingId === session.id ? 'Sending...' : 'Notify'}
                </button>
                <button 
                    onClick={() => openRescheduleModal(session)}
                    style={{ flex: 1, padding: '10px', background: '#ebf8ff', color: '#3182ce', border: '1px solid #bee3f8', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: '0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    <i className="fas fa-calendar-alt"></i> Reschedule
                </button>
            </div>
        )}
    </div>
  );

  return (
    <>
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} >
        <div className="telemedicine-layout" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            
            <div className="telemedicine-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ textAlign: 'left' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2d3748', fontSize: '30px', fontWeight: 'bold', margin: 0, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                        <i className="fas fa-video" style={{ color: '#2E5E3E' }}></i>
                        Telemedicine Bookings
                    </h1>
                    <p style={{ color: '#718096', margin: '4px 0 0 42px', fontSize: '15px' }}>Manage and schedule remote consultations</p>
                </div>
                <button 
                    onClick={() => setShowJoinModal(true)}
                    style={{ background: '#2E5E3E', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(46, 94, 62, 0.2)' }}
                >
                    <i className="fas fa-video"></i> Start New Session
                </button>
            </div>

            <div className="telemedicine-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'start' }}>
                <style>{`
                    .hide-scroll::-webkit-scrollbar { display: none; }
                    .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>

                {/* Today's Sessions Container */}
                <div className="consultations-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '75vh', minHeight: '600px' }}>
                    <h3 style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '20px', marginBottom: '10px', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
                        <i className="fas fa-calendar-day" style={{color: '#2E5E3E', fontSize: '1.5rem'}}></i> Today's Sessions
                    </h3>
                    <div className="hide-scroll" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                        {todaySessions.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a0aec0', gap: '15px' }}>
                                <i className="fas fa-calendar-times" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                                <p style={{ fontSize: '1.1rem', margin: 0 }}>No sessions scheduled for today.</p>
                            </div>
                        ) : (
                            todaySessions.map(session => renderSessionCard(session, false))
                        )}
                    </div>
                </div>

                {/* Upcoming Bookings Container */}
                <div className="consultations-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '75vh', minHeight: '600px' }}>
                    <h3 style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '20px', marginBottom: '10px', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
                        <i className="fas fa-calendar-plus" style={{color: '#2E5E3E', fontSize: '1.5rem'}}></i> Upcoming Bookings
                    </h3>
                    <div className="hide-scroll" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                        {upcomingSessions.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a0aec0', gap: '15px' }}>
                                <i className="fas fa-calendar-check" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                                <p style={{ fontSize: '1.1rem', margin: 0 }}>No upcoming bookings.</p>
                            </div>
                        ) : (
                            upcomingSessions.map(session => renderSessionCard(session, false))
                        )}
                    </div>
                </div>

                {/* Past Sessions Container */}
                <div className="consultations-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '75vh', minHeight: '600px' }}>
                    <h3 style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '20px', marginBottom: '10px', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
                        <i className="fas fa-history" style={{color: '#a0aec0', fontSize: '1.5rem'}}></i> Past Sessions
                    </h3>
                    <div className="hide-scroll" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                        {pastSessions.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a0aec0', gap: '15px' }}>
                                <i className="fas fa-history" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                                <p style={{ fontSize: '1.1rem', margin: 0 }}>No past sessions recorded.</p>
                            </div>
                        ) : (
                            pastSessions.map(session => renderSessionCard(session, true))
                        )}
                    </div>
                </div>

            </div>

        </div>
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

    <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.85; } }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    `}</style>
    </>
  );
}
