"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useUsers, User } from '../../../hooks/useUsers';
import { useRecords } from '../../../hooks/useRecords';
import { useNotifications } from '../../../hooks/useNotifications';
import './users.css';

export default function UsersPage() {
    const { users, addUser, updateUser, deleteUser } = useUsers();
    const { records, addRecord } = useRecords();
    const { addNotification } = useNotifications();
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    // View Modal state
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Add Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        role: 'petowner' as 'admin' | 'petowner',
        name: '',
        email: '',
        contact: '',
        petName: '',
        species: ''
    });

    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [contactWarning, setContactWarning] = useState(false);
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest('.action-dropdown-container')) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Derived Data
    const admins = useMemo(() => users.filter(u => u.role === 'admin'), [users]);
    const petOwners = useMemo(() => users.filter(u => u.role === 'petowner'), [users]);
    
    const totalAdmins = admins.length;
    const totalOwners = petOwners.length;
    const activeUsers = users.filter(u => u.status === 'Active').length;
    const inactiveUsers = users.filter(u => u.status === 'Inactive').length;

    // Pagination Calculations for Pet Owners
    const totalPages = Math.max(1, Math.ceil(petOwners.length / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentPetOwners = petOwners.slice(startIndex, startIndex + rowsPerPage);

    // Handlers
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check for existing email
        const emailExists = users.some(u => u.email.toLowerCase() === formData.email.toLowerCase());
        if (emailExists) {
            setEmailError('This email is already registered to another user.');
            return;
        }

        addUser({
            name: formData.name,
            email: formData.email,
            contact: formData.contact,
            role: formData.role,
            status: 'Active'
        });

        if (formData.role === 'petowner' && formData.petName) {
            addRecord({
                id: `PR-${1000 + Math.floor(Math.random() * 9000)}`,
                petName: formData.petName,
                species: formData.species || 'Unknown',
                breed: '', gender: '', age: '', color: '', weight: '',
                ownerName: formData.name,
                contact: formData.contact,
                address: '', userName: formData.email, pastIllness: 'None', previousSurgeries: 'None',
                vaccine: 'Pending', veterinarian: ''
            });
        }

        addNotification('New User Added', `${formData.name} was added as ${formData.role}.`, 'fas fa-user-plus');
        setIsAddModalOpen(false);
        setSuccessMessage('Successfully Added');
        setFormData({ role: 'petowner', name: '', email: '', contact: '', petName: '', species: '' });
        setEmailError('');
        setContactWarning(false);
    };

    const toggleStatus = (user: User) => {
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        updateUser(user.id, { status: newStatus });
        addNotification('User Status Changed', `${user.name} is now ${newStatus}.`, 'fas fa-user-edit');
    };

    // Render Table Row
    const renderRow = (user: User | null, index: number, isPlaceholder = false) => {
        if (isPlaceholder || !user) {
            return (
                <tr key={`empty-${index}`} style={{ height: '53px', background: '#fafafa' }}>
                    <td style={{ textAlign: 'center', color: '#a0aec0', fontWeight: 'bold' }}>{index + 1}</td>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#cbd5e0' }}>- Empty Slot -</td>
                </tr>
            );
        }

        return (
            <tr key={user.id}>
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#4a5568' }}>{index + 1}</td>
                <td><strong>{user.id}</strong></td>
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.contact}</td>
                <td>
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: user.role === 'admin' ? '#ebf8ff' : '#e6fffa',
                        color: user.role === 'admin' ? '#3182ce' : '#319795'
                    }}>
                        {user.role === 'admin' ? 'Administrator' : 'Pet Owner'}
                    </span>
                </td>
                <td>
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: user.status === 'Active' ? '#c6f6d5' : '#fed7d7',
                        color: user.status === 'Active' ? '#22543d' : '#9b2c2c'
                    }}>
                        {user.status}
                    </span>
                </td>
                <td>
                    <div className="action-dropdown-container" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <button 
                            onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#a0aec0' }}
                        >
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                        {activeDropdownId === user.id && (
                            <div style={{ position: 'absolute', top: '100%', right: '50%', transform: 'translateX(50%)', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, width: '120px', overflow: 'hidden' }}>
                                <button onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); setActiveDropdownId(null); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', borderBottom: '1px solid #edf2f7', textAlign: 'left', cursor: 'pointer', color: '#4a5568' }}>
                                    <i className="fas fa-eye" style={{ width: '20px', color: '#3182ce' }}></i> View
                                </button>
                                {user.status === 'Active' ? (
                                    <button onClick={() => { toggleStatus(user); setActiveDropdownId(null); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', borderBottom: '1px solid #edf2f7', textAlign: 'left', cursor: 'pointer', color: '#4a5568' }}>
                                        <i className="fas fa-ban" style={{ width: '20px', color: '#e53e3e' }}></i> Disable
                                    </button>
                                ) : (
                                    <button onClick={() => { toggleStatus(user); setActiveDropdownId(null); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', borderBottom: '1px solid #edf2f7', textAlign: 'left', cursor: 'pointer', color: '#4a5568' }}>
                                        <i className="fas fa-check-circle" style={{ width: '20px', color: '#38a169' }}></i> Enable
                                    </button>
                                )}
                                <button onClick={() => { deleteUser(user.id); addNotification('User Removed', `${user.name} was deleted.`, 'fas fa-trash-alt'); setActiveDropdownId(null); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#e53e3e' }}>
                                    <i className="fas fa-trash" style={{ width: '20px' }}></i> Remove
                                </button>
                            </div>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }}>
            <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon" style={{background: 'linear-gradient(135deg, #2E5E3E, #2E5E3E)'}}><i className="fas fa-user-shield"></i></div><div className="stat-info"><h3 style={{color: '#718096'}}>Admins</h3><p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{totalAdmins}</p></div></div>
                <div className="stat-card"><div className="stat-icon" style={{background: 'linear-gradient(135deg, #3182ce, #3182ce)'}}><i className="fas fa-users"></i></div><div className="stat-info"><h3 style={{color: '#718096'}}>Pet Owners</h3><p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{totalOwners}</p></div></div>
                <div className="stat-card"><div className="stat-icon" style={{background: 'linear-gradient(135deg, #38a169, #38a169)'}}><i className="fas fa-user-check"></i></div><div className="stat-info"><h3 style={{color: '#718096'}}>Active</h3><p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{activeUsers}</p></div></div>
                <div className="stat-card"><div className="stat-icon" style={{background: 'linear-gradient(135deg, #e53e3e, #e53e3e)'}}><i className="fas fa-user-slash"></i></div><div className="stat-info"><h3 style={{color: '#718096'}}>Inactive</h3><p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{inactiveUsers}</p></div></div>
            </div>

            <div className="users-section" style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#2d3748', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-users-cog" style={{ color: '#2E5E3E' }}></i> User Management
                    </h2>
                    <button className="btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2E5E3E', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-plus"></i> Add User
                    </button>
                </div>

                {/* Admins Table */}
                <h3 style={{ color: '#4a5568', margin: '30px 0 15px 0', paddingLeft: '10px', borderLeft: '4px solid #3182ce' }}>Admins</h3>
                <div className="table-container" style={{ overflowX: 'auto', marginBottom: '40px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600, width: '60px', textAlign: 'center' }}>No.</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>ID</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Email</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Contact</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Role</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin, idx) => renderRow(admin, idx))}
                            {admins.length === 0 && (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#a0aec0' }}>No admins found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pet Owners Table */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0 15px 0' }}>
                    <h3 style={{ color: '#4a5568', margin: 0, paddingLeft: '10px', borderLeft: '4px solid #38a169' }}>Pet Owners</h3>
                </div>
                <div className="table-container" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600, width: '60px', textAlign: 'center' }}>No.</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>ID</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Email</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Contact</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Role</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '15px', color: '#4a5568', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: rowsPerPage }).map((_, index) => {
                                const userIndex = index;
                                const actualRowNumber = startIndex + index;
                                const user = currentPetOwners[userIndex];
                                
                                return renderRow(user || null, actualRowNumber, !user);
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '10px 0' }}>
                        <span style={{ color: '#718096', fontSize: '0.9rem' }}>Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, petOwners.length)} of {petOwners.length} entries</span>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '8px 12px', background: currentPage === 1 ? '#edf2f7' : 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#a0aec0' : '#4a5568' }}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    style={{ 
                                        padding: '8px 14px', 
                                        background: currentPage === i + 1 ? '#2E5E3E' : 'white', 
                                        color: currentPage === i + 1 ? 'white' : '#4a5568',
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: '6px', 
                                        cursor: 'pointer',
                                        fontWeight: currentPage === i + 1 ? 'bold' : 'normal'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}

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

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}>
                    <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-user-plus" style={{ color: '#2E5E3E' }}></i> Add New User</h3>
                            <button className="modal-close" onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#a0aec0', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                        </div>
                        
                        <form onSubmit={handleAddSubmit}>
                            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}>User Type *</label>
                                    <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as 'admin'|'petowner'})} className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <option value="petowner">Pet Owner</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Full Name *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="form-control" placeholder="Full name" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Email *</label>
                                    <input type="email" required value={formData.email} onChange={(e) => { setFormData({...formData, email: e.target.value}); setEmailError(''); }} className="form-control" placeholder="email@example.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${emailError ? '#fc8181' : '#e2e8f0'}`, outline: emailError ? 'none' : undefined, boxShadow: emailError ? '0 0 0 1px #fc8181' : 'none' }} />
                                    {emailError && <p style={{ color: '#e53e3e', fontSize: '0.8rem', margin: '5px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-exclamation-circle"></i> {emailError}</p>}
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Contact Number *</label>
                                    <input type="tel" required value={formData.contact} onChange={(e) => {
                                        const val = e.target.value;
                                        if (/\D/.test(val)) {
                                            setContactWarning(true);
                                            setTimeout(() => setContactWarning(false), 3000);
                                        }
                                        setFormData({...formData, contact: val.replace(/\D/g, '')});
                                    }} className="form-control" placeholder="(555) 123-4567" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${contactWarning ? '#fc8181' : '#e2e8f0'}`, outline: contactWarning ? 'none' : undefined, boxShadow: contactWarning ? '0 0 0 1px #fc8181' : 'none' }} />
                                    {contactWarning && <p style={{ color: '#e53e3e', fontSize: '0.8rem', margin: '5px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-exclamation-circle"></i> Numbers only</p>}
                                </div>
                                
                                {formData.role === 'petowner' && (
                                    <div style={{ padding: '15px', background: '#f7fafc', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                                        <h4 style={{ margin: '0 0 15px 0', color: '#4a5568', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-paw" style={{color: '#2E5E3E'}}></i> Pet Information (Optional)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Pet Name</label>
                                                <input type="text" value={formData.petName} onChange={(e) => setFormData({...formData, petName: e.target.value})} className="form-control" placeholder="Buddy" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Pet Type</label>
                                                <select value={formData.species} onChange={(e) => setFormData({...formData, species: e.target.value})} className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <option value="">Select Type</option>
                                                    <option value="Dog">Dog</option>
                                                    <option value="Cat">Cat</option>
                                                    <option value="Bird">Bird</option>
                                                    <option value="Rabbit">Rabbit</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #edf2f7' }}>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#4a5568' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', background: '#2E5E3E', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white' }}>Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View User Modal - Redesigned to match Pet Records */}
            {isViewModalOpen && selectedUser && (() => {
                const linkedPet = records.find(r => r.ownerName === selectedUser.name || r.userName === selectedUser.email);
                return (
                    <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setIsViewModalOpen(false); }}>
                        <div className="modal-content" style={{ background: '#f0f4f8', borderRadius: '24px', width: '95%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0 }}>
                            {/* Header Section */}
                            <div style={{ background: 'white', padding: '30px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: selectedUser.role === 'admin' ? 'linear-gradient(135deg, #3182ce, #2b6cb0)' : 'linear-gradient(135deg, #38a169, #2f855a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
                                        <i className={selectedUser.role === 'admin' ? "fas fa-user-shield" : "fas fa-user"}></i>
                                    </div>
                                    <div>
                                        <h2 style={{ margin: '0 0 5px 0', color: '#2d3748', fontSize: '2rem', fontWeight: 800 }}>{selectedUser.name}</h2>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ background: '#edf2f7', color: '#4a5568', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>{selectedUser.id}</span>
                                            <span style={{ color: '#718096', fontSize: '0.95rem' }}>{selectedUser.role === 'admin' ? 'Administrator' : 'Pet Owner'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="modal-close" onClick={() => setIsViewModalOpen(false)} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '12px', color: '#a0aec0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}><i className="fas fa-times"></i></button>
                                </div>
                            </div>
                            
                            {/* Body Layout */}
                            <div className="modal-body" style={{ padding: '30px', display: 'grid', gridTemplateColumns: linkedPet ? '1fr 1fr' : '1fr', gap: '25px', gridAutoRows: 'min-content' }}>
                                {/* Left Column: Pet Info (if exists) or just User Profile */}
                                {linkedPet && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-paw" style={{ color: '#2E5E3E' }}></i> Pet Information</h3>
                                                <span style={{ background: '#ebf8ff', color: '#3182ce', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>{linkedPet.id}</span>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5568', fontSize: '1.5rem', border: '1px solid #e2e8f0' }}>
                                                    <i className={linkedPet.species.toLowerCase() === 'cat' ? "fas fa-cat" : "fas fa-dog"}></i>
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 700, fontSize: '1.1rem' }}>{linkedPet.petName}</p>
                                                    <p style={{ margin: '2px 0 0 0', color: '#718096', fontSize: '0.9rem' }}>{linkedPet.species} • {linkedPet.breed || 'Unknown Breed'}</p>
                                                </div>
                                            </div>
                                            
                                            <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', marginBottom: '20px' }} />
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Gender</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{linkedPet.gender || 'Unknown'}</p></div>
                                                <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Age</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{linkedPet.age || 'Unknown'}</p></div>
                                                <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Color</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{linkedPet.color || 'Unknown'}</p></div>
                                                <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Weight</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{linkedPet.weight || 'Unknown'}</p></div>
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
                                                        background: linkedPet.vaccine === 'Up to Date' ? '#c6f6d5' : linkedPet.vaccine === 'Overdue' ? '#fed7d7' : '#feebc8',
                                                        color: linkedPet.vaccine === 'Up to Date' ? '#22543d' : linkedPet.vaccine === 'Overdue' ? '#9b2c2c' : '#7b341e',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <i className={linkedPet.vaccine === 'Up to Date' ? "fas fa-check-circle" : linkedPet.vaccine === 'Overdue' ? "fas fa-exclamation-circle" : "fas fa-clock"}></i>
                                                        {linkedPet.vaccine}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ background: '#fff5f5', padding: '15px', borderRadius: '12px', marginBottom: '15px', borderLeft: '4px solid #fc8181' }}>
                                                <p style={{ margin: '0 0 5px 0', color: '#c53030', fontWeight: 700, fontSize: '0.9rem' }}><i className="fas fa-procedures"></i> Past Illnesses</p>
                                                <p style={{ margin: 0, color: '#4a5568', fontSize: '0.95rem' }}>{linkedPet.pastIllness || 'None reported'}</p>
                                            </div>

                                            <div style={{ background: '#ebf4ff', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #63b3ed' }}>
                                                <p style={{ margin: '0 0 5px 0', color: '#2b6cb0', fontWeight: 700, fontSize: '0.9rem' }}><i className="fas fa-syringe"></i> Previous Surgeries</p>
                                                <p style={{ margin: 0, color: '#4a5568', fontSize: '0.95rem' }}>{linkedPet.previousSurgeries || 'None reported'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Right Column: Status Info & Contact */}
                                <div style={{ display: 'grid', gridTemplateColumns: linkedPet ? '1fr' : '1fr 1fr', gap: '25px', alignContent: 'start' }}>
                                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-address-card" style={{ color: selectedUser.role === 'admin' ? '#3182ce' : '#38a169' }}></i> Contact Information</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-envelope"></i> Email Address</p>
                                                <p style={{ margin: 0, color: '#4a5568', fontWeight: 500 }}>{selectedUser.email}</p>
                                            </div>
                                            <hr style={{ border: 'none', borderTop: '1px solid #edf2f7', margin: 0 }} />
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-phone"></i> Phone Number</p>
                                                <p style={{ margin: 0, color: '#4a5568', fontWeight: 500 }}>{selectedUser.contact}</p>
                                            </div>
                                            {linkedPet && linkedPet.address && (
                                                <>
                                                    <hr style={{ border: 'none', borderTop: '1px solid #edf2f7', margin: 0 }} />
                                                    <div>
                                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-map-marker-alt"></i> Address</p>
                                                        <p style={{ margin: 0, color: '#4a5568', fontWeight: 500 }}>{linkedPet.address}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-info-circle" style={{ color: selectedUser.role === 'admin' ? '#3182ce' : '#38a169' }}></i> Account Status</h3>
                                        
                                        <div style={{ marginBottom: '20px' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Current Status</p>
                                            <div style={{ marginTop: '8px' }}>
                                                <span style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700,
                                                    background: selectedUser.status === 'Active' ? '#c6f6d5' : '#fed7d7',
                                                    color: selectedUser.status === 'Active' ? '#22543d' : '#9b2c2c',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <i className={selectedUser.status === 'Active' ? "fas fa-check-circle" : "fas fa-ban"}></i>
                                                    {selectedUser.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '12px' }}>
                                            <p style={{ margin: '0 0 5px 0', color: '#4a5568', fontWeight: 700, fontSize: '0.9rem' }}><i className="fas fa-shield-alt"></i> Access Level</p>
                                            <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                                {selectedUser.role === 'admin' 
                                                    ? "Full administrative access to manage the clinic, view all records, and control system settings." 
                                                    : "Standard pet owner access to view their own pet records, book appointments, and receive updates."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

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
    );
}
