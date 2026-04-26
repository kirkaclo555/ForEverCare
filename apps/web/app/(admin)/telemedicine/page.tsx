"use client";

import React, { useState } from 'react';
import './telemedicine.css';

export default function TelemedicinePage() {
  return (
    <>
      <div className="main-content" id="mainContent">
        
        <div className="top-bar">
            <div style={{"display":"flex","alignItems":"center"}}>
                <button className="menu-toggle" onClick={() => {}}>
                    <i className="fas fa-bars"></i>
                </button>
                <div className="page-title">
                    <h1>Telemedicine</h1>
                    <span>Virtual Care</span>
                </div>
            </div>
            
            <div className="user-info">
                
                <div className="search-container">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search telemedicine..." />
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

        
        <div className="telemedicine-container">
            
            <div className="telemedicine-header">
                <h2>
                    <i className="fas fa-video"></i>
                    Telemedicine
                </h2>
                <p>Connect with pet owners remotely</p>
            </div>

            
            <div className="action-cards">
                
                <div className="action-card" onClick={() => {}}>
                    <div className="icon">
                        <i className="fas fa-plus"></i>
                    </div>
                    <h2>New Session</h2>
                    <p>Start a new telemedicine consultation instantly</p>
                </div>

                
                <div className="action-card" onClick={() => {}}>
                    <div className="icon">
                        <i className="fas fa-key"></i>
                    </div>
                    <h2>Join with Code</h2>
                    <p>Enter a meeting code to join an existing session</p>
                </div>
            </div>

            
            <div className="join-section">
                <h3>
                    <i className="fas fa-link"></i>
                    Enter Meeting Code
                </h3>
                <div className="join-input-group">
                    <input type="text" className="join-input" id="meetingCode" placeholder="Enter 6-digit code" maxLength={6} />
                    <button className="join-btn" onClick={() => {}}>
                        <i className="fas fa-sign-in-alt"></i>
                        Join
                    </button>
                </div>
            </div>

            
            <div className="info-box">
                <i className="fas fa-share-alt"></i>
                <p><strong>Get a link you can share.</strong> Tap <strong>"New Session"</strong> to get a link you can send to people you want to meet with.</p>
            </div>

            
            <div className="bottom-text">
                <i className="fas fa-info-circle"></i>
                Get a link you can share. Tap New Session to get link you can send people you want to meet with.
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
