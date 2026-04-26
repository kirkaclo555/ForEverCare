"use client";

import React, { useState } from 'react';
import './users.css';

export default function UsersPage() {
  return (
    <>
      <div className="main-content" id="mainContent">
        
        <div className="top-bar">
            <div style={{"display":"flex","alignItems":"center"}}>
                <button className="menu-toggle" onClick={() => {}}>
                    <i className="fas fa-bars"></i>
                </button>
                <div className="page-title">
                    <h1>User Management</h1>
                    <span>Staff & Access</span>
                </div>
            </div>
            
            <div className="user-info">
                
                <div className="search-container">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search users..." />
                </div>

                
                <div className="notifications" onClick={() => {}}>
                    <i className="far fa-bell"></i>
                    <span className="badge">3</span>
                </div>

                
                <div className="notification-panel" id="notificationPanel" onClick={() => {}}>
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <span className="mark-read" onClick={() => {}}>Mark all as read</span>
                    </div>
                    <div className="notification-list">
                        <div className="notification-item unread" onClick={() => {}}>
                            <div className="notification-icon">
                                <i className="fas fa-calendar-check"></i>
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">New Appointment Request</div>
                                <div className="notification-desc">Max (Golden Retriever) - Checkup with Dr. Smith</div>
                                <div className="notification-time">5 minutes ago</div>
                            </div>
                        </div>
                        <div className="notification-item unread" onClick={() => {}}>
                            <div className="notification-icon">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">Low Stock Alert</div>
                                <div className="notification-desc">Amoxicillin is running low (only 45 units left)</div>
                                <div className="notification-time">15 minutes ago</div>
                            </div>
                        </div>
                        <div className="notification-item unread" onClick={() => {}}>
                            <div className="notification-icon">
                                <i className="fas fa-video"></i>
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">Telemedicine Session Starting</div>
                                <div className="notification-desc">Luna (Cat) - Video consultation in 10 minutes</div>
                                <div className="notification-time">20 minutes ago</div>
                            </div>
                        </div>
                        <div className="notification-item" onClick={() => {}}>
                            <div className="notification-icon">
                                <i className="fas fa-prescription"></i>
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">Prescription Ready</div>
                                <div className="notification-desc">Rocky's medication is ready for pickup</div>
                                <div className="notification-time">1 hour ago</div>
                            </div>
                        </div>
                        <div className="notification-item" onClick={() => {}}>
                            <div className="notification-icon">
                                <i className="fas fa-credit-card"></i>
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">Payment Received</div>
                                <div className="notification-desc">Invoice #INV-2024-042 - $245.00</div>
                                <div className="notification-time">2 hours ago</div>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="settings-container">
                    <div className="settings-icon" onClick={() => {}}>
                        <i className="fas fa-cog"></i>
                    </div>

                    <div className="settings-dropdown" id="settingsDropdown" onClick={() => {}}>
                        <div className="settings-header">
                            <span>Settings</span>
                        </div>
                        
                        <div className="settings-item" onClick={() => {}}>
                            <i className="fas fa-sliders-h"></i>
                            <span>General Settings</span>
                        </div>
                        
                        <div className="settings-item" onClick={() => {}}>
                            <i className="fas fa-shield-alt"></i>
                            <span>Account and Security</span>
                        </div>
                        
                        <div className="settings-item" onClick={() => {}}>
                            <i className="fas fa-globe"></i>
                            <span>Language</span>
                        </div>
                        <div className="settings-item">
                            <div className="darkmode-toggle">
                                <span><i className="fas fa-moon" style={{"marginRight":"12px"}}></i>Darkmode</span>
                                <label className="switch">
                                    <input type="checkbox" id="darkmodeToggle" onClick={() => {}} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="settings-item" onClick={() => {}}>
                            <i className="fas fa-gavel"></i>
                            <span>Community Rules</span>
                        </div>
                        <div className="settings-item logout" onClick={() => {}}>
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </div>
                    </div>
                </div>

                
                <div className="user-profile" onClick={() => {}}>
                    <div className="avatar">
                        <span>AD</span>
                    </div>
                    <div>
                        <div style={{"fontWeight":"600","color":"#2d3748"}}>Admin User</div>
                        <div style={{"fontSize":"0.8rem","color":"#718096"}}>admin@furcare.com</div>
                    </div>
                </div>
            </div>
        </div>

        
        <div className="back-link" onClick={() => {}}>
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
        </div>

        
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                    <h3>Total Users</h3>
                    <p>48</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-user-check"></i>
                </div>
                <div className="stat-info">
                    <h3>Active</h3>
                    <p>42</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-user-clock"></i>
                </div>
                <div className="stat-info">
                    <h3>On Leave</h3>
                    <p>4</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-user-slash"></i>
                </div>
                <div className="stat-info">
                    <h3>Inactive</h3>
                    <p>2</p>
                </div>
            </div>
        </div>

        
        <div className="roles-grid">
            <div className="role-card" onClick={() => {}}>
                <div className="role-icon">
                    <i className="fas fa-crown"></i>
                </div>
                <div className="role-info">
                    <h4>Administrators</h4>
                    <p>Full system access</p>
                </div>
                <div className="role-count">6</div>
            </div>
            <div className="role-card" onClick={() => {}}>
                <div className="role-icon">
                    <i className="fas fa-stethoscope"></i>
                </div>
                <div className="role-info">
                    <h4>Veterinarians</h4>
                    <p>Medical staff</p>
                </div>
                <div className="role-count">18</div>
            </div>
            <div className="role-card" onClick={() => {}}>
                <div className="role-icon">
                    <i className="fas fa-syringe"></i>
                </div>
                <div className="role-info">
                    <h4>Technicians</h4>
                    <p>Clinical support</p>
                </div>
                <div className="role-count">12</div>
            </div>
            <div className="role-card" onClick={() => {}}>
                <div className="role-icon">
                    <i className="fas fa-phone-alt"></i>
                </div>
                <div className="role-info">
                    <h4>Receptionists</h4>
                    <p>Front desk</p>
                </div>
                <div className="role-count">8</div>
            </div>
        </div>

        
        <div className="filters-section">
            <div className="filter-group">
                <span className="filter-label"><i className="fas fa-user-tag" style={{"marginRight":"5px"}}></i>Role:</span>
                <select className="filter-select" id="roleFilter" onChange={() => {}}>
                    <option value="all">All Roles</option>
                    <option value="admin">Administrator</option>
                    <option value="veterinarian">Veterinarian</option>
                    <option value="technician">Technician</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="manager">Manager</option>
                </select>
            </div>
            
            <div className="filter-group">
                <span className="filter-label"><i className="fas fa-circle" style={{"marginRight":"5px"}}></i>Status:</span>
                <select className="filter-select" id="statusFilter" onChange={() => {}}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="onleave">On Leave</option>
                </select>
            </div>

            <button className="add-user-btn" onClick={() => {}}>
                <i className="fas fa-plus"></i>
                Add New User
            </button>
        </div>

        
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Contact Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span className="id-badge">#U001</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">JD</div>
                                <div className="user-info-small">
                                    <span className="user-name">Dr. John Doe</span>
                                    <span className="user-email">john.doe@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-admin">Administrator</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 123-4567
                            </div>
                        </td>
                        <td><span className="status-badge status-active">Active</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => {}}><i className="fas fa-eye"></i></button>
                                <button className="edit-btn" onClick={() => {}}><i className="fas fa-edit"></i></button>
                                <button className="archive-btn" onClick={() => {}}><i className="fas fa-archive"></i></button>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td><span className="id-badge">#U002</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">JS</div>
                                <div className="user-info-small">
                                    <span className="user-name">Dr. Jane Smith</span>
                                    <span className="user-email">jane.smith@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-vet">Veterinarian</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 234-5678
                            </div>
                        </td>
                        <td><span className="status-badge status-active">Active</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => {}}><i className="fas fa-eye"></i></button>
                                <button className="edit-btn" onClick={() => {}}><i className="fas fa-edit"></i></button>
                                <button className="archive-btn" onClick={() => {}}><i className="fas fa-archive"></i></button>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td><span className="id-badge">#U003</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">MW</div>
                                <div className="user-info-small">
                                    <span className="user-name">Mike Wilson</span>
                                    <span className="user-email">mike.wilson@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-technician">Technician</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 345-6789
                            </div>
                        </td>
                        <td><span className="status-badge status-active">Active</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => {}}><i className="fas fa-eye"></i></button>
                                <button className="edit-btn" onClick={() => {}}><i className="fas fa-edit"></i></button>
                                <button className="archive-btn" onClick={() => {}}><i className="fas fa-archive"></i></button>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td><span className="id-badge">#U004</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">SJ</div>
                                <div className="user-info-small">
                                    <span className="user-name">Sarah Johnson</span>
                                    <span className="user-email">sarah.j@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-receptionist">Receptionist</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 456-7890
                            </div>
                        </td>
                        <td><span className="status-badge status-active">Active</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => {}}><i className="fas fa-eye"></i></button>
                                <button className="edit-btn" onClick={() => {}}><i className="fas fa-edit"></i></button>
                                <button className="archive-btn" onClick={() => {}}><i className="fas fa-archive"></i></button>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td><span className="id-badge">#U005</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">RB</div>
                                <div className="user-info-small">
                                    <span className="user-name">Dr. Robert Brown</span>
                                    <span className="user-email">robert.brown@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-vet">Veterinarian</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 567-8901
                            </div>
                        </td>
                        <td><span className="status-badge status-onleave">On Leave</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => {}}><i className="fas fa-eye"></i></button>
                                <button className="edit-btn" onClick={() => {}}><i className="fas fa-edit"></i></button>
                                <button className="archive-btn" onClick={() => {}}><i className="fas fa-archive"></i></button>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td><span className="id-badge">#U006</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">LA</div>
                                <div className="user-info-small">
                                    <span className="user-name">Lisa Anderson</span>
                                    <span className="user-email">lisa.a@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-manager">Manager</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 678-9012
                            </div>
                        </td>
                        <td><span className="status-badge status-active">Active</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => {}}><i className="fas fa-eye"></i></button>
                                <button className="edit-btn" onClick={() => {}}><i className="fas fa-edit"></i></button>
                                <button className="archive-btn" onClick={() => {}}><i className="fas fa-archive"></i></button>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td><span className="id-badge">#U007</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">DM</div>
                                <div className="user-info-small">
                                    <span className="user-name">David Martinez</span>
                                    <span className="user-email">david.m@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-technician">Technician</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 789-0123
                            </div>
                        </td>
                        <td><span className="status-badge status-pending">Pending</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => {}}><i className="fas fa-eye"></i></button>
                                <button className="edit-btn" onClick={() => {}}><i className="fas fa-edit"></i></button>
                                <button className="archive-btn" onClick={() => {}}><i className="fas fa-archive"></i></button>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td><span className="id-badge">#U008</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">JT</div>
                                <div className="user-info-small">
                                    <span className="user-name">Jennifer Taylor</span>
                                    <span className="user-email">jennifer.t@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-receptionist">Receptionist</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 890-1234
                            </div>
                        </td>
                        <td><span className="status-badge status-inactive">Inactive</span></td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => {}}><i className="fas fa-eye"></i></button>
                                <button className="edit-btn" onClick={() => {}}><i className="fas fa-edit"></i></button>
                                <button className="archive-btn" onClick={() => {}}><i className="fas fa-archive"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        
        <div className="pagination">
            <button className="page-btn"><i className="fas fa-chevron-left"></i></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn">5</button>
            <button className="page-btn"><i className="fas fa-chevron-right"></i></button>
        </div>
    </div>

    
    <div className="modal" id="generalSettingsModal" onClick={() => {}}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-clinic-medical" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Clinic Information
                </h3>
                <button className="modal-close" onClick={() => {}}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="clinicSettingsForm">
                    <div className="form-group">
                        <label><i className="fas fa-clinic-medical"></i> Clinic name</label>
                        <input type="text" className="form-control" id="clinicName"
                            placeholder="e.g., FurEverCare Veterinary" value="FurEverCare Veterinary Clinic" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-map-marker-alt"></i> Address</label>
                        <input type="text" className="form-control" id="clinicAddress" placeholder="Street, City, ZIP"
                            value="123 Paws Avenue, Pet City, PC 12345" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-phone-alt"></i> Phone number</label>
                        <input type="tel" className="form-control" id="clinicPhone" placeholder="+1 (555) 123-4567"
                            value="+1 (555) 123-4567" />
                    </div>
                    <div className="form-group">
                        <label><i className="far fa-clock"></i> Opening hours</label>
                        <input type="text" className="form-control" id="clinicHours"
                            placeholder="e.g., Mon-Fri 9am-6pm, Sat 9am-2pm"
                            value="Mon-Fri 9am-6pm, Sat 9am-2pm, Sun Closed" />
                    </div>
                </form>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => {}}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {}}>Save Changes</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="accountSecurityModal" onClick={() => {}}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-shield-alt" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Account Security</h3>
                <button className="modal-close" onClick={() => {}}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="securityForm" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label><i className="fas fa-lock"></i> Current password</label>
                        <input type="password" className="form-control" id="currentPassword"
                            placeholder="Enter current password" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-key"></i> New password</label>
                        <input type="password" className="form-control" id="newPassword" placeholder="Enter new password"
                            onKeyUp={() => {}} />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-check-circle"></i> Confirm new password</label>
                        <input type="password" className="form-control" id="confirmPassword"
                            placeholder="Confirm new password" onKeyUp={() => {}} />
                    </div>

                    <div className="password-requirements">
                        <p><i className="fas fa-shield-alt" style={{"marginRight":"8px"}}></i>Password requirements:</p>
                        <div className="requirement-item" id="req-length">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">At least 8 characters</span>
                        </div>
                        <div className="requirement-item" id="req-uppercase">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">One uppercase letter</span>
                        </div>
                        <div className="requirement-item" id="req-number">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">One number</span>
                        </div>
                        <div className="requirement-item" id="req-match">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">Passwords match</span>
                        </div>
                    </div>
                </form>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => {}}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {}}>Update Password</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="languageModal" onClick={() => {}}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-globe" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Language Settings</h3>
                <button className="modal-close" onClick={() => {}}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <p style={{"color":"#718096","marginBottom":"20px"}}>Select your preferred language</p>

                <div className="language-options">
                    
                    <div className="language-option" id="langEnglish" onClick={() => {}}>
                        <div className="language-flag">
                            <i className="fas fa-flag-usa"></i>
                        </div>
                        <div className="language-info">
                            <h4>English</h4>
                            <div className="language-description">US English</div>
                        </div>
                        <div className="language-check" id="checkEnglish">
                            <i className="fas fa-check"></i>
                        </div>
                    </div>

                    
                    <div className="language-option" id="langFilipino" onClick={() => {}}>
                        <div className="language-flag">
                            <i className="fas fa-flag"></i>
                        </div>
                        <div className="language-info">
                            <h4>Filipino</h4>
                            <div className="language-description">Wikang Filipino</div>
                        </div>
                        <div className="language-check" id="checkFilipino">
                            <i className="fas fa-check"></i>
                        </div>
                    </div>
                </div>

                <div style={{"marginTop":"20px","padding":"15px","background":"#f7fafc","borderRadius":"16px"}}>
                    <p style={{"color":"#4a5568","fontSize":"0.9rem"}}>
                        <i className="fas fa-info-circle" style={{"color":"#2E5E3E","marginRight":"8px"}}></i>
                        <span id="languagePreview">Current language: English</span>
                    </p>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => {}}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {}}>Apply Changes</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="communityRulesModal" onClick={() => {}}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-gavel" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Community Rules</h3>
                <button className="modal-close" onClick={() => {}}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <div className="rules-container">
                    
                    <div className="rules-section dos">
                        <h4><i className="fas fa-check-circle"></i> Do's</h4>
                        <ul className="rules-list dos">
                            <li><i className="fas fa-check-circle"></i> Provide accurate pet information.</li>
                            <li><i className="fas fa-check-circle"></i> Arrive on time for appointments.</li>
                            <li><i className="fas fa-check-circle"></i> Use teleconsultation properly.</li>
                            <li><i className="fas fa-check-circle"></i> Follow veterinarian instructions.</li>
                            <li><i className="fas fa-check-circle"></i> Communicate respectfully.</li>
                            <li><i className="fas fa-check-circle"></i> Provide accurate pet information.</li>
                            <li><i className="fas fa-check-circle"></i> Arrive on time for appointments.</li>
                            <li><i className="fas fa-check-circle"></i> Use teleconsultation properly.</li>
                            <li><i className="fas fa-check-circle"></i> Follow veterinarian instructions.</li>
                            <li><i className="fas fa-check-circle"></i> Communicate respectfully.</li>
                        </ul>
                    </div>

                    
                    <div className="rules-section donts">
                        <h4><i className="fas fa-times-circle"></i> Don'ts</h4>
                        <ul className="rules-list donts">
                            <li><i className="fas fa-times-circle"></i> Do not provide false information.</li>
                            <li><i className="fas fa-times-circle"></i> Do not use abusive language.</li>
                            <li><i className="fas fa-times-circle"></i> Do not share your account.</li>
                            <li><i className="fas fa-times-circle"></i> Do not book fake appointments.</li>
                            <li><i className="fas fa-times-circle"></i> Do not misuse teleconsultation.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => {}}>Got it</button>
            </div>
        </div>
    </div>

    
    <div id="toast"></div>

    

    </>
  );
}
