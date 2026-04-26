"use client";

import React, { useState } from 'react';
import './records.css';

export default function PatientRecordsPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)' }}>
            <i className="fas fa-paw"></i>
          </div>
          <div className="stat-info">
            <h3>Total Patients</h3>
            <p>1,248</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' }}>
            <i className="fas fa-heartbeat"></i>
          </div>
          <div className="stat-info">
            <h3>Active Patients</h3>
            <p>945</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)' }}>
            <i className="fas fa-dog"></i>
          </div>
          <div className="stat-info">
            <h3>Dogs</h3>
            <p>682</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dd6b20 0%, #c05621 100%)' }}>
            <i className="fas fa-cat"></i>
          </div>
          <div className="stat-info">
            <h3>Cats</h3>
            <p>426</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <span className="filter-label">Species:</span>
          <select className="filter-select">
            <option value="all">All Species</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="rabbit">Rabbit</option>
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <button className="add-patient-btn" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i> New Patient Record
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Owner Name</th>
              <th>Contact Number</th>
              <th>Pet Name</th>
              <th>Species</th>
              <th>Breed</th>
              <th>Age</th>
              <th>Weight (kg)</th>
              <th>Gender</th>
              <th>Last Visit</th>
              <th>Next Vaccination</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="id-badge">#PT-001</span></td>
              <td>Jane Doe</td>
              <td>(555) 123-4567</td>
              <td><span style={{ fontWeight: 600, color: '#2d3748' }}>Max</span></td>
              <td><span className="species-badge species-dog">Dog</span></td>
              <td>Golden Retriever</td>
              <td>3 yrs</td>
              <td>28.5</td>
              <td><span className="gender-badge male"><i className="fas fa-mars"></i> Male</span></td>
              <td>Mar 15, 2024</td>
              <td><span style={{ color: '#e53e3e', fontWeight: 500 }}>Oct 20, 2024</span></td>
              <td><span className="status-active"><i className="fas fa-circle"></i> Active</span></td>
              <td className="action-buttons">
                <button className="view-btn"><i className="fas fa-eye"></i></button>
                <button className="edit-btn"><i className="fas fa-edit"></i></button>
              </td>
            </tr>
            <tr>
              <td><span className="id-badge">#PT-002</span></td>
              <td>John Smith</td>
              <td>(555) 987-6543</td>
              <td><span style={{ fontWeight: 600, color: '#2d3748' }}>Luna</span></td>
              <td><span className="species-badge species-cat">Cat</span></td>
              <td>Persian</td>
              <td>2.5 yrs</td>
              <td>4.2</td>
              <td><span className="gender-badge female"><i className="fas fa-venus"></i> Female</span></td>
              <td>Feb 28, 2024</td>
              <td>Jan 15, 2025</td>
              <td><span className="status-active"><i className="fas fa-circle"></i> Active</span></td>
              <td className="action-buttons">
                <button className="view-btn"><i className="fas fa-eye"></i></button>
                <button className="edit-btn"><i className="fas fa-edit"></i></button>
              </td>
            </tr>
            <tr>
              <td><span className="id-badge">#PT-003</span></td>
              <td>Emily Brown</td>
              <td>(555) 456-7890</td>
              <td><span style={{ fontWeight: 600, color: '#2d3748' }}>Tweety</span></td>
              <td><span className="species-badge species-bird">Bird</span></td>
              <td>Canary</td>
              <td>1 yr</td>
              <td>0.02</td>
              <td><span className="gender-badge unknown"><i className="fas fa-question"></i> Unknown</span></td>
              <td>Oct 10, 2023</td>
              <td>N/A</td>
              <td><span className="status-inactive"><i className="fas fa-circle"></i> Inactive</span></td>
              <td className="action-buttons">
                <button className="view-btn"><i className="fas fa-eye"></i></button>
                <button className="edit-btn"><i className="fas fa-edit"></i></button>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="pagination">
          <button className="page-btn"><i className="fas fa-chevron-left"></i></button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn"><i className="fas fa-chevron-right"></i></button>
        </div>
      </div>

      {showAddModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>Add New Patient Record</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form>
                {/* Form fields */}
                <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>Owner Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
                    <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Contact Number</label>
                    <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="(555) 000-0000" />
                  </div>
                </div>

                <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>Patient details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Pet Name</label>
                    <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Max" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Species</label>
                    <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Bird</option>
                      <option>Rabbit</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2E5E3E', color: 'white', cursor: 'pointer' }}>Save Record</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
