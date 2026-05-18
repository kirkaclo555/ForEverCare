"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBilling } from '../../../hooks/useBilling';
import { useAppointments } from '../../../hooks/useAppointments';
import './appointment.css';

export default function AppointmentPage() {
  const router = useRouter();
  const { addInvoice } = useBilling();
  const { appointments, addAppointment, updateAppointmentStatus, updateAppointmentDetails, deleteAppointment, getAvailableTimeSlots } = useAppointments();
  
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [viewAppointmentDetails, setViewAppointmentDetails] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  
  // Reschedule State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<any>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const availableRescheduleSlots = newDate ? getAvailableTimeSlots(newDate) : [];
  const [searchQuery, setSearchQuery] = useState('');
  
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
  const [referenceNumber, setReferenceNumber] = useState('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [receiptImage, setReceiptImage] = useState('');
  const [appointmentType, setAppointmentType] = useState('inperson');
  const [appointmentPurpose, setAppointmentPurpose] = useState('Check-up');

  const BREEDS: Record<string, string[]> = {
    Dog: ['Golden Retriever', 'Bulldog', 'Poodle', 'German Shepherd', 'Labrador Retriever', 'Beagle', 'Husky', 'Pug', 'Shih Tzu', 'Aspin', 'Other'],
    Cat: ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Sphynx', 'British Shorthair', 'Puspin', 'Other']
  };

  useEffect(() => {
    fetch('/api/users?role=USER')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
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
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

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
    if (!selectedUserId || !selectedPetId || !species || !breed || !appointmentDate || !appointmentTime) {
      setFormError('Please fill in all required fields marked with *');
      return;
    }
    setFormError('');

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
        status: 'pending',
        referenceNumber: referenceNumber || undefined,
        amountPaid: amountPaid === '' ? undefined : Number(amountPaid),
        receiptImage: receiptImage || undefined
    });

    setIsAppointmentModalOpen(false);
    setSelectedUserId('');
    setSelectedPetId('');
    setAppointmentDate('');
    setAppointmentTime('');
    setReferenceNumber('');
    setAmountPaid('');
    setReceiptImage('');
    setSuccessMessage('Appointment saved and pending Invoice generated in Billing Module!');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const updatedApp = await updateAppointmentStatus(id, newStatus);
    if (updatedApp && updatedApp.type === 'telemedicine' && newStatus === 'confirmed') {
        alert(`SMS Successfully Sent to ${updatedApp.owner} at ${updatedApp.contact}:\n\n"Your Telemedicine session is confirmed. Your unique session code is: ${updatedApp.sessionCode}"`);
    }
    setOpenActionMenuId(null);
  };

  const openRescheduleModal = (app: any) => {
    setAppointmentToReschedule(app);
    setNewDate(app.date);
    setNewTime(app.time);
    setRescheduleModalOpen(true);
    setOpenActionMenuId(null);
  };

  const confirmReschedule = () => {
    if (appointmentToReschedule && newDate && newTime) {
      updateAppointmentDetails(appointmentToReschedule.id, { date: newDate, time: newTime });
      setRescheduleModalOpen(false);
      setAppointmentToReschedule(null);
      setSuccessMessage(`Appointment for ${appointmentToReschedule.owner} successfully rescheduled to ${newDate} at ${newTime}.`);
    }
  };

  const closeDropdown = () => setOpenActionMenuId(null);

  const handleDeleteAppointment = (id: string) => {
    setAppointmentToDelete(id);
    setOpenActionMenuId(null);
  };

  const confirmDeleteAppointment = () => {
    if (appointmentToDelete) {
      deleteAppointment(appointmentToDelete);
      setAppointmentToDelete(null);
    }
  };

  const filteredAppointments = appointments.filter(app => {
      const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch = app.owner.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            app.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.contact.includes(searchQuery);
      return matchesStatus && matchesSearch;
  });

  return (
    <>
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }}  onClick={closeDropdown}>
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

            <div style={{ display: 'flex', gap: '15px', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '250px' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}></i>
                    <input 
                        type="text" 
                        placeholder="Search by owner, pet, or contact..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 35px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box' }}
                    />
                </div>
                <button className="add-appointment-btn" onClick={() => { setIsAppointmentModalOpen(true); setFormError(''); }}>
                    <i className="fas fa-plus"></i>
                    New Appointment
                </button>
            </div>
        </div>

        <div className="table-container" style={{ overflow: 'visible' }}>
            <table id="appointmentsTable">
                <thead>
                    <tr>
                        <th>Owner Name</th>
                        <th>Contact Number</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Ref. No</th>
                        <th>Amount Paid</th>
                        <th>Type</th>
                        <th>Purpose of visit</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAppointments.length === 0 ? (
                        <tr>
                            <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                <i className="fas fa-search" style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.5 }}></i>
                                <p>No appointments found matching your search.</p>
                            </td>
                        </tr>
                    ) : (
                        filteredAppointments.map((app) => (
                            <tr key={app.id} onClick={() => setViewAppointmentDetails(app)} style={{cursor: 'pointer'}}>
                                <td>{app.owner}</td>
                                <td>{app.contact}</td>
                                <td>{app.date}</td>
                                <td>{app.time}</td>
                                <td>{app.referenceNumber || 'N/A'}</td>
                                <td>{app.amountPaid !== undefined && app.amountPaid !== null ? `₱${Number(app.amountPaid).toFixed(2)}` : 'N/A'}</td>
                            <td>{app.type === 'telemedicine' ? <span className="status-badge" style={{background:'#EBF8FF', color:'#2B6CB0'}}>Telemedicine</span> : <span className="status-badge" style={{background:'#F0FFF4', color:'#2F855A'}}>In-Person</span>}</td>
                            <td style={{textTransform: 'capitalize'}}>{app.purpose}</td>
                            <td><span className={`status-badge status-${app.status.toLowerCase()}`} style={{textTransform:'capitalize'}}>{app.status}</span></td>
                            <td style={{ position: 'relative' }}>
                                <button className="btn-secondary" style={{padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === app.id ? null : app.id); }}>
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                                {openActionMenuId === app.id && (                                    <div style={{ position: 'absolute', right: '100%', top: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2d3748' }} onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'pending'); }}>Pending</button>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2d3748' }} onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'paid'); }}>Paid</button>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2d3748' }} onClick={(e) => { e.stopPropagation(); handleStatusChange(app.id, 'completed'); }}>Completed</button>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2E5E3E' }} onClick={(e) => { e.stopPropagation(); openRescheduleModal(app); }}>
                                            <i className="fas fa-calendar-alt" style={{marginRight: '8px'}}></i> Reschedule
                                        </button>
                                        <button style={{ padding: '8px 12px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#E53E3E' }} onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(app.id); }}>
                                            <i className="fas fa-trash-alt" style={{marginRight: '8px'}}></i> Delete
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))
                    )}
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
                {formError && (
                    <div style={{ background: '#fff5f5', color: '#c53030', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fed7d7', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: '500', animation: 'modalFadeIn 0.2s ease-out' }}>
                        <i className="fas fa-exclamation-circle" style={{ fontSize: '1.1rem' }}></i> {formError}
                    </div>
                )}
                <form id="appointmentForm" onSubmit={handleSaveAppointment}>
                    <div className="appointment-form-row">
                        <div className="appointment-form-group">
                            <label><i className="fas fa-user"></i> Owner Name *</label>
                            <select className="appointment-form-control" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                                <option value="">-- Select Owner --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="appointment-form-group">
                            <label><i className="fas fa-phone"></i> Contact Number *</label>
                            <input type="text" className="appointment-form-control" value={contactNumber} onChange={e => setContactNumber(e.target.value)} required placeholder="Enter contact number" />
                        </div>
                    </div>

                    <div className="appointment-form-row">
                        <div className="appointment-form-group">
                            <label><i className="fas fa-paw"></i> Pet Name *</label>
                            <select className="appointment-form-control" value={selectedPetId} onChange={e => setSelectedPetId(e.target.value)} required disabled={!selectedUserId}>
                                <option value="">{selectedUserId ? "-- Select Pet --" : "Select an owner first"}</option>
                                {pets.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="appointment-form-group">
                            <label><i className="fas fa-dog"></i> Species *</label>
                            <select className="appointment-form-control" value={species} onChange={e => { setSpecies(e.target.value); setBreed(''); }} required>
                                <option value="">-- Select Species --</option>
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                            </select>
                        </div>
                    </div>

                    <div className="appointment-form-group" style={{marginBottom: '15px'}}>
                        <label><i className="fas fa-paw"></i> Breed *</label>
                        <select className="appointment-form-control" value={breed} onChange={e => setBreed(e.target.value)} required disabled={!species}>
                            <option value="">{species ? "-- Select Breed --" : "Select species first"}</option>
                            {species && BREEDS[species]?.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                            {species && !BREEDS[species] && <option value="Other">Other</option>}
                        </select>
                    </div>

                    <div className="appointment-form-row">
                        <div className="appointment-form-group">
                            <label><i className="fas fa-receipt"></i> Reference Number</label>
                            <input type="text" className="appointment-form-control" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} placeholder="Enter reference number (optional)" />
                        </div>
                        <div className="appointment-form-group">
                            <label><i className="fas fa-money-bill-wave"></i> Amount Paid</label>
                            <input type="number" className="appointment-form-control" value={amountPaid} onChange={e => setAmountPaid(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="0.00 (optional)" min="0" step="0.01" />
                        </div>
                    </div>

                    <div className="appointment-form-group" style={{marginBottom: '15px'}}>
                        <label><i className="fas fa-image"></i> Receipt Image</label>
                        <input type="file" accept="image/*" className="appointment-form-control" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setReceiptImage(reader.result as string);
                                reader.readAsDataURL(file);
                            }
                        }} />
                        {receiptImage && (
                            <div style={{ marginTop: '10px' }}>
                                <img src={receiptImage} alt="Receipt Preview" style={{ maxWidth: '100px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                            </div>
                        )}
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
                                        title={!slot.available ? (!slot.enabled ? 'Disabled by Admin' : 'Already booked') : ''}
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

    {/* Reschedule Modal */}
    {rescheduleModalOpen && appointmentToReschedule && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.4rem' }}>Reschedule Appointment</h3>
                    <button onClick={() => setRescheduleModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#a0aec0' }}><i className="fas fa-times"></i></button>
                </div>
                <p style={{ color: '#718096', marginBottom: '20px' }}>Rescheduling <strong>{appointmentToReschedule.pet}</strong> ({appointmentToReschedule.owner})</p>
                
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
                                    disabled={!slot.available && newTime !== slot.time} // allow keeping current time
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

    {viewAppointmentDetails && (
        <div className="modal" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000}} onClick={() => setViewAppointmentDetails(null)}>
            <div className="modal-content" style={{background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.4rem' }}><i className="fas fa-calendar-check" style={{marginRight: '10px', color: '#2E5E3E'}}></i> Appointment Details</h3>
                    <button onClick={() => setViewAppointmentDetails(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#a0aec0' }}><i className="fas fa-times"></i></button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                    <div>
                        <h4 style={{ color: '#2E5E3E', marginBottom: '10px', fontSize: '1.1rem', borderBottom: '1px solid #edf2f7', paddingBottom: '5px' }}>Owner Information</h4>
                        <p style={{ margin: '5px 0' }}><strong>Name:</strong> {viewAppointmentDetails.owner}</p>
                        <p style={{ margin: '5px 0' }}><strong>Contact:</strong> {viewAppointmentDetails.contact}</p>
                    </div>
                    <div>
                        <h4 style={{ color: '#2E5E3E', marginBottom: '10px', fontSize: '1.1rem', borderBottom: '1px solid #edf2f7', paddingBottom: '5px' }}>Pet Information</h4>
                        <p style={{ margin: '5px 0' }}><strong>Name:</strong> {viewAppointmentDetails.pet}</p>
                        <p style={{ margin: '5px 0' }}><strong>Pet Type:</strong> {viewAppointmentDetails.species}</p>
                        <p style={{ margin: '5px 0' }}><strong>Breed:</strong> {viewAppointmentDetails.breed}</p>
                    </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ color: '#2E5E3E', marginBottom: '10px', fontSize: '1.1rem', borderBottom: '1px solid #edf2f7', paddingBottom: '5px' }}>Appointment Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <p style={{ margin: '5px 0' }}><strong>Date:</strong> {viewAppointmentDetails.date}</p>
                        <p style={{ margin: '5px 0' }}><strong>Time:</strong> {viewAppointmentDetails.time}</p>
                        <p style={{ margin: '5px 0' }}><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{viewAppointmentDetails.type}</span></p>
                        <p style={{ margin: '5px 0' }}><strong>Purpose:</strong> <span style={{ textTransform: 'capitalize' }}>{viewAppointmentDetails.purpose}</span></p>
                        <p style={{ margin: '5px 0' }}><strong>Status:</strong> <span className={`status-badge ${viewAppointmentDetails.status}`} style={{ textTransform: 'capitalize', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', display: 'inline-block', backgroundColor: viewAppointmentDetails.status === 'confirmed' ? '#C6F6D5' : viewAppointmentDetails.status === 'Done' ? '#EBF8FF' : '#FEEBC8', color: viewAppointmentDetails.status === 'confirmed' ? '#22543D' : viewAppointmentDetails.status === 'Done' ? '#2B6CB0' : '#7B341E' }}>{viewAppointmentDetails.status}</span></p>
                    </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ color: '#2E5E3E', marginBottom: '10px', fontSize: '1.1rem', borderBottom: '1px solid #edf2f7', paddingBottom: '5px' }}>Payment Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <p style={{ margin: '5px 0' }}><strong>Reference Number:</strong> {viewAppointmentDetails.referenceNumber || 'N/A'}</p>
                        <p style={{ margin: '5px 0' }}><strong>Amount Paid:</strong> {viewAppointmentDetails.amountPaid ? `₱${viewAppointmentDetails.amountPaid.toFixed(2)}` : 'N/A'}</p>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <p style={{ margin: '5px 0' }}><strong>Receipt Image:</strong></p>
                        {viewAppointmentDetails.receiptImage ? (
                            <div style={{ marginTop: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', maxWidth: '300px' }}>
                                <img src={viewAppointmentDetails.receiptImage} alt="Receipt" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                        ) : (
                            <div style={{ padding: '20px', background: '#f7fafc', borderRadius: '8px', color: '#a0aec0', textAlign: 'center', border: '1px dashed #cbd5e0', marginTop: '10px' }}>
                                <i className="fas fa-image" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                                <p style={{ margin: 0 }}>No receipt uploaded</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button onClick={() => setViewAppointmentDetails(null)} style={{ padding: '10px 20px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
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
    {appointmentToDelete && (
        <div className="modal" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000}}>
            <div className="modal-content" style={{background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FED7D7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <i className="fas fa-exclamation-triangle" style={{ color: '#E53E3E', fontSize: '2rem' }}></i>
                </div>
                <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem' }}>Confirm Deletion</h3>
                <p style={{ color: '#718096', marginBottom: '25px', lineHeight: '1.5' }}>Are you sure you want to delete this appointment?</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setAppointmentToDelete(null)} style={{ flex: 1, padding: '10px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={confirmDeleteAppointment} style={{ flex: 1, padding: '10px', background: '#E53E3E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Yes</button>
                </div>
            </div>
        </div>
    )}

    </>
  );
}
