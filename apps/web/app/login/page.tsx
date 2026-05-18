"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@furevercare.com");
  const [password, setPassword] = useState("123123");
  const [showPassword, setShowPassword] = useState(false);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (email === "admin@furcare.com" || email === "admin@gmail.com" || email === "admin@furevercare.com" || email === "fureverpawcareadmin@gmail.com") && 
      (password === "123123" || password === "admin123")
    ) {
      router.push("/admin/dashboard");
    } else if (
      (email === "superadmin@furcare.com" || email === "superadmin@gmail.com" || email === "superadmin@furevercare.com" || email === "fureverpawcare@gmail.com") && 
      (password === "123123" || password === "superadmin123")
    ) {
      router.push("/superadmin/dashboard");
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
                    <input type="checkbox" style={{ accentColor: '#7ed44a' }} />
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
                onClick={() => triggerToast("SSO login not implemented yet.")}
              >
                <i className="fab fa-windows"></i> Sign in with SSO
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
