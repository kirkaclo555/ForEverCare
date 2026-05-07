"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBilling } from '../../../hooks/useBilling';
import { useAppointments } from '../../../hooks/useAppointments';
import './appointment.css';

export default function AppointmentPage() {
  const router = useRouter();
  const { addInvoice } = useBilling();
  const { appointments, addAppointment, updateAppointmentStatus, getAvailableTimeSlots } = useAppointments();
  
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [appointmentType, setAppointmentType] = useState('inperson');
  const [appointmentPurpose, setAppointmentPurpose] = useState('Check-up');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const availableSlots = appointmentDate ? getAvailableTimeSlots(appointmentDate) : [];

  useEffect(() => {
    if (appointmentType === 'telemedicine') {
        setAppointmentPurpose('Consultation');
    } else {
        setAppointmentPurpose('Check-up');
    }
  }, [appointmentType]);

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !appointmentDate || !appointmentTime) return alert('Please fill in required fields');

    const fee = appointmentType === 'telemedicine' ? 800 : 500;
    
    // Add to billing
    addInvoice({
      clientName: ownerName,
      date: appointmentDate,
      items: [{
        id: Date.now().toString(),
        name: appointmentType === 'telemedicine' ? 'Telemedicine Consultation Fee' : 'In-Person Consultation Fee',
        quantity: 1,
        price: fee
      }],
      totalAmount: fee,
      status: 'pending',
      source: 'appointment'
    });

    // Add to local state
    addAppointment({
        owner: ownerName,
        contact: contactNumber || 'N/A',
        pet: petName || 'N/A',
        species: species || 'N/A',
        breed: breed || 'N/A',
        date: appointmentDate,
        time: appointmentTime,
        type: appointmentType,
        purpose: appointmentPurpose,
        status: 'pending'
    });

    setIsAppointmentModalOpen(false);
    setOwnerName('');
    setContactNumber('');
    setPetName('');
    setSpecies('');
    setBreed('');
    setAppointmentDate('');
    setAppointmentTime('');
    alert('Appointment saved and pending Invoice generated in Billing Module!');
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateAppointmentStatus(id, newStatus);
    setOpenActionMenuId(null);
  };

  const closeDropdown = () => setOpenActionMenuId(null);

  return (
    <>
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} id="mainContent" onClick={closeDropdown}>
        <div className="filters-section">
            <div className="filter-group">
                <span className="filter-label"><i className="fas fa-flag" style={{marginRight: "5px"}}></i>Status:</span>
                <select className="filter-select" id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="Done">Done</option>
                </select>
            </div>

            <button className="add-appointment-btn" onClick={() => setIsAppointmentModalOpen(true)}>
                <i className="fas fa-plus"></i>
                New Appointment
            </button>
        </div>

        <div className="table-container" style={{ overflow: 'visible' }}>
            <table id="appointmentsTable">
                <thead>
                    <tr>
                        <th>Owner Name</th>
                        <th>Contact Number</th>
                        <th>Pet Name</th>
                        <th>Species</th>
                        <th>Breed</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Purpose of visit</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.filter(app => statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase()).map((app) => (
                        <tr key={app.id}>
                            <td>{app.owner}</td>
                            <td>{app.contact}</td>
                            <td>{app.pet}</td>
                            <td>{app.species}</td>
                            <td>{app.breed}</td>
                            <td>{app.date}</td>
                            <td>{app.time}</td>
                            <td>{app.type === 'telemedicine' ? <span className="status-badge" style={{background:'#EBF8FF', color:'#2B6CB0'}}>Telemedicine</span> : <span className="status-badge" style={{background:'#F0FFF4', color:'#2F855A'}}>In-Person</span>}</td>
                            <td style={{textTransform: 'capitalize'}}>{app.purpose}</td>
                            <td><span className={`status-badge ${app.status}`} style={{textTransform:'capitalize'}}>{app.status}</span></td>
                            <td style={{ position: 'relative' }}>
                                <button className="btn-secondary" style={{padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === app.id ? null : app.id); }}>
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                                {openActionMenuId === app.id && (
                                    <div style={{ position: 'absolute', right: '100%', top: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2d3748' }} onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'pending'); }}>Pending</button>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2d3748' }} onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'confirmed'); }}>Confirmed</button>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#2d3748' }} onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'Done'); }}>Done</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>

    {isAppointmentModalOpen && (
    <div className="appointment-modal" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="appointment-modal-content" style={{maxHeight: '90vh', overflowY: 'auto'}}>
            <div className="appointment-modal-header">
                <h3><i className="fas fa-calendar-plus" style={{marginRight: "10px", color: "#2E5E3E"}}></i> New Appointment</h3>
                <button className="appointment-modal-close" onClick={() => setIsAppointmentModalOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="appointment-modal-body">
                <form id="appointmentForm" onSubmit={handleSaveAppointment}>
                    <div className="appointment-form-row">
                        <div className="appointment-form-group">
                            <label><i className="fas fa-user"></i> Owner Name *</label>
                            <input type="text" className="appointment-form-control" value={ownerName} onChange={e => setOwnerName(e.target.value)} required placeholder="Enter owner name" />
                        </div>
                        <div className="appointment-form-group">
                            <label><i className="fas fa-phone"></i> Contact Number *</label>
                            <input type="text" className="appointment-form-control" value={contactNumber} onChange={e => setContactNumber(e.target.value)} required placeholder="Enter contact number" />
                        </div>
                    </div>

                    <div className="appointment-form-row">
                        <div className="appointment-form-group">
                            <label><i className="fas fa-paw"></i> Pet Name *</label>
                            <input type="text" className="appointment-form-control" value={petName} onChange={e => setPetName(e.target.value)} required placeholder="Enter pet name" />
                        </div>
                        <div className="appointment-form-group">
                            <label><i className="fas fa-dog"></i> Species *</label>
                            <input type="text" className="appointment-form-control" value={species} onChange={e => setSpecies(e.target.value)} required placeholder="e.g. Dog, Cat" />
                        </div>
                    </div>

                    <div className="appointment-form-group" style={{marginBottom: '15px'}}>
                        <label><i className="fas fa-paw"></i> Breed</label>
                        <input type="text" className="appointment-form-control" value={breed} onChange={e => setBreed(e.target.value)} placeholder="Enter breed (optional)" />
                    </div>

                    <div className="appointment-form-row">
                        <div className="appointment-form-group">
                            <label><i className="fas fa-calendar"></i> Date *</label>
                            <input type="date" className="appointment-form-control" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required />
                        </div>
                        <div className="appointment-form-group">
                            <label><i className="fas fa-video"></i> Appointment Type *</label>
                            <select className="appointment-form-control" value={appointmentType} onChange={e => setAppointmentType(e.target.value)} required>
                                <option value="inperson">In-Person</option>
                                <option value="telemedicine">Telemedicine</option>
                            </select>
                        </div>
                    </div>

                    <div className="appointment-form-group" style={{marginTop: '15px'}}>
                        <label><i className="far fa-clock"></i> Available Time Slots *</label>
                        {!appointmentDate ? (
                            <div style={{color: '#a0aec0', fontSize: '0.9rem', marginTop: '5px'}}>Please select a date first</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
                                {availableSlots.map(slot => (
                                    <button
                                        type="button"
                                        key={slot.time}
                                        disabled={!slot.available}
                                        onClick={() => setAppointmentTime(slot.time)}
                                        style={{
                                            padding: '8px', borderRadius: '6px', border: slot.available ? (appointmentTime === slot.time ? 'none' : '1px solid #e2e8f0') : '1px solid #edf2f7',
                                            background: slot.available ? (appointmentTime === slot.time ? '#2E5E3E' : 'white') : '#f7fafc',
                                            color: slot.available ? (appointmentTime === slot.time ? 'white' : '#2d3748') : '#a0aec0',
                                            cursor: slot.available ? 'pointer' : 'not-allowed',
                                            opacity: slot.available ? 1 : 0.5,
                                            fontWeight: appointmentTime === slot.time ? '600' : 'normal'
                                        }}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="appointment-form-group" style={{marginTop: '15px'}}>
                        <label><i className="fas fa-notes-medical"></i> Purpose of visit *</label>
                        <select className="appointment-form-control" value={appointmentPurpose} onChange={e => setAppointmentPurpose(e.target.value)} required>
                            {appointmentType === 'telemedicine' ? (
                                <option value="Consultation">Consultation</option>
                            ) : (
                                <>
                                    <option value="Check-up">Check-up</option>
                                    <option value="vaccination">Vaccination</option>
                                    <option value="treatment/sick visit">Treatment / Sick Visit</option>
                                    <option value="Deworming">Deworming</option>
                                    <option value="laboratory">Laboratory</option>
                                    <option value="emergency">Emergency</option>
                                    <option value="follow-up">Follow-up</option>
                                    <option value="grooming services">Grooming Services</option>
                                </>
                            )}
                        </select>
                    </div>
                </form>
            </div>
            <div className="appointment-modal-actions">
                <button className="btn btn-secondary" onClick={() => setIsAppointmentModalOpen(false)}>Cancel</button>
                <button type="submit" form="appointmentForm" className="btn btn-primary">Save Appointment</button>
            </div>
        </div>
    </div>
    )}
    </>
  );
}
