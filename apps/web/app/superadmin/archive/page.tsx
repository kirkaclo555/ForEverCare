"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './archive.css';

export default function ArchivePage() {
  const router = useRouter();
  return (
    <>
      
    
    

    
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} >
        
        

        
        

        
        <div className="back-link" onClick={() => router.push('/superadmin/dashboard')}>
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
        </div>

        
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-archive"></i>
                </div>
                <div className="stat-info">
                    <h3>Total Archived</h3>
                    <p>127</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                    <h3>Archived Users</h3>
                    <p>34</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-notes-medical"></i>
                </div>
                <div className="stat-info">
                    <h3>Archived Patients</h3>
                    <p>56</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-box"></i>
                </div>
                <div className="stat-info">
                    <h3>Archived Items</h3>
                    <p>37</p>
                </div>
            </div>
        </div>

        
        <div className="archive-summary">
            <div className="summary-item">
                <div className="summary-icon">
                    <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="summary-text">
                    <h3>This Month</h3>
                    <span>23</span>
                </div>
            </div>
            <div className="summary-item">
                <div className="summary-icon">
                    <i className="fas fa-calendar-week"></i>
                </div>
                <div className="summary-text">
                    <h3>This Week</h3>
                    <span>8</span>
                </div>
            </div>
            <div className="summary-item">
                <div className="summary-icon">
                    <i className="fas fa-calendar-day"></i>
                </div>
                <div className="summary-text">
                    <h3>Today</h3>
                    <span>2</span>
                </div>
            </div>
            <div className="summary-item">
                <div className="summary-icon">
                    <i className="fas fa-history"></i>
                </div>
                <div className="summary-text">
                    <h3>30+ Days</h3>
                    <span>94</span>
                </div>
            </div>
        </div>

        
        <div className="categories-grid">
            <div className="category-card" onClick={() => console.log(`filterByCategory('users')`)}>
                <div className="category-icon">
                    <i className="fas fa-users"></i>
                </div>
                <div className="category-info">
                    <h4>Users</h4>
                    <p>Staff accounts</p>
                </div>
                <div className="category-count">34</div>
            </div>
            <div className="category-card" onClick={() => console.log(`filterByCategory('patients')`)}>
                <div className="category-icon">
                    <i className="fas fa-notes-medical"></i>
                </div>
                <div className="category-info">
                    <h4>Patients</h4>
                    <p>Pet records</p>
                </div>
                <div className="category-count">56</div>
            </div>
            <div className="category-card" onClick={() => console.log(`filterByCategory('inventory')`)}>
                <div className="category-icon">
                    <i className="fas fa-box"></i>
                </div>
                <div className="category-info">
                    <h4>Inventory</h4>
                    <p>Supplies & equipment</p>
                </div>
                <div className="category-count">37</div>
            </div>
            <div className="category-card" onClick={() => console.log(`filterByCategory('appointments')`)}>
                <div className="category-icon">
                    <i className="fas fa-calendar-check"></i>
                </div>
                <div className="category-info">
                    <h4>Appointments</h4>
                    <p>Past appointments</p>
                </div>
                <div className="category-count">0</div>
            </div>
        </div>

        
        <div className="filters-section">
            <div className="filter-group">
                <span className="filter-label"><i className="fas fa-folder" style={{"marginRight":"5px"}}></i>Category:</span>
                <select className="filter-select" id="categoryFilter" onChange={() => console.log('applyFilters()')}>
                    <option value="all">All Categories</option>
                    <option value="users">Users</option>
                    <option value="patients">Patients</option>
                    <option value="inventory">Inventory</option>
                    <option value="appointments">Appointments</option>
                </select>
            </div>

            <div className="filter-group">
                <span className="filter-label"><i className="fas fa-calendar" style={{"marginRight":"5px"}}></i>Archive
                    Date:</span>
                <select className="filter-select" id="dateFilter" onChange={() => console.log('applyFilters()')}>
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="older">30+ Days</option>
                </select>
            </div>

            <button className="clear-filters-btn" onClick={() => console.log('clearFilters()')}>
                <i className="fas fa-times"></i>
                Clear Filters
            </button>
        </div>

        
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Role / Type</th>
                        <th>Contact #</th>
                        <th>Archive Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    
                    <tr>
                        <td><span className="id-badge">#U023</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">MT</div>
                                <div className="user-info-small">
                                    <span className="user-name">Mark Thompson</span>
                                    <span className="user-email">mark.t@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-technician">Technician</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 987-6543
                            </div>
                        </td>
                        <td>
                            <div className="archive-date">
                                <i className="fas fa-calendar-alt"></i>
                                Mar 15, 2024
                            </div>
                        </td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => console.log(`viewItem('U023')`)}><i className="fas fa-eye"></i></button>
                                <button className="unarchive-btn" onClick={() => console.log(`unarchiveItem('U023')`)}><i
                                        className="fas fa-undo-alt"></i></button>
                            </div>
                        </td>
                    </tr>

                    
                    <tr>
                        <td><span className="id-badge">#P045</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">BA</div>
                                <div className="user-info-small">
                                    <span className="user-name">Buddy (Dog)</span>
                                    <span className="user-email">Owner: Alex Brown</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge" style={{"background":"#c6f6d5","color":"#22543d"}}>Patient -
                                Canine</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 456-7890
                            </div>
                        </td>
                        <td>
                            <div className="archive-date">
                                <i className="fas fa-calendar-alt"></i>
                                Mar 14, 2024
                            </div>
                        </td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => console.log(`viewItem('P045')`)}><i className="fas fa-eye"></i></button>
                                <button className="unarchive-btn" onClick={() => console.log(`unarchiveItem('P045')`)}><i
                                        className="fas fa-undo-alt"></i></button>
                            </div>
                        </td>
                    </tr>

                    
                    <tr>
                        <td><span className="id-badge">#I089</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small"><i className="fas fa-pills"></i></div>
                                <div className="user-info-small">
                                    <span className="user-name">Amoxicillin</span>
                                    <span className="user-email">Batch #A-2023-045</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge" style={{"background":"#e9d8fd","color":"#553c9a"}}>Medication</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-hashtag"></i>
                                Qty: 120
                            </div>
                        </td>
                        <td>
                            <div className="archive-date">
                                <i className="fas fa-calendar-alt"></i>
                                Mar 12, 2024
                            </div>
                        </td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => console.log(`viewItem('I089')`)}><i className="fas fa-eye"></i></button>
                                <button className="unarchive-btn" onClick={() => console.log(`unarchiveItem('I089')`)}><i
                                        className="fas fa-undo-alt"></i></button>
                            </div>
                        </td>
                    </tr>

                    
                    <tr>
                        <td><span className="id-badge">#U045</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">PW</div>
                                <div className="user-info-small">
                                    <span className="user-name">Patricia White</span>
                                    <span className="user-email">patricia.w@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-receptionist">Receptionist</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 234-5678
                            </div>
                        </td>
                        <td>
                            <div className="archive-date">
                                <i className="fas fa-calendar-alt"></i>
                                Mar 10, 2024
                            </div>
                        </td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => console.log(`viewItem('U045')`)}><i className="fas fa-eye"></i></button>
                                <button className="unarchive-btn" onClick={() => console.log(`unarchiveItem('U045')`)}><i
                                        className="fas fa-undo-alt"></i></button>
                            </div>
                        </td>
                    </tr>

                    
                    <tr>
                        <td><span className="id-badge">#P078</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">MI</div>
                                <div className="user-info-small">
                                    <span className="user-name">Mittens (Cat)</span>
                                    <span className="user-email">Owner: Carol Green</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge" style={{"background":"#feebc8","color":"#7b341e"}}>Patient -
                                Feline</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 678-9012
                            </div>
                        </td>
                        <td>
                            <div className="archive-date">
                                <i className="fas fa-calendar-alt"></i>
                                Mar 8, 2024
                            </div>
                        </td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => console.log(`viewItem('P078')`)}><i className="fas fa-eye"></i></button>
                                <button className="unarchive-btn" onClick={() => console.log(`unarchiveItem('P078')`)}><i
                                        className="fas fa-undo-alt"></i></button>
                            </div>
                        </td>
                    </tr>

                    
                    <tr>
                        <td><span className="id-badge">#I102</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small"><i className="fas fa-syringe"></i></div>
                                <div className="user-info-small">
                                    <span className="user-name">Rabies Vaccine</span>
                                    <span className="user-email">Batch #RB-2023-112</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge" style={{"background":"#bee3f8","color":"#2c5282"}}>Vaccine</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-hashtag"></i>
                                Qty: 45
                            </div>
                        </td>
                        <td>
                            <div className="archive-date">
                                <i className="fas fa-calendar-alt"></i>
                                Mar 5, 2024
                            </div>
                        </td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => console.log(`viewItem('I102')`)}><i className="fas fa-eye"></i></button>
                                <button className="unarchive-btn" onClick={() => console.log(`unarchiveItem('I102')`)}><i
                                        className="fas fa-undo-alt"></i></button>
                            </div>
                        </td>
                    </tr>

                    
                    <tr>
                        <td><span className="id-badge">#U067</span></td>
                        <td>
                            <div className="user-cell">
                                <div className="user-avatar-small">DR</div>
                                <div className="user-info-small">
                                    <span className="user-name">Dr. David Ross</span>
                                    <span className="user-email">david.ross@furcare.com</span>
                                </div>
                            </div>
                        </td>
                        <td><span className="role-badge role-vet">Veterinarian</span></td>
                        <td>
                            <div className="contact-info">
                                <i className="fas fa-phone"></i>
                                (555) 345-6789
                            </div>
                        </td>
                        <td>
                            <div className="archive-date">
                                <i className="fas fa-calendar-alt"></i>
                                Mar 3, 2024
                            </div>
                        </td>
                        <td>
                            <div className="action-buttons">
                                <button className="view-btn" onClick={() => console.log(`viewItem('U067')`)}><i className="fas fa-eye"></i></button>
                                <button className="unarchive-btn" onClick={() => console.log(`unarchiveItem('U067')`)}><i
                                        className="fas fa-undo-alt"></i></button>
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

    
    <div className="modal" id="generalSettingsModal" onClick={() => console.log('if(event.target === this) closeGeneralSettings()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-clinic-medical" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Clinic Information
                </h3>
                <button className="modal-close" onClick={() => console.log('closeGeneralSettings()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="clinicSettingsForm">
                    <div className="form-group">
                        <label><i className="fas fa-clinic-medical"></i> Clinic name</label>
                        <input type="text" className="form-control" id="clinicName"
                            placeholder="e.g., FurEverCare Veterinary" defaultValue="FurEverCare Veterinary Clinic" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-map-marker-alt"></i> Address</label>
                        <input type="text" className="form-control" id="clinicAddress" placeholder="Street, City, ZIP"
                            defaultValue="123 Paws Avenue, Pet City, PC 12345" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-phone-alt"></i> Phone number</label>
                        <input type="tel" className="form-control" id="clinicPhone" placeholder="+1 (555) 123-4567"
                            defaultValue="+1 (555) 123-4567" />
                    </div>
                    <div className="form-group">
                        <label><i className="far fa-clock"></i> Opening hours</label>
                        <input type="text" className="form-control" id="clinicHours"
                            placeholder="e.g., Mon-Fri 9am-6pm, Sat 9am-2pm"
                            defaultValue="Mon-Fri 9am-6pm, Sat 9am-2pm, Sun Closed" />
                    </div>
                </form>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => console.log('closeGeneralSettings()')}>Cancel</button>
                <button className="btn btn-primary" onClick={() => console.log('saveClinicSettings()')}>Save Changes</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="accountSecurityModal" onClick={() => console.log('if(event.target === this) closeAccountSecurity()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-shield-alt" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Account Security</h3>
                <button className="modal-close" onClick={() => console.log('closeAccountSecurity()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="securityForm" onSubmit={() => console.log('event.preventDefault(); updatePassword();')}>
                    <div className="form-group">
                        <label><i className="fas fa-lock"></i> Current password</label>
                        <input type="password" className="form-control" id="currentPassword"
                            placeholder="Enter current password" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-key"></i> New password</label>
                        <input type="password" className="form-control" id="newPassword" placeholder="Enter new password"
                            onKeyUp={() => console.log('validatePassword()')} />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-check-circle"></i> Confirm new password</label>
                        <input type="password" className="form-control" id="confirmPassword"
                            placeholder="Confirm new password" onKeyUp={() => console.log('validatePassword()')} />
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
                <button className="btn btn-secondary" onClick={() => console.log('closeAccountSecurity()')}>Cancel</button>
                <button className="btn btn-primary" onClick={() => console.log('updatePassword()')}>Update Password</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="languageModal" onClick={() => console.log('if(event.target === this) closeLanguageSettings()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-globe" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Language Settings</h3>
                <button className="modal-close" onClick={() => console.log('closeLanguageSettings()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <p style={{"color":"#718096","marginBottom":"20px"}}>Select your preferred language</p>

                <div className="language-options">
                    
                    <div className="language-option" id="langEnglish" onClick={() => console.log(`selectLanguage('en')`)}>
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

                    
                    <div className="language-option" id="langFilipino" onClick={() => console.log(`selectLanguage('fil')`)}>
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
                <button className="btn btn-secondary" onClick={() => console.log('closeLanguageSettings()')}>Cancel</button>
                <button className="btn btn-primary" onClick={() => console.log('saveLanguageSettings()')}>Apply Changes</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="communityRulesModal" onClick={() => console.log('if(event.target === this) closeCommunityRules()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-gavel" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Community Rules</h3>
                <button className="modal-close" onClick={() => console.log('closeCommunityRules()')}><i className="fas fa-times"></i></button>
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
                <button className="btn btn-primary" onClick={() => console.log('closeCommunityRules()')}>Got it</button>
            </div>
        </div>
    </div>

    
    <div id="toast"></div>

    

    </>
  );
}
