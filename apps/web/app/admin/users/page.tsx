"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useUsers, User } from '../../../hooks/useUsers';
import { useNotifications } from '../../../hooks/useNotifications';
import './users.css';

export default function UsersPage() {
    const { users, addUser, updateUser, deleteUser } = useUsers();
    const { addNotification } = useNotifications();
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    // Add Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        role: 'petowner' as 'admin' | 'petowner',
        name: '',
        email: '',
        contact: '',
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
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addUser({
            name: formData.name,
            email: formData.email,
            contact: formData.contact,
            role: formData.role,
            status: 'Active'
        });
        addNotification('New User Added', `${formData.name} was added as ${formData.role}.`, 'fas fa-user-plus');
        setIsAddModalOpen(false);
        setFormData({ role: 'petowner', name: '', email: '', contact: '' });
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
                <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}>
                    <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-user-plus" style={{ color: '#2E5E3E' }}></i> Add New User</h3>
                            <button className="modal-close" onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#a0aec0', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                        </div>
                        
                        <form onSubmit={handleAddSubmit}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Full Name *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="form-control" placeholder="Full name" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Email *</label>
                                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="form-control" placeholder="email@example.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Contact Number *</label>
                                    <input type="tel" required value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} className="form-control" placeholder="(555) 123-4567" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                </div>
                            </div>
                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #edf2f7' }}>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#4a5568' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', background: '#2E5E3E', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white' }}>Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
