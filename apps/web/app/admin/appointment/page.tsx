"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBilling } from '../../../hooks/useBilling';
import { useAppointments } from '../../../hooks/useAppointments';
import './appointment.css';

const formatDateDisplay = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
};

const formatRefNumber = (ref?: string) => {
  if (!ref || ref === 'N/A') return '—';
  if (ref.length <= 11) return ref;
  return `${ref.slice(0, 5)}…${ref.slice(-4)}`;
};

const getStatusBadgeConfig = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'paid') {
    return { label: 'Verified', bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' };
  }
  if (s === 'pending') {
    return { label: 'Pending', bg: '#fffbeb', color: '#92400e', border: '#fde68a' };
  }
  if (s === 'completed') {
    return { label: 'Completed', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
  }
  if (s === 'declined') {
    return { label: 'Declined', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' };
  }
  if (s === 'cancelled') {
    return { label: 'Cancelled', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' };
  }
  return { label: status || 'Pending', bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
};

export default function AppointmentPage() {
  const router = useRouter();
  const { addInvoice } = useBilling();
  const { appointments, addAppointment, updateAppointmentStatus, getAvailableTimeSlots } = useAppointments();
  
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [viewAppointmentDetails, setViewAppointmentDetails] = useState<any>(null);
  const [previewReceiptImage, setPreviewReceiptImage] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Database-driven states
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [customPetName, setCustomPetName] = useState('');
  const [isTypingCustomPet, setIsTypingCustomPet] = useState(false);
  
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
  const [appointmentToDecline, setAppointmentToDecline] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [appointmentToArchive, setAppointmentToArchive] = useState<string | null>(null);
  const [appointmentToMarkPaid, setAppointmentToMarkPaid] = useState<string | null>(null);
  const [appointmentToMarkCompleted, setAppointmentToMarkCompleted] = useState<string | null>(null);
  const [isProcessingStatus, setIsProcessingStatus] = useState(false);

  // Pricing configuration states
  const [inpersonPrice, setInpersonPrice] = useState(500);
  const [telemedicinePrice, setTelemedicinePrice] = useState(800);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState('');
  const [isPricingUpdating, setIsPricingUpdating] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const BREEDS: Record<string, string[]> = {
    Dog: ['Golden Retriever', 'Bulldog', 'Poodle', 'German Shepherd', 'Labrador Retriever', 'Beagle', 'Husky', 'Pug', 'Shih Tzu', 'Aspin', 'Other'],
    Cat: ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Sphynx', 'British Shorthair', 'Puspin', 'Other']
  };

  const fetchUserPets = async (userId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/pets?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.name || p.petName || 'Unnamed Pet',
            species: p.species || 'Dog',
            breed: p.breed || 'Other'
          }));
          setPets(mapped);
          const firstPet = mapped[0];
          if (mapped.length === 1 && firstPet) {
            setSelectedPetId(firstPet.id);
            setSpecies(firstPet.species || 'Dog');
            setBreed(firstPet.breed || 'Other');
            setIsTypingCustomPet(false);
          } else if (mapped.length === 0) {
            setIsTypingCustomPet(true);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching pets for user:', err);
    }
  };

  useEffect(() => {
    // Fetch users for the dropdown
    fetch('/api/users?role=USER')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
        } else {
          fetch('/api/users')
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setUsers(d); });
        }
      })
      .catch(console.error);

    // Fetch dynamic prices
    fetch('/api/appointments/prices')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.inperson !== undefined) setInpersonPrice(data.inperson);
          if (data.telemedicine !== undefined) setTelemedicinePrice(data.telemedicine);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Fetch pets when a user is selected
    if (selectedUserId) {
      const selectedUser = users.find(u => u.id === selectedUserId);
      if (selectedUser) {
        if (selectedUser.phoneNumber || selectedUser.contact) {
          setContactNumber(selectedUser.phoneNumber || selectedUser.contact);
        }
        if (selectedUser.pets && Array.isArray(selectedUser.pets) && selectedUser.pets.length > 0) {
          const mapped = selectedUser.pets.map((p: any) => ({
            id: p.id,
            name: p.petName || p.name || 'Unnamed Pet',
            species: p.species || 'Dog',
            breed: p.breed || 'Other'
          }));
          setPets(mapped);
          const firstPet = mapped[0];
          if (mapped.length === 1 && firstPet) {
            setSelectedPetId(firstPet.id);
            setSpecies(firstPet.species || 'Dog');
            setBreed(firstPet.breed || 'Other');
            setIsTypingCustomPet(false);
          } else {
            setIsTypingCustomPet(false);
          }
        } else if (selectedUser.pets && selectedUser.pets.length === 0) {
          setIsTypingCustomPet(true);
        }
      }
      fetchUserPets(selectedUserId);
    } else {
      setPets([]);
      setSelectedPetId('');
      setCustomPetName('');
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    // Auto-fill species and breed when an existing pet is selected
    if (selectedPetId && selectedPetId !== '__NEW_PET__') {
      const selectedPet = pets.find(p => p.id === selectedPetId);
      if (selectedPet) {
        setSpecies(selectedPet.species || 'Dog');
        setBreed(selectedPet.breed || 'Other');
      }
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

  const handleSelectOwner = (u: any) => {
    setSelectedUserId(u.id);
    setOwnerSearch(u.fullName || u.name || '');
    if (u.phoneNumber || u.contact) {
      setContactNumber(u.phoneNumber || u.contact);
    }
    setShowOwnerDropdown(false);
    if (errors.ownerId) setErrors(prev => ({ ...prev, ownerId: '' }));
  };

  const handleOwnerSearchChange = (val: string) => {
    setOwnerSearch(val);
    setShowOwnerDropdown(true);

    if (!val.trim()) {
      setSelectedUserId('');
      setPets([]);
      setSelectedPetId('');
      setCustomPetName('');
      setContactNumber('');
      return;
    }

    // Auto-match exact name
    const exactMatch = users.find(u =>
      (u.fullName || u.name || '').toLowerCase() === val.trim().toLowerCase()
    );
    if (exactMatch) {
      setSelectedUserId(exactMatch.id);
      if (exactMatch.phoneNumber || exactMatch.contact) {
        setContactNumber(exactMatch.phoneNumber || exactMatch.contact);
      }
    } else {
      const current = users.find(u => u.id === selectedUserId);
      if (current && (current.fullName || current.name || '').toLowerCase() !== val.trim().toLowerCase()) {
        setSelectedUserId('');
        setPets([]);
        setSelectedPetId('');
      }
    }

    if (errors.ownerId) setErrors(prev => ({ ...prev, ownerId: '' }));
  };

  const filteredUsers = users.filter(u => {
    const q = (ownerSearch || '').toLowerCase().trim();
    if (!q) return true;
    return (
      (u.fullName || u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phoneNumber || u.contact || '').includes(q)
    );
  });

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!selectedUserId && !ownerSearch.trim()) newErrors.ownerId = 'Owner name is required';
    if (!contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    const currentPetName = (selectedPetId && selectedPetId !== '__NEW_PET__')
      ? (pets.find(p => p.id === selectedPetId)?.name || customPetName.trim())
      : customPetName.trim();
    if (!currentPetName) newErrors.petId = 'Pet name is required';
    if (!species) newErrors.species = 'Species is required';
    if (!breed) newErrors.breed = 'Breed is required';
    if (!appointmentDate) newErrors.appointmentDate = 'Date is required';
    if (!appointmentTime) newErrors.appointmentTime = 'Time slot is required';
    if (!appointmentPurpose) newErrors.appointmentPurpose = 'Purpose of visit is required';

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    setErrors({});

    const fee = appointmentType === 'telemedicine' ? telemedicinePrice : inpersonPrice;
    const selectedUser = users.find(u => u.id === selectedUserId);
    const ownerName = selectedUser?.fullName || selectedUser?.name || ownerSearch.trim();
    const selectedPet = pets.find(p => p.id === selectedPetId);
    const petName = (selectedPetId && selectedPetId !== '__NEW_PET__')
      ? (selectedPet?.name || selectedPet?.petName || 'Pet')
      : customPetName.trim();

    // Add to billing (include userEmail so billing page can trigger email when marking paid)
    addInvoice({
      clientName: ownerName,
      userEmail: selectedUser?.email || undefined,
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
        ownerId: selectedUserId || undefined,
        ownerName: ownerName,
        contactNumber,
        petId: (selectedPetId && selectedPetId !== '__NEW_PET__') ? selectedPetId : 'new',
        pet: {
          name: petName,
          species,
          breed
        },
        date: appointmentDate,
        time: appointmentTime,
        type: appointmentType,
        purpose: appointmentPurpose,
        status: 'pending'
    });

    setIsAppointmentModalOpen(false);
    setSelectedUserId('');
    setOwnerSearch('');
    setShowOwnerDropdown(false);
    setSelectedPetId('');
    setCustomPetName('');
    setIsTypingCustomPet(false);
    setPets([]);
    setSpecies('');
    setBreed('');
    setAppointmentDate('');
    setAppointmentTime('');
    setContactNumber('');
    setErrors({});
    setSuccessMessage('Appointment saved and pending Invoice generated in Billing Module!');
  };

  const handleUpdatePrices = async () => {
    setIsPricingUpdating(true);
    setPricingSuccessMsg('');
    try {
      const res = await fetch('/api/appointments/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inperson: inpersonPrice,
          telemedicine: telemedicinePrice
        })
      });
      const data = await res.json();
      if (data.success) {
        setPricingSuccessMsg('Prices updated successfully!');
        setTimeout(() => setPricingSuccessMsg(''), 3000);
      } else {
        alert('Failed to update prices: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating prices:', err);
      alert('Error updating prices');
    } finally {
      setIsPricingUpdating(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateAppointmentStatus(id, newStatus);
    setOpenActionMenuId(null);
  };

  const handleRemindSuperAdmin = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remindCancel: true })
      });
      const data = await res.json();
      if (data.success) {
        alert("Reminder sent to Super Admin!");
      } else {
        alert("Error: " + (data.error || "Failed to send reminder"));
      }
    } catch (err) {
      console.error('Failed to send reminder:', err);
      alert("Failed to send reminder.");
    }
    setOpenActionMenuId(null);
  };

  const closeDropdown = () => setOpenActionMenuId(null);

  const handleDeclineAppointment = (id: string) => {
    setAppointmentToDecline(id);
    setDeclineReason('');
    setOpenActionMenuId(null);
  };

  const confirmDeclineAppointment = async () => {
    if (appointmentToDecline) {
      try {
        const res = await fetch(`/api/appointments/${appointmentToDecline}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'declined', declineReason: declineReason || undefined })
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMessage('Appointment has been declined. The user has been notified.');
          window.location.reload();
        } else {
          alert('Error: ' + (data.error || 'Failed to decline appointment'));
        }
      } catch (err) {
        console.error('Failed to decline appointment:', err);
        alert('Failed to decline appointment.');
      }
      setAppointmentToDecline(null);
      setDeclineReason('');
    }
  };

  const handleArchiveAppointment = (id: string) => {
    setAppointmentToArchive(id);
    setOpenActionMenuId(null);
  };

  const confirmArchiveAppointment = async () => {
    if (appointmentToArchive) {
      try {
        const res = await fetch(`/api/appointments/${appointmentToArchive}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isArchived: true })
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMessage('Appointment has been successfully archived.');
          window.location.reload();
        } else {
          alert('Error: ' + (data.error || 'Failed to archive appointment'));
        }
      } catch (err) {
        console.error('Failed to archive appointment:', err);
        alert('Failed to archive appointment.');
      }
      setAppointmentToArchive(null);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <>
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} id="mainContent" onClick={closeDropdown}>
        <div className="filters-section">
            <div className="filter-group">
                <span className="filter-label"><i className="fas fa-flag" style={{marginRight: "5px"}}></i>Status:</span>
                <select className="filter-select" id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Verified</option>
                    <option value="completed">Completed</option>
                    <option value="declined">Declined</option>
                </select>
            </div>

            <button className="add-appointment-btn" onClick={() => setIsPricingModalOpen(true)} style={{ background: '#4A5568', marginLeft: 'auto' }}>
                <i className="fas fa-cog"></i>
                Pricing Settings
            </button>
            <button className="add-appointment-btn" onClick={() => { setIsAppointmentModalOpen(true); setErrors({}); }} style={{ marginLeft: 0 }}>
                <i className="fas fa-plus"></i>
                New Appointment
            </button>
        </div>

        <div className="table-container" style={{ overflowX: 'auto' }}>
            <table id="appointmentsTable">
                <thead>
                    <tr>
                        <th style={{ minWidth: '140px' }}>Owner</th>
                        <th style={{ minWidth: '120px' }}>Pet</th>
                        <th style={{ minWidth: '125px' }}>Contact</th>
                        <th style={{ minWidth: '95px' }}>Date</th>
                        <th style={{ minWidth: '80px' }}>Time</th>
                        <th style={{ minWidth: '120px' }}>Ref. No.</th>
                        <th style={{ minWidth: '90px' }}>Amount</th>
                        <th style={{ minWidth: '110px' }}>Type</th>
                        <th style={{ minWidth: '110px' }}>Purpose</th>
                        <th style={{ minWidth: '125px' }}>Status</th>
                        <th style={{ width: '160px', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.filter(app => statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase()).length === 0 ? (
                        <tr>
                            <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                <i className="fas fa-calendar-times" style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.5 }}></i>
                                <p>No appointments found for the selected status.</p>
                            </td>
                        </tr>
                    ) : (
                        appointments.filter(app => statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase()).map((app) => {
                            const badge = getStatusBadgeConfig(app.status);
                            const cleanPurpose = app.purpose?.startsWith('[CANCEL_REQUESTED]')
                                ? app.purpose.replace('[CANCEL_REQUESTED] ', '')
                                : app.purpose;
                            return (
                                <tr 
                                    key={app.id}
                                    onClick={() => setViewAppointmentDetails(app)}
                                    className="appointment-table-row"
                                    style={{ cursor: 'pointer' }}
                                    title="Click to view appointment details"
                                >
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#1a202c', lineHeight: 1.35, wordBreak: 'normal', whiteSpace: 'normal' }}>
                                            {app.owner}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: 600, color: '#2E5E3E', fontSize: '0.88rem', lineHeight: 1.2 }}>
                                                {app.pet || 'N/A'}
                                            </span>
                                            {app.species && app.species !== 'N/A' && (
                                                <span style={{ fontSize: '0.76rem', color: '#718096', lineHeight: 1.2, whiteSpace: 'nowrap' }} title={`${app.species}${app.breed && app.breed !== 'Other' && app.breed !== 'N/A' ? ` · ${app.breed}` : ''}`}>
                                                    {app.species}{app.breed && app.breed !== 'Other' && app.breed !== 'N/A' ? ` · ${app.breed}` : ''}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: '#4a5568', fontSize: '0.85rem' }}>
                                            {app.contact}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 500, color: '#2d3748', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                                            {formatDateDisplay(app.date)}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.84rem', color: '#4a5568', whiteSpace: 'nowrap' }}>
                                            {app.time || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        {app.referenceNumber ? (
                                            <span 
                                                title={`Full Reference: ${app.referenceNumber}`}
                                                style={{ 
                                                    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', 
                                                    fontSize: '0.78rem', 
                                                    color: '#4a5568',
                                                    background: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    whiteSpace: 'nowrap',
                                                    cursor: 'help'
                                                }}
                                            >
                                                {formatRefNumber(app.referenceNumber)}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: '#2E5E3E', fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                            {app.amountPaid !== undefined && app.amountPaid !== null ? `₱${Number(app.amountPaid).toFixed(2)}` : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        {app.type === 'telemedicine' ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', height: '22px', padding: '0 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 600, background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', whiteSpace: 'nowrap' }}>
                                                Telemedicine
                                            </span>
                                        ) : app.type === 'walk-in' ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', height: '22px', padding: '0 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 600, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>
                                                Walk-in
                                            </span>
                                        ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', height: '22px', padding: '0 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 600, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
                                                In-Person
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ textTransform: 'capitalize', color: '#4a5568', fontSize: '0.84rem', whiteSpace: 'normal', wordBreak: 'normal', display: 'block', maxWidth: '140px' }} title={cleanPurpose}>
                                            {cleanPurpose}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '24px',
                                                padding: '0 9px',
                                                borderRadius: '9999px',
                                                fontSize: '0.74rem',
                                                fontWeight: 600,
                                                backgroundColor: badge.bg,
                                                color: badge.color,
                                                border: `1px solid ${badge.border}`,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {badge.label}
                                            </span>
                                            {app.purpose?.startsWith('[CANCEL_REQUESTED]') && (
                                                <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.7rem', background: '#fee2e2', padding: '1px 5px', borderRadius: '4px', border: '1px solid #fca5a5', whiteSpace: 'nowrap' }}>
                                                    Cancel Req.
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-start' }}>
                                            {app.status.toLowerCase() === 'pending' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setAppointmentToMarkPaid(app.id); setOpenActionMenuId(null); }}
                                                    style={{
                                                        width: '90px',
                                                        height: '38px',
                                                        background: '#ecfdf5',
                                                        color: '#065f46',
                                                        border: '1px solid #a7f3d0',
                                                        borderRadius: '8px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#d1fae5'}
                                                    onMouseLeave={e => e.currentTarget.style.background = '#ecfdf5'}
                                                >
                                                    <i className="fas fa-check"></i> Verify
                                                </button>
                                            )}
                                            <button 
                                                className="btn-secondary" 
                                                style={{
                                                    width: '48px', 
                                                    height: '38px', 
                                                    borderRadius: '8px', 
                                                    border: '1px solid #e2e8f0', 
                                                    background: '#ffffff', 
                                                    color: '#718096', 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                    transition: 'background 0.2s'
                                                }} 
                                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                                                onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === app.id ? null : app.id); }}
                                                title="Actions"
                                            >
                                                <i className="fas fa-ellipsis-v" style={{ fontSize: '0.9rem' }}></i>
                                            </button>
                                        </div>
                                {openActionMenuId === app.id && (
                                    <div style={{ position: 'absolute', right: '100%', top: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '175px', overflow: 'hidden' }}>
                                        {/* Remind Super Admin — only when cancel requested */}
                                        {app.purpose?.startsWith('[CANCEL_REQUESTED]') && (
                                          <button style={{ padding: '9px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2E5E3E', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => { e.stopPropagation(); handleRemindSuperAdmin(app.id); }}>
                                            <i className="fas fa-bell"></i> Remind Super Admin
                                          </button>
                                        )}



                                        {/* Mark Completed — only if pending or paid */}
                                        {['pending','paid'].includes(app.status.toLowerCase()) && (
                                          <button style={{ padding: '9px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => { e.stopPropagation(); setAppointmentToMarkCompleted(app.id); setOpenActionMenuId(null); }}>
                                            <i className="fas fa-flag-checkered" style={{color:'#3182ce'}}></i> Mark Completed
                                          </button>
                                        )}

                                        {/* Decline — only if pending */}
                                        {app.status.toLowerCase() === 'pending' && (
                                          <button style={{ padding: '9px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2E5E3E', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => { e.stopPropagation(); handleDeclineAppointment(app.id); }}>
                                            <i className="fas fa-ban"></i> Decline
                                          </button>
                                        )}

                                        {/* Archive — always available */}
                                        <button style={{ padding: '9px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#2E5E3E', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e6fffa'} onMouseLeave={e => e.currentTarget.style.background = 'none'} onClick={(e) => { e.stopPropagation(); handleArchiveAppointment(app.id); }}>
                                          <i className="fas fa-archive" style={{color: '#2E5E3E'}}></i> Archive
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })
                )}
                </tbody>
            </table>
        </div>
    </div>

    {isAppointmentModalOpen && (
    <div className="appointment-modal show" onClick={(e) => { if (e.target === e.currentTarget) { setIsAppointmentModalOpen(false); setErrors({}); } }}>
        <div className="appointment-modal-content">
            <div className="appointment-modal-header">
                <h3>
                    <span className="appointment-modal-header-icon">
                        <i className="fas fa-calendar-plus"></i>
                    </span>
                    <span>New Appointment</span>
                </h3>
                <button
                    type="button"
                    className="appointment-modal-close"
                    onClick={() => { setIsAppointmentModalOpen(false); setErrors({}); }}
                    title="Close modal"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="appointment-modal-body">
                <form id="appointmentForm" onSubmit={handleSaveAppointment}>
                    <div className="appointment-form-grid">
                        {/* Row 1 Col 1: Owner Name * */}
                        <div className="appointment-form-group">
                            <label>
                                <i className="fas fa-user appointment-label-icon"></i>
                                <span>Owner Name</span>
                                <span className="appointment-required-star">*</span>
                                {selectedUserId && (
                                    <span className="appointment-registered-badge" style={{ marginLeft: 'auto' }}>
                                        <i className="fas fa-check-circle"></i> Registered
                                    </span>
                                )}
                            </label>
                            <div className="appointment-combobox-wrap">
                                <input
                                    type="text"
                                    className={`appointment-form-control ${errors.ownerId ? 'has-error' : ''}`}
                                    style={{ paddingRight: '56px' }}
                                    placeholder="Search or choose owner..."
                                    value={ownerSearch}
                                    autoComplete="off"
                                    onChange={e => {
                                        handleOwnerSearchChange(e.target.value);
                                        if (errors.ownerId) setErrors(prev => ({ ...prev, ownerId: '' }));
                                    }}
                                    onFocus={() => setShowOwnerDropdown(true)}
                                />
                                <div className="appointment-combobox-controls">
                                    {ownerSearch && (
                                        <button
                                            type="button"
                                            className="appointment-combobox-btn"
                                            onClick={() => {
                                                setOwnerSearch('');
                                                setSelectedUserId('');
                                                setPets([]);
                                                setSelectedPetId('');
                                                setCustomPetName('');
                                                setContactNumber('');
                                            }}
                                            title="Clear owner"
                                        >
                                            <i className="fas fa-times-circle"></i>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="appointment-combobox-btn"
                                        onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
                                        title="Toggle dropdown"
                                    >
                                        <i className={`fas ${showOwnerDropdown ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                    </button>
                                </div>

                                {showOwnerDropdown && (
                                    <div className="appointment-dropdown-panel">
                                        <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>REGISTERED OWNERS ({filteredUsers.length})</span>
                                            <span onClick={() => setShowOwnerDropdown(false)} style={{ cursor: 'pointer', color: '#94a3b8' }}><i className="fas fa-times"></i></span>
                                        </div>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map(u => (
                                                <div
                                                    key={u.id}
                                                    onMouseDown={() => {
                                                        handleSelectOwner(u);
                                                        setShowOwnerDropdown(false);
                                                        if (errors.ownerId) setErrors(prev => ({ ...prev, ownerId: '' }));
                                                    }}
                                                    style={{
                                                        padding: '9px 12px', cursor: 'pointer',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        fontSize: '0.88rem', color: '#1e293b',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        background: selectedUserId === u.id ? '#eaf4ed' : 'transparent',
                                                        transition: 'background 0.15s'
                                                    }}
                                                    onMouseEnter={e => { if (selectedUserId !== u.id) e.currentTarget.style.background = '#f0fdf4'; }}
                                                    onMouseLeave={e => { if (selectedUserId !== u.id) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eaf4ed', color: '#1a5c3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                                            {(u.fullName || u.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>{u.fullName || u.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                {u.email}{(u.phoneNumber || u.contact) ? ` • ${u.phoneNumber || u.contact}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {selectedUserId === u.id && (
                                                        <span style={{ color: '#1a5c3a', fontSize: '0.85rem' }}><i className="fas fa-check"></i></span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                                <div>No registered owner found matching <strong>"{ownerSearch}"</strong></div>
                                                <div style={{ marginTop: '5px', fontSize: '0.78rem', color: '#1a5c3a', cursor: 'pointer', fontWeight: 500 }} onClick={() => setShowOwnerDropdown(false)}>
                                                    <i className="fas fa-check"></i> Use custom name "{ownerSearch}"
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.ownerId && (
                                <div className="appointment-error-msg">
                                    <i className="fas fa-exclamation-circle"></i> {errors.ownerId}
                                </div>
                            )}
                        </div>

                        {/* Row 1 Col 2: Contact Number * */}
                        <div className="appointment-form-group">
                            <label>
                                <i className="fas fa-phone appointment-label-icon"></i>
                                <span>Contact Number</span>
                                <span className="appointment-required-star">*</span>
                            </label>
                            <input
                                type="text"
                                className={`appointment-form-control ${errors.contactNumber ? 'has-error' : ''}`}
                                value={contactNumber}
                                onChange={e => {
                                    setContactNumber(e.target.value);
                                    if (errors.contactNumber) setErrors(prev => ({ ...prev, contactNumber: '' }));
                                }}
                                placeholder="Enter contact number"
                            />
                            {errors.contactNumber && (
                                <div className="appointment-error-msg">
                                    <i className="fas fa-exclamation-circle"></i> {errors.contactNumber}
                                </div>
                            )}
                        </div>

                        {/* Row 2 Col 1: Pet Name * */}
                        <div className="appointment-form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                                <label style={{ margin: 0 }}>
                                    <i className="fas fa-paw appointment-label-icon"></i>
                                    <span>Pet Name</span>
                                    <span className="appointment-required-star">*</span>
                                </label>
                                {pets.length > 0 && (
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        {pets.length} owner pet{pets.length > 1 ? 's' : ''} found
                                    </span>
                                )}
                            </div>
                            <input
                                type="text"
                                list="owner-pets-list"
                                className={`appointment-form-control ${errors.petId ? 'has-error' : ''}`}
                                placeholder="Enter pet name..."
                                value={customPetName}
                                onChange={e => {
                                    const val = e.target.value;
                                    setCustomPetName(val);
                                    const matched = pets.find(p => (p.name || p.petName || '').toLowerCase() === val.trim().toLowerCase());
                                    if (matched) {
                                        setSelectedPetId(matched.id);
                                        setSpecies(matched.species || 'Dog');
                                        setBreed(matched.breed || 'Other');
                                    } else {
                                        setSelectedPetId('');
                                    }
                                    if (errors.petId) setErrors(prev => ({ ...prev, petId: '' }));
                                }}
                            />
                            {pets.length > 0 && (
                                <datalist id="owner-pets-list">
                                    {pets.map(p => (
                                        <option key={p.id} value={p.name || p.petName}>
                                            {p.species}{p.breed ? ` - ${p.breed}` : ''}
                                        </option>
                                    ))}
                                </datalist>
                            )}
                            {pets.length > 0 && (
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
                                    {pets.map(p => {
                                        const pName = p.name || p.petName;
                                        const isCurrent = customPetName.toLowerCase() === pName.toLowerCase();
                                        return (
                                            <button
                                                type="button"
                                                key={p.id}
                                                onClick={() => {
                                                    setCustomPetName(pName);
                                                    setSelectedPetId(p.id);
                                                    setSpecies(p.species || 'Dog');
                                                    setBreed(p.breed || 'Other');
                                                    if (errors.petId) setErrors(prev => ({ ...prev, petId: '' }));
                                                    if (errors.species) setErrors(prev => ({ ...prev, species: '' }));
                                                    if (errors.breed) setErrors(prev => ({ ...prev, breed: '' }));
                                                }}
                                                style={{
                                                    background: isCurrent ? '#1a5c3a' : '#f1f5f9',
                                                    color: isCurrent ? '#ffffff' : '#334155',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '2px 8px',
                                                    fontSize: '0.74rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s'
                                                }}
                                            >
                                                <i className="fas fa-paw" style={{ marginRight: '3px', fontSize: '0.68rem' }}></i> {pName}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {errors.petId && (
                                <div className="appointment-error-msg">
                                    <i className="fas fa-exclamation-circle"></i> {errors.petId}
                                </div>
                            )}
                        </div>

                        {/* Row 2 Col 2: Species * */}
                        <div className="appointment-form-group">
                            <label>
                                <i className="fas fa-dog appointment-label-icon"></i>
                                <span>Species</span>
                                <span className="appointment-required-star">*</span>
                            </label>
                            <select
                                className={`appointment-form-control ${errors.species ? 'has-error' : ''}`}
                                value={species}
                                onChange={e => {
                                    setSpecies(e.target.value);
                                    setBreed('');
                                    if (errors.species) setErrors(prev => ({ ...prev, species: '' }));
                                    if (errors.breed) setErrors(prev => ({ ...prev, breed: '' }));
                                }}
                            >
                                <option value="">-- Select Species --</option>
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                            </select>
                            {errors.species && (
                                <div className="appointment-error-msg">
                                    <i className="fas fa-exclamation-circle"></i> {errors.species}
                                </div>
                            )}
                        </div>

                        {/* Row 3 (Full width): Breed * */}
                        <div className="appointment-form-group appointment-grid-full">
                            <label>
                                <i className="fas fa-paw appointment-label-icon"></i>
                                <span>Breed</span>
                                <span className="appointment-required-star">*</span>
                            </label>
                            <select
                                className={`appointment-form-control ${errors.breed ? 'has-error' : ''} ${!species ? 'is-disabled' : ''}`}
                                value={breed}
                                onChange={e => {
                                    setBreed(e.target.value);
                                    if (errors.breed) setErrors(prev => ({ ...prev, breed: '' }));
                                }}
                                disabled={!species}
                            >
                                <option value="">{species ? "-- Select Breed --" : "Select species first"}</option>
                                {species && BREEDS[species]?.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                                {species && !BREEDS[species] && <option value="Other">Other</option>}
                            </select>
                            {errors.breed && (
                                <div className="appointment-error-msg">
                                    <i className="fas fa-exclamation-circle"></i> {errors.breed}
                                </div>
                            )}
                        </div>

                        {/* Row 4 Col 1: Date * */}
                        <div className="appointment-form-group">
                            <label>
                                <i className="fas fa-calendar-alt appointment-label-icon"></i>
                                <span>Date</span>
                                <span className="appointment-required-star">*</span>
                            </label>
                            <input
                                type="date"
                                className={`appointment-form-control ${errors.appointmentDate ? 'has-error' : ''}`}
                                value={appointmentDate}
                                onChange={e => {
                                    setAppointmentDate(e.target.value);
                                    setAppointmentTime('');
                                    if (errors.appointmentDate) setErrors(prev => ({ ...prev, appointmentDate: '' }));
                                    if (errors.appointmentTime) setErrors(prev => ({ ...prev, appointmentTime: '' }));
                                }}
                            />
                            {errors.appointmentDate && (
                                <div className="appointment-error-msg">
                                    <i className="fas fa-exclamation-circle"></i> {errors.appointmentDate}
                                </div>
                            )}
                        </div>

                        {/* Row 4 Col 2: Appointment Type * */}
                        <div className="appointment-form-group">
                            <label>
                                <i className="fas fa-video appointment-label-icon"></i>
                                <span>Appointment Type</span>
                                <span className="appointment-required-star">*</span>
                            </label>
                            <select
                                className="appointment-form-control"
                                value={appointmentType}
                                onChange={e => setAppointmentType(e.target.value)}
                            >
                                <option value="inperson">In-Person</option>
                                <option value="telemedicine">Telemedicine</option>
                            </select>
                        </div>

                        {/* Row 5 (Full width): Available Time Slots * */}
                        <div className="appointment-form-group appointment-grid-full">
                            <label>
                                <i className="fas fa-clock appointment-label-icon"></i>
                                <span>Available Time Slots</span>
                                <span className="appointment-required-star">*</span>
                            </label>
                            {!appointmentDate ? (
                                <div className="appointment-slots-placeholder">
                                    <i className="far fa-calendar-alt"></i>
                                    <span>Please select a date first</span>
                                </div>
                            ) : (
                                <>
                                    <div className="appointment-slots-grid">
                                        {availableSlots.map(slot => (
                                            <button
                                                type="button"
                                                key={slot.time}
                                                disabled={!slot.available}
                                                onClick={() => {
                                                    setAppointmentTime(slot.time);
                                                    if (errors.appointmentTime) setErrors(prev => ({ ...prev, appointmentTime: '' }));
                                                }}
                                                className={`appointment-slot-btn ${appointmentTime === slot.time ? 'is-selected' : ''}`}
                                                title={!slot.available ? (!slot.enabled ? 'Disabled by Clinic' : 'Already booked') : slot.time}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.appointmentTime && (
                                        <div className="appointment-error-msg">
                                            <i className="fas fa-exclamation-circle"></i> {errors.appointmentTime}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Row 6 (Full width): Purpose of visit * */}
                        <div className="appointment-form-group appointment-grid-full">
                            <label>
                                <i className="fas fa-plus-square appointment-label-icon"></i>
                                <span>Purpose of visit</span>
                                <span className="appointment-required-star">*</span>
                            </label>
                            <select
                                className={`appointment-form-control ${errors.appointmentPurpose ? 'has-error' : ''}`}
                                value={appointmentPurpose}
                                onChange={e => {
                                    setAppointmentPurpose(e.target.value);
                                    if (errors.appointmentPurpose) setErrors(prev => ({ ...prev, appointmentPurpose: '' }));
                                }}
                            >
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
                            {errors.appointmentPurpose && (
                                <div className="appointment-error-msg">
                                    <i className="fas fa-exclamation-circle"></i> {errors.appointmentPurpose}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
            <div className="appointment-modal-actions">
                <button
                    type="button"
                    className="appointment-btn-cancel"
                    onClick={() => { setIsAppointmentModalOpen(false); setErrors({}); }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    form="appointmentForm"
                    className="appointment-btn-save"
                >
                    <i className="fas fa-calendar-check"></i>
                    Save Appointment
                </button>
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

    {appointmentToDecline && (
        <div className="modal" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000}}>
            <div className="modal-content" style={{background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FEFCBF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <i className="fas fa-ban" style={{ color: '#2E5E3E', fontSize: '2rem' }}></i>
                </div>
                <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem', textAlign: 'center' }}>Decline Appointment</h3>
                <p style={{ color: '#718096', marginBottom: '20px', lineHeight: '1.5', textAlign: 'center' }}>Are you sure you want to decline this appointment? The user will be notified.</p>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontWeight: '600', fontSize: '0.9rem' }}>Reason for declining (optional)</label>
                    <textarea
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        placeholder="e.g., Schedule is full, clinic closed, etc."
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setAppointmentToDecline(null); setDeclineReason(''); }} style={{ flex: 1, padding: '10px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={confirmDeclineAppointment} style={{ flex: 1, padding: '10px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Decline</button>
                </div>
            </div>
        </div>
    )}

    {appointmentToArchive && (
        <div className="modal" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000}}>
            <div className="modal-content" style={{background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#C6F6D5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <i className="fas fa-archive" style={{ color: '#2E5E3E', fontSize: '2rem' }}></i>
                </div>
                <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem', fontWeight: 600 }}>Archive Appointment</h3>
                <p style={{ color: '#718096', marginBottom: '25px', lineHeight: '1.5' }}>Are you sure you want to archive this appointment? It will be sent to the Archive module and can be restored anytime.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setAppointmentToArchive(null)} className="btn-secondary" style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
                    <button onClick={confirmArchiveAppointment} className="btn-primary" style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: '#2E5E3E', borderColor: '#2E5E3E', color: 'white' }}>Archive</button>
                </div>
            </div>
        </div>
    )}

    {appointmentToMarkPaid && (() => {
        const targetApp = appointments.find(a => a.id === appointmentToMarkPaid);
        const apptDateRaw = targetApp?.date;
        const apptDateStr = apptDateRaw
            ? new Date(apptDateRaw).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            : 'Scheduled Date';
        const apptTimeStr = targetApp?.time || '';
        const displayDateTime = apptTimeStr ? `${apptDateStr} · ${apptTimeStr}` : apptDateStr;
        const apptAmount = targetApp?.amountPaid || (targetApp?.type === 'telemedicine' ? telemedicinePrice : inpersonPrice);
        const displayId = targetApp?.id ? `#APT-${targetApp.id.slice(-6).toUpperCase()}` : `#${appointmentToMarkPaid.slice(0, 8)}`;

        return (
        <div className="modal" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(18, 28, 24, 0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 10000, padding: '20px'}}>
            <div className="modal-content" style={{background: '#ffffff', padding: '28px 30px 26px', borderRadius: '20px', width: '100%', maxWidth: '470px', boxShadow: '0 24px 48px -12px rgba(15, 45, 35, 0.18), 0 12px 24px -8px rgba(15, 30, 25, 0.08)', border: '1px solid rgba(255, 255, 255, 0.8)'}}>
                
                {/* Header Row: Left-aligned icon + heading pairing */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '22px' }}>
                    <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '12px', background: '#e6f3f0', border: '1px solid #b8ded6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f6f5c' }}>
                        <i className="fas fa-check" style={{ fontSize: '1.2rem', fontWeight: 900 }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 6px 0', color: '#19231f', fontSize: '1.28rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                            Verify this payment?
                        </h3>
                        <p style={{ margin: 0, color: '#495752', fontSize: '0.88rem', lineHeight: 1.45 }}>
                            Confirming marks the appointment as paid and notifies the front desk.
                        </p>
                    </div>
                </div>

                {/* Details Block: Bordered card with subtle background */}
                <div style={{ background: '#fafafa', border: '1px solid #e6e8e5', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', fontSize: '0.88rem', borderBottom: '1px solid #e6e8e5' }}>
                        <span style={{ color: '#6b7a74', fontWeight: 500 }}>Appointment ID</span>
                        <span style={{ color: '#2c3833', fontFamily: 'monospace', background: '#edf1ee', padding: '2px 7px', borderRadius: '6px', fontSize: '0.86rem', fontWeight: 600 }}>{displayId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', fontSize: '0.88rem', borderBottom: '1px solid #e6e8e5' }}>
                        <span style={{ color: '#6b7a74', fontWeight: 500 }}>Date & time</span>
                        <span style={{ color: '#19231f', fontWeight: 600 }}>{displayDateTime}</span>
                    </div>
                    {/* Distinctly highlighted amount received row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', fontSize: '0.88rem', background: '#f1f7ef', borderTop: '1px solid #d4e5d1' }}>
                        <span style={{ color: '#273e20', fontWeight: 600 }}>Amount received</span>
                        <span style={{ color: '#3f5a34', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}>₱{Number(apptAmount).toFixed(2)}</span>
                    </div>
                </div>

                {/* Short Caution Line */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', background: '#faf6ee', border: '1px solid #eee4cc', borderRadius: '10px', marginBottom: '24px' }}>
                    <i className="fas fa-exclamation-circle" style={{ color: '#8c6d31', marginTop: '2px', fontSize: '0.9rem', flexShrink: 0 }}></i>
                    <p style={{ margin: 0, fontSize: '0.81rem', lineHeight: 1.45, color: '#605139' }}>
                        This action can't be undone from this screen. If the amount looks wrong, cancel and check with billing first.
                    </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        disabled={isProcessingStatus} 
                        onClick={() => !isProcessingStatus && setAppointmentToMarkPaid(null)} 
                        style={{ 
                            flex: 1, 
                            padding: '11px 20px', 
                            background: '#ffffff', 
                            color: isProcessingStatus ? '#a0aec0' : '#37433e', 
                            border: '1px solid #d1d8d4', 
                            borderRadius: '10px', 
                            fontWeight: 600, 
                            fontSize: '0.92rem',
                            cursor: isProcessingStatus ? 'not-allowed' : 'pointer', 
                            transition: 'all 0.18s' 
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        disabled={isProcessingStatus} 
                        onClick={async () => { 
                            if (isProcessingStatus || !appointmentToMarkPaid) return;
                            setIsProcessingStatus(true);
                            try {
                                await handleStatusChange(appointmentToMarkPaid, 'paid'); 
                            } finally {
                                setIsProcessingStatus(false);
                                setAppointmentToMarkPaid(null); 
                            }
                        }} 
                        style={{ 
                            flex: 1.35, 
                            padding: '11px 20px', 
                            background: isProcessingStatus ? '#63b3ed' : '#0f6f5c', 
                            color: '#ffffff', 
                            border: 'none', 
                            borderRadius: '10px', 
                            fontWeight: 600, 
                            fontSize: '0.92rem',
                            cursor: isProcessingStatus ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 6px rgba(15, 111, 92, 0.25)',
                            transition: 'all 0.18s'
                        }}
                    >
                        {isProcessingStatus ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Verifying...
                            </>
                        ) : (
                            'Verify payment'
                        )}
                    </button>
                </div>
            </div>
        </div>
        );
    })()}

    {appointmentToMarkCompleted && (() => {
      const completingApp = appointments.find(a => a.id === appointmentToMarkCompleted);
      const petInitials = (completingApp?.pet || completingApp?.owner || 'P').slice(0, 2).toUpperCase();
      const shortId = completingApp?.id ? completingApp.id.slice(0, 8).toUpperCase() : '—';
      return (
        <div
          onClick={(e) => { if (e.target === e.currentTarget && !isProcessingStatus) setAppointmentToMarkCompleted(null); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'fixed', inset: 0,
            background: 'rgba(10,30,20,0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 10000,
            padding: '16px',
            animation: 'cmpl-fade-in 0.18s ease',
          }}
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            @keyframes cmpl-fade-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
            @media (prefers-reduced-motion: reduce) { .cmpl-modal-card { animation: none !important; } }
            .cmpl-modal-card { animation: cmpl-fade-in 0.2s cubic-bezier(0.22,1,0.36,1); }
            .cmpl-btn-cancel:hover:not(:disabled) { background: #e9e8e4 !important; }
            .cmpl-btn-confirm:hover:not(:disabled) { background: #134d30 !important; }
            .cmpl-btn-cancel:focus-visible, .cmpl-btn-confirm:focus-visible { outline: 3px solid #1f7a4d; outline-offset: 2px; }
            @media (max-width: 480px) {
              .cmpl-btn-row { flex-direction: column-reverse !important; }
              .cmpl-btn-cancel, .cmpl-btn-confirm { width: 100% !important; }
            }
          `}</style>
          <div
            className="cmpl-modal-card"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 24px 60px rgba(10,30,20,0.22), 0 4px 16px rgba(10,30,20,0.1)',
              fontFamily: "'Inter', system-ui, sans-serif",
              overflow: 'hidden',
            }}
          >
            {/* ── Top cream band ── */}
            <div style={{ background: '#f6f5f1', padding: '28px 28px 20px 28px' }}>
              {/* Header row: badge + heading */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '6px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: '#e6f3ec', border: '1.5px solid #b2dcc4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <i className="fas fa-check" style={{ color: '#1f7a4d', fontSize: '1.1rem' }}></i>
                </div>
                <div>
                  <h3 style={{
                    margin: 0, fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: '1.25rem', fontWeight: 700, color: '#1a2e22', lineHeight: 1.25,
                  }}>Mark this visit as completed?</h3>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.875rem', color: '#5a6b5e', lineHeight: 1.45 }}>
                    Confirming closes out the appointment and updates the patient&apos;s record.
                  </p>
                </div>
              </div>
            </div>

            {/* ── White body ── */}
            <div style={{ padding: '20px 28px 28px 28px' }}>

              {/* Appointment section */}
              <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', fontWeight: 700, color: '#8a9e8f', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Appointment</p>
              <div style={{
                border: '1.5px solid #d8ead2',
                borderRadius: '12px',
                background: '#f8fbf8',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '20px',
              }}>
                {/* Initials avatar */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: '#c8e6d4', color: '#175c3a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                }}>{petInitials}</div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#1a2e22', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {completingApp?.pet || 'Unknown Pet'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#5a6b5e', marginTop: '2px' }}>
                    {completingApp?.owner || 'Unknown Owner'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#7a8e7f', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fas fa-calendar-alt" style={{ fontSize: '0.72rem', color: '#1f7a4d' }}></i>
                    {completingApp?.date ? formatDateDisplay(completingApp.date) : 'N/A'}
                    {completingApp?.time && (
                      <><span style={{ color: '#c8d8cc' }}>·</span>
                      <i className="fas fa-clock" style={{ fontSize: '0.72rem', color: '#1f7a4d' }}></i>
                      {completingApp.time}</>
                    )}
                  </div>
                </div>

                {/* ID pill */}
                <div style={{
                  background: '#e6f3ec', color: '#175c3a',
                  borderRadius: '99px', padding: '3px 10px',
                  fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                  border: '1px solid #b2dcc4',
                }}>#{shortId}</div>
              </div>

              {/* What happens next */}
              <p style={{ margin: '0 0 8px 0', fontSize: '0.72rem', fontWeight: 700, color: '#8a9e8f', letterSpacing: '0.06em', textTransform: 'uppercase' }}>What happens next</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                {[
                  'Appointment status changes to Completed.',
                  'Visit summary becomes available on the patient record.',
                  'Owner is notified that the visit is done.',
                ].map((text, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px',
                      background: '#e6f3ec', border: '1px solid #b2dcc4',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
                    }}>
                      <i className="fas fa-check" style={{ color: '#1f7a4d', fontSize: '0.65rem' }}></i>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Caution note */}
              <div style={{
                background: '#fdf6ec',
                border: '1.5px solid #f1e0bd',
                borderRadius: '10px',
                padding: '11px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                marginBottom: '24px',
              }}>
                <span style={{ fontSize: '0.55rem', color: '#c49a38', marginTop: '5px', flexShrink: 0 }}>●</span>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#7a5a1f', lineHeight: 1.5 }}>
                  This can&apos;t be reversed from here. If the visit isn&apos;t actually finished, cancel and update it later.
                </p>
              </div>

              {/* Buttons */}
              <div className="cmpl-btn-row" style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="cmpl-btn-cancel"
                  disabled={isProcessingStatus}
                  onClick={() => !isProcessingStatus && setAppointmentToMarkCompleted(null)}
                  style={{
                    flex: 1, padding: '12px 20px',
                    background: '#f0eeea',
                    color: isProcessingStatus ? '#9CA3AF' : '#374151',
                    border: '1.5px solid #dddad3',
                    borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem',
                    cursor: isProcessingStatus ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                    fontFamily: "inherit",
                  }}
                >Cancel</button>
                <button
                  className="cmpl-btn-confirm"
                  disabled={isProcessingStatus}
                  onClick={async () => {
                    if (isProcessingStatus || !appointmentToMarkCompleted) return;
                    setIsProcessingStatus(true);
                    try {
                      await handleStatusChange(appointmentToMarkCompleted, 'completed');
                    } finally {
                      setIsProcessingStatus(false);
                      setAppointmentToMarkCompleted(null);
                    }
                  }}
                  style={{
                    flex: 1, padding: '12px 20px',
                    background: isProcessingStatus ? '#5aaa7a' : '#175c3a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
                    cursor: isProcessingStatus ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontFamily: "inherit",
                  }}
                >
                  {isProcessingStatus ? (
                    <><i className="fas fa-spinner fa-spin"></i> Completing&hellip;</>
                  ) : (
                    <><i className="fas fa-flag-checkered" style={{ fontSize: '0.85rem' }}></i> Yes, mark completed</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    })()}

    {isPricingModalOpen && (
    <div className="appointment-modal" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="appointment-modal-content" style={{maxWidth: '500px', width: '90%'}}>
            <div className="appointment-modal-header">
                <h3><i className="fas fa-file-invoice-dollar" style={{marginRight: "10px", color: "#2E5E3E"}}></i> Appointment Pricing Settings</h3>
                <button className="appointment-modal-close" onClick={() => { setIsPricingModalOpen(false); setPricingSuccessMsg(''); }}><i className="fas fa-times"></i></button>
            </div>
            <div className="appointment-modal-body" style={{ padding: '25px' }}>
                <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '20px' }}>
                    Configure the dynamic booking fees charged to customers when scheduling appointments.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center' }}><i className="fas fa-hospital" style={{ marginRight: '6px', color: '#2E5E3E' }}></i> In-Person Visit Fee *</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <span style={{ position: 'absolute', left: '12px', color: '#a0aec0', fontSize: '1rem' }}>₱</span>
                            <input
                                type="number"
                                className="appointment-form-control"
                                value={inpersonPrice}
                                onChange={(e) => setInpersonPrice(Number(e.target.value))}
                                style={{
                                    paddingLeft: '28px',
                                    width: '100%'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center' }}><i className="fas fa-video" style={{ marginRight: '6px', color: '#2E5E3E' }}></i> Telemedicine Fee *</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <span style={{ position: 'absolute', left: '12px', color: '#a0aec0', fontSize: '1rem' }}>₱</span>
                            <input
                                type="number"
                                className="appointment-form-control"
                                value={telemedicinePrice}
                                onChange={(e) => setTelemedicinePrice(Number(e.target.value))}
                                style={{
                                    paddingLeft: '28px',
                                    width: '100%'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {pricingSuccessMsg && (
                    <div style={{
                        color: '#2F855A',
                        background: '#F0FFF4',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        border: '1px solid #C6F6D5',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        animation: 'modalFadeIn 0.2s ease-out'
                    }}>
                        <i className="fas fa-check-circle"></i>
                        {pricingSuccessMsg}
                    </div>
                )}

                <div className="appointment-modal-actions" style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => { setIsPricingModalOpen(false); setPricingSuccessMsg(''); }}
                        style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 600, margin: 0 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdatePrices}
                        disabled={isPricingUpdating}
                        className="btn btn-primary"
                        style={{
                            margin: 0,
                            padding: '12px 25px',
                            opacity: isPricingUpdating ? 0.7 : 1
                        }}
                    >
                        <i className={isPricingUpdating ? "fas fa-spinner fa-spin" : "fas fa-save"} style={{ marginRight: '6px' }}></i>
                        {isPricingUpdating ? 'Saving...' : 'Update Prices'}
                    </button>
                </div>
            </div>
        </div>
    </div>
    )}

    {/* APPOINTMENT DETAILS MODAL */}
    {viewAppointmentDetails && (
      <div 
        className="appointment-modal-overlay" 
        style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: 'rgba(15, 23, 42, 0.65)', 
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          padding: '20px'
        }} 
        onClick={() => setViewAppointmentDetails(null)}
      >
        <div 
          className="appointment-details-card" 
          style={{
            background: '#ffffff', 
            borderRadius: '20px', 
            width: '100%', 
            maxWidth: '680px', 
            maxHeight: '92vh', 
            overflowY: 'auto', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column'
          }} 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#2E5E3E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                border: '1px solid #a7f3d0'
              }}>
                <i className="fas fa-calendar-check"></i>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                    Appointment Details
                  </h3>
                  <span style={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    ID: {viewAppointmentDetails.id?.slice(0, 8)}
                  </span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Booked on {viewAppointmentDetails.createdAt ? new Date(viewAppointmentDetails.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : formatDateDisplay(viewAppointmentDetails.date)}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {(() => {
                const badge = getStatusBadgeConfig(viewAppointmentDetails.status);
                return (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    height: '28px',
                    padding: '0 12px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badge.color }}></span>
                    {badge.label}
                  </span>
                );
              })()}
              <button 
                onClick={() => setViewAppointmentDetails(null)} 
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#64748b'; }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Cancellation Requested Alert if any */}
          {viewAppointmentDetails.purpose?.startsWith('[CANCEL_REQUESTED]') && (
            <div style={{
              margin: '16px 24px 0',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#991b1b',
              fontSize: '0.88rem'
            }}>
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.1rem' }}></i>
              <div>
                <strong>Cancellation Requested:</strong> The client has requested to cancel this booking.
              </div>
            </div>
          )}

          {/* Modal Body */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Section 1: Appointment Info Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#2E5E3E', fontWeight: 700, fontSize: '0.92rem' }}>
                <i className="fas fa-calendar-day"></i> Schedule & Appointment Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Date</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                    {formatDateDisplay(viewAppointmentDetails.date)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Time Slot</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className="far fa-clock" style={{ color: '#2E5E3E' }}></i>
                    {viewAppointmentDetails.time || 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Type</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: '6px',
                    background: viewAppointmentDetails.type === 'telemedicine' ? '#f5f3ff' : '#f0fdf4',
                    color: viewAppointmentDetails.type === 'telemedicine' ? '#6d28d9' : '#166534',
                    border: viewAppointmentDetails.type === 'telemedicine' ? '1px solid #ddd6fe' : '1px solid #bbf7d0'
                  }}>
                    <i className={viewAppointmentDetails.type === 'telemedicine' ? 'fas fa-video' : 'fas fa-hospital-user'}></i>
                    {viewAppointmentDetails.type === 'telemedicine' ? 'Telemedicine' : viewAppointmentDetails.type === 'walk-in' ? 'Walk-in' : 'In-Person'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Purpose</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 500, color: '#334155' }}>
                    {viewAppointmentDetails.purpose?.replace('[CANCEL_REQUESTED] ', '') || 'Check-up'}
                  </span>
                </div>
              </div>
              {viewAppointmentDetails.sessionCode && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Telemed Session Code:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, background: '#f5f3ff', color: '#6d28d9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ddd6fe' }}>
                    {viewAppointmentDetails.sessionCode}
                  </span>
                </div>
              )}
            </div>

            {/* Section 2: Two Columns: Owner & Pet */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Owner Info Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px 18px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#2E5E3E', fontWeight: 700, fontSize: '0.92rem' }}>
                  <i className="fas fa-user"></i> Owner Details
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block' }}>Full Name</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{viewAppointmentDetails.owner}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block' }}>Contact</span>
                    <a href={`tel:${viewAppointmentDetails.contact}`} style={{ fontSize: '0.88rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fas fa-phone-alt" style={{ fontSize: '0.75rem' }}></i>
                      {viewAppointmentDetails.contact}
                    </a>
                  </div>
                  {viewAppointmentDetails.email && (
                    <div>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block' }}>Email</span>
                      <a href={`mailto:${viewAppointmentDetails.email}`} style={{ fontSize: '0.84rem', color: '#475569', textDecoration: 'none', wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fas fa-envelope" style={{ fontSize: '0.75rem', color: '#94a3b8' }}></i>
                        {viewAppointmentDetails.email}
                      </a>
                    </div>
                  )}
                  {viewAppointmentDetails.address && (
                    <div>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block' }}>Address</span>
                      <span style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.3 }}>{viewAppointmentDetails.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pet Info Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px 18px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#2E5E3E', fontWeight: 700, fontSize: '0.92rem' }}>
                  <i className="fas fa-paw"></i> Pet Patient
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block' }}>Pet Name</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2E5E3E' }}>{viewAppointmentDetails.pet || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block' }}>Species & Breed</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#1e293b' }}>
                      {viewAppointmentDetails.species || 'N/A'}{viewAppointmentDetails.breed && viewAppointmentDetails.breed !== 'Other' && viewAppointmentDetails.breed !== 'N/A' ? ` · ${viewAppointmentDetails.breed}` : ''}
                    </span>
                  </div>
                  {(viewAppointmentDetails.petGender || viewAppointmentDetails.age) && (
                    <div>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, display: 'block' }}>Gender & Age</span>
                      <span style={{ fontSize: '0.84rem', color: '#475569' }}>
                        {[viewAppointmentDetails.petGender, viewAppointmentDetails.age ? `${viewAppointmentDetails.age} yr(s)` : null, viewAppointmentDetails.petWeight ? `${viewAppointmentDetails.petWeight} kg` : null].filter(Boolean).join(' · ') || '—'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Payment & GCash Receipt Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2E5E3E', fontWeight: 700, fontSize: '0.92rem' }}>
                  <i className="fas fa-file-invoice-dollar"></i> Payment & GCash Verification
                </div>
                {viewAppointmentDetails.amountPaid !== undefined && viewAppointmentDetails.amountPaid !== null ? (
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2E5E3E' }}>
                    ₱{Number(viewAppointmentDetails.amountPaid).toFixed(2)}
                  </span>
                ) : null}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: viewAppointmentDetails.receiptImage ? '1fr 180px' : '1fr', gap: '16px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Reference Number
                    </span>
                    {viewAppointmentDetails.referenceNumber ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                          {viewAppointmentDetails.referenceNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(viewAppointmentDetails.referenceNumber)}
                          style={{
                            background: copiedRef ? '#ecfdf5' : '#ffffff',
                            border: copiedRef ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                            color: copiedRef ? '#065f46' : '#475569',
                            borderRadius: '6px',
                            padding: '3px 7px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Copy Reference Number"
                        >
                          <i className={copiedRef ? "fas fa-check" : "fas fa-copy"}></i>
                          {copiedRef ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No reference number provided (Cash / Walk-in)</span>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                      Payment Method
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                      {viewAppointmentDetails.referenceNumber || viewAppointmentDetails.receiptImage ? 'GCash (E-Wallet)' : 'Direct Cash Payment'}
                    </span>
                  </div>
                </div>

                {/* Receipt Thumbnail */}
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Payment Receipt
                  </span>
                  {viewAppointmentDetails.receiptImage ? (
                    <div 
                      onClick={() => setPreviewReceiptImage(viewAppointmentDetails.receiptImage)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '2px solid #e2e8f0',
                        height: '110px',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      title="Click to view full receipt"
                    >
                      <img 
                        src={viewAppointmentDetails.receiptImage} 
                        alt="Receipt" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        gap: '4px',
                        opacity: 0.9
                      }}>
                        <i className="fas fa-search-plus" style={{ fontSize: '1.2rem' }}></i>
                        <span>Zoom In</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      height: '80px',
                      borderRadius: '10px',
                      border: '1px dashed #cbd5e1',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      fontSize: '0.78rem',
                      gap: '4px'
                    }}>
                      <i className="fas fa-receipt" style={{ fontSize: '1.2rem' }}></i>
                      <span>No receipt uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #f1f5f9',
            background: '#f8fafc',
            borderRadius: '0 0 20px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Quick Actions inside modal */}
              {viewAppointmentDetails.status?.toLowerCase() === 'pending' && (
                <button
                  onClick={() => {
                    const id = viewAppointmentDetails.id;
                    setViewAppointmentDetails(null);
                    setAppointmentToMarkPaid(id);
                  }}
                  style={{
                    padding: '9px 16px',
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-check"></i> Verify Payment
                </button>
              )}

              {['pending', 'paid'].includes(viewAppointmentDetails.status?.toLowerCase()) && (
                <button
                  onClick={() => {
                    const id = viewAppointmentDetails.id;
                    setViewAppointmentDetails(null);
                    setAppointmentToMarkCompleted(id);
                  }}
                  style={{
                    padding: '9px 16px',
                    background: '#eff6ff',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-flag-checkered"></i> Mark Completed
                </button>
              )}

              {viewAppointmentDetails.status?.toLowerCase() === 'pending' && (
                <button
                  onClick={() => {
                    const id = viewAppointmentDetails.id;
                    setViewAppointmentDetails(null);
                    handleDeclineAppointment(id);
                  }}
                  style={{
                    padding: '9px 16px',
                    background: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-ban"></i> Decline
                </button>
              )}
            </div>

            <button
              onClick={() => setViewAppointmentDetails(null)}
              style={{
                padding: '9px 22px',
                background: '#2E5E3E',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* RECEIPT FULLSCREEN LIGHTBOX */}
    {previewReceiptImage && (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 20000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px'
        }}
        onClick={() => setPreviewReceiptImage(null)}
      >
        <div 
          style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={() => setPreviewReceiptImage(null)}
            style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#0f172a',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 10
            }}
          >
            <i className="fas fa-times"></i>
          </button>
          <img 
            src={previewReceiptImage} 
            alt="Receipt Preview" 
            style={{
              maxWidth: '85vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
              display: 'block',
              background: '#ffffff'
            }}
          />
        </div>
      </div>
    )}

    </>
  );
}
