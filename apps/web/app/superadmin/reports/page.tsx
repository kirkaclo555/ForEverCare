"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './reports.css';

export default function ReportsPage() {
  const router = useRouter();
  
  const [activeCategory, setActiveCategory] = useState('pet_health');

  // Pet Health Data
  const [petMonitorReports, setPetMonitorReports] = useState([
    { id: 999, pet: 'Bella (Poodle)', owner: 'Sarah Davis', date: 'Just Now', diagnosis: 'Excessive scratching, possible allergies', status: 'Forwarded by Admin', severity: 'Moderate', details: 'Bella is scratching constantly around the ears and neck. No visible fleas. Suspected seasonal allergies or dermatitis. Recommend a soothing bath and a vet consultation for antihistamines.' },
    { id: 1, pet: 'Buddy (Golden Retriever)', owner: 'John Doe', date: 'Today, 10:30 AM', diagnosis: 'Slight fever detected, recommended checkup', status: 'Forwarded by Admin', severity: 'Moderate', details: 'Buddy has been experiencing a mild fever for the last 24 hours. The owner reported lethargy and loss of appetite. Immediate vet checkup is highly recommended to rule out infections.' },
    { id: 2, pet: 'Luna (Siamese Cat)', owner: 'Jane Smith', date: 'Yesterday', diagnosis: 'Normal activity, good health', status: 'Submitted by User', severity: 'Mild', details: 'Luna appears perfectly healthy. Regular bi-weekly update from the owner shows high activity levels, normal feeding habits, and no signs of distress.' },
    { id: 3, pet: 'Max (Beagle)', owner: 'Mike Johnson', date: 'Mon, 02:15 PM', diagnosis: 'Lethargy reported, schedule vet visit', status: 'Forwarded by Admin', severity: 'Severe', details: 'Max has not moved much from his bed in 2 days. The owner noted pale gums and whimpering when touched. This was flagged as high severity and requires immediate attention.' },
    { id: 4, pet: 'Bella (Poodle)', owner: 'Sarah Davis', date: 'Sun, 09:00 AM', diagnosis: 'Excessive scratching, possible allergies', status: 'Submitted by User', severity: 'Moderate', details: 'Bella is scratching constantly around the ears and neck. No visible fleas. Suspected seasonal allergies or dermatitis. Recommend a soothing bath and a vet consultation for antihistamines.' },
    { id: 5, pet: 'Rocky (German Shepherd)', owner: 'David Wilson', date: 'Sat, 11:45 AM', diagnosis: 'Post-surgery recovery going well', status: 'Submitted by User', severity: 'Mild', details: 'Rocky is recovering beautifully from his knee surgery. Incision looks clean, no redness. He is bearing light weight on the leg as instructed.' },
    { id: 6, pet: 'Chloe (Persian Cat)', owner: 'Emily Brown', date: 'Sat, 08:30 AM', diagnosis: 'Vomiting, requires monitoring', status: 'Forwarded by Admin', severity: 'Severe', details: 'Chloe has vomited 4 times since yesterday evening. Owner was advised to withhold food and monitor for next 12 hours. If vomiting persists, immediate IV fluids may be necessary.' },
    { id: 7, pet: 'Zeus (Husky)', owner: 'Chris Taylor', date: 'Fri, 04:20 PM', diagnosis: 'Limping on right front leg', status: 'Submitted by User', severity: 'Moderate', details: 'Zeus started limping after a run at the park. No swelling visible, but he avoids putting weight on it. Needs a physical examination to check for sprains or fractures.' },
    { id: 8, pet: 'Milo (Maine Coon)', owner: 'Ashley White', date: 'Thu, 01:10 PM', diagnosis: 'Routine wellness update', status: 'Submitted by User', severity: 'Mild', details: 'Milo is maintaining a steady weight of 18 lbs. Coat is shiny, eyes are clear. Next vaccination is due in 3 months.' },
  ]);

  // Pagination & Modal State for Reports
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 6;
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Derived Pagination
  const totalPages = Math.ceil(petMonitorReports.length / reportsPerPage);
  const currentReports = petMonitorReports.slice((currentPage - 1) * reportsPerPage, currentPage * reportsPerPage);

  // Mock Data for other tables
  const patientLogs = [
    { id: 1, date: 'Oct 24, 2024', name: 'Charlie', breed: 'Bulldog', age: '3 yrs', reason: 'Vaccination' },
    { id: 2, date: 'Oct 23, 2024', name: 'Daisy', breed: 'Persian Cat', age: '1 yr', reason: 'General Checkup' },
    { id: 3, date: 'Oct 21, 2024', name: 'Cooper', breed: 'Labrador', age: '5 yrs', reason: 'Dental Cleaning' },
    { id: 4, date: 'Oct 20, 2024', name: 'Milo', breed: 'Mixed Feline', age: '2 yrs', reason: 'Skin Rash' },
  ];

  const appointmentLogs = [
    { id: 1, date: 'Oct 25, 2024', time: '10:00 AM', patient: 'Buddy', doctor: 'Dr. Smith', status: 'Completed' },
    { id: 2, date: 'Oct 25, 2024', time: '11:30 AM', patient: 'Luna', doctor: 'Dr. Jones', status: 'Canceled' },
    { id: 3, date: 'Oct 26, 2024', time: '09:00 AM', patient: 'Max', doctor: 'Dr. Smith', status: 'Pending' },
    { id: 4, date: 'Oct 27, 2024', time: '02:00 PM', patient: 'Bella', doctor: 'Dr. Adams', status: 'Approved' },
  ];

  const telemedicineLogs = [
    { id: 1, date: 'May 04, 2026', duration: '15 mins', patient: 'Charlie', status: 'Successful' },
    { id: 2, date: 'May 03, 2026', duration: '5 mins', patient: 'Daisy', status: 'Pending' },
    { id: 3, date: 'May 02, 2026', duration: '20 mins', patient: 'Cooper', status: 'Successful' },
    { id: 4, date: 'May 01, 2026', duration: '12 mins', patient: 'Milo', status: 'Successful' },
  ];

  const inventoryLogs = [
    { id: 1, date: 'Oct 24, 2024', item: 'Rabies Vaccine', change: '+50', reason: 'Restock' },
    { id: 2, date: 'Oct 24, 2024', item: 'Flea Treatment', change: '-5', reason: 'Dispensed' },
    { id: 3, date: 'Oct 23, 2024', item: 'Bandages', change: '-12', reason: 'Clinic Use' },
    { id: 4, date: 'Oct 22, 2024', item: 'Heartworm Meds', change: '+100', reason: 'Restock' },
  ];

  const printReport = () => {
    window.print();
  };

  return (
    <>
    <style dangerouslySetInnerHTML={{__html: `
      @media print {
        body * {
          visibility: hidden;
        }
        .report-view-container, .report-view-container * {
          visibility: visible;
        }
        .report-view-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .date-range { display: none !important; }
        .modal-overlay, .modal-overlay * {
          visibility: visible !important;
        }
        .modal-overlay {
          position: absolute;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          background: white !important;
          z-index: 9999;
        }
        .modal-content {
          box-shadow: none !important;
          border: none !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
        }
        .modal-close, .modal-actions {
          display: none !important;
        }
      }
      .report-card {
        background: white;
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        border: 1px solid #edf2f7;
        margin-bottom: 30px;
      }
      .clickable-report-card {
        transition: all 0.2s ease-in-out;
        cursor: pointer;
      }
      .clickable-report-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.06);
        border-color: #cbd5e0 !important;
      }
    `}} />
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} >
        
        <div className="date-range" style={{ marginBottom: '30px' }}>
            <h3><i className="fas fa-chart-pie"></i> Report Categories</h3>
            <div className="range-selector" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className={`range-btn ${activeCategory === 'pet_health' ? 'active' : ''}`} onClick={() => setActiveCategory('pet_health')}>Pet Health</button>
                <button className={`range-btn ${activeCategory === 'patients' ? 'active' : ''}`} onClick={() => setActiveCategory('patients')}>Pet Reports</button>
                <button className={`range-btn ${activeCategory === 'appointments' ? 'active' : ''}`} onClick={() => setActiveCategory('appointments')}>Appointments</button>
                <button className={`range-btn ${activeCategory === 'telemedicine' ? 'active' : ''}`} onClick={() => setActiveCategory('telemedicine')}>Telemedicine</button>
                <button className={`range-btn ${activeCategory === 'inventory' ? 'active' : ''}`} onClick={() => setActiveCategory('inventory')}>Inventory</button>
            </div>
            <button className="export-btn" onClick={printReport}><i className="fas fa-print"></i> Print Report</button>
        </div>

        <div className="report-view-container" style={{ width: '100%', maxWidth: '100%' }}>
            
            {activeCategory === 'pet_health' && (
                <div className="report-card pet-monitor-card" style={{ width: '100%' }}>
                    <div className="pet-monitor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-heartbeat" style={{ color: '#2E5E3E' }}></i> Pet Health Monitor Reports</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span className="pending-badge" style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>{petMonitorReports.length} Total Reports</span>
                            <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                <i className="fas fa-history"></i> View History
                            </button>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '1.1rem' }}>Detailed Monitor Logs</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {currentReports.map(report => (
                            <div 
                                key={report.id} 
                                className="clickable-report-card"
                                onClick={() => setSelectedReport(report)}
                                style={{ 
                                    padding: '25px', 
                                    background: '#f7fafc', 
                                    borderRadius: '16px', 
                                    border: '1px solid #edf2f7',
                                    borderLeft: `5px solid ${report.severity === 'Severe' ? '#fc8181' : report.severity === 'Moderate' ? '#f6ad55' : '#48bb78'}`, 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: '15px' 
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <strong style={{ color: '#2d3748', fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>{report.pet}</strong>
                                            <span style={{ color: '#718096', fontSize: '0.9rem' }}><i className="fas fa-user" style={{ marginRight: '5px' }}></i> {report.owner}</span>
                                        </div>
                                        <span style={{ color: '#a0aec0', fontSize: '0.85rem', fontWeight: 500 }}><i className="far fa-clock"></i> {report.date}</span>
                                    </div>
                                    <p style={{ margin: '10px 0 0 0', color: '#4a5568', fontSize: '1rem', lineHeight: '1.5' }}>{report.diagnosis}</p>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #edf2f7' }}>
                                    <span style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px', 
                                        color: report.status === 'Forwarded by Admin' ? '#805ad5' : '#3182ce', 
                                        fontWeight: 600, 
                                        fontSize: '0.85rem', 
                                        background: report.status === 'Forwarded by Admin' ? '#faf5ff' : '#ebf8ff', 
                                        padding: '6px 12px', 
                                        borderRadius: '20px',
                                        border: `1px solid ${report.status === 'Forwarded by Admin' ? '#e9d8fd' : '#bee3f8'}`
                                    }}>
                                        <i className={`fas ${report.status === 'Forwarded by Admin' ? 'fa-user-shield' : 'fa-user'}`}></i> 
                                        {report.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '8px 16px', background: currentPage === 1 ? '#edf2f7' : 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#a0aec0' : '#4a5568', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
                            >
                                <i className="fas fa-chevron-left"></i> Prev
                            </button>
                            <span style={{ fontWeight: 600, color: '#4a5568' }}>Page {currentPage} of {totalPages}</span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{ padding: '8px 16px', background: currentPage === totalPages ? '#edf2f7' : 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#a0aec0' : '#4a5568', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
                            >
                                Next <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeCategory === 'patients' && (
                <div className="report-card" style={{ width: '100%' }}>
                    <div className="report-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-paw" style={{ color: '#2E5E3E' }}></i> Pet Reports</h2>
                        <span style={{ color: '#718096', fontWeight: 500 }}>Overview 2024</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            <div style={{ padding: '20px', background: '#ebf8ff', borderRadius: '16px', border: '1px solid #bee3f8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div style={{ color: '#2b6cb0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>TOTAL PETS</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3182ce' }}>312</div>
                                <div style={{ color: '#4299e1', fontSize: '0.8rem', marginTop: '5px', fontWeight: 500 }}>↑ 12% from last month</div>
                            </div>
                            <div style={{ padding: '20px', background: '#f0fff4', borderRadius: '16px', border: '1px solid #c6f6d5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div style={{ color: '#276749', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>ACTIVE / INACTIVE</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#38a169' }}>267 <span style={{ fontSize: '1.2rem', color: '#e53e3e' }}>/ 45</span></div>
                            </div>
                        </div>
                        <div style={{ flex: '1', minWidth: '300px', background: '#f7fafc', padding: '20px', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '15px', color: '#2d3748', fontSize: '1rem' }}>Pet Registrations (Last 5 Months)</h3>
                            <div style={{ display: 'flex', height: '120px', gap: '15px', paddingTop: '10px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div style={{ width: '100%', background: '#48bb78', height: '30%', borderRadius: '4px 4px 0 0' }}></div></div>
                                    <span style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', marginTop: '8px' }}>Jun</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div style={{ width: '100%', background: '#48bb78', height: '50%', borderRadius: '4px 4px 0 0' }}></div></div>
                                    <span style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', marginTop: '8px' }}>Jul</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div style={{ width: '100%', background: '#48bb78', height: '40%', borderRadius: '4px 4px 0 0' }}></div></div>
                                    <span style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', marginTop: '8px' }}>Aug</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div style={{ width: '100%', background: '#48bb78', height: '80%', borderRadius: '4px 4px 0 0' }}></div></div>
                                    <span style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', marginTop: '8px' }}>Sep</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div style={{ width: '100%', background: '#48bb78', height: '100%', borderRadius: '4px 4px 0 0' }}></div></div>
                                    <span style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', marginTop: '8px' }}>Oct</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '15px', color: '#2d3748', fontSize: '1.1rem' }}>Recent Pet Log</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #edf2f7' }}>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Date</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Pet Name</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Breed</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Age</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Reason for Visit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientLogs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={{ padding: '15px', color: '#718096', fontSize: '0.95rem' }}>{log.date}</td>
                                        <td style={{ padding: '15px', color: '#2d3748', fontWeight: 600 }}>{log.name}</td>
                                        <td style={{ padding: '15px', color: '#4a5568', fontSize: '0.95rem' }}>{log.breed}</td>
                                        <td style={{ padding: '15px', color: '#718096', fontSize: '0.95rem' }}>{log.age}</td>
                                        <td style={{ padding: '15px', color: '#4a5568', fontSize: '0.95rem' }}>{log.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeCategory === 'appointments' && (
                <div className="report-card" style={{ width: '100%' }}>
                    <div className="report-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-calendar-check" style={{ color: '#2E5E3E' }}></i> Appointment Reports</h2>
                        <span style={{ color: '#718096', fontWeight: 500 }}>128 Total This Month</span>
                    </div>

                    <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div className="status-grid" style={{ flex: '1', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            <div style={{ padding: '20px', background: '#fffaf0', borderRadius: '16px', border: '1px solid #feebc8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div style={{ color: '#c05621', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase' }}>Pending</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#dd6b20' }}>182</div>
                            </div>
                            <div style={{ padding: '20px', background: '#f0fff4', borderRadius: '16px', border: '1px solid #c6f6d5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div style={{ color: '#276749', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase' }}>Completed</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#38a169' }}>18</div>
                            </div>
                        </div>

                        <div style={{ flex: '1', minWidth: '300px', background: '#f7fafc', padding: '20px', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '25px', color: '#2d3748', fontSize: '1rem' }}>Appointments Breakdown</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#718096', marginBottom: '5px' }}><span>Completed</span><span>60%</span></div>
                                    <div style={{ width: '100%', height: '8px', background: '#edf2f7', borderRadius: '4px' }}><div style={{ width: '60%', height: '100%', background: '#48bb78', borderRadius: '4px' }}></div></div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#718096', marginBottom: '5px' }}><span>Pending</span><span>30%</span></div>
                                    <div style={{ width: '100%', height: '8px', background: '#edf2f7', borderRadius: '4px' }}><div style={{ width: '30%', height: '100%', background: '#f6ad55', borderRadius: '4px' }}></div></div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#718096', marginBottom: '5px' }}><span>Canceled</span><span>10%</span></div>
                                    <div style={{ width: '100%', height: '8px', background: '#edf2f7', borderRadius: '4px' }}><div style={{ width: '10%', height: '100%', background: '#fc8181', borderRadius: '4px' }}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '15px', color: '#2d3748', fontSize: '1.1rem' }}>Appointment Log</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #edf2f7' }}>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Date</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Time</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Patient</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Doctor</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointmentLogs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={{ padding: '15px', color: '#718096', fontSize: '0.95rem' }}>{log.date}</td>
                                        <td style={{ padding: '15px', color: '#718096', fontSize: '0.95rem' }}>{log.time}</td>
                                        <td style={{ padding: '15px', color: '#2d3748', fontWeight: 600 }}>{log.patient}</td>
                                        <td style={{ padding: '15px', color: '#4a5568', fontSize: '0.95rem' }}>{log.doctor}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, background: log.status === 'Completed' ? '#c6f6d5' : log.status === 'Canceled' ? '#fed7d7' : log.status === 'Pending' ? '#feebc8' : '#bee3f8', color: log.status === 'Completed' ? '#22543d' : log.status === 'Canceled' ? '#822727' : log.status === 'Pending' ? '#7b341e' : '#2a4365' }}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeCategory === 'telemedicine' && (
                <div className="report-card" style={{ width: '100%' }}>
                    <div className="report-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-video" style={{ color: '#2E5E3E' }}></i> Telemedicine Reports</h2>
                        <span style={{ color: '#718096', fontWeight: 500 }}>61 Total Consultations</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', background: '#f7fafc', borderRadius: '16px', padding: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <span style={{ fontWeight: 600, color: '#2d3748', fontSize: '1.2rem' }}>Success Rate</span>
                                <span style={{ fontWeight: 700, color: '#48bb78', fontSize: '1.4rem' }}>80%</span>
                            </div>
                            <div style={{ width: '100%', height: '16px', background: '#edf2f7', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                                <div style={{ width: '80%', height: '100%', background: 'linear-gradient(90deg, #48bb78, #38a169)', borderRadius: '10px' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#718096', fontSize: '1rem', fontWeight: 500 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-check-circle" style={{ color: '#48bb78' }}></i> 49 Successful</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-clock" style={{ color: '#f6ad55' }}></i> 12 Pending</span>
                            </div>
                        </div>

                        <div style={{ flex: '1', minWidth: '300px', background: '#f7fafc', padding: '20px', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '15px', color: '#2d3748', fontSize: '1rem' }}>Consultations (This Month)</h3>
                            <div style={{ display: 'flex', height: '120px', gap: '15px', paddingTop: '10px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div style={{ width: '100%', background: '#3182ce', height: '20%', borderRadius: '4px 4px 0 0' }}></div></div>
                                    <span style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', marginTop: '8px' }}>Week 1</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div style={{ width: '100%', background: '#3182ce', height: '45%', borderRadius: '4px 4px 0 0' }}></div></div>
                                    <span style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', marginTop: '8px' }}>Week 2</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div style={{ width: '100%', background: '#3182ce', height: '60%', borderRadius: '4px 4px 0 0' }}></div></div>
                                    <span style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', marginTop: '8px' }}>Week 3</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div style={{ width: '100%', background: '#3182ce', height: '85%', borderRadius: '4px 4px 0 0' }}></div></div>
                                    <span style={{ fontSize: '0.75rem', color: '#718096', textAlign: 'center', marginTop: '8px' }}>Week 4</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '15px', color: '#2d3748', fontSize: '1.1rem' }}>Telemedicine Consultation Log</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #edf2f7' }}>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Date</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Duration</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Patient Name</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Connection Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {telemedicineLogs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={{ padding: '15px', color: '#718096', fontSize: '0.95rem' }}>{log.date}</td>
                                        <td style={{ padding: '15px', color: '#4a5568', fontSize: '0.95rem' }}><i className="far fa-clock" style={{ marginRight: '5px', color: '#a0aec0' }}></i>{log.duration}</td>
                                        <td style={{ padding: '15px', color: '#2d3748', fontWeight: 600 }}>{log.patient}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{ color: log.status === 'Successful' ? '#48bb78' : '#dd6b20', fontWeight: 500, fontSize: '0.9rem' }}>
                                                {log.status === 'Successful' ? <i className="fas fa-check" style={{ marginRight: '5px' }}></i> : <i className="fas fa-clock" style={{ marginRight: '5px' }}></i>}
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeCategory === 'inventory' && (
                <div className="report-card" style={{ width: '100%' }}>
                    <div className="report-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-box" style={{ color: '#2E5E3E' }}></i> Inventory Reports</h2>
                        <span style={{ color: '#718096', fontWeight: 500 }}>Current Stock Status</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            <div style={{ padding: '20px', background: '#fff5f5', borderRadius: '16px', border: '1px solid #fed7d7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#c53030', fontSize: '0.85rem', textTransform: 'uppercase' }}>Out of Stock</h4>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e53e3e' }}>8</div>
                            </div>
                            <div style={{ padding: '20px', background: '#f0fff4', borderRadius: '16px', border: '1px solid #c6f6d5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#276749', fontSize: '0.85rem', textTransform: 'uppercase' }}>Well Stocked</h4>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#38a169' }}>1,241</div>
                            </div>
                        </div>

                        <div style={{ flex: '1', minWidth: '300px', background: '#f7fafc', padding: '20px', borderRadius: '16px' }}>
                            <h3 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '1rem' }}>Top 3 Most Dispensed Items</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4a5568', marginBottom: '5px', fontWeight: 500 }}><span>Rabies Vaccine</span><span>120 Units</span></div>
                                    <div style={{ width: '100%', height: '10px', background: '#edf2f7', borderRadius: '5px' }}><div style={{ width: '90%', height: '100%', background: '#4299e1', borderRadius: '5px' }}></div></div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4a5568', marginBottom: '5px', fontWeight: 500 }}><span>Flea Treatment</span><span>85 Units</span></div>
                                    <div style={{ width: '100%', height: '10px', background: '#edf2f7', borderRadius: '5px' }}><div style={{ width: '65%', height: '100%', background: '#4299e1', borderRadius: '5px' }}></div></div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4a5568', marginBottom: '5px', fontWeight: 500 }}><span>Heartworm Meds</span><span>60 Units</span></div>
                                    <div style={{ width: '100%', height: '10px', background: '#edf2f7', borderRadius: '5px' }}><div style={{ width: '45%', height: '100%', background: '#4299e1', borderRadius: '5px' }}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '15px', color: '#2d3748', fontSize: '1.1rem' }}>Recent Inventory Movement Log</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #edf2f7' }}>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Date</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Item Name</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Quantity Change</th>
                                    <th style={{ padding: '12px 15px', textAlign: 'left', color: '#a0aec0', fontSize: '0.9rem' }}>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryLogs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={{ padding: '15px', color: '#718096', fontSize: '0.95rem' }}>{log.date}</td>
                                        <td style={{ padding: '15px', color: '#2d3748', fontWeight: 600 }}>{log.item}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{ color: log.change.startsWith('+') ? '#48bb78' : '#fc8181', fontWeight: 600, padding: '4px 8px', background: log.change.startsWith('+') ? '#c6f6d5' : '#fed7d7', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                {log.change}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', color: '#4a5568', fontSize: '0.95rem' }}>{log.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    </div>
    
    {/* View Details Modal (Formal Report Design) */}
    {selectedReport && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedReport(null); }}>
            <div className="modal-content" style={{ background: '#f7fafc', borderRadius: '8px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
                
                {/* Formal Document Area (This is what gets printed) */}
                <div className="report-view-container" style={{ padding: '10%', background: 'white', color: '#1a202c', fontFamily: '"Times New Roman", Times, serif', margin: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.05)', borderRadius: '2px', boxSizing: 'border-box' }}>
                    
                    {/* Header */}
                    <div style={{ borderBottom: '2px solid #2d3748', paddingBottom: '25px', marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '60px', height: '60px', background: '#2E5E3E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className="fas fa-paw" style={{ color: 'white', fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h1 style={{ margin: '0 0 5px 0', fontSize: 'max(1.8rem, 2.2vw)', color: '#1a202c', fontFamily: '"Times New Roman", Times, serif', textTransform: 'uppercase', letterSpacing: '1px' }}>FurEver Paw Care</h1>
                                <p style={{ margin: 0, fontSize: 'max(0.85rem, 0.95vw)', color: '#4a5568', lineHeight: '1.4' }}>Veterinary Clinic & Pet Hospital<br/>123 Healing Paws Lane, Pet City, PC 12345<br/>Phone: (555) 019-2837 | Email: clinic@fureverpaw.com</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: 'max(1.4rem, 1.6vw)', color: '#1a202c', textTransform: 'uppercase', letterSpacing: '1px' }}>Medical Report</h2>
                            <p style={{ margin: 0, fontSize: '1rem' }}><strong>Report ID:</strong> #{selectedReport.id.toString().padStart(4, '0')}</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '1rem' }}><strong>Date Issued:</strong> {selectedReport.date}</p>
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div style={{ marginBottom: '35px', width: '100%' }}>
                        <h3 style={{ borderBottom: '1px solid #cbd5e0', paddingBottom: '8px', marginBottom: '15px', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2d3748' }}>Patient Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '1.05rem', wordBreak: 'break-word' }}>
                            <div><strong style={{ color: '#4a5568' }}>Patient Name:</strong> {selectedReport.pet}</div>
                            <div><strong style={{ color: '#4a5568' }}>Condition Severity:</strong> <span style={{ color: selectedReport.severity === 'Severe' ? '#c53030' : selectedReport.severity === 'Moderate' ? '#c05621' : '#2f855a', fontWeight: 'bold' }}>{selectedReport.severity}</span></div>
                            <div><strong style={{ color: '#4a5568' }}>Owner Name:</strong> {selectedReport.owner}</div>
                            <div><strong style={{ color: '#4a5568' }}>Submission Status:</strong> {selectedReport.status}</div>
                        </div>
                    </div>

                    {/* Clinical Findings */}
                    <div style={{ marginBottom: '35px', width: '100%' }}>
                        <h3 style={{ borderBottom: '1px solid #cbd5e0', paddingBottom: '8px', marginBottom: '15px', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2d3748' }}>Clinical Findings & Diagnosis</h3>
                        <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.6', fontWeight: 'bold', color: '#1a202c', wordBreak: 'break-word' }}>{selectedReport.diagnosis}</p>
                    </div>

                    {/* Detailed Notes */}
                    <div style={{ marginBottom: '50px', width: '100%' }}>
                        <h3 style={{ borderBottom: '1px solid #cbd5e0', paddingBottom: '8px', marginBottom: '15px', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2d3748' }}>Detailed Observation Notes</h3>
                        <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#2d3748', textAlign: 'justify', wordBreak: 'break-word' }}>{selectedReport.details}</p>
                    </div>

                    {/* Footer / Signature */}
                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ fontSize: '0.9rem', color: '#718096', fontStyle: 'italic', flex: '1 1 300px' }}>
                            <p style={{ margin: 0 }}>This is a verified system-generated medical report.</p>
                            <p style={{ margin: '5px 0 0 0' }}>Confidentiality Notice: This document contains privileged medical information.</p>
                        </div>
                        <div style={{ textAlign: 'center', width: '250px' }}>
                            <div style={{ borderBottom: '1px solid #1a202c', height: '50px', marginBottom: '8px' }}></div>
                            <span style={{ fontSize: '1rem', color: '#1a202c', fontWeight: 'bold' }}>Authorized Clinic Signature</span>
                        </div>
                    </div>
                </div>

                {/* Action Bar (Not printed) */}
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '15px 25px', background: '#edf2f7', borderTop: '1px solid #e2e8f0', position: 'sticky', bottom: 0, zIndex: 10, borderRadius: '0 0 8px 8px' }}>
                    <button onClick={printReport} style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <i className="fas fa-print"></i> Print Report
                    </button>
                    <button onClick={() => setSelectedReport(null)} style={{ padding: '8px 20px', background: '#2d3748', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: 'white', transition: 'background 0.2s' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )}

    <div id="toast"></div>

    </>
  );
}
