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

  const handleNotify = (clientName: string) => {
    alert(`Notification sent to ${clientName} regarding their telemedicine schedule.`);
  };

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const availableRescheduleSlots = newDate ? getAvailableTimeSlots(newDate) : [];

  const openRescheduleModal = (session: any) => {
    setSessionToReschedule(session);
    setNewDate(session.date);
    setNewTime(session.time);
    setRescheduleModalOpen(true);
  };

  const confirmReschedule = () => {
    if (sessionToReschedule && newDate && newTime) {
       updateAppointmentDetails(sessionToReschedule.id, { date: newDate, time: newTime });
       addNotification('Session Rescheduled', `Telemedicine session for ${sessionToReschedule.owner} was rescheduled to ${newDate} at ${newTime}.`, 'fas fa-calendar-alt');
       setRescheduleModalOpen(false);
       setSessionToReschedule(null);
       alert(`Appointment for ${sessionToReschedule.owner} successfully rescheduled to ${newDate} at ${newTime}.`);
    }
  };

  const handleJoinSession = () => {
    if (!joinCodeInput.trim()) {
      setJoinError('Please enter a session code before starting.');
      return;
    }
    setJoinError('');

    const session = appointments.find(app => app.sessionCode === joinCodeInput);
    if (session) {
       setActiveSession(session);
       setShowJoinModal(false);
       setJoinCodeInput('');
       setIsVideoMinimized(false);
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

  const teleAppointments = appointments.filter(app => app.type === 'telemedicine' && (app.status.toLowerCase() === 'confirmed' || app.status.toLowerCase() === 'done'));

  const todaySessions = sortSessions(teleAppointments.filter(s => s.date === todayStr && s.status.toLowerCase() !== 'done'));
  const upcomingSessions = sortSessions(teleAppointments.filter(s => s.date > todayStr && s.status.toLowerCase() !== 'done'));
  const pastSessions = sortSessions(teleAppointments.filter(s => s.date < todayStr || s.status.toLowerCase() === 'done'), false);

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
                <button 
                    onClick={() => handleNotify(session.owner)}
                    style={{ flex: 1, padding: '10px', background: 'rgba(255, 255, 255, 0.5)', color: '#2E5E3E', border: '1px solid rgba(46, 94, 62, 0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: '0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    <i className="fas fa-bell"></i> Notify
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
            
            <div className="telemedicine-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2d3748', fontSize: '2rem', margin: 0 }}>
                        <i className="fas fa-video" style={{ color: '#2E5E3E', background: 'rgba(46, 94, 62, 0.1)', padding: '12px', borderRadius: '50%' }}></i>
                        Telemedicine Bookings
                    </h2>
                    <p style={{ color: '#718096', margin: '10px 0 0 0', fontSize: '1.1rem' }}>Manage and schedule remote consultations</p>
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
                <div style={{ width: isVideoMinimized ? '100%' : '80%', height: isVideoMinimized ? '100%' : '80%', background: '#2d3748', borderRadius: isVideoMinimized ? '0' : '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                    {/* Mock Remote User Video */}
                    <div style={{ textAlign: 'center', color: '#718096' }}>
                        <i className="fas fa-user-circle" style={{ fontSize: isVideoMinimized ? '4rem' : '8rem', marginBottom: isVideoMinimized ? '10px' : '20px' }}></i>
                        {!isVideoMinimized && <p style={{ fontSize: '1.2rem' }}>Waiting for {activeSession.owner} to join...</p>}
                    </div>

                    {/* Mock Local User Video */}
                    <div style={{ position: 'absolute', bottom: isVideoMinimized ? '10px' : '20px', right: isVideoMinimized ? '10px' : '20px', width: isVideoMinimized ? '80px' : '200px', height: isVideoMinimized ? '60px' : '150px', background: '#4a5568', borderRadius: '12px', border: '2px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#a0aec0' }}>
                        <i className="fas fa-user" style={{ fontSize: isVideoMinimized ? '1.5rem' : '3rem' }}></i>
                    </div>
                </div>
            </div>

            {/* Video Controls */}
            {!isVideoMinimized && (
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', gap: '20px', background: 'rgba(0,0,0,0.3)' }}>
                    <button style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                        <i className="fas fa-microphone"></i>
                    </button>
                    <button style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                        <i className="fas fa-video"></i>
                    </button>
                    <button style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                        <i className="fas fa-comment"></i>
                    </button>
                </div>
            )}
        </div>
    )}

    {/* Reschedule Modal */}
    {rescheduleModalOpen && sessionToReschedule && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.4rem' }}>Reschedule Appointment</h3>
                    <button onClick={() => setRescheduleModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#a0aec0' }}><i className="fas fa-times"></i></button>
                </div>
                <p style={{ color: '#718096', marginBottom: '20px' }}>Rescheduling session for <strong>{sessionToReschedule.owner}</strong></p>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 'bold' }}>New Date</label>
                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
                </div>
                
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: 'bold' }}>New Time</label>
                    {!newDate ? (
                        <div style={{color: '#a0aec0', fontSize: '0.9rem', marginTop: '5px'}}>Please select a date first</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' }}>
                            {availableRescheduleSlots.map((slot: any) => (
                                <button
                                    type="button"
                                    key={slot.time}
                                    disabled={!slot.available && newTime !== slot.time}
                                    title={!slot.available && newTime !== slot.time ? (!slot.enabled ? 'Disabled by Admin' : 'Already booked') : ''}
                                    onClick={() => setNewTime(slot.time)}
                                    style={{
                                        padding: '8px', borderRadius: '6px', border: (slot.available || newTime === slot.time) ? (newTime === slot.time ? 'none' : '1px solid #e2e8f0') : '1px solid #edf2f7',
                                        background: (slot.available || newTime === slot.time) ? (newTime === slot.time ? '#2E5E3E' : 'white') : '#f7fafc',
                                        color: (slot.available || newTime === slot.time) ? (newTime === slot.time ? 'white' : '#2d3748') : '#a0aec0',
                                        cursor: (slot.available || newTime === slot.time) ? 'pointer' : 'not-allowed',
                                        opacity: (slot.available || newTime === slot.time) ? 1 : 0.5,
                                        fontWeight: newTime === slot.time ? '600' : 'normal'
                                    }}
                                >
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setRescheduleModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={confirmReschedule} disabled={!newTime} style={{ flex: 1, padding: '12px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: !newTime ? 'not-allowed' : 'pointer', opacity: !newTime ? 0.5 : 1 }}>Confirm</button>
                </div>
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
    </>
  );
}
