"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./welcome.module.css";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.splitLayout}>
        
        {/* LEFT COLUMN */}
        <div className={styles.leftColumn}>
          <div className={styles.logoArea}>
            <i className={`fas fa-paw ${styles.logoIcon}`}></i>
            <span>FurEverPawCare</span>
          </div>

          <div className={styles.pillBadge}>
            <div className={styles.pillDot}></div>
            Veterinary Management System
          </div>

          <h1 className={styles.headline}>
            Your Clinic,<br />
            <span className={styles.accentText}>Smarter</span> & More Caring
          </h1>

          <p className={styles.subtitle}>
            Manage appointments, patient records, billing, and your whole team — all from one easy dashboard.
          </p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><i className="far fa-calendar-check"></i></div>
              <span>Appointment scheduling & reminders</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><i className="fas fa-notes-medical"></i></div>
              <span>Patient & pet medical records</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><i className="fas fa-file-invoice-dollar"></i></div>
              <span>Billing, invoices & inventory</span>
            </div>
          </div>

          <div className={styles.actionContainer}>
            <button className={styles.primaryBtn} onClick={() => router.push('/signup')}>
              Get Started
            </button>
            <button className={styles.secondaryBtn} onClick={() => router.push('/login')}>
              Log in to your clinic
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightColumn}>
          
          <div className={`${styles.floatingStat} ${styles.stat1}`}>
            <div className={styles.statIcon}><i className="fas fa-users"></i></div>
            <div className={styles.statContent}>
              <p>Patients today</p>
              <h4>12 Appointments</h4>
            </div>
          </div>

          <div className={`${styles.floatingStat} ${styles.stat2}`}>
            <div className={styles.statIcon} style={{ background: '#ebf8ff', color: '#3182ce' }}><i className="fas fa-wallet"></i></div>
            <div className={styles.statContent}>
              <p>Revenue</p>
              <h4>₱24,500 this week</h4>
            </div>
          </div>

          <div className={`${styles.floatingStat} ${styles.stat3}`}>
            <div className={styles.statIcon} style={{ background: '#fff5f5', color: '#e53e3e' }}><i className="far fa-clock"></i></div>
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
                  <p className={styles.doctorName}>Dr. Smith • Checkup</p>
                </div>
              </div>

              <div className={`${styles.appointmentRow} ${styles.purpleBorder}`}>
                <div className={styles.petAvatar} style={{ background: '#e9d8fd', color: '#6b46c1' }}>🐱</div>
                <div className={styles.petInfo}>
                  <p className={styles.petName}>Luna</p>
                  <p className={styles.petBreed}>Siamese</p>
                </div>
                <div className={styles.visitDetails}>
                  <p className={styles.visitTime}>11:45 AM</p>
                  <p className={styles.doctorName}>Dr. Jones • Vaccine</p>
                </div>
              </div>

              <div className={`${styles.appointmentRow} ${styles.blueBorder}`}>
                <div className={styles.petAvatar} style={{ background: '#bee3f8', color: '#2b6cb0' }}>🐕</div>
                <div className={styles.petInfo}>
                  <p className={styles.petName}>Max</p>
                  <p className={styles.petBreed}>Beagle</p>
                </div>
                <div className={styles.visitDetails}>
                  <p className={styles.visitTime}>02:15 PM</p>
                  <p className={styles.doctorName}>Dr. Smith • Dental</p>
                </div>
              </div>

            </div>

            <div className={styles.dashboardFooter}>
              <span className={styles.morePill}>+ 4 more</span>
              <button className={styles.viewAllBtn}>View all <i className="fas fa-arrow-right" style={{ fontSize: '0.8rem' }}></i></button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
