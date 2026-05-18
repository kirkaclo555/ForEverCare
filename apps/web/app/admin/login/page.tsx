"use client";

import React, { useState } from 'react';
import './login.css';

export default function LoginPage() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    setIsLoading(true);
    setResetMessage('');
    setResetError('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResetMessage(`A password reset code has been sent to ${resetEmail}`);
        setResetStep(2);
      } else {
        setResetError(`Error: ${data.message || 'Failed to send reset code'}`);
      }
    } catch (error) {
      setResetError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode) return;
    
    setIsLoading(true);
    setResetMessage('');
    setResetError('');
    
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail, code: resetCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResetMessage('Code verified successfully.');
        setResetStep(3);
      } else {
        setResetError(`Error: ${data.message || 'Invalid code'}`);
      }
    } catch (error) {
      setResetError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmNewPassword) {
      setResetError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setResetMessage('');
    setResetError('');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail, code: resetCode, newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResetMessage('Password reset successfully. You can now login.');
        setTimeout(() => {
          setIsForgotPassword(false);
          setResetStep(1);
          setResetEmail('');
          setResetCode('');
          setNewPassword('');
          setConfirmNewPassword('');
          setResetMessage('');
          setResetError('');
        }, 3000);
      } else {
        setResetError(`Error: ${data.message || 'Failed to reset password'}`);
      }
    } catch (error) {
      setResetError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      
    
    <header className="header">
        <div className="header-content">
            <div className="header-logo">
                <i className="fas fa-paw"></i>
            </div>
            <div className="header-brand">
                <h1>Balingasag Dog & Cat Pet's Clinic</h1>
                <span>Veterinary Clinic Management System</span>
            </div>
        </div>
    </header>

    
    <main className="module-content" style={{ width: "100%", padding: 0, margin: 0 }}>
        <div className="login-container">
            {isForgotPassword ? (
              <div className="forgot-password-view">
                <div className="login-header">
                    <h2>Reset Password</h2>
                    <p>
                      {resetStep === 1 && "Enter your email to receive a reset link"}
                      {resetStep === 2 && "Enter the 6-digit code sent to your email"}
                      {resetStep === 3 && "Set your new password"}
                    </p>
                </div>
                {resetMessage && (
                    <div style={{ padding: '10px', background: '#c6f6d5', color: '#22543d', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                        <i className="fas fa-check-circle" style={{marginRight:'5px'}}></i> {resetMessage}
                    </div>
                )}
                {resetError && (
                    <div style={{ padding: '10px', background: '#fed7d7', color: '#c53030', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                        <i className="fas fa-exclamation-circle" style={{marginRight:'5px'}}></i> {resetError}
                    </div>
                )}

                {resetStep === 1 && (
                  <form onSubmit={handleSendResetEmail}>
                      <div className="form-group">
                          <label>Email Address</label>
                          <div className="input-group">
                              <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Enter your email" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'transparent' }} />
                          </div>
                      </div>
                      <button type="submit" className="login-btn" style={{marginTop: '10px'}} disabled={isLoading}>
                          {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                  </form>
                )}

                {resetStep === 2 && (
                  <form onSubmit={handleVerifyCode}>
                      <div className="form-group">
                          <label>6-Digit Code</label>
                          <div className="input-group">
                              <input type="text" value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="Enter code" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'transparent' }} />
                          </div>
                      </div>
                      <button type="submit" className="login-btn" style={{marginTop: '10px'}} disabled={isLoading}>
                          {isLoading ? 'Verifying...' : 'Verify Code'}
                      </button>
                  </form>
                )}

                {resetStep === 3 && (
                  <form onSubmit={handleSetNewPassword}>
                      <div className="form-group">
                          <label>New Password</label>
                          <div className="input-group">
                              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'transparent' }} />
                          </div>
                      </div>
                      <div className="form-group">
                          <label>Confirm Password</label>
                          <div className="input-group">
                              <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'transparent' }} />
                          </div>
                      </div>
                      <button type="submit" className="login-btn" style={{marginTop: '10px'}} disabled={isLoading}>
                          {isLoading ? 'Saving...' : 'Reset Password'}
                      </button>
                  </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setResetStep(1); setResetMessage(''); setResetError(''); }} style={{ color: '#2E5E3E', textDecoration: 'none', fontWeight: 600 }}>
                        <i className="fas fa-arrow-left"></i> Back to Login
                    </a>
                </div>
              </div>
            ) : (
              <div className="login-view">
                <div className="login-header">
                <h2>Welcome Back!</h2>
                <p>Login to access your dashboard</p>
            </div>

            <form onSubmit={() => console.log('handleLogin(event)')}>
                <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-group">
                        <input type="email" id="email" defaultValue="admin@furcare.com" placeholder="Enter your email" required />
                    </div>
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <div className="input-group">
                        <input type="password" id="password" defaultValue="admin123" placeholder="Enter your password" required />
                    </div>
                </div>

                <div className="forgot-password">
                    <span onClick={() => setIsForgotPassword(true)} style={{ cursor: 'pointer', zIndex: 50, position: 'relative', color: '#2E5E3E', textDecoration: 'underline' }}>Forgot password?</span>
                </div>

                <button type="submit" className="login-btn">
                    Sign In
                </button>
            </form>

            <div className="divider">
                <span>or continue with</span>
            </div>

            <button className="google-btn" onClick={() => console.log('handleGoogleLogin()')}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{"marginRight":"10px"}}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
            </button>

            <div className="signup-link">
                Don't have an account? <a href="Signup.html">Sign up</a>
            </div>
          </div>
          )}
        </div>
    </main>

    
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
