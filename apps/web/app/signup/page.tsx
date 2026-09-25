"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (agreed) {
      router.push("/login");
    } else {
      alert("Please agree to the Terms of Service and Privacy Policy.");
    }
  };

  const calculateStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 0) strength += 1;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const strength = calculateStrength(password);

  return (
    <div className={styles.signupContainer}>
      <div className={styles.splitLayout}>
        
        {/* LEFT COLUMN: VISUALS (Faded/Blurred) */}
        <div className={styles.leftColumn}>
          
          <div className={`${styles.floatingStat} ${styles.stat1}`}>
            <div className={styles.statIcon} style={{ background: 'rgba(126,212,74,0.2)', color: '#7ed44a' }}><i className="fas fa-users"></i></div>
            <div className={styles.statContent}>
              <p>Patients today</p>
              <h4>12 <span style={{fontSize: '0.8rem', color: '#7ed44a'}}>(+3 vs yesterday)</span></h4>
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
                  <p className={styles.petBreed}>Labrador</p>
                </div>
                <div className={styles.visitDetails}>
                  <p className={styles.visitTime}>9:00 AM</p>
                  <p className={styles.doctorName}>Dr. Santos</p>
                </div>
              </div>

              <div className={`${styles.appointmentRow} ${styles.tealBorder}`}>
                <div className={styles.petAvatar} style={{ background: '#e6fffa', color: '#319795' }}>🐱</div>
                <div className={styles.petInfo}>
                  <p className={styles.petName}>Luna</p>
                  <p className={styles.petBreed}>Siamese</p>
                </div>
                <div className={styles.visitDetails}>
                  <p className={styles.visitTime}>10:45 AM</p>
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
            FurEverPawCare — Veterinary Management System
          </div>
        </div>

        {/* RIGHT COLUMN: SIGNUP FORM */}
        <div className={styles.rightColumn}>
          <div className={styles.formWrapper}>
            
            <div className={styles.logoArea}>
              <i className={`fas fa-paw ${styles.logoIcon}`}></i>
              <span>FurEverPawCare</span>
            </div>

            <div className={styles.signupHeader}>
              <h2>Create your account</h2>
              <p>Join FurEverPawCare and start managing your clinic smarter.</p>
            </div>

            <form onSubmit={handleSignup}>
              
              <div className={styles.nameRow}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>First Name</label>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Juan"
                      required
                      className={styles.inputField}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Last Name</label>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Dela Cruz"
                      required
                      className={styles.inputField}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Phone Number</label>
                <div className={styles.inputGroup}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09XX XXX XXXX"
                    required
                    className={styles.inputField}
                  />
                  <i className={`fas fa-phone ${styles.inputIcon}`}></i>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Password</label>
                <div className={styles.inputGroup}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    className={styles.inputField}
                  />
                  <i className={`fas fa-lock ${styles.inputIcon}`}></i>
                </div>
                {password.length > 0 && (
                  <div className={styles.passwordStrength}>
                    <div className={`${styles.strengthBar} ${strength >= 1 ? styles.active1 : ''}`}></div>
                    <div className={`${styles.strengthBar} ${strength >= 2 ? styles.active2 : ''}`}></div>
                    <div className={`${styles.strengthBar} ${strength >= 3 ? styles.active3 : ''}`}></div>
                    <div className={`${styles.strengthBar} ${strength >= 4 ? styles.active4 : ''}`}></div>
                  </div>
                )}
              </div>

              <div className={styles.termsGroup}>
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required 
                />
                <label>
                  I agree to the <a href="#" className={styles.termsLink}>Terms of Service</a> and <a href="#" className={styles.termsLink}>Privacy Policy</a> of FurEverPawCare.
                </label>
              </div>

              <button type="submit" className={styles.primaryBtn}>
                Create Account
              </button>
            </form>

            <div className={styles.divider}>
              or sign up with
            </div>

            <button
              type="button"
              className={styles.ssoBtn}
              onClick={() => alert("SSO signup not implemented yet.")}
            >
              <i className="fas fa-th"></i> Sign up with SSO
            </button>

            <div className={styles.formFooter}>
              Already have an account? <a href="/login">Log in</a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
