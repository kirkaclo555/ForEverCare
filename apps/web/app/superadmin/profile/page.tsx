"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './profile.css';

export default function ProfilePage() {
  const router = useRouter();

  const [profilePic, setProfilePic] = useState<string | null>(null);
  
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Admin User",
    email: "admin@furevercare.com",
    contact: "+1 (555) 123-4567",
    address: "123 Main Street, Springfield, IL 62701"
  });
  
  const [editedInfo, setEditedInfo] = useState(personalInfo);
  const isDirty = JSON.stringify(personalInfo) !== JSON.stringify(editedInfo);

  const handleSave = () => {
    setPersonalInfo(editedInfo);
    // Add logic to save to backend or local storage here
  };

  React.useEffect(() => {
    const pic = localStorage.getItem('superadminProfilePic');
    if (pic) setProfilePic(pic);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePic(base64String);
        localStorage.setItem('superadminProfilePic', base64String);
        window.dispatchEvent(new Event('profilePicUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      
    
    

    
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} >
        
        

        
        <div className="profile-container">
            
            <div className="profile-header">
                <div className="profile-header-content">
                    
                    <div className="profile-avatar-large" style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} title="Change Profile Picture" />
                        {profilePic ? (
                            <img id="profileAvatarImage" src={profilePic} alt="Profile Picture" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span className="avatar-text" id="profileAvatarText">SA</span>
                        )}
                        <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', background: 'rgba(0,0,0,0.6)', color: 'white', textAlign: 'center', padding: '6px 0', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                            <i className="fas fa-camera"></i>
                        </div>
                    </div>

                    <div className="profile-header-info">
                        <h1>{personalInfo.fullName}</h1>
                        <p><i className="fas fa-envelope"></i> {personalInfo.email}</p>
                        <p><i className="fas fa-phone"></i> {personalInfo.contact}</p>
                    </div>
                    <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', opacity: 0.15, pointerEvents: 'none', zIndex: 0, width: '350px', height: '350px', backgroundColor: '#2E5E3E', maskImage: 'url(/logo.png)', WebkitMaskImage: 'url(/logo.png)', maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
                    </div>
                </div>
            </div>

            
            <div className="profile-layout" style={{ display: 'block' }}>
                <div className="profile-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    
                    <div className="info-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 className="section-title" style={{ margin: 0 }}>
                                <i className="fas fa-user-circle"></i>
                                Personal Information
                            </h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-user"></i>
                                    Full Name
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        value={editedInfo.fullName}
                                        onChange={(e) => setEditedInfo({...editedInfo, fullName: e.target.value})}
                                        style={{ flex: 1, padding: '8px 0', border: 'none', borderBottom: '1px solid #e2e8f0', background: 'transparent', outline: 'none', fontSize: '1rem', color: '#2d3748', transition: 'border-color 0.3s' }}
                                        onFocus={(e) => e.target.style.borderBottom = '2px solid #2E5E3E'}
                                        onBlur={(e) => e.target.style.borderBottom = '1px solid #e2e8f0'}
                                    />
                                    {personalInfo.fullName !== editedInfo.fullName && (
                                        <button onClick={() => setPersonalInfo({...personalInfo, fullName: editedInfo.fullName})} style={{ background: '#2E5E3E', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Save</button>
                                    )}
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-envelope"></i>
                                    Email Address
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="email" 
                                        value={editedInfo.email}
                                        onChange={(e) => setEditedInfo({...editedInfo, email: e.target.value})}
                                        style={{ flex: 1, padding: '8px 0', border: 'none', borderBottom: '1px solid #e2e8f0', background: 'transparent', outline: 'none', fontSize: '1rem', color: '#2d3748', transition: 'border-color 0.3s' }}
                                        onFocus={(e) => e.target.style.borderBottom = '2px solid #2E5E3E'}
                                        onBlur={(e) => e.target.style.borderBottom = '1px solid #e2e8f0'}
                                    />
                                    {personalInfo.email !== editedInfo.email && (
                                        <button onClick={() => setPersonalInfo({...personalInfo, email: editedInfo.email})} style={{ background: '#2E5E3E', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Save</button>
                                    )}
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-phone"></i>
                                    Contact Number
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="tel" 
                                        value={editedInfo.contact}
                                        onChange={(e) => setEditedInfo({...editedInfo, contact: e.target.value})}
                                        style={{ flex: 1, padding: '8px 0', border: 'none', borderBottom: '1px solid #e2e8f0', background: 'transparent', outline: 'none', fontSize: '1rem', color: '#2d3748', transition: 'border-color 0.3s' }}
                                        onFocus={(e) => e.target.style.borderBottom = '2px solid #2E5E3E'}
                                        onBlur={(e) => e.target.style.borderBottom = '1px solid #e2e8f0'}
                                    />
                                    {personalInfo.contact !== editedInfo.contact && (
                                        <button onClick={() => setPersonalInfo({...personalInfo, contact: editedInfo.contact})} style={{ background: '#2E5E3E', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Save</button>
                                    )}
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <i className="fas fa-map-marker-alt"></i>
                                    Address
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        value={editedInfo.address}
                                        onChange={(e) => setEditedInfo({...editedInfo, address: e.target.value})}
                                        style={{ flex: 1, padding: '8px 0', border: 'none', borderBottom: '1px solid #e2e8f0', background: 'transparent', outline: 'none', fontSize: '1rem', color: '#2d3748', transition: 'border-color 0.3s' }}
                                        onFocus={(e) => e.target.style.borderBottom = '2px solid #2E5E3E'}
                                        onBlur={(e) => e.target.style.borderBottom = '1px solid #e2e8f0'}
                                    />
                                    {personalInfo.address !== editedInfo.address && (
                                        <button onClick={() => setPersonalInfo({...personalInfo, address: editedInfo.address})} style={{ background: '#2E5E3E', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Save</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
