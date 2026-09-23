"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppointments, DEFAULT_TIME_SLOTS } from '../../../hooks/useAppointments';
import AppointmentDonutChart from '../../components/AppointmentDonutChart';
import { QuickActionsRow, AlertsFeed, TelemedicineQueue, RevenueTrendChart, FeedbackCarousel, DashboardStats } from '../../components/DashboardWidgets';
import './dashboard.css';

export default function DashboardPage() {
  const router = useRouter();
  const { appointments, timeSlotsData, toggleTimeSlot, initTimeSlotsForDate, getAvailableTimeSlots } = useAppointments();

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showEditSlotsModal, setShowEditSlotsModal] = useState(false);
  const [showViewAllScheduleModal, setShowViewAllScheduleModal] = useState(false);
  
  const defaultSlots = DEFAULT_TIME_SLOTS;

  useEffect(() => {
    // Initialize today on mount
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    initTimeSlotsForDate(dateKey);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);
    
    const dateKey = `${newSelectedDate.getFullYear()}-${String(newSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(newSelectedDate.getDate()).padStart(2, '0')}`;
    initTimeSlotsForDate(dateKey);
  };

  const handleSlotToggle = (timeIndex: number) => {
    if (!selectedDate) return;
    const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    toggleTimeSlot(dateKey, timeIndex);
  };

  const formatDateLabel = (date: Date | null) => {
    if (!date) return "Not selected";
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const selectedDateStr = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '';
  const todaysAppointments = appointments.filter(app => app.date === selectedDateStr && (app.status.toLowerCase() === 'confirmed' || app.status.toLowerCase() === 'done'));

  return (
    <>
    <div className="module-content" >
        <div className="dashboard-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 id="greetingMessage">Good morning, Super Admin!</h1>
              <p id="subGreeting"> </p>
            </div>
            <QuickActionsRow />
        </div>

        <DashboardStats />

        <div className="dashboard-grid">
            <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="calendar-section">
                <div className="section-header">
                    <h2><i className="far fa-calendar-alt" style={{marginRight:"8px"}}></i> <span id="calendarTitle">Calendar Activities</span></h2>
                    <button 
                      className="edit-slots-btn-sm" 
                      onClick={() => setShowEditSlotsModal(true)}
                    >
                      <i className="fas fa-edit"></i> Edit Slots
                    </button>
                </div>

                <div className="calendar-header">
                    <h3 id="currentMonthYear">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="calendar-nav">
                        <button onClick={prevMonth}><i className="fas fa-chevron-left"></i></button>
                        <button onClick={nextMonth}><i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>

                <div className="weekdays">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>

                <div className="calendar-days" id="calendarDaysContainer">
                    {Array.from({ length: getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="calendar-day empty"></div>
                    ))}
                    {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, idx) => {
                      const day = idx + 1;
                      const isSelected = selectedDate && 
                        selectedDate.getDate() === day && 
                        selectedDate.getMonth() === currentDate.getMonth() && 
                        selectedDate.getFullYear() === currentDate.getFullYear();
                      
                      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const hasSlots = timeSlotsData[dateKey] && timeSlotsData[dateKey].some(s => s.enabled);

                      return (
                        <button 
                          key={`day-${day}`} 
                          className={`calendar-day ${isSelected ? 'active' : ''} ${hasSlots ? 'has-slots' : ''}`}
                          onClick={() => handleDateClick(day)}
                        >
                          {day}
                        </button>
                      );
                    })}
                </div>
            </div>
            
            <AlertsFeed />
            </div>

            <div className="right-column">
                <AppointmentDonutChart appointments={appointments} />
            <TelemedicineQueue appointments={appointments} />

                <div className="today-schedule">
                    <div className="section-header">
                        <h2><i className="far fa-clock" style={{marginRight:"8px"}}></i> <span id="scheduleTitle">Schedule for {formatDateLabel(selectedDate)}</span></h2>
                        <button className="view-all-btn" onClick={() => setShowViewAllScheduleModal(true)}><span>View All</span></button>
                    </div>
                    <div className="schedule-list" id="scheduleList">
                        {todaysAppointments.length === 0 ? (
                            <div style={{padding:"20px",textAlign:"center",color:"#a0aec0"}}>
                                <i className="fas fa-calendar-times" style={{fontSize: "2rem", marginBottom: "10px"}}></i>
                                <p>No appointments for this date</p>
                            </div>
                        ) : (
                            todaysAppointments.map(app => (
                                <div key={app.id} className="schedule-row">
                                    <div className="schedule-details">
                                        <div className="schedule-time" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                            {app.time} <span style={{fontWeight: 'normal', color: '#a0aec0'}}>·</span> {app.pet} <span style={{fontWeight: 'normal', color: '#a0aec0'}}>—</span> {app.type}
                                        </div>
                                        <div className="schedule-desc">{app.owner}</div>
                                    </div>
                                    <span className={app.status.toLowerCase() === 'done' ? "badge-done" : "badge-confirmed"} style={app.status.toLowerCase() === 'done' ? {background: '#E2E8F0', color: '#4A5568', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600} : {}}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="time-slots-status-container">
                    <div className="slot-status-header">
                        <i className="fas fa-list-ul"></i>
                        <h4>Time Slots Status <span style={{fontSize:"0.75rem",fontWeight:"normal"}}>(Selected Date: <span id="selectedDateLabel">{formatDateLabel(selectedDate)}</span>)</span></h4>
                    </div>
                    <div className="slots-status-list" id="slotsStatusList">
                        {!selectedDate ? (
                          <div style={{padding:"20px",textAlign:"center",color:"#a0aec0"}}>
                              <i className="fas fa-calendar-day"></i> Select a date on the calendar to view time slots
                          </div>
                        ) : (
                          <div className="time-slot-grid">
                            {selectedDateStr && getAvailableTimeSlots(selectedDateStr).map((slot, idx) => {
                              const isBooked = !slot.available && slot.enabled;
                              return (
                                <div 
                                  key={idx}
                                  className={`time-slot-btn ${slot.available ? 'enabled' : 'disabled'} read-only`}
                                  style={isBooked ? { background: '#e2e8f0', color: '#a0aec0', borderColor: '#cbd5e0' } : {}}
                                  title={isBooked ? "Already Booked" : (!slot.enabled ? "Manually Disabled" : "Available")}
                                >
                                  {slot.time}
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="bottom-grid">
            <RevenueTrendChart />
            <FeedbackCarousel />
        </div>
    </div>

    
    {/* View All Schedule Modal */}
    <div className={`modal ${showViewAllScheduleModal ? 'show' : ''}`} style={{display: showViewAllScheduleModal ? 'flex' : 'none', zIndex: 9999}} onClick={() => setShowViewAllScheduleModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column"}}>
            <div className="modal-header">
                <h3><i className="far fa-clock" style={{marginRight:"10px",color:"#2E5E3E"}}></i> All Schedules for {formatDateLabel(selectedDate)}</h3>
                <button className="modal-close" onClick={() => setShowViewAllScheduleModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body" style={{overflowY: "auto", padding: "20px"}}>
                {todaysAppointments.length === 0 ? (
                    <div style={{padding:"40px",textAlign:"center",color:"#a0aec0"}}>
                        <i className="fas fa-calendar-times" style={{fontSize: "3rem", marginBottom: "15px"}}></i>
                        <p>No confirmed appointments for this date</p>
                    </div>
                ) : (
                    todaysAppointments.map(app => (
                        <div key={app.id} style={{padding: "15px", borderBottom: "1px solid #edf2f7", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", background: "#f7fafc", borderRadius: "12px"}}>
                            <div style={{display: "flex", gap: "15px", alignItems: "center"}}>
                                <div style={{background: "#e6f4ea", color: "#2E5E3E", padding: "10px", borderRadius: "10px", fontWeight: "bold"}}>
                                    {app.time}
                                </div>
                                <div>
                                    <div style={{fontWeight: 600, color: "#2d3748", fontSize: "1.1rem"}}>{app.pet}</div>
                                    <div style={{fontSize: "0.85rem", color: "#718096"}}>Owner: {app.owner} • {app.type}</div>
                                </div>
                            </div>
                            <span style={app.status.toLowerCase() === 'done' ? {background: '#E2E8F0', color: '#4A5568', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600} : {background: "#2E5E3E", color: "white", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600}}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase()}
                            </span>
                        </div>
                    ))
                )}
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => setShowViewAllScheduleModal(false)}>Close</button>
            </div>
        </div>
    </div>


    {/* Edit Slots Modal */}
    <div className={`modal ${showEditSlotsModal ? 'show' : ''}`} style={{display: showEditSlotsModal ? 'flex' : 'none', zIndex: 9999}} onClick={() => setShowEditSlotsModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: "500px"}}>
            <div className="modal-header">
                <h3><i className="fas fa-edit" style={{marginRight:"10px",color:"#2E5E3E"}}></i> Edit Slots for {formatDateLabel(selectedDate)}</h3>
                <button className="modal-close" onClick={() => setShowEditSlotsModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <p style={{marginBottom: "15px", color: "#718096", fontSize: "0.9rem"}}>Click on a time slot to enable or disable it for this date.</p>
                <div className="time-slot-grid">
                    {selectedDateStr && getAvailableTimeSlots(selectedDateStr).map((slot, idx) => {
                        const isBooked = !slot.available && slot.enabled;
                        return (
                        <button 
                            key={idx}
                            onClick={() => !isBooked && handleSlotToggle(idx)}
                            className={`time-slot-btn ${slot.available ? 'enabled' : 'disabled'}`}
                            style={isBooked ? { opacity: 0.6, cursor: 'not-allowed', background: '#e2e8f0', color: '#a0aec0', borderColor: '#cbd5e0' } : {}}
                            title={isBooked ? "Cannot edit a booked slot" : (slot.enabled ? "Enabled" : "Disabled")}
                        >
                            {slot.time} {isBooked && <span style={{fontSize: '0.7rem', display: 'block', marginTop: '2px'}}>(Booked)</span>}
                        </button>
                        );
                    })}
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => setShowEditSlotsModal(false)}>Done</button>
            </div>
        </div>
    </div>

    <div className="modal" id="generalSettingsModal" onClick={() => console.log('if(event.target === this) closeGeneralSettings()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-clinic-medical" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Clinic Information
                </h3>
                <button className="modal-close" onClick={() => console.log('closeGeneralSettings()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="clinicSettingsForm">
                    <div className="form-group">
                        <label><i className="fas fa-clinic-medical"></i> Clinic name</label>
                        <input type="text" className="form-control" id="clinicName"
                            placeholder="e.g., FurEverCare Veterinary" defaultValue="FurEverCare Veterinary Clinic" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-map-marker-alt"></i> Address</label>
                        <input type="text" className="form-control" id="clinicAddress" placeholder="Street, City, ZIP"
                            defaultValue="123 Paws Avenue, Pet City, PC 12345" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-phone-alt"></i> Phone number</label>
                        <input type="tel" className="form-control" id="clinicPhone" placeholder="+1 (555) 123-4567"
                            defaultValue="+1 (555) 123-4567" />
                    </div>
                    <div className="form-group">
                        <label><i className="far fa-clock"></i> Opening hours</label>
                        <input type="text" className="form-control" id="clinicHours"
                            placeholder="e.g., Mon-Fri 9am-6pm, Sat 9am-2pm"
                            defaultValue="Mon-Fri 9am-6pm, Sat 9am-2pm, Sun Closed" />
                    </div>
                </form>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => console.log('closeGeneralSettings()')}>Cancel</button>
                <button className="btn btn-primary" onClick={() => console.log('saveClinicSettings()')}>Save Changes</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="accountSecurityModal" onClick={() => console.log('if(event.target === this) closeAccountSecurity()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-shield-alt" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Account Security</h3>
                <button className="modal-close" onClick={() => console.log('closeAccountSecurity()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="securityForm" onSubmit={() => console.log('event.preventDefault(); updatePassword();')}>
                    <div className="form-group">
                        <label><i className="fas fa-lock"></i> Current password</label>
                        <input type="password" className="form-control" id="currentPassword"
                            placeholder="Enter current password" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-key"></i> New password</label>
                        <input type="password" className="form-control" id="newPassword" placeholder="Enter new password"
                            onKeyUp={() => console.log('validatePassword()')} />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-check-circle"></i> Confirm new password</label>
                        <input type="password" className="form-control" id="confirmPassword"
                            placeholder="Confirm new password" onKeyUp={() => console.log('validatePassword()')} />
                    </div>

                    <div className="password-requirements">
                        <p><i className="fas fa-shield-alt" style={{"marginRight":"8px"}}></i>Password requirements:</p>
                        <div className="requirement-item" id="req-length">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">At least 8 characters</span>
                        </div>
                        <div className="requirement-item" id="req-uppercase">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">One uppercase letter</span>
                        </div>
                        <div className="requirement-item" id="req-number">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">One number</span>
                        </div>
                        <div className="requirement-item" id="req-match">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">Passwords match</span>
                        </div>
                    </div>
                </form>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => console.log('closeAccountSecurity()')}>Cancel</button>
                <button className="btn btn-primary" onClick={() => console.log('updatePassword()')}>Update Password</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="languageModal" onClick={() => console.log('if(event.target === this) closeLanguageSettings()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-globe" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Language Settings</h3>
                <button className="modal-close" onClick={() => console.log('closeLanguageSettings()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <p style={{"color":"#718096","marginBottom":"20px"}}>Select your preferred language</p>

                <div className="language-options">
                    
                    <div className="language-option" id="langEnglish" onClick={() => console.log(`selectLanguage('en')`)}>
                        <div className="language-flag">
                            <i className="fas fa-flag-usa"></i>
                        </div>
                        <div className="language-info">
                            <h4>English</h4>
                            <div className="language-description">US English</div>
                        </div>
                        <div className="language-check" id="checkEnglish">
                            <i className="fas fa-check"></i>
                        </div>
                    </div>

                    
                    <div className="language-option" id="langFilipino" onClick={() => console.log(`selectLanguage('fil')`)}>
                        <div className="language-flag">
                            <i className="fas fa-flag"></i>
                        </div>
                        <div className="language-info">
                            <h4>Filipino</h4>
                            <div className="language-description">Wikang Filipino</div>
                        </div>
                        <div className="language-check" id="checkFilipino">
                            <i className="fas fa-check"></i>
                        </div>
                    </div>
                </div>

                <div style={{"marginTop":"20px","padding":"15px","background":"#f7fafc","borderRadius":"16px"}}>
                    <p style={{"color":"#4a5568","fontSize":"0.9rem"}}>
                        <i className="fas fa-info-circle" style={{"color":"#2E5E3E","marginRight":"8px"}}></i>
                        <span id="languagePreview">Current language: English</span>
                    </p>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => console.log('closeLanguageSettings()')}>Cancel</button>
                <button className="btn btn-primary" onClick={() => console.log('saveLanguageSettings()')}>Apply Changes</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="communityRulesModal" onClick={() => console.log('if(event.target === this) closeCommunityRules()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-gavel" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Community Rules</h3>
                <button className="modal-close" onClick={() => console.log('closeCommunityRules()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <div className="rules-container">
                    
                    <div className="rules-section dos">
                        <h4><i className="fas fa-check-circle"></i> Do's</h4>
                        <ul className="rules-list dos">
                            <li><i className="fas fa-check-circle"></i> Provide accurate pet information.</li>
                            <li><i className="fas fa-check-circle"></i> Arrive on time for appointments.</li>
                            <li><i className="fas fa-check-circle"></i> Use telemedicine properly.</li>
                            <li><i className="fas fa-check-circle"></i> Follow veterinarian instructions.</li>
                            <li><i className="fas fa-check-circle"></i> Communicate respectfully.</li>
                            <li><i className="fas fa-check-circle"></i> Provide accurate pet information.</li>
                            <li><i className="fas fa-check-circle"></i> Arrive on time for appointments.</li>
                            <li><i className="fas fa-check-circle"></i> Use telemedicine properly.</li>
                            <li><i className="fas fa-check-circle"></i> Follow veterinarian instructions.</li>
                            <li><i className="fas fa-check-circle"></i> Communicate respectfully.</li>
                        </ul>
                    </div>

                    
                    <div className="rules-section donts">
                        <h4><i className="fas fa-times-circle"></i> Don'ts</h4>
                        <ul className="rules-list donts">
                            <li><i className="fas fa-times-circle"></i> Do not provide false information.</li>
                            <li><i className="fas fa-times-circle"></i> Do not use abusive language.</li>
                            <li><i className="fas fa-times-circle"></i> Do not share your account.</li>
                            <li><i className="fas fa-times-circle"></i> Do not book fake appointments.</li>
                            <li><i className="fas fa-times-circle"></i> Do not misuse telemedicine.</li>
                        </ul>
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="btn btn-primary" onClick={() => console.log('closeCommunityRules()')}>Got it</button>
                </div>
            </div>
        </div>
    </div>

    
    <div className="modal" id="appointmentsModal" onClick={() => console.log('if(event.target === this) closeAppointmentsModal()')}>
        <div className="modal-content" style={{"maxWidth":"800px"}}>
            <div className="modal-header">
                <h3><i className="fas fa-calendar-check" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Today's
                    Appointments</h3>
                <button className="modal-close" onClick={() => console.log('closeAppointmentsModal()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <div className="appointments-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Patient Name</th>
                                <th>Owner</th>
                                <th>Doctor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="empty-state">
                                <td colSpan={5}>
                                    <div className="empty-message">
                                        <i className="fas fa-calendar-times"
                                            style={{"fontSize":"2rem","color":"#a0aec0","marginBottom":"10px"}}></i>
                                        <p>No appointments for today.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => console.log('closeAppointmentsModal()')}>Close</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="consultationsModal" onClick={() => console.log('if(event.target === this) closeConsultationsModal()')}>
        <div className="modal-content" style={{"maxWidth":"800px"}}>
            <div className="modal-header">
                <h3><i className="fas fa-clock" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Pending Consultations
                </h3>
                <button className="modal-close" onClick={() => console.log('closeConsultationsModal()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <div className="consultations-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Owner</th>
                                <th>Doctor</th>
                                <th>Scheduled Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="empty-state">
                                <td colSpan={5}>
                                    <div className="empty-message">
                                        <i className="fas fa-user-clock"
                                            style={{"fontSize":"2rem","color":"#a0aec0","marginBottom":"10px"}}></i>
                                        <p>No pending consultations.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => console.log('closeConsultationsModal()')}>Close</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="revenueModal" onClick={() => console.log('if(event.target === this) closeRevenueModal()')}>
        <div className="modal-content" style={{"maxWidth":"900px"}}>
            <div className="modal-header">
                <h3><i className="fas fa-dollar-sign" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Revenue Overview
                </h3>
                <button className="modal-close" onClick={() => console.log('closeRevenueModal()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <div className="revenue-charts">
                    
                    <div className="chart-section">
                        <h4>Today's Revenue</h4>
                        <div className="chart-container">
                            <canvas id="todayRevenueChart" width="400" height="200"></canvas>
                        </div>
                    </div>

                    
                    <div className="chart-section">
                        <h4>Monthly Revenue</h4>
                        <div className="chart-container">
                            <canvas id="monthlyRevenueChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => console.log('closeRevenueModal()')}>Close</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="patientListModal" onClick={() => console.log('if(event.target === this) closePatientListModal()')}>
        <div className="modal-content" style={{"maxWidth":"1000px"}}>
            <div className="modal-header">
                <h3><i className="fas fa-users" style={{"marginRight":"10px","color":"#2E5E3E"}}></i>Pet Records</h3>
                <button className="modal-close" onClick={() => console.log('closePatientListModal()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                
                <div className="search-container" style={{"marginBottom":"20px"}}>
                    <i className="fas fa-search"></i>
                    <input type="text" id="patientSearchInput" placeholder="Search patients by name or owner..." onKeyUp={() => console.log('searchPatients()')} />
                </div>
                
                
                <div className="patient-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Pet Name</th>
                                <th>Owner Name</th>
                                <th>Species</th>
                                <th>Breed</th>
                                <th>Age</th>
                                <th>Contact Number</th>
                            </tr>
                        </thead>
                        <tbody id="patientListTableBody">
                            
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => console.log('closePatientListModal()')}>Close</button>
            </div>
        </div>
    </div>

    
    <div id="toast"></div>

        
    <div className="modal" id="viewAllAppointmentsModal" onClick={() => console.log('if(event.target === this) closeViewAllAppointmentsModal()')}>
        <div className="modal-content" style={{"maxWidth":"800px"}}>
            <div className="modal-header">
                <h3><i className="fas fa-calendar-check" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Appointments for <span id="viewAllModalDate"></span></h3>
                <button className="modal-close" onClick={() => console.log('closeViewAllAppointmentsModal()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <div id="viewAllAppointmentsList" style={{"maxHeight":"500px","overflowY":"auto"}}></div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => console.log('closeViewAllAppointmentsModal()')}>Close</button>
            </div>
        </div>
    </div>

    
    </>
  );
}
