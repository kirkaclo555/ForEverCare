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
  const [successMessage, setSuccessMessage] = useState('');
  
  // Database-driven states
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [appointmentType, setAppointmentType] = useState('inperson');
  const [appointmentPurpose, setAppointmentPurpose] = useState('Check-up');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const BREEDS: Record<string, string[]> = {
    Dog: ['Golden Retriever', 'Bulldog', 'Poodle', 'German Shepherd', 'Labrador Retriever', 'Beagle', 'Husky', 'Pug', 'Shih Tzu', 'Aspin', 'Other'],
    Cat: ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Sphynx', 'British Shorthair', 'Puspin', 'Other']
  };

  useEffect(() => {
    // Fetch users for the dropdown
    fetch('/api/users?role=USER')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Fetch pets when a user is selected
    if (selectedUserId) {
      const selectedUser = users.find(u => u.id === selectedUserId);
      if (selectedUser) {
        setContactNumber(selectedUser.phoneNumber || '');
      }
      
      fetch(`/api/pets?userId=${selectedUserId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPets(data);
          }
        })
        .catch(console.error);
    } else {
      setPets([]);
      setSelectedPetId('');
      setContactNumber('');
      setSpecies('');
      setBreed('');
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    // Auto-fill species and breed when a pet is selected
    if (selectedPetId) {
      const selectedPet = pets.find(p => p.id === selectedPetId);
      if (selectedPet) {
        setSpecies(selectedPet.species || '');
        setBreed(selectedPet.breed || '');
      }
    } else {
      setSpecies('');
      setBreed('');
    }
  }, [selectedPetId, pets]);

  const availableSlots = appointmentDate ? getAvailableTimeSlots(appointmentDate) : [];

  useEffect(() => {
    if (appointmentType === 'telemedicine') {
        setAppointmentPurpose('Consultation');
    } else {
        setAppointmentPurpose('Check-up');
    }
  }, [appointmentType]);

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!selectedUserId) newErrors.ownerId = 'Owner is required';
    if (!selectedPetId) newErrors.petId = 'Pet is required';
    if (!species) newErrors.species = 'Species is required';
    if (!breed) newErrors.breed = 'Breed is required';
    if (!appointmentDate) newErrors.appointmentDate = 'Date is required';
    if (!appointmentTime) newErrors.appointmentTime = 'Time is required';

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setErrors({});

    const fee = appointmentType === 'telemedicine' ? 800 : 500;
    const selectedUser = users.find(u => u.id === selectedUserId);

    
    // Add to billing
    addInvoice({
      clientName: selectedUser?.fullName || 'Unknown',
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

    // Save to DB via API
    await addAppointment({
        ownerId: selectedUserId,
        petId: selectedPetId,
        date: appointmentDate,
        time: appointmentTime,
        type: appointmentType,
        purpose: appointmentPurpose,
        status: 'pending'
    });

    setIsAppointmentModalOpen(false);
    setSelectedUserId('');
    setSelectedPetId('');
    setSpecies('');
    setBreed('');
    setAppointmentDate('');
    setAppointmentTime('');
    setErrors({});
    setSuccessMessage('Appointment saved and pending Invoice generated in Billing Module!');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateAppointmentStatus(id, newStatus);
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
                    <option value="paid">Paid</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <button className="add-appointment-btn" onClick={() => { setIsAppointmentModalOpen(true); setErrors({}); }}>
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
                            <td><span className={`status-badge status-${app.status.toLowerCase()}`} style={{textTransform:'capitalize'}}>{app.status}</span></td>
                            <td style={{ position: 'relative' }}>
                                <button className="btn-secondary" style={{padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === app.id ? null : app.id); }}>
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                                {openActionMenuId === app.id && (
                                    <div style={{ position: 'absolute', right: '100%', top: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2d3748' }} onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'pending'); }}>Pending</button>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2d3748' }} onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'paid'); }}>Paid</button>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#2d3748' }} onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'completed'); }}>Completed</button>
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
                <button className="appointment-modal-close" onClick={() => { setIsAppointmentModalOpen(false); setErrors({}); }}><i className="fas fa-times"></i></button>
            </div>
            <div className="appointment-modal-body">
                <form id="appointmentForm" onSubmit={handleSaveAppointment}>
                    <div className="appointment-form-row">
                        <div className="appointment-form-group">
                            <label><i className="fas fa-user"></i> Owner Name *</label>
                            <select className="appointment-form-control" style={errors.ownerId ? {borderColor: '#e53e3e'} : {}} value={selectedUserId} onChange={e => { setSelectedUserId(e.target.value); if(errors.ownerId) setErrors({...errors, ownerId: ''}); }}>
                                <option value="">-- Select Owner --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                                ))}
                            </select>
                            {errors.ownerId && <span style={{color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px', display: 'block'}}>{errors.ownerId}</span>}
                        </div>
                        <div className="appointment-form-group">
                            <label><i className="fas fa-phone"></i> Contact Number *</label>
                            <input type="text" className="appointment-form-control" style={errors.contactNumber ? {borderColor: '#e53e3e'} : {}} value={contactNumber} onChange={e => { setContactNumber(e.target.value); if(errors.contactNumber) setErrors({...errors, contactNumber: ''}); }} placeholder="Enter contact number" />
                            {errors.contactNumber && <span style={{color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px', display: 'block'}}>{errors.contactNumber}</span>}
                        </div>
                    </div>

                    <div className="appointment-form-row">
                        <div className="appointment-form-group">
                            <label><i className="fas fa-paw"></i> Pet Name *</label>
                            <select className="appointment-form-control" style={errors.petId ? {borderColor: '#e53e3e'} : {}} value={selectedPetId} onChange={e => { setSelectedPetId(e.target.value); if(errors.petId) setErrors({...errors, petId: ''}); }} disabled={!selectedUserId}>
                                <option value="">{selectedUserId ? "-- Select Pet --" : "Select an owner first"}</option>
                                {pets.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.petId && <span style={{color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px', display: 'block'}}>{errors.petId}</span>}
                        </div>
                        <div className="appointment-form-group">
                            <label><i className="fas fa-dog"></i> Species *</label>
                            <select className="appointment-form-control" style={errors.species ? {borderColor: '#e53e3e'} : {}} value={species} onChange={e => { setSpecies(e.target.value); setBreed(''); if(errors.species) setErrors({...errors, species: ''}); }}>
                                <option value="">-- Select Species --</option>
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                            </select>
                            {errors.species && <span style={{color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px', display: 'block'}}>{errors.species}</span>}
                        </div>
                    </div>

                    <div className="appointment-form-group" style={{marginBottom: '15px'}}>
                        <label><i className="fas fa-paw"></i> Breed *</label>
                        <select className="appointment-form-control" style={errors.breed ? {borderColor: '#e53e3e'} : {}} value={breed} onChange={e => { setBreed(e.target.value); if(errors.breed) setErrors({...errors, breed: ''}); }} disabled={!species}>
                            <option value="">{species ? "-- Select Breed --" : "Select species first"}</option>
                            {species && BREEDS[species]?.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                            {species && !BREEDS[species] && <option value="Other">Other</option>}
                        </select>
                        {errors.breed && <span style={{color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px', display: 'block'}}>{errors.breed}</span>}
                    </div>

                    <div className="appointment-form-row">
                        <div className="appointment-form-group">
                            <label><i className="fas fa-calendar"></i> Date *</label>
                            <input type="date" className="appointment-form-control" style={errors.appointmentDate ? {borderColor: '#e53e3e'} : {}} value={appointmentDate} onChange={e => { setAppointmentDate(e.target.value); if(errors.appointmentDate) setErrors({...errors, appointmentDate: ''}); }} />
                            {errors.appointmentDate && <span style={{color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px', display: 'block'}}>{errors.appointmentDate}</span>}
                        </div>
                        <div className="appointment-form-group">
                            <label><i className="fas fa-video"></i> Appointment Type *</label>
                            <select className="appointment-form-control" value={appointmentType} onChange={e => setAppointmentType(e.target.value)}>
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
                            <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
                                {availableSlots.map(slot => (
                                    <button
                                        type="button"
                                        key={slot.time}
                                        disabled={!slot.available}
                                        onClick={() => { setAppointmentTime(slot.time); if(errors.appointmentTime) setErrors({...errors, appointmentTime: ''}); }}
                                        style={{
                                            padding: '8px', borderRadius: '6px', border: slot.available ? (appointmentTime === slot.time ? 'none' : (errors.appointmentTime ? '1px solid #e53e3e' : '1px solid #e2e8f0')) : '1px solid #edf2f7',
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
                            {errors.appointmentTime && <span style={{color: '#e53e3e', fontSize: '0.8rem', marginTop: '4px', display: 'block'}}>{errors.appointmentTime}</span>}
                            </>
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
                <button className="btn btn-secondary" type="button" onClick={() => { setIsAppointmentModalOpen(false); setErrors({}); }}>Cancel</button>
                <button type="submit" form="appointmentForm" className="btn btn-primary">Save Appointment</button>
            </div>
        </div>
    </div>
    )}

    {successMessage && (
        <div className="modal" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000}}>
            <div className="modal-content" style={{background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#C6F6D5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <i className="fas fa-check" style={{ color: '#2E5E3E', fontSize: '2rem' }}></i>
                </div>
                <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem' }}>Success!</h3>
                <p style={{ color: '#718096', marginBottom: '25px', lineHeight: '1.5' }}>{successMessage}</p>
                <button onClick={() => setSuccessMessage('')} style={{ padding: '10px 30px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', width: '100%' }}>OK</button>
            </div>
        </div>
    )}

    </>
  );
}
