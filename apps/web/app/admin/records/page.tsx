"use client";

import React, { useState } from 'react';
import { useRecords, PetRecord } from '../../../hooks/useRecords';

export default function RecordsPage() {
    const { records, addRecord, updateRecord, deleteRecord } = useRecords();
    
    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PetRecord | null>(null);

    // Filter State
    const [filterVaccine, setFilterVaccine] = useState('all');

    // Add Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
            id: `PR-${1000 + records.length + 1}`,
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
        addRecord(newRecord);
        setIsAddModalOpen(false);
        setFormData({ vaccine: 'Pending' });
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

                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>ID</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Pet Name</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Species / Breed</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Owner</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Contact</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Vaccine</th>
                                    <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedRecords.length > 0 ? displayedRecords.map(record => (
                                    <tr key={record.id} style={{ borderBottom: '1px solid #edf2f7', background: 'white' }}>
                                        <td style={{ padding: '15px', color: '#718096' }}><strong>{record.id}</strong></td>
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
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button onClick={() => openViewModal(record)} style={{ padding: '6px 12px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}>
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button onClick={() => deleteRecord(record.id)} style={{ padding: '6px 12px', background: '#fed7d7', color: '#c53030', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
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
                    <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) closeViewModal(); }}>
                        <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-paw" style={{ color: '#2E5E3E' }}></i> Pet Details: {selectedRecord.petName}</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="print-btn" onClick={() => window.print()} style={{ background: '#edf2f7', color: '#4a5568', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                        <i className="fas fa-print"></i> Print
                                    </button>
                                    <button className="modal-close" onClick={closeViewModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#a0aec0', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                                </div>
                            </div>
                            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>ID:</strong> {selectedRecord.id}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Species:</strong> {selectedRecord.species}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Breed:</strong> {selectedRecord.breed}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Gender:</strong> {selectedRecord.gender}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Age:</strong> {selectedRecord.age}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Color:</strong> {selectedRecord.color}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Weight:</strong> {selectedRecord.weight}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Vaccine Status:</strong> {selectedRecord.vaccine}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Owner Name:</strong> {selectedRecord.ownerName}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Contact:</strong> {selectedRecord.contact}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Address:</strong> {selectedRecord.address}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>User Name:</strong> {selectedRecord.userName}</p>
                                    <p style={{ margin: '0 0 10px 0', color: '#718096' }}><strong>Veterinarian:</strong> {selectedRecord.veterinarian}</p>
                                    <div style={{ marginTop: '15px', padding: '15px', background: '#f7fafc', borderRadius: '12px' }}>
                                        <p style={{ margin: '0 0 8px 0', color: '#4a5568', fontWeight: 600 }}>Past Illnesses</p>
                                        <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>{selectedRecord.pastIllness}</p>
                                    </div>
                                    <div style={{ marginTop: '10px', padding: '15px', background: '#f7fafc', borderRadius: '12px' }}>
                                        <p style={{ margin: '0 0 8px 0', color: '#4a5568', fontWeight: 600 }}>Previous Surgeries</p>
                                        <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>{selectedRecord.previousSurgeries}</p>
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
                                <div><label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Species *</label><select required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }} value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})}><option value="">Select</option><option value="Dog">Dog</option><option value="Cat">Cat</option></select></div>
                                <div><label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Breed</label><input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }} value={formData.breed} onChange={(e) => setFormData({...formData, breed: e.target.value})} /></div>
                                <div><label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Gender</label><select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                                <div><label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Owner Name *</label><input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }} value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} /></div>
                                <div><label style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Contact # *</label><input type="text" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '5px' }} value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} /></div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#2E5E3E', color: 'white', cursor: 'pointer', fontWeight: 600, marginTop: '10px' }}>Save Pet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
