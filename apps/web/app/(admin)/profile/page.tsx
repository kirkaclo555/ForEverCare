"use client";

import React, { useState } from 'react';
import './profile.css';

export default function ProfilePage() {
  return (
    <>
      <div className="main-content" id="mainContent">
        
        <div className="top-bar">
            <div style={{"display":"flex","alignItems":"center"}}>
                <button className="menu-toggle" onClick={() => {}}>
                    <i className="fas fa-bars"></i>
                </button>
                <div className="page-title">
                    <h1>Admin Profile</h1>
                    <span>Personal Info</span>
                </div>
            </div>
            
            <div className="user-info">
                
                <div className="search-container">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search..." />
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

        
        <div className="profile-container">
            
            <div className="profile-header">
                <div className="profile-header-content">
                    <div className="profile-avatar-large" onClick={() => {}}>
                        AD
                    </div>
                    <div className="profile-header-info">
                        <h1>Admin User</h1>
                        <p><i className="fas fa-envelope"></i> admin@furcare.com</p>
                        <p><i className="fas fa-phone"></i> +1 (555) 123-4567</p>
                    </div>
                    <button className="edit-profile-btn" onClick={() => {}}>
                        <i className="fas fa-edit"></i>
                        Edit Profile
                    </button>
                </div>
            </div>

            
            <div className="profile-layout">
                
                <div className="profile-sidebar">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stats-number">1,482</div>
                            <div className="stats-label">Total Patients</div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-number">24</div>
                            <div className="stats-label">Appointments</div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-number">8</div>
                            <div className="stats-label">Pending</div>
                        </div>
                        <div className="stat-card">
                            <div className="stats-number">5</div>
                            <div className="stats-label">Years</div>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <h3 className="section-title" style={{"marginBottom":"15px"}}>
                            <i className="fas fa-bolt"></i>
                            Quick Actions
                        </h3>
                        <div className="quick-action-item" onClick={() => {}}>
                            <i className="fas fa-key"></i>
                            <span>Change Password</span>
                        </div>
                        <div className="quick-action-item" onClick={() => {}}>
                            <i className="fas fa-history"></i>
                            <span>Activity Log</span>
                        </div>
                        <div className="quick-action-item" onClick={() => {}}>
                            <i className="fas fa-bell"></i>
                            <span>Notification Settings</span>
                        </div>
                        <div className="quick-action-item" onClick={() => {}}>
                            <i className="fas fa-download"></i>
                            <span>Export Data</span>
                        </div>
                    </div>
                </div>

                
                <div className="profile-content">
                    
                    <div className="info-section">
                        <h3 className="section-title">
                            <i className="fas fa-user-circle"></i>
                            Personal Information
                        </h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-user"></i>
                                    Full Name
                                </div>
                                <div className="info-value">Admin User</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-envelope"></i>
                                    Email Address
                                </div>
                                <div className="info-value">admin@furcare.com</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-phone"></i>
                                    Contact Number
                                </div>
                                <div className="info-value">+1 (555) 123-4567</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-map-marker-alt"></i>
                                    Address
                                </div>
                                <div className="info-value">123 Main Street, Springfield, IL 62701</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-calendar"></i>
                                    Date of Birth
                                </div>
                                <div className="info-value">January 15, 1985</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-flag"></i>
                                    Member Since
                                </div>
                                <div className="info-value">March 2020</div>
                            </div>
                        </div>
                    </div>

                    
                    <div className="info-section">
                        <h3 className="section-title">
                            <i className="fas fa-quote-right"></i>
                            Bio
                        </h3>
                        <div className="bio-box">
                            <i className="fas fa-quote-left" style={{"color":"#2E5E3E","opacity":"0.5","marginRight":"8px"}}></i>
                            Experienced veterinary clinic administrator with over 5 years of experience in managing daily operations, patient records, and staff coordination. Passionate about providing the best care for animals and supporting our team of dedicated veterinarians.
                        </div>
                    </div>

                    
                    <div className="info-section">
                        <h3 className="section-title">
                            <i className="fas fa-clock"></i>
                            Recent Activity
                        </h3>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <i className="fas fa-calendar-check"></i>
                                </div>
                                <div className="activity-content">
                                    <div className="activity-text">New appointment scheduled for Max (Golden Retriever)</div>
                                    <div className="activity-time">10 minutes ago</div>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <i className="fas fa-box"></i>
                                </div>
                                <div className="activity-content">
                                    <div className="activity-text">Updated inventory: Added 50 units of Amoxicillin</div>
                                    <div className="activity-time">25 minutes ago</div>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <i className="fas fa-video"></i>
                                </div>
                                <div className="activity-content">
                                    <div className="activity-text">Completed telemedicine consultation with Luna (Cat)</div>
                                    <div className="activity-time">1 hour ago</div>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <i className="fas fa-file-invoice"></i>
                                </div>
                                <div className="activity-content">
                                    <div className="activity-text">Generated monthly report for February 2024</div>
                                    <div className="activity-time">2 hours ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    
    <div className="modal" id="editModal" onClick={() => {}}>
        <div className="modal-content" onClick={() => {}}>
            <div className="modal-header">
                <h2>Edit Profile</h2>
                <button className="close-modal" onClick={() => {}}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="modal-body">
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" value="Admin User" placeholder="Enter your full name" />
                </div>
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value="admin@furcare.com" placeholder="Enter your email" />
                </div>
                <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input type="tel" className="form-input" value="+1 (555) 123-4567" placeholder="Enter your phone number" />
                </div>
                <div className="form-group">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-input" value="123 Main Street, Springfield, IL 62701" placeholder="Enter your address" />
                </div>
                <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-input" placeholder="Tell us about yourself">Experienced veterinary clinic administrator with over 5 years of experience in managing daily operations, patient records, and staff coordination. Passionate about providing the best care for animals and supporting our team of dedicated veterinarians.</textarea>
                </div>
                <div className="form-group">
                    <label className="form-label">Profile Picture</label>
                    <input type="file" className="form-input" accept="image/*" />
                </div>
            </div>
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => {}}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {}}>Save Changes</button>
            </div>
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
