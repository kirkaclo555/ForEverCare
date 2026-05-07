"use client";

import React, { useState } from 'react';
import { useAppointments } from '../../../hooks/useAppointments';
import './telemedicine.css';

export default function TelemedicinePage() {
  const { appointments, updateAppointmentStatus, updateAppointmentDetails } = useAppointments();
  
  const todayStr = new Date().toISOString().split('T')[0]!;

  const handleNotify = (clientName: string) => {
    alert(`Notification sent to ${clientName} regarding their telemedicine schedule.`);
  };

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const openRescheduleModal = (session: any) => {
    setSessionToReschedule(session);
    setNewDate(session.date);
    setNewTime(session.time);
    setRescheduleModalOpen(true);
  };

  const confirmReschedule = () => {
    if (sessionToReschedule && newDate && newTime) {
       updateAppointmentDetails(sessionToReschedule.id, { date: newDate, time: newTime });
       setRescheduleModalOpen(false);
       setSessionToReschedule(null);
       alert(`Appointment for ${sessionToReschedule.owner} successfully rescheduled to ${newDate} at ${newTime}.`);
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

  const todaySessions = sortSessions(teleAppointments.filter(s => s.date === todayStr && s.status.toLowerCase() !== 'done'));
  const upcomingSessions = sortSessions(teleAppointments.filter(s => s.date > todayStr && s.status.toLowerCase() !== 'done'));
  const pastSessions = sortSessions(teleAppointments.filter(s => s.date < todayStr || s.status.toLowerCase() === 'done'), false);

  const renderSessionListItem = (session: any, isPast: boolean) => (
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
                    style={{ flex: 1, padding: '10px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: '0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    <i className="fas fa-calendar-alt"></i> Reschedule
                </button>
            </div>
        )}
    </div>
  );

  return (
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} id="mainContent">
        <div className="telemedicine-layout" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            
            <div className="telemedicine-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ textAlign: 'left' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2d3748', fontSize: '2rem', margin: 0 }}>
                        <i className="fas fa-video" style={{ color: '#2E5E3E', background: 'rgba(46, 94, 62, 0.1)', padding: '12px', borderRadius: '50%' }}></i>
                        Telemedicine Administration
                    </h2>
                    <p style={{ color: '#718096', margin: '10px 0 0 0', fontSize: '1.1rem' }}>Manage schedules and notify clients</p>
                </div>
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
                            todaySessions.map(session => renderSessionListItem(session, false))
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
                            upcomingSessions.map(session => renderSessionListItem(session, false))
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
                            pastSessions.map(session => renderSessionListItem(session, true))
                        )}
                    </div>
                </div>
            </div>

        </div>

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
                        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setRescheduleModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={confirmReschedule} style={{ flex: 1, padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Confirm</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
