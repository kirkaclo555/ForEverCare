"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './reports.css';

export default function ReportsPage() {
  const router = useRouter();
  
  const [activeCategory, setActiveCategory] = useState('pet_health');

  // Pet Health Data
  const [petMonitorReports, setPetMonitorReports] = useState<any[]>([]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/monitoring?role=ADMIN');
      const data = await res.json();
      if (data.success) {
        const formatted = data.reports.map((r: any) => ({
          id: r.id,
          pet: `${r.pet.petName} (${r.pet.breed})`,
          owner: r.pet.user.fullName,
          date: new Date(r.createdAt).toLocaleString(),
          diagnosis: r.symptoms || 'Report Submitted',
          status: r.isForwarded ? 'Forwarded to Superadmin' : 'Submitted by User',
          severity: r.recommendations?.includes('Immediate') ? 'High' : 'Medium',
          details: r.reportSummary,
          adminFindings: r.adminFindings || '',
          superAdminFindings: r.superAdminFindings || '',
          rawReportId: r.id
        }));
        setPetMonitorReports(formatted);
      }
    } catch (error) {
      console.error('Error fetching reports', error);
    }
  };

  React.useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

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
    { id: 1, date: 'Oct 24, 2024', duration: '15 mins', patient: 'Charlie', status: 'Successful' },
    { id: 2, date: 'Oct 23, 2024', duration: '5 mins', patient: 'Daisy', status: 'Incomplete (Connection)' },
    { id: 3, date: 'Oct 22, 2024', duration: '20 mins', patient: 'Cooper', status: 'Successful' },
    { id: 4, date: 'Oct 20, 2024', duration: '12 mins', patient: 'Milo', status: 'Successful' },
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
                                    borderLeft: `5px solid ${report.severity === 'High' ? '#fc8181' : report.severity === 'Medium' ? '#f6ad55' : '#48bb78'}`, 
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
                                        color: report.status.includes('Forwarded') ? '#805ad5' : '#3182ce', 
                                        fontWeight: 600, 
                                        fontSize: '0.85rem', 
                                        background: report.status.includes('Forwarded') ? '#faf5ff' : '#ebf8ff', 
                                        padding: '6px 12px', 
                                        borderRadius: '20px',
                                        border: `1px solid ${report.status.includes('Forwarded') ? '#e9d8fd' : '#bee3f8'}`
                                    }}>
                                        <i className={`fas ${report.status.includes('Forwarded') ? 'fa-user-shield' : 'fa-user'}`}></i> 
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
                            <div style={{ padding: '20px', background: '#f7fafc', borderRadius: '15px' }}>
                                <div style={{ color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>TOTAL PETS</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2d3748' }}>312</div>
                                <div style={{ color: '#48bb78', fontSize: '0.8rem', marginTop: '5px' }}>↑ 12% from last month</div>
                            </div>
                            <div style={{ padding: '20px', background: '#f7fafc', borderRadius: '15px' }}>
                                <div style={{ color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>ACTIVE / INACTIVE</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#48bb78' }}>267 <span style={{ fontSize: '1rem', color: '#a0aec0' }}>/ 45</span></div>
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
                            <div style={{ padding: '20px', background: '#f7fafc', borderRadius: '16px', textAlign: 'center', borderTop: '4px solid #f6ad55' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f6ad55', marginBottom: '5px' }}>182</div>
                                <div style={{ color: '#718096', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem' }}>Pending</div>
                            </div>
                            <div style={{ padding: '20px', background: '#f7fafc', borderRadius: '16px', textAlign: 'center', borderTop: '4px solid #48bb78' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#48bb78', marginBottom: '5px' }}>18</div>
                                <div style={{ color: '#718096', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem' }}>Completed</div>
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
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fas fa-times-circle" style={{ color: '#fc8181' }}></i> 12 Incomplete</span>
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
                                            <span style={{ color: log.status === 'Successful' ? '#48bb78' : '#fc8181', fontWeight: 500, fontSize: '0.9rem' }}>
                                                {log.status === 'Successful' ? <i className="fas fa-check" style={{ marginRight: '5px' }}></i> : <i className="fas fa-exclamation-triangle" style={{ marginRight: '5px' }}></i>}
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
                            <div style={{ padding: '20px', background: '#fff5f5', borderRadius: '16px', border: '1px solid #fed7d7' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#c53030' }}>Out of Stock</h4>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e53e3e' }}>8</div>
                            </div>
                            <div style={{ padding: '20px', background: '#f0fff4', borderRadius: '16px', border: '1px solid #c6f6d5' }}>
                                <h4 style={{ margin: '0 0 5px 0', color: '#276749' }}>Well Stocked</h4>
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
    
    {/* View Details Modal */}
    {selectedReport && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedReport(null); }}>
            <div className="modal-content" style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '90%', maxWidth: '600px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #edf2f7', paddingBottom: '20px', marginBottom: '25px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fas fa-file-medical-alt" style={{ color: '#2E5E3E' }}></i> Report Details</h2>
                        <span style={{ color: '#718096', fontSize: '0.95rem' }}>Report ID: #{selectedReport.id.toString().padStart(4, '0')}</span>
                    </div>
                    <button className="modal-close" onClick={() => setSelectedReport(null)} style={{ background: '#edf2f7', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#4a5568', cursor: 'pointer', transition: 'background 0.2s' }}><i className="fas fa-times"></i></button>
                </div>
                
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f7fafc', padding: '20px', borderRadius: '16px', border: '1px solid #edf2f7' }}>
                        <div>
                            <span style={{ display: 'block', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase' }}>Patient</span>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>{selectedReport.pet}</strong>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase' }}>Owner</span>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>{selectedReport.owner}</strong>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase' }}>Submission Date</span>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>{selectedReport.date}</strong>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase' }}>Severity</span>
                            <strong style={{ color: selectedReport.severity === 'High' ? '#e53e3e' : selectedReport.severity === 'Medium' ? '#dd6b20' : '#38a169', fontSize: '1.1rem' }}>{selectedReport.severity}</strong>
                        </div>
                    </div>

                    <div>
                        <span style={{ display: 'block', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Diagnosis / Reason</span>
                        <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem', lineHeight: '1.4' }}>{selectedReport.diagnosis}</h3>
                    </div>

                    <div>
                        <span style={{ display: 'block', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Detailed Notes</span>
                        <div style={{ background: '#fff5f5', borderLeft: '4px solid #fc8181', padding: '15px 20px', borderRadius: '0 12px 12px 0', color: '#4a5568', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            {selectedReport.details}
                        </div>
                    </div>

                    {selectedReport.adminFindings && (
                        <div>
                            <span style={{ display: 'block', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Admin Findings</span>
                            <div style={{ background: '#ebf8ff', borderLeft: '4px solid #3182ce', padding: '15px 20px', borderRadius: '0 12px 12px 0', color: '#2b6cb0', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                {selectedReport.adminFindings}
                            </div>
                        </div>
                    )}
                    
                    {selectedReport.superAdminFindings && (
                        <div>
                            <span style={{ display: 'block', color: '#a0aec0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Super Admin Findings</span>
                            <div style={{ background: '#faf5ff', borderLeft: '4px solid #805ad5', padding: '15px 20px', borderRadius: '0 12px 12px 0', color: '#553c9a', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                {selectedReport.superAdminFindings}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', background: selectedReport.status.includes('Forwarded') ? '#faf5ff' : '#ebf8ff', borderRadius: '12px', border: `1px solid ${selectedReport.status.includes('Forwarded') ? '#e9d8fd' : '#bee3f8'}` }}>
                        <span style={{ color: '#4a5568', fontWeight: 600 }}>Report Status:</span>
                        <span style={{ color: selectedReport.status.includes('Forwarded') ? '#805ad5' : '#3182ce', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className={`fas ${selectedReport.status.includes('Forwarded') ? 'fa-user-shield' : 'fa-user'}`}></i> 
                            {selectedReport.status}
                        </span>
                    </div>
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #edf2f7', flexWrap: 'wrap' }}>
                    <button onClick={async () => {
                        const finding = prompt("Enter your findings:");
                        if (finding) {
                            try {
                                await fetch('/api/monitoring/findings', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ reportId: selectedReport.rawReportId, findings: finding, role: 'ADMIN' })
                                });
                                fetchReports();
                                setSelectedReport(null);
                            } catch (e) {}
                        }
                    }} style={{ padding: '12px 24px', background: 'white', border: '1px solid #3182ce', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, color: '#3182ce', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                        <i className="fas fa-comment-medical"></i> Add Findings
                    </button>

                    {!selectedReport.status.includes('Forwarded') && (
                        <button onClick={async () => {
                            if (confirm('Forward this report to Superadmin?')) {
                                try {
                                    await fetch('/api/monitoring/forward', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ reportId: selectedReport.rawReportId })
                                    });
                                    fetchReports();
                                    setSelectedReport(null);
                                } catch (e) {}
                            }
                        }} style={{ padding: '12px 24px', background: 'white', border: '1px solid #805ad5', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, color: '#805ad5', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                            <i className="fas fa-share"></i> Forward
                        </button>
                    )}
                    
                    <button onClick={printReport} style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                        <i className="fas fa-print"></i> Print Document
                    </button>
                    <button onClick={() => setSelectedReport(null)} style={{ padding: '12px 30px', background: '#2E5E3E', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, color: 'white', transition: 'background 0.2s' }}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    )}

    <div id="toast"></div>

    </>
  );
}
