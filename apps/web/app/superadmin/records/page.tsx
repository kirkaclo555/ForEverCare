"use client";

import React, { useState, useEffect } from 'react';
import { useRecords, PetRecord } from '../../../hooks/useRecords';
import { useUsers } from '../../../hooks/useUsers';

export default function RecordsPage() {
    const { records, addRecord, updateRecord, deleteRecord } = useRecords();
    const { users, addUser } = useUsers();
    
    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PetRecord | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    // Filter State
    const [filterVaccine, setFilterVaccine] = useState('all');

    // Add Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
    const [contactWarning, setContactWarning] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest('.action-dropdown-container')) {
                setOpenActionMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Form State for Add
    const [formData, setFormData] = useState<Partial<PetRecord>>({
        petName: '', species: '', breed: '', gender: '', age: '',
        color: '', weight: '', ownerName: '', contact: '', address: '',
        userName: '', pastIllness: '', previousSurgeries: '', vaccine: 'Pending', veterinarian: ''
    });

    const openViewModal = (record: PetRecord) => {
        setSelectedRecord(record);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedRecord(null);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newRecord: PetRecord = {
            id: `PR-${1000 + Math.floor(Math.random() * 9000)}`,
            petName: formData.petName || '',
            species: formData.species || '',
            breed: formData.breed || '',
            gender: formData.gender || '',
            age: formData.age || '',
            color: formData.color || '',
            weight: formData.weight || '',
            ownerName: formData.ownerName || '',
            contact: formData.contact || '',
            address: formData.address || '',
            userName: formData.userName || '',
            pastIllness: formData.pastIllness || 'None',
            previousSurgeries: formData.previousSurgeries || 'None',
            vaccine: formData.vaccine || 'Pending',
            veterinarian: formData.veterinarian || ''
        };

        // Sync to Users
        if (formData.ownerName) {
            const ownerExists = users.some(u => u.name.toLowerCase() === formData.ownerName!.toLowerCase());
            if (!ownerExists) {
                addUser({
                    name: formData.ownerName,
                    email: 'pending@fureverpaw.com',
                    contact: formData.contact || '',
                    role: 'petowner',
                    status: 'Active'
                });
            }
        }

        addRecord(newRecord);
        setIsAddModalOpen(false);
        setFormData({
            petName: '', species: '', breed: '', gender: '', age: '',
            color: '', weight: '', ownerName: '', contact: '', address: '',
            userName: '', pastIllness: '', previousSurgeries: '', vaccine: 'Pending', veterinarian: ''
        });
        setSuccessMessage('Successfully added a new pet!');
    };

    const handleExport = () => {
        // Create CSV Header
        const headers = ['ID', 'Pet Name', 'Species', 'Breed', 'Gender', 'Age', 'Color', 'Weight', 'Owner Name', 'Contact', 'Address', 'Vaccine', 'Veterinarian', 'Past Illness', 'Previous Surgeries'];
        
        // Map records to CSV rows
        const csvRows = records.map(r => {
            return [
                r.id, r.petName, r.species, r.breed, r.gender, r.age, r.color, r.weight, 
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
        filterVaccine === 'all' || record.vaccine.toLowerCase() === filterVaccine.toLowerCase()
    );

    const totalPages = Math.max(1, Math.ceil(displayedRecords.length / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRecords = displayedRecords.slice(startIndex, startIndex + rowsPerPage);

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

                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem', color: '#2d3748', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-paw" style={{ color: '#2E5E3E', background: 'rgba(46, 94, 62, 0.1)', padding: '12px', borderRadius: '50%' }}></i> Pet Records
                    </h2>
                    <p style={{ color: '#718096', margin: '10px 0 0 0', fontSize: '1.1rem' }}>Manage and view all pet records</p>
                </div>

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

                    <div className="table-container" style={{ overflowX: 'visible', minHeight: '350px', paddingBottom: '150px' }}>
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>ID</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Pet Name</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Pet Type / Breed</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Owner</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Contact</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Vaccine</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((record, index) => (
                                    <tr key={record.id} style={{ borderBottom: '1px solid #edf2f7', background: 'white' }}>
                                        <td style={{ padding: '15px', color: '#718096' }}><strong>{startIndex + index + 1}</strong></td>
                                        <td style={{ padding: '15px', color: '#2d3748', fontWeight: 600 }}>{record.petName}</td>
                                        <td style={{ padding: '15px', color: '#4a5568' }}>{record.species} ({record.breed})</td>
                                        <td style={{ padding: '15px', color: '#4a5568' }}>{record.ownerName}</td>
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
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <div className="action-dropdown-container" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                                <button className="btn-secondary" style={{padding: '6px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4a5568'}} onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === record.id ? null : record.id); }}>
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                                {openActionMenuId === record.id && (
                                                    <div style={{ position: 'absolute', right: '50%', top: '100%', transform: 'translateX(50%)', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '120px', overflow: 'hidden' }}>
                                                        <button style={{ padding: '10px 15px', textAlign: 'left', border: 'none', background: 'white', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'} onMouseLeave={e => e.currentTarget.style.background = 'white'} onClick={(e) => { e.stopPropagation(); openViewModal(record); setOpenActionMenuId(null); }}>
                                                            <i className="fas fa-eye" style={{color: '#4a5568', width: '16px'}}></i> View
                                                        </button>
                                                        <button style={{ padding: '10px 15px', textAlign: 'left', border: 'none', background: 'white', cursor: 'pointer', color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'} onMouseLeave={e => e.currentTarget.style.background = 'white'} onClick={(e) => { e.stopPropagation(); deleteRecord(record.id); setOpenActionMenuId(null); }}>
                                                            <i className="fas fa-trash" style={{width: '16px'}}></i> Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {Array.from({ length: Math.max(0, rowsPerPage - currentRecords.length) }).map((_, i) => (
                                    <tr key={`empty-${i}`} style={{ height: '53px', background: '#fafafa' }}>
                                        <td style={{ textAlign: 'center', color: '#a0aec0', fontWeight: 'bold' }}>{startIndex + currentRecords.length + i + 1}</td>
                                        <td colSpan={6} style={{ textAlign: 'center', color: '#cbd5e0' }}>- Empty Slot -</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '15px 0', borderTop: '1px solid #edf2f7' }}>
                            <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>
                                Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + rowsPerPage, displayedRecords.length)}</strong> of <strong>{displayedRecords.length}</strong> records
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{ padding: '8px 12px', background: currentPage === 1 ? '#edf2f7' : 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#a0aec0' : '#4a5568' }}
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', color: '#4a5568', fontWeight: 600 }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '8px 12px', background: currentPage === totalPages ? '#edf2f7' : 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#a0aec0' : '#4a5568' }}
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* View Patient Modal - Redesigned */}
                {isViewModalOpen && selectedRecord && (
                    <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) closeViewModal(); }}>
                        <div className="modal-content" style={{ background: '#f0f4f8', borderRadius: '24px', width: '95%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0 }}>
                            {/* Header Section */}
                            <div style={{ background: 'white', padding: '30px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #2E5E3E, #1a4d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', boxShadow: '0 10px 25px rgba(46, 94, 62, 0.2)' }}>
                                        <i className={selectedRecord.species?.toLowerCase() === 'cat' ? 'fas fa-cat' : 'fas fa-dog'}></i>
                                    </div>
                                    <div>
                                        <h2 style={{ margin: '0 0 5px 0', color: '#2d3748', fontSize: '2rem', fontWeight: 800 }}>{selectedRecord.petName}</h2>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ background: '#edf2f7', color: '#4a5568', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>{selectedRecord.id}</span>
                                            <span style={{ color: '#718096', fontSize: '0.95rem' }}>{selectedRecord.breed} ({selectedRecord.species})</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="print-btn" onClick={() => window.print()} style={{ background: 'white', color: '#4a5568', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                        <i className="fas fa-print"></i> Print Record
                                    </button>
                                    <button className="modal-close" onClick={closeViewModal} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '12px', color: '#a0aec0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}><i className="fas fa-times"></i></button>
                                </div>
                            </div>
                            
                            {/* Body Layout */}
                            <div className="modal-body" style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', gridAutoRows: 'min-content' }}>
                                {/* Left Column: Pet Info & Medical */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-info-circle" style={{ color: '#2E5E3E' }}></i> Pet Information</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Gender</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{selectedRecord.gender || 'Unknown'}</p></div>
                                            <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Age</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{selectedRecord.age || 'Unknown'}</p></div>
                                            <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Color</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{selectedRecord.color || 'Unknown'}</p></div>
                                            <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Weight</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{selectedRecord.weight || 'Unknown'}</p></div>
                                        </div>
                                    </div>

                                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-notes-medical" style={{ color: '#2E5E3E' }}></i> Medical History</h3>
                                        
                                        <div style={{ marginBottom: '20px' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Vaccination Status</p>
                                            <div style={{ marginTop: '8px' }}>
                                                <span style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700,
                                                    background: selectedRecord.vaccine === 'Up to Date' ? '#c6f6d5' : selectedRecord.vaccine === 'Overdue' ? '#fed7d7' : '#feebc8',
                                                    color: selectedRecord.vaccine === 'Up to Date' ? '#22543d' : selectedRecord.vaccine === 'Overdue' ? '#9b2c2c' : '#7b341e',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <i className={selectedRecord.vaccine === 'Up to Date' ? "fas fa-check-circle" : selectedRecord.vaccine === 'Overdue' ? "fas fa-exclamation-circle" : "fas fa-clock"}></i>
                                                    {selectedRecord.vaccine}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ background: '#fff5f5', padding: '15px', borderRadius: '12px', marginBottom: '15px', borderLeft: '4px solid #fc8181' }}>
                                            <p style={{ margin: '0 0 5px 0', color: '#c53030', fontWeight: 700, fontSize: '0.9rem' }}><i className="fas fa-procedures"></i> Past Illnesses</p>
                                            <p style={{ margin: 0, color: '#4a5568', fontSize: '0.95rem' }}>{selectedRecord.pastIllness || 'None reported'}</p>
                                        </div>

                                        <div style={{ background: '#ebf4ff', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #63b3ed' }}>
                                            <p style={{ margin: '0 0 5px 0', color: '#2b6cb0', fontWeight: 700, fontSize: '0.9rem' }}><i className="fas fa-syringe"></i> Previous Surgeries</p>
                                            <p style={{ margin: 0, color: '#4a5568', fontSize: '0.95rem' }}>{selectedRecord.previousSurgeries || 'None reported'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Owner Info & Clinic */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-user" style={{ color: '#2E5E3E' }}></i> Owner Details</h3>
                                            <span style={{ background: '#e6fffa', color: '#319795', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Linked Account</span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', fontSize: '1.2rem' }}><i className="fas fa-user"></i></div>
                                                <div>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 700 }}>{selectedRecord.ownerName}</p>
                                                    <p style={{ margin: '2px 0 0 0', color: '#718096', fontSize: '0.85rem' }}>Pet Owner</p>
                                                </div>
                                            </div>
                                            <hr style={{ border: 'none', borderTop: '1px solid #edf2f7', margin: '5px 0' }} />
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-phone-alt"></i> Contact Number</p>
                                                <p style={{ margin: 0, color: '#4a5568', fontWeight: 500 }}>{selectedRecord.contact}</p>
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-map-marker-alt"></i> Address</p>
                                                <p style={{ margin: 0, color: '#4a5568', fontWeight: 500, lineHeight: 1.4 }}>{selectedRecord.address || 'No address provided'}</p>
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-at"></i> Username / Email</p>
                                                <p style={{ margin: 0, color: '#4a5568', fontWeight: 500 }}>{selectedRecord.userName || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-clinic-medical" style={{ color: '#2E5E3E' }}></i> Clinic Assignment</h3>
                                        <div>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-user-md"></i> Primary Veterinarian</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                                                <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#e6fffa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#319795' }}><i className="fas fa-stethoscope"></i></div>
                                                <p style={{ margin: 0, color: '#2d3748', fontWeight: 600 }}>{selectedRecord.veterinarian || 'Not assigned'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Patient Modal */}
                {isAddModalOpen && (
                    <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}>
                        <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-plus-circle" style={{ color: '#2E5E3E' }}></i> Add New Pet</h3>
                                <button className="modal-close" onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#a0aec0', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                            </div>
                            <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Pet Name *</label><input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }} value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} /></div>
                                <div><label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Pet Type *</label><select required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }} value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})}><option value="">Select</option><option value="Dog">Dog</option><option value="Cat">Cat</option></select></div>
                                <div><label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Breed</label><input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }} value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div>
                                <div><label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Gender</label><select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                                <div><label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Owner Name *</label><input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }} value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} /></div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Contact # *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${contactWarning ? '#fc8181' : '#e2e8f0'}`, marginTop: '5px', outline: contactWarning ? 'none' : undefined, boxShadow: contactWarning ? '0 0 0 1px #fc8181' : 'none' }} 
                                        value={formData.contact} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/\D/.test(val)) {
                                                setContactWarning(true);
                                                setTimeout(() => setContactWarning(false), 3000);
                                            }
                                            setFormData({...formData, contact: val.replace(/\D/g, '')});
                                        }} 
                                    />
                                    {contactWarning && <p style={{ color: '#e53e3e', fontSize: '0.8rem', margin: '5px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-exclamation-circle"></i> Numbers only</p>}
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#2E5E3E', color: 'white', cursor: 'pointer', fontWeight: 600, marginTop: '10px' }}>Save Pet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
            </div>
        </div>
    );
}
