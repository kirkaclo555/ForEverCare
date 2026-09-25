"use client";

import React, { useState } from 'react';
import './signup.css';

export default function SignupPage() {
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
        <div className="signup-container">
            <div className="signup-header">
                <h2>Create Account</h2>
                <p>Join our veterinary clinic management system</p>
            </div>

            <form onSubmit={() => console.log('handleSignup(event)')}>
                <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-group">
                        <input type="text" id="fullName" placeholder="e.g. Juan Dela Cruz" required />
                    </div>
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-group">
                        <input type="email" id="email" placeholder="example@gmail.com" required />
                    </div>
                </div>

                <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-group">
                        <input type="tel" id="phone" placeholder="09XX-XXX-XXXX" required />
                    </div>
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <div className="input-group password-input">
                        <input type="password" id="password" placeholder="Create a strong password" required onKeyUp={() => console.log('validatePassword()')} />
                        <button type="button" className="toggle-password" onClick={() => console.log('togglePasswordVisibility()')}>
                            <i className="fas fa-eye" id="passwordToggle"></i>
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-group password-input">
                        <input type="password" id="confirmPassword" placeholder="Confirm your password" required onKeyUp={() => console.log('validatePassword()')} />
                        <button type="button" className="toggle-password" onClick={() => console.log('toggleConfirmPasswordVisibility()')}>
                            <i className="fas fa-eye" id="confirmPasswordToggle"></i>
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Clinic Role</label>
                    <div className="input-group">
                        <select id="role" style={{"width":"100%","padding":"12px 16px","border":"1px solid #e2e8f0","borderRadius":"10px","fontSize":"0.95rem","background":"#f8fafc"}} required>
                            <option value="">Select your role</option>
                            <option value="admin">Administrator</option>
                            <option value="veterinarian">Veterinarian</option>
                            <option value="staff">Clinic Staff</option>
                            <option value="receptionist">Receptionist</option>
                        </select>
                    </div>
                </div>

                <div className="terms-checkbox">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms">I agree to the <a href="#" onClick={() => console.log('showTerms(event)')}>Terms of Service</a> and <a href="#" onClick={() => console.log('showPrivacy(event)')}>Privacy Policy</a></label>
                </div>

                <button type="submit" className="signup-btn" id="signupBtn">
                    Create Account
                </button>
            </form>

            <div className="divider">
                <span>or sign up with</span>
            </div>

            <button className="google-btn" onClick={() => console.log('handleGoogleSignup()')}>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{"marginRight":"10px"}}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
            </button>

            <div className="login-link">
                Already have an account? <a href="Loginpage.html">Sign in</a>
            </div>
        </div>
    </main>

    
    <div id="toast"></div>

    

    </>
  );
}
