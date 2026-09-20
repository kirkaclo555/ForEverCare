"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    const savedPassword = localStorage.getItem("remembered_password");
    const savedRemember = localStorage.getItem("remember_me") === "true";
    if (savedRemember) {
      setEmail(savedEmail || "");
      setPassword(savedPassword || "");
      setRememberMe(true);
    } else {
      setEmail("");
      setPassword("");
    }
  }, []);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const openForgotModal = () => {
    setShowForgotModal(true);
    setResetStep(1);
    setForgotEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
  };

  const [customPasswords, setCustomPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch any custom passwords set by admin
    fetch('/api/auth/change-password')
      .then(res => res.json())
      .then(data => {
        // Store the flags; actual validation happens server-side
        setCustomPasswords(data);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if custom password might be set - validate via API
    const adminEmails = ["admin@furcare.com", "admin@gmail.com", "admin@furevercare.com", "adminfureverpawcare@gmail.com"];
    const superadminEmails = ["superadmin@furcare.com", "superadmin@gmail.com", "superadmin@furevercare.com", "fureverpawcare@gmail.com", "fureverpawcaresuperadmin@gmail.com"];
    
    const isAdminEmail = adminEmails.includes(email);
    const isSuperAdminEmail = superadminEmails.includes(email);

    if (!isAdminEmail && !isSuperAdminEmail) {
      triggerToast("Invalid credentials! Please use valid admin or superadmin accounts.");
      return;
    }

    const role = isSuperAdminEmail ? 'superadmin' : 'admin';

    // Always validate via the server API - it knows if a custom password was set
    // and will reject old defaults when a new password exists
    let isValid = false;
    try {
      const res = await fetch('/api/auth/validate-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, password }),
      });
      if (res.ok) {
        isValid = true;
      }
    } catch (err) {
      // API unreachable - fall back to default passwords only
      const defaultAdminPasswords = ['123123', 'admin123'];
      const defaultSuperadminPasswords = ['123123', 'superadmin123'];
      const defaultPasswords = role === 'admin' ? defaultAdminPasswords : defaultSuperadminPasswords;
      isValid = defaultPasswords.includes(password);
    }

    if (isValid) {
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
        localStorage.setItem("remembered_password", password);
        localStorage.setItem("remember_me", "true");
      } else {
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remembered_password");
        localStorage.setItem("remember_me", "false");
      }
      
      if (role === 'admin') {
        router.push("/admin/dashboard");
      } else {
        router.push("/superadmin/dashboard");
      }
    } else {
      triggerToast("Invalid credentials! Please use valid admin or superadmin accounts.");
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      triggerToast("Please enter an email address.");
      return;
    }
    
    setIsResetting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      
      if (res.ok) {
        triggerToast(`Password reset code sent to ${forgotEmail}`);
        setResetStep(2);
      } else {
        triggerToast(data.message || "Failed to send reset code.");
      }
    } catch (err) {
      triggerToast("An error occurred. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode) {
      triggerToast("Please enter the verification code.");
      return;
    }
    
    setIsResetting(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: resetCode })
      });
      const data = await res.json();
      
      if (res.ok) {
        triggerToast("Code verified. Please enter your new password.");
        setResetStep(3);
      } else {
        triggerToast(data.message || "Invalid code.");
      }
    } catch (err) {
      triggerToast("An error occurred. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmNewPassword) {
      triggerToast("Passwords do not match.");
      return;
    }
    
    setIsResetting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: resetCode, newPassword })
      });
      const data = await res.json();
      
      if (res.ok) {
        triggerToast("Password reset successfully. You can now log in.");
        closeForgotModal();
      } else {
        triggerToast(data.message || "Failed to reset password.");
      }
    } catch (err) {
      triggerToast("An error occurred. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <div className={styles.loginContainer}>
        <div className={styles.splitLayout}>
          
          {/* LEFT COLUMN: VISUALS */}
          <div className={styles.leftColumn}>
            
            <div className={`${styles.floatingStat} ${styles.stat1}`}>
              <div className={styles.statIcon} style={{ background: 'rgba(126,212,74,0.2)', color: '#7ed44a' }}><i className="fas fa-users"></i></div>
              <div className={styles.statContent}>
                <p>Patients today</p>
                <h4>12</h4>
              </div>
            </div>

            <div className={`${styles.floatingStat} ${styles.stat2}`}>
              <div className={styles.statIcon} style={{ background: 'rgba(178,234,160,0.2)', color: '#b2eaa0' }}><i className="fas fa-wallet"></i></div>
              <div className={styles.statContent}>
                <p>Revenue</p>
                <h4>₱24,500 this week</h4>
              </div>
            </div>

            <div className={`${styles.floatingStat} ${styles.stat3}`}>
              <div className={styles.statIcon} style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}><i className="far fa-clock"></i></div>
              <div className={styles.statContent}>
                <p>Next up</p>
                <h4>Buddy in 12 mins</h4>
              </div>
            </div>

            <div className={styles.dashboardCard}>
              <div className={styles.dashboardHeader}>
                <span className={styles.dashboardTitle}>Today's Schedule</span>
                <span className={styles.dateBadge}>Oct 24, 2024</span>
              </div>

              <div className={styles.appointmentsList}>
                
                <div className={styles.appointmentRow}>
                  <div className={styles.petAvatar} style={{ background: '#fbd38d', color: '#c05621' }}>🐶</div>
                  <div className={styles.petInfo}>
                    <p className={styles.petName}>Buddy</p>
                    <p className={styles.petBreed}>Golden Retriever</p>
                  </div>
                  <div className={styles.visitDetails}>
                    <p className={styles.visitTime}>10:30 AM</p>
                    <p className={styles.doctorName}>Dr. Smith</p>
                  </div>
                </div>

                <div className={`${styles.appointmentRow} ${styles.tealBorder}`}>
                  <div className={styles.petAvatar} style={{ background: '#e6fffa', color: '#319795' }}>🐱</div>
                  <div className={styles.petInfo}>
                    <p className={styles.petName}>Luna</p>
                    <p className={styles.petBreed}>Siamese</p>
                  </div>
                  <div className={styles.visitDetails}>
                    <p className={styles.visitTime}>11:45 AM</p>
                    <p className={styles.doctorName}>Dr. Jones</p>
                  </div>
                </div>

                <div className={`${styles.appointmentRow} ${styles.amberBorder}`}>
                  <div className={styles.petAvatar} style={{ background: '#fffff0', color: '#d69e2e' }}>🐕</div>
                  <div className={styles.petInfo}>
                    <p className={styles.petName}>Max</p>
                    <p className={styles.petBreed}>Beagle</p>
                  </div>
                  <div className={styles.visitDetails}>
                    <p className={styles.visitTime}>02:15 PM</p>
                    <p className={styles.doctorName}>Dr. Smith</p>
                  </div>
                </div>

              </div>

              <div className={styles.dashboardFooter}>
                <span className={styles.morePill}>+ 4 more</span>
                <button className={styles.viewAllBtn}>View all <i className="fas fa-arrow-right" style={{ fontSize: '0.8rem' }}></i></button>
              </div>
            </div>

            <div className={styles.watermark}>
              FurEverPawCare / Veterinary Management System
            </div>
          </div>

          {/* RIGHT COLUMN: LOGIN FORM */}
          <div className={styles.rightColumn}>
            <div className={styles.formWrapper}>
              
              <div className={styles.logoArea}>
                <i className={`fas fa-paw ${styles.logoIcon}`}></i>
                <span>FurEverPawCare</span>
              </div>

              <div className={styles.loginHeader}>
                <h2>Welcome back</h2>
                <p>Sign in to your clinic account to continue.</p>
              </div>

              <form onSubmit={handleLogin}>
                <div className={styles.formGroup}>
                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className={styles.inputField}
                    />
                    <i className={`far fa-envelope ${styles.inputIcon}`}></i>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <div className={styles.inputGroup}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className={styles.inputField}
                    />
                    <i 
                      className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'} ${styles.inputIcon}`} 
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                  </div>
                </div>

                <div className={styles.formOptions}>
                  <label className={styles.rememberMe}>
                    <input 
                      type="checkbox" 
                      style={{ accentColor: '#7ed44a' }} 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <a href="#" className={styles.forgotLink} onClick={(e) => { e.preventDefault(); openForgotModal(); }}>Forgot password?</a>
                </div>

                <button type="submit" className={styles.primaryBtn}>
                  Sign in to FurEverPawCare
                </button>
              </form>

              <div className={styles.divider}>
                or continue with
              </div>

              <button
                className={styles.ssoBtn}
                onClick={() => triggerToast("Google login not implemented yet.")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" style={{marginRight:"10px"}}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>

              <div className={styles.formFooter}>
                Don't have an account? <a href="/signup">Sign up</a>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reset Password</h3>
              <button className={styles.closeModalBtn} onClick={closeForgotModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              {resetStep === 1 ? (
                <>
                  <p>Enter your clinic email address and we'll send you a 6-digit code to reset your password.</p>
                  <form onSubmit={handleForgotPassword}>
                    <div className={styles.formGroup}>
                      <div className={styles.inputGroup}>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="Email address"
                          required
                          className={styles.inputField}
                          disabled={isResetting}
                        />
                        <i className={`far fa-envelope ${styles.inputIcon}`}></i>
                      </div>
                    </div>
                    <div className={styles.modalFooter}>
                      <button type="button" className={styles.cancelBtn} onClick={closeForgotModal} disabled={isResetting}>Cancel</button>
                      <button type="submit" className={styles.submitModalBtn} disabled={isResetting}>
                        {isResetting ? "Sending..." : "Send Code"}
                      </button>
                    </div>
                  </form>
                </>
              ) : resetStep === 2 ? (
                <>
                  <p>Enter the 6-digit code sent to {forgotEmail}.</p>
                  <form onSubmit={handleVerifyCode}>
                    <div className={styles.formGroup}>
                      <div className={styles.inputGroup}>
                        <input
                          type="text"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          placeholder="6-digit Code"
                          required
                          className={styles.inputField}
                          disabled={isResetting}
                        />
                        <i className={`fas fa-key ${styles.inputIcon}`}></i>
                      </div>
                    </div>
                    <div className={styles.modalFooter}>
                      <button type="button" className={styles.cancelBtn} onClick={closeForgotModal} disabled={isResetting}>Cancel</button>
                      <button type="submit" className={styles.submitModalBtn} disabled={isResetting}>
                        {isResetting ? "Verifying..." : "Verify Code"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <p>Set a new password for your account.</p>
                  <form onSubmit={handleResetPassword}>
                    <div className={styles.formGroup}>
                      <div className={styles.inputGroup}>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New Password"
                          required
                          className={styles.inputField}
                          disabled={isResetting}
                        />
                        <i className={`fas fa-lock ${styles.inputIcon}`}></i>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <div className={styles.inputGroup}>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirm New Password"
                          required
                          className={styles.inputField}
                          disabled={isResetting}
                        />
                        <i className={`fas fa-lock ${styles.inputIcon}`}></i>
                      </div>
                    </div>
                    <div className={styles.modalFooter}>
                      <button type="button" className={styles.cancelBtn} onClick={closeForgotModal} disabled={isResetting}>Cancel</button>
                      <button type="submit" className={styles.submitModalBtn} disabled={isResetting}>
                        {isResetting ? "Resetting..." : "Reset Password"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div id="toast" className={`toast ${showToast ? "toastShow" : ""}`}>
        {toastMessage}
      </div>
    </>
  );
}
