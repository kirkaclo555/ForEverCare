"use client";

import React, { useState, useEffect } from 'react';
import { useRecords, PetRecord } from '../../../hooks/useRecords';

const DOG_BREEDS = ["Aspin", "Golden Retriever", "Labrador", "Poodle", "Bulldog", "Beagle", "Pug", "Chihuahua", "Shih Tzu", "Husky", "German Shepherd", "Rottweiler", "Dachshund", "Boxer", "Doberman", "Great Dane", "Pomeranian", "Corgi", "Shiba Inu", "Chow Chow", "Dalmatian", "Mixed"];
const CAT_BREEDS = ["Puspin", "Persian", "Siamese", "Maine Coon", "Bengal", "Sphynx", "British Shorthair", "Scottish Fold", "Mixed"];

export default function RecordsPage() {
    const { records, addRecord, updateRecord, deleteRecord } = useRecords();
    const [users, setUsers] = useState<any[]>([]);
    
    useEffect(() => {
        fetch('/api/users?role=USER')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setUsers(data);
          })
          .catch(console.error);
    }, []);

    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PetRecord | null>(null);

    // Filter State
    const [filterVaccine, setFilterVaccine] = useState('all');

    // Add Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [petToArchive, setPetToArchive] = useState<any | null>(null);
    const [verifyingPetId, setVerifyingPetId] = useState<string | null>(null);

    const handleVerifyPet = async (petId: string) => {
        setVerifyingPetId(petId);
        try {
            const res = await fetch(`/api/pets/${petId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verifiedBy: 'Clinic Admin' })
            });
            if (res.ok) {
                await updateRecord(petId, { verificationStatus: 'VERIFIED' });
                if (selectedRecord && selectedRecord.id === petId) {
                    setSelectedRecord({ ...selectedRecord, verificationStatus: 'VERIFIED' });
                }
                setSuccessMessage('Pet details verified successfully in person! Pet monitoring is now unlocked.');
            } else {
                alert('Failed to verify pet.');
            }
        } catch (e) {
            console.error(e);
            alert('Error verifying pet.');
        } finally {
            setVerifyingPetId(null);
        }
    };

    // Form State for Add
    const [formData, setFormData] = useState<any>({
        ownerId: '', petName: '', species: '', breed: '', gender: '', age: '',
        color: '', weight: '', environment: 'Indoor', activity: 'Moderate', pastIllness: 'None', previousSurgeries: 'None', vaccine: 'Pending', veterinarian: ''
    });

    const openViewModal = (record: PetRecord) => {
        setSelectedRecord(record);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedRecord(null);
    };

    const openEditModal = () => {
        if (selectedRecord) {
            setFormData({
                id: selectedRecord.id,
                ownerId: '',
                petName: selectedRecord.petName,
                species: selectedRecord.species,
                breed: selectedRecord.breed,
                gender: selectedRecord.gender,
                age: selectedRecord.age?.replace(/[^0-9]/g, '') || '',
                color: selectedRecord.color,
                weight: selectedRecord.weight?.replace(/[^0-9.]/g, '') || '',
                environment: selectedRecord.environment || 'Indoor',
                activity: selectedRecord.activity || 'Moderate',
                vaccine: selectedRecord.vaccine || 'Pending',
                veterinarian: selectedRecord.veterinarian || '',
                pastIllness: selectedRecord.pastIllness || 'None',
                previousSurgeries: selectedRecord.previousSurgeries || 'None'
            });
            setIsEditModalOpen(true);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            petName: formData.petName,
            species: formData.species,
            breed: formData.breed,
            gender: formData.gender,
            age: formData.age ? parseInt(formData.age, 10) : null,
            color: formData.color,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            environment: formData.environment,
            activity: formData.activity,
            vaccinationRecord: formData.vaccine,
            veterinarian: formData.veterinarian,
            pastIllness: formData.pastIllness,
            previousSurgeries: formData.previousSurgeries
        };
        const updated = await updateRecord(formData.id, payload as any);
        if (updated) {
            setSelectedRecord({ ...selectedRecord, ...updated });
        }
        setIsEditModalOpen(false);
        setFormData({ vaccine: 'Pending', pastIllness: 'None', previousSurgeries: 'None', ownerId: '', petName: '', species: '', breed: '', gender: '', age: '', color: '', weight: '', environment: 'Indoor', activity: 'Moderate', veterinarian: '' });
        setSuccessMessage('Successfully updated pet details!');
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ownerId: formData.ownerId,
            petName: formData.petName,
            species: formData.species,
            breed: formData.breed,
            gender: formData.gender,
            age: formData.age,
            color: formData.color,
            weight: formData.weight,
            environment: formData.environment,
            activity: formData.activity,
            vaccine: formData.vaccine,
            veterinarian: formData.veterinarian,
            pastIllness: formData.pastIllness,
            previousSurgeries: formData.previousSurgeries
        };
        await addRecord(payload);
        setIsAddModalOpen(false);
        setFormData({ vaccine: 'Pending', pastIllness: 'None', previousSurgeries: 'None', ownerId: '', petName: '', species: '', breed: '', gender: '', age: '', color: '', weight: '', environment: 'Indoor', activity: 'Moderate', veterinarian: '' });
        setSuccessMessage('Successfully added a new pet!');
    };

    const handleExport = () => {
        // Create CSV Header
        const headers = ['ID', 'Pet Name', 'Species', 'Breed', 'Gender', 'Age', 'Color', 'Weight', 'Environment', 'Activity', 'Owner Name', 'Contact', 'Address', 'Vaccine', 'Veterinarian', 'Past Illness', 'Previous Surgeries'];
        
        // Map records to CSV rows
        const csvRows = records.map(r => {
            return [
                r.id, r.petName, r.species, r.breed, r.gender, r.age, r.color, r.weight, 
                `"${r.environment || 'Indoor'}"`, `"${r.activity || 'Moderate'}"`,
                `"${r.ownerName}"`, `"${r.contact}"`, `"${r.address}"`, r.vaccine, 
                `"${r.veterinarian}"`, `"${r.pastIllness}"`, `"${r.previousSurgeries}"`
            ].join(',');
        });

        // Combine header and rows
        const csvString = [headers.join(','), ...csvRows].join('\n');
        
        // Trigger Download
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "pet_records.csv";
        link.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                if (Array.isArray(parsed)) {
                    parsed.forEach(record => {
                        // Basic validation
                        if (record.petName && record.ownerName) {
                            addRecord(record);
                        }
                    });
                    alert('Records imported successfully!');
                }
            } catch (err) {
                alert('Invalid JSON file format.');
            }
        };
        reader.readAsText(file);
    };

    const displayedRecords = records.filter(record => 
        (filterVaccine === 'all' || record.vaccine.toLowerCase() === filterVaccine.toLowerCase()) && !record.isArchived
    );

    return (
        <div className="module-content">
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .modal-content, .modal-content * {
                        visibility: visible;
                    }
                    .modal-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        max-width: 100% !important;
                        box-shadow: none !important;
                    }
                    .modal-close, .print-btn {
                        display: none !important;
                    }
                }
            `}</style>
            <div className="section-container" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', background: 'transparent', boxShadow: 'none' }}>

                {/* Main Table Section */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div className="filter-dropdown" style={{ display: 'flex', gap: '10px' }}>
                            <select 
                                className="form-control" 
                                style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#4a5568', background: 'white' }}
                                value={filterVaccine}
                                onChange={(e) => setFilterVaccine(e.target.value)}
                            >
                                <option value="all">All Vaccines</option>
                                <option value="up to date">Up to Date</option>
                                <option value="overdue">Overdue</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <input type="file" accept=".json" id="import-file" style={{ display: 'none' }} onChange={handleImport} />
                            <button className="btn-secondary" onClick={() => document.getElementById('import-file')?.click()} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#4a5568', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fas fa-file-import"></i> Import Record
                            </button>
                            <button className="btn-secondary" onClick={handleExport} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#4a5568', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fas fa-file-export"></i> Export Record
                            </button>
                            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2E5E3E', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fas fa-plus"></i> Add Pet
                            </button>
                        </div>
                    </div>

                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>No.</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Owner Name</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Pet Name</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Species / Breed</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Contact</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Vaccine</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Verification</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedRecords.length > 0 ? displayedRecords.map((record, index) => (
                                    <tr 
                                        key={record.id} 
                                        onClick={() => openViewModal(record)}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                        style={{ borderBottom: '1px solid #edf2f7', background: 'white', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                                        title="Click to view details"
                                    >
                                        <td style={{ padding: '15px', color: '#718096' }}><strong>{index + 1}</strong></td>
                                        <td style={{ padding: '15px', color: '#2d3748', fontWeight: 600 }}>{record.ownerName}</td>
                                        <td style={{ padding: '15px', color: '#2d3748', fontWeight: 600 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e6fffa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                                    {record.avatar && (record.avatar.startsWith('/') || record.avatar.startsWith('data:image/') || record.avatar.startsWith('http')) && !record.avatar.startsWith('file') ? (
                                                        <img src={record.avatar} alt={record.petName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <i className={`fas fa-${record.species?.toLowerCase() === 'cat' ? 'cat' : 'dog'}`} style={{ color: '#2E5E3E', fontSize: '0.85rem' }}></i>
                                                    )}
                                                </div>
                                                <span>{record.petName}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '15px', color: '#4a5568' }}>{record.species} ({record.breed})</td>
                                        <td style={{ padding: '15px', color: '#718096' }}>{record.contact}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                background: record.vaccine === 'Up to Date' ? '#c6f6d5' : record.vaccine === 'Overdue' ? '#fed7d7' : '#feebc8',
                                                color: record.vaccine === 'Up to Date' ? '#22543d' : record.vaccine === 'Overdue' ? '#9b2c2c' : '#7b341e'
                                            }}>
                                                {record.vaccine}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                background: record.verificationStatus === 'VERIFIED' ? '#c6f6d5' : '#fefcbf',
                                                color: record.verificationStatus === 'VERIFIED' ? '#22543d' : '#744210'
                                            }}>
                                                <i className={`fas fa-${record.verificationStatus === 'VERIFIED' ? 'check-circle' : 'clock'}`}></i>
                                                {record.verificationStatus === 'VERIFIED' ? 'Verified' : 'Pending Walk-in'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                {record.verificationStatus !== 'VERIFIED' && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleVerifyPet(record.id); }} 
                                                        disabled={verifyingPetId === record.id || !record.hasPaidAppointment}
                                                        style={{ padding: '6px 10px', background: record.hasPaidAppointment ? '#38A169' : '#A0AEC0', color: 'white', border: 'none', borderRadius: '6px', cursor: record.hasPaidAppointment ? 'pointer' : 'not-allowed', fontSize: '0.8rem', fontWeight: 600, transition: '0.2s', opacity: record.hasPaidAppointment ? 1 : 0.7 }} 
                                                        title={record.hasPaidAppointment ? "Verify Pet in Person" : "Pet must have a paid appointment to be verified"}
                                                    >
                                                        <i className="fas fa-check"></i> Verify
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setPetToArchive(record); }} 
                                                    style={{ padding: '6px 12px', background: '#e6fffa', color: '#2E5E3E', border: '1px solid #C6F6D5', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }} 
                                                    title="Archive Pet"
                                                >
                                                    <i className="fas fa-archive"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                            <i className="fas fa-paw" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                                            <p>No records found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* View Patient Modal */}
                {isViewModalOpen && selectedRecord && (
                    <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={(e) => { if (e.target === e.currentTarget) closeViewModal(); }}>
                        <div className="modal-content" style={{ background: '#f8fafc', borderRadius: '24px', width: '90%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                            
                            {/* Formal Header */}
                            <div style={{ background: 'linear-gradient(135deg, #2E5E3E 0%, #1a3622 100%)', padding: '30px 40px', position: 'relative', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                                <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                                    <button className="print-btn" onClick={() => window.print()} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, transition: '0.2s', backdropFilter: 'blur(4px)' }}>
                                        <i className="fas fa-print"></i> Print Record
                                    </button>
                                    <button className="modal-close" onClick={closeViewModal} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                                        {selectedRecord.avatar && (selectedRecord.avatar.startsWith('/') || selectedRecord.avatar.startsWith('data:image/') || selectedRecord.avatar.startsWith('http')) && !selectedRecord.avatar.startsWith('file') ? (
                                            <img src={selectedRecord.avatar} alt={selectedRecord.petName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <i className={`fas fa-${selectedRecord.species?.toLowerCase() === 'cat' ? 'cat' : 'dog'}`} style={{ fontSize: '36px', color: '#2E5E3E' }}></i>
                                        )}
                                    </div>
                                    <div>
                                        <h2 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{selectedRecord.petName}</h2>
                                        <div style={{ display: 'flex', gap: '15px', color: '#e2e8f0', fontSize: '0.95rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fas fa-paw"></i> {selectedRecord.species} • {selectedRecord.breed}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i className="fas fa-id-badge"></i> ID: {selectedRecord.displayId || selectedRecord.id.substring(0,8)}</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '3px 10px',
                                                borderRadius: '12px',
                                                fontWeight: 700,
                                                background: selectedRecord.verificationStatus === 'VERIFIED' ? '#c6f6d5' : '#fefcbf',
                                                color: selectedRecord.verificationStatus === 'VERIFIED' ? '#22543d' : '#744210',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                <i className={`fas fa-${selectedRecord.verificationStatus === 'VERIFIED' ? 'check-circle' : 'clock'}`}></i>
                                                {selectedRecord.verificationStatus === 'VERIFIED' ? 'VERIFIED (CLINIC)' : 'PENDING WALK-IN APPOINTMENT'}
                                            </span>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={openEditModal}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.2)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '4px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        backdropFilter: 'blur(4px)'
                                                    }}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                    Edit
                                                </button>
                                                {selectedRecord.verificationStatus !== 'VERIFIED' && (
                                                    <button
                                                        onClick={() => handleVerifyPet(selectedRecord.id)}
                                                        disabled={verifyingPetId === selectedRecord.id || !selectedRecord.hasPaidAppointment}
                                                        style={{
                                                            background: selectedRecord.hasPaidAppointment ? '#38A169' : '#A0AEC0',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '4px 12px',
                                                            borderRadius: '6px',
                                                            cursor: selectedRecord.hasPaidAppointment ? 'pointer' : 'not-allowed',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            opacity: selectedRecord.hasPaidAppointment ? 1 : 0.7
                                                        }}
                                                        title={selectedRecord.hasPaidAppointment ? "Verify Pet in Person" : "Pet must have a paid appointment to be verified"}
                                                    >
                                                        <i className="fas fa-user-check"></i>
                                                        {verifyingPetId === selectedRecord.id ? 'Verifying...' : 'Verify in Person'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body" style={{ padding: '40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                    
                                    {/* Left Column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                        
                                        {/* Pet Information Card */}
                                        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #edf2f7' }}>
                                            <h4 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                                                <i className="fas fa-info-circle" style={{ color: '#2E5E3E' }}></i> General Information
                                            </h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Gender</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 500 }}>{selectedRecord.gender}</p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Age</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 500 }}>{selectedRecord.age}</p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Color</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 500 }}>{selectedRecord.color}</p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Weight</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 500 }}>{selectedRecord.weight}</p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Environment</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 500 }}>{selectedRecord.environment || 'Indoor'}</p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Activity Level</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 500 }}>{selectedRecord.activity || 'Moderate'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Owner Information Card */}
                                        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #edf2f7' }}>
                                            <h4 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                                                <i className="fas fa-user" style={{ color: '#2E5E3E' }}></i> Owner Details
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Owner Name</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 500 }}>{selectedRecord.ownerName}</p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Contact Number</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 500 }}>{selectedRecord.contact}</p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Address</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 500 }}>{selectedRecord.address}</p>
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>App User Profile</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 500 }}>{selectedRecord.userName}</p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Right Column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                        
                                        {/* Medical Status Card */}
                                        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #edf2f7' }}>
                                            <h4 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                                                <i className="fas fa-stethoscope" style={{ color: '#2E5E3E' }}></i> Medical Profile
                                            </h4>
                                            
                                            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                                                <div>
                                                    <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Vaccination Status</p>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 600 }}>{selectedRecord.vaccine}</p>
                                                </div>
                                                <div style={{ 
                                                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: selectedRecord.vaccine === 'Up to Date' ? '#c6f6d5' : selectedRecord.vaccine === 'Overdue' ? '#C6F6D5' : '#C6F6D5',
                                                    color: selectedRecord.vaccine === 'Up to Date' ? '#22543d' : selectedRecord.vaccine === 'Overdue' ? '#9b2c2c' : '#7b341e'
                                                }}>
                                                    <i className={`fas ${selectedRecord.vaccine === 'Up to Date' ? 'fa-check' : selectedRecord.vaccine === 'Overdue' ? 'fa-exclamation-triangle' : 'fa-clock'}`}></i>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '20px' }}>
                                                <p style={{ margin: '0 0 4px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Primary Veterinarian</p>
                                                <p style={{ margin: 0, color: '#2d3748', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <i className="fas fa-user-md" style={{ color: '#4a5568' }}></i> {selectedRecord.veterinarian || 'Not specified'}
                                                </p>
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <p style={{ margin: '0 0 6px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Past Illnesses</p>
                                                <div style={{ background: '#fffbeb', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                                    <p style={{ margin: 0, color: '#92400e', fontSize: '0.95rem', lineHeight: '1.4' }}>{selectedRecord.pastIllness || 'None'}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p style={{ margin: '0 0 6px 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Previous Surgeries</p>
                                                <div style={{ background: '#fef2f2', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                                    <p style={{ margin: 0, color: '#991b1b', fontSize: '0.95rem', lineHeight: '1.4' }}>{selectedRecord.previousSurgeries || 'None'}</p>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* Triage & Monitoring History */}
                                <div style={{ marginTop: '30px', background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #edf2f7' }}>
                                    <h4 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                                        <i className="fas fa-heartbeat" style={{ color: '#2E5E3E' }}></i> Triage & Monitoring History
                                    </h4>
                                    {selectedRecord.monitoring && selectedRecord.monitoring.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            {selectedRecord.monitoring.map((m: any) => (
                                                <div key={m.id} style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '12px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 600, color: '#2d3748' }}>
                                                            {m.chatCategory || 'Health'} Monitoring Session
                                                        </span>
                                                        <span style={{ 
                                                            fontSize: '0.8rem', 
                                                            padding: '4px 10px', 
                                                            borderRadius: '20px', 
                                                            fontWeight: 600,
                                                            background: m.status === 'CRITICAL' ? '#C6F6D5' : m.status === 'RESOLVED' ? '#c6f6d5' : '#C6F6D5',
                                                            color: m.status === 'CRITICAL' ? '#9b2c2c' : m.status === 'RESOLVED' ? '#22543d' : '#7b341e'
                                                        }}>
                                                            {m.status || 'Active'}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '6px' }}>
                                                        <strong>Date:</strong> {new Date(m.createdAt).toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '4px' }}>
                                                        <strong>Diagnosis:</strong> {m.symptoms || 'Triage Chat Started'}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '4px' }}>
                                                        <strong>Observation Summary:</strong> {m.reportSummary || 'N/A'}
                                                    </div>
                                                    {m.recommendations && (
                                                        <div style={{ fontSize: '0.9rem', color: '#2b6cb0' }}>
                                                            <strong>Recommendations:</strong> {m.recommendations}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0, color: '#718096', fontStyle: 'italic', fontSize: '0.95rem' }}>No triage or monitoring history recorded for this pet.</p>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Patient Modal */}
                {isEditModalOpen && (
                    <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }} onClick={(e) => { if (e.target === e.currentTarget) setIsEditModalOpen(false); }}>
                        <div className="modal-content" style={{ background: '#f8fafc', borderRadius: '24px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
                            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #2E5E3E 0%, #1a3622 100%)', padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem', fontWeight: 800 }}><i className="fas fa-edit"></i> Edit Pet Details</h3>
                                    <p style={{ color: '#e2e8f0', margin: '8px 0 0 0', fontSize: '1rem', opacity: 0.9 }}>Update information before verifying</p>
                                </div>
                                <button type="button" className="modal-close" onClick={() => setIsEditModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', backdropFilter: 'blur(4px)' }}>
                                    <i className="fas fa-times" style={{ fontSize: '1.2rem' }}></i>
                                </button>
                            </div>
                            
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body" style={{ padding: '30px 40px' }}>
                                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #edf2f7' }}>
                                        <h4 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                                            <i className="fas fa-paw" style={{ color: '#2E5E3E' }}></i> Pet Details
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Pet Name *</label>
                                                <input type="text" required style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} placeholder="Buddy" />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Species *</label>
                                                <select required style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})}>
                                                    <option value="">Select</option>
                                                    <option value="Dog">Dog</option>
                                                    <option value="Cat">Cat</option>
                                                    <option value="Bird">Bird</option>
                                                    <option value="Rabbit">Rabbit</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Breed</label>
                                                {['Dog', 'Cat'].includes(formData.species) ? (
                                                    <select style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})}>
                                                        <option value="">Select Breed</option>
                                                        {(formData.species === 'Dog' ? DOG_BREEDS : CAT_BREEDS).map(b => (
                                                            <option key={b} value={b}>{b}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input type="text" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} placeholder="E.g. Golden Retriever" />
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Gender</label>
                                                <select style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Age (Years)</label>
                                                <input type="text" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="3" />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Color</label>
                                                <input type="text" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} placeholder="Brown" />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Weight (kg)</label>
                                                <input type="text" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="15" />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Environment</label>
                                                <select style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.environment} onChange={(e) => setFormData({...formData, environment: e.target.value})}>
                                                    <option value="Indoor">Indoor</option>
                                                    <option value="Outdoor">Outdoor</option>
                                                    <option value="Mixed">Mixed</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Activity Level</label>
                                                <select style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.activity} onChange={(e) => setFormData({...formData, activity: e.target.value})}>
                                                    <option value="Low">Low</option>
                                                    <option value="Moderate">Moderate</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Vaccination Status</label>
                                                <select style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.vaccine} onChange={(e) => setFormData({...formData, vaccine: e.target.value})}>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Up to Date">Up to Date</option>
                                                    <option value="Overdue">Overdue</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '25px 40px', background: '#f8fafc', borderTop: '1px solid #edf2f7', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, color: '#4a5568', fontSize: '0.95rem', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #2E5E3E 0%, #1a3622 100%)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, color: 'white', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 4px 15px rgba(46, 94, 62, 0.3)' }}>
                                        <i className="fas fa-save"></i> Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Patient Modal */}
                {isAddModalOpen && (
                    <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }} onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}>
                        <div className="modal-content" style={{ background: '#f8fafc', borderRadius: '24px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
                            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #2E5E3E 0%, #1a3622 100%)', padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem', fontWeight: 800 }}><i className="fas fa-plus-circle"></i> Add New Pet</h3>
                                    <p style={{ color: '#e2e8f0', margin: '8px 0 0 0', fontSize: '1rem', opacity: 0.9 }}>Register a new pet to the system</p>
                                </div>
                                <button type="button" className="modal-close" onClick={() => setIsAddModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', backdropFilter: 'blur(4px)' }}>
                                    <i className="fas fa-times" style={{ fontSize: '1.2rem' }}></i>
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddSubmit}>
                                <div className="modal-body" style={{ padding: '30px 40px' }}>
                                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #edf2f7' }}>
                                        <h4 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                                            <i className="fas fa-paw" style={{ color: '#2E5E3E' }}></i> Pet Details
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Owner *</label>
                                                <select required style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.ownerId} onChange={(e) => setFormData({...formData, ownerId: e.target.value})}>
                                                    <option value="">Select Owner</option>
                                                    {users.map(u => (
                                                        <option key={u.id} value={u.id}>{u.fullName || u.name} ({u.email})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Pet Name *</label>
                                                <input type="text" required style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} placeholder="Buddy" />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Species *</label>
                                                <select required style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})}>
                                                    <option value="">Select</option>
                                                    <option value="Dog">Dog</option>
                                                    <option value="Cat">Cat</option>
                                                    <option value="Bird">Bird</option>
                                                    <option value="Rabbit">Rabbit</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Breed</label>
                                                {['Dog', 'Cat'].includes(formData.species) ? (
                                                    <select style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})}>
                                                        <option value="">Select Breed</option>
                                                        {(formData.species === 'Dog' ? DOG_BREEDS : CAT_BREEDS).map(b => (
                                                            <option key={b} value={b}>{b}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input type="text" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} placeholder="E.g. Golden Retriever" />
                                                )}
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Gender</label>
                                                <select style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Age (Years)</label>
                                                <input type="text" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="3" />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Environment</label>
                                                <select style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.environment} onChange={(e) => setFormData({...formData, environment: e.target.value})}>
                                                    <option value="Indoor">Indoor</option>
                                                    <option value="Outdoor">Outdoor</option>
                                                    <option value="Mixed">Mixed</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Activity Level</label>
                                                <select style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s' }} value={formData.activity} onChange={(e) => setFormData({...formData, activity: e.target.value})}>
                                                    <option value="Low">Low</option>
                                                    <option value="Moderate">Moderate</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '25px 40px', background: '#f8fafc', borderTop: '1px solid #edf2f7', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, color: '#4a5568', fontSize: '0.95rem', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #2E5E3E 0%, #1a3622 100%)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, color: 'white', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 4px 15px rgba(46, 94, 62, 0.3)' }}>
                                        <i className="fas fa-check"></i> Save Pet
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {/* Success Modal */}
            {successMessage && (
                <div className="modal show" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000}}>
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
            {/* Pet Archive Confirmation Modal */}
            {petToArchive && (
                <div className="modal show" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000}}>
                    <div className="modal-content" style={{background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#C6F6D5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                            <i className="fas fa-archive" style={{ color: '#2E5E3E', fontSize: '2rem' }}></i>
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem', fontWeight: 600 }}>Archive Pet Record</h3>
                        <p style={{ color: '#718096', marginBottom: '25px', lineHeight: '1.5' }}>
                            Are you sure you want to archive <strong style={{ color: '#1a202c' }}>{petToArchive.petName}</strong>? It will be moved to the Archive module and can be restored anytime.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setPetToArchive(null)} className="btn-secondary" style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
                            <button onClick={async () => {
                                await updateRecord(petToArchive.id, { isArchived: true });
                                setSuccessMessage(`${petToArchive.petName} has been successfully archived.`);
                                setPetToArchive(null);
                            }} className="btn-primary" style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: '#2E5E3E', borderColor: '#2E5E3E', color: 'white' }}>Archive</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
