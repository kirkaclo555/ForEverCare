"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useUsers, User } from '../../../hooks/useUsers';
import { useRecords } from '../../../hooks/useRecords';
import { useNotifications } from '../../../hooks/useNotifications';
import './users.css';

export default function UsersPage() {
    const { users, addUser, updateUser, deleteUser } = useUsers();
    const { records } = useRecords();
    const { addNotification } = useNotifications();
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    // View Modal state
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isViewAllPetsOpen, setIsViewAllPetsOpen] = useState(false);

    // Add Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        role: 'petowner' as 'admin' | 'petowner',
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        password: '',
    });

    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

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
    const [showValidationErrors, setShowValidationErrors] = useState(false);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.contact || !formData.password || !formData.role) {
            setShowValidationErrors(true);
            return;
        }

        addUser({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            contact: formData.contact,
            password: formData.password,
            role: formData.role,
            status: 'Active'
        });
        addNotification('New User Added', `${formData.firstName} ${formData.lastName} was added as ${formData.role}.`, 'fas fa-user-plus');
        setIsAddModalOpen(false);
        setFormData({ role: 'petowner', firstName: '', lastName: '', email: '', contact: '', password: '' });
        setShowValidationErrors(false);
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
            <tr 
                key={user.id}
                onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                title="Click to view details"
            >
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#4a5568' }}>{index + 1}</td>
                <td><strong>{user.displayId || user.id}</strong></td>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: user.role === 'admin' ? 'linear-gradient(135deg, #3182ce, #2b6cb0)' : 'linear-gradient(135deg, #38a169, #2f855a)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, color: 'white' }}>
                            {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <i className={user.role === 'admin' ? "fas fa-user-shield" : "fas fa-user"} style={{ fontSize: '0.85rem' }}></i>
                            )}
                        </div>
                        <span style={{ fontWeight: 600, color: '#2d3748' }}>{user.name}</span>
                    </div>
                </td>
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
                <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-dropdown-container" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(activeDropdownId === user.id ? null : user.id);
                            }} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#a0aec0' }}
                            title="Actions"
                        >
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                        {activeDropdownId === user.id && (
                            <div style={{ position: 'absolute', top: '100%', right: '50%', transform: 'translateX(50%)', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, width: '120px', overflow: 'hidden' }}>
                                {user.status === 'Active' ? (
                                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(user); setActiveDropdownId(null); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#4a5568' }}>
                                        <i className="fas fa-ban" style={{ width: '20px', color: '#e53e3e' }}></i> Disable
                                    </button>
                                ) : (
                                    <button onClick={(e) => { e.stopPropagation(); toggleStatus(user); setActiveDropdownId(null); }} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#4a5568' }}>
                                        <i className="fas fa-check-circle" style={{ width: '20px', color: '#38a169' }}></i> Enable
                                    </button>
                                )}
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
                <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }} onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}>
                    <div className="modal-content" style={{ background: '#f8fafc', borderRadius: '24px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
                        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #2E5E3E 0%, #1a3622 100%)', padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem', fontWeight: 800 }}><i className="fas fa-user-plus"></i> Add New User</h3>
                                <p style={{ color: '#e2e8f0', margin: '8px 0 0 0', fontSize: '1rem', opacity: 0.9 }}>Register a new account to the system</p>
                            </div>
                            <button type="button" className="modal-close" onClick={() => setIsAddModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', backdropFilter: 'blur(4px)' }}>
                                <i className="fas fa-times" style={{ fontSize: '1.2rem' }}></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddSubmit} noValidate>
                            <div className="modal-body" style={{ padding: '30px 40px' }}>
                                <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #edf2f7', marginBottom: '25px' }}>
                                    <h4 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                                        <i className="fas fa-id-card" style={{ color: '#2E5E3E' }}></i> Basic Information
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>User Role</label>
                                            <select value={formData.role} onChange={(e) => {setFormData({...formData, role: e.target.value as 'admin'|'petowner'}); setShowValidationErrors(false);}} className="form-control" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: (showValidationErrors && !formData.role) ? '1px solid #fc8181' : '1px solid #e2e8f0', background: (showValidationErrors && !formData.role) ? '#fff5f5' : '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s', outline: 'none' }}>
                                                <option value="petowner">Pet Owner</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                            {showValidationErrors && !formData.role && <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-exclamation-circle"></i> This field is required</p>}
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>First Name</label>
                                            <input type="text" value={formData.firstName} onChange={(e) => {setFormData({...formData, firstName: e.target.value}); setShowValidationErrors(false);}} className="form-control" placeholder="e.g. Juan" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: (showValidationErrors && !formData.firstName) ? '1px solid #fc8181' : '1px solid #e2e8f0', background: (showValidationErrors && !formData.firstName) ? '#fff5f5' : '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s', outline: 'none' }} />
                                            {showValidationErrors && !formData.firstName && <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-exclamation-circle"></i> This field is required</p>}
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Last Name</label>
                                            <input type="text" value={formData.lastName} onChange={(e) => {setFormData({...formData, lastName: e.target.value}); setShowValidationErrors(false);}} className="form-control" placeholder="e.g. Dela Cruz" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: (showValidationErrors && !formData.lastName) ? '1px solid #fc8181' : '1px solid #e2e8f0', background: (showValidationErrors && !formData.lastName) ? '#fff5f5' : '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s', outline: 'none' }} />
                                            {showValidationErrors && !formData.lastName && <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-exclamation-circle"></i> This field is required</p>}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #edf2f7' }}>
                                    <h4 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                                        <i className="fas fa-envelope" style={{ color: '#2E5E3E' }}></i> Contact & Security
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="form-group">
                                            <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Email Address</label>
                                            <input type="email" value={formData.email} onChange={(e) => {setFormData({...formData, email: e.target.value}); setShowValidationErrors(false);}} className="form-control" placeholder="jane@example.com" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: (showValidationErrors && !formData.email) ? '1px solid #fc8181' : '1px solid #e2e8f0', background: (showValidationErrors && !formData.email) ? '#fff5f5' : '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s', outline: 'none' }} />
                                            {showValidationErrors && !formData.email && <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-exclamation-circle"></i> This field is required</p>}
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Phone Number</label>
                                            <input type="tel" value={formData.contact} onChange={(e) => {setFormData({...formData, contact: e.target.value.replace(/\D/g, '')}); setShowValidationErrors(false);}} className="form-control" placeholder="09123456789" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: (showValidationErrors && !formData.contact) ? '1px solid #fc8181' : '1px solid #e2e8f0', background: (showValidationErrors && !formData.contact) ? '#fff5f5' : '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s', outline: 'none' }} />
                                            {showValidationErrors && !formData.contact && <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-exclamation-circle"></i> This field is required</p>}
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Password</label>
                                            <input type="password" value={formData.password} onChange={(e) => {setFormData({...formData, password: e.target.value}); setShowValidationErrors(false);}} className="form-control" placeholder="Create a secure password" style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: (showValidationErrors && !formData.password) ? '1px solid #fc8181' : '1px solid #e2e8f0', background: (showValidationErrors && !formData.password) ? '#fff5f5' : '#f8fafc', fontSize: '0.95rem', color: '#2d3748', transition: '0.2s', outline: 'none' }} />
                                            {showValidationErrors && !formData.password && <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fas fa-exclamation-circle"></i> This field is required</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '25px 40px', background: '#f8fafc', borderTop: '1px solid #edf2f7', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, color: '#4a5568', fontSize: '0.95rem', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>Cancel</button>
                                <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #2E5E3E 0%, #1a3622 100%)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, color: 'white', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 4px 15px rgba(46, 94, 62, 0.3)' }}>
                                    <i className="fas fa-check"></i> Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View User Modal - Redesigned to match Pet Records */}
            {isViewModalOpen && selectedUser && (() => {
                const currentUser = users.find(u => u.id === selectedUser.id) || selectedUser;
                const linkedPets = records.filter(r => r.ownerName === currentUser.name || r.userName === currentUser.email);
                const primaryPet = linkedPets.length > 0 ? linkedPets[0] : null;
                return (
                    <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setIsViewModalOpen(false); }}>
                        <div className="modal-content" style={{ background: '#f0f4f8', borderRadius: '24px', width: '95%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0 }}>
                            {/* Header Section */}
                            <div style={{ background: 'white', padding: '30px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: currentUser.role === 'admin' ? 'linear-gradient(135deg, #3182ce, #2b6cb0)' : 'linear-gradient(135deg, #38a169, #2f855a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                                        {currentUser.profileImage ? (
                                            <img src={currentUser.profileImage} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <i className={currentUser.role === 'admin' ? "fas fa-user-shield" : "fas fa-user"}></i>
                                        )}
                                    </div>
                                    <div>
                                        <h2 style={{ margin: '0 0 5px 0', color: '#2d3748', fontSize: '2rem', fontWeight: 800 }}>{currentUser.name}</h2>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ background: '#edf2f7', color: '#4a5568', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.displayId || currentUser.id}</span>
                                            <span style={{ color: '#718096', fontSize: '0.95rem' }}>{currentUser.role === 'admin' ? 'Administrator' : 'Pet Owner'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="modal-close" onClick={() => setIsViewModalOpen(false)} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '12px', color: '#a0aec0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}><i className="fas fa-times"></i></button>
                                </div>
                            </div>
                            
                            {/* Body Layout */}
                            <div className="modal-body" style={{ padding: '30px', display: 'grid', gridTemplateColumns: primaryPet ? '1fr 1fr' : '1fr', gap: '25px', gridAutoRows: 'min-content' }}>
                                {/* Left Column: Pet Info (if exists) or just User Profile */}
                                {primaryPet && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-paw" style={{ color: '#2E5E3E' }}></i> Pet Information</h3>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{ background: '#ebf8ff', color: '#3182ce', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>{primaryPet.displayId || primaryPet.id}</span>
                                                    {linkedPets.length > 1 && (
                                                        <button onClick={() => setIsViewAllPetsOpen(true)} style={{ padding: '6px 12px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                            See all {linkedPets.length} pets
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5568', fontSize: '1.5rem', border: '1px solid #e2e8f0' }}>
                                                    <i className={primaryPet.species.toLowerCase() === 'cat' ? "fas fa-cat" : "fas fa-dog"}></i>
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, color: '#2d3748', fontWeight: 700, fontSize: '1.1rem' }}>{primaryPet.petName}</p>
                                                    <p style={{ margin: '2px 0 0 0', color: '#718096', fontSize: '0.9rem' }}>{primaryPet.species} • {primaryPet.breed || 'Unknown Breed'}</p>
                                                </div>
                                            </div>
                                            
                                            <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', marginBottom: '20px' }} />
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Gender</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{primaryPet.gender || 'Unknown'}</p></div>
                                                <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Age</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{primaryPet.age || 'Unknown'}</p></div>
                                                <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Color</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{primaryPet.color || 'Unknown'}</p></div>
                                                <div><p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase' }}>Weight</p><p style={{ margin: '5px 0 0 0', color: '#4a5568', fontWeight: 500 }}>{primaryPet.weight || 'Unknown'}</p></div>
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
                                                        background: primaryPet.vaccine === 'Up to Date' ? '#c6f6d5' : primaryPet.vaccine === 'Overdue' ? '#fed7d7' : '#feebc8',
                                                        color: primaryPet.vaccine === 'Up to Date' ? '#22543d' : primaryPet.vaccine === 'Overdue' ? '#9b2c2c' : '#7b341e',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <i className={primaryPet.vaccine === 'Up to Date' ? "fas fa-check-circle" : primaryPet.vaccine === 'Overdue' ? "fas fa-exclamation-circle" : "fas fa-clock"}></i>
                                                        {primaryPet.vaccine}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ background: '#fff5f5', padding: '15px', borderRadius: '12px', marginBottom: '15px', borderLeft: '4px solid #fc8181' }}>
                                                <p style={{ margin: '0 0 5px 0', color: '#c53030', fontWeight: 700, fontSize: '0.9rem' }}><i className="fas fa-procedures"></i> Past Illnesses</p>
                                                <p style={{ margin: 0, color: '#4a5568', fontSize: '0.95rem' }}>{primaryPet.pastIllness || 'None reported'}</p>
                                            </div>

                                            <div style={{ background: '#ebf4ff', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #63b3ed' }}>
                                                <p style={{ margin: '0 0 5px 0', color: '#2b6cb0', fontWeight: 700, fontSize: '0.9rem' }}><i className="fas fa-syringe"></i> Previous Surgeries</p>
                                                <p style={{ margin: 0, color: '#4a5568', fontSize: '0.95rem' }}>{primaryPet.previousSurgeries || 'None reported'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Right Column: Status Info & Contact */}
                                <div style={{ display: 'grid', gridTemplateColumns: primaryPet ? '1fr' : '1fr 1fr', gap: '25px', alignContent: 'start' }}>
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
                                            {primaryPet && primaryPet.address && (
                                                <>
                                                    <hr style={{ border: 'none', borderTop: '1px solid #edf2f7', margin: 0 }} />
                                                    <div>
                                                        <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#a0aec0', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-map-marker-alt"></i> Address</p>
                                                        <p style={{ margin: 0, color: '#4a5568', fontWeight: 500 }}>{primaryPet.address}</p>
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

            {/* View All Pets Modal */}
            {isViewAllPetsOpen && selectedUser && (() => {
                const linkedPets = records.filter(r => r.ownerName === selectedUser.name || r.userName === selectedUser.email);
                return (
                    <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1100, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setIsViewAllPetsOpen(false); }}>
                        <div className="modal-content" style={{ background: '#f0f4f8', borderRadius: '24px', width: '90%', maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0 }}>
                            <div style={{ background: 'white', padding: '25px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-paw" style={{ color: '#2E5E3E' }}></i> Pets Owned by {selectedUser.name}</h3>
                                <button className="modal-close" onClick={() => setIsViewAllPetsOpen(false)} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '12px', color: '#a0aec0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}><i className="fas fa-times"></i></button>
                            </div>
                            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {linkedPets.map(pet => (
                                    <div key={pet.id} style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5568', fontSize: '1.8rem', border: '1px solid #e2e8f0' }}>
                                            <i className={pet.species.toLowerCase() === 'cat' ? "fas fa-cat" : "fas fa-dog"}></i>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                <h4 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem' }}>{pet.petName}</h4>
                                                <span style={{ background: '#ebf8ff', color: '#3182ce', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{pet.displayId || pet.id}</span>
                                            </div>
                                            <p style={{ margin: '0 0 5px 0', color: '#718096', fontSize: '0.9rem' }}>{pet.species} • {pet.breed || 'Unknown Breed'} • {pet.gender || 'Unknown'}</p>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}><i className="fas fa-weight" style={{marginRight: '5px'}}></i>{pet.weight || 'N/A'}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}><i className="fas fa-birthday-cake" style={{marginRight: '5px'}}></i>{pet.age || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                background: pet.vaccine === 'Up to Date' ? '#c6f6d5' : pet.vaccine === 'Overdue' ? '#fed7d7' : '#feebc8',
                                                color: pet.vaccine === 'Up to Date' ? '#22543d' : pet.vaccine === 'Overdue' ? '#9b2c2c' : '#7b341e',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <i className={pet.vaccine === 'Up to Date' ? "fas fa-check-circle" : pet.vaccine === 'Overdue' ? "fas fa-exclamation-circle" : "fas fa-clock"}></i>
                                                Vaccine: {pet.vaccine}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
