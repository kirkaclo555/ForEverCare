"use client";

import React, { useState } from 'react';
import './appointment.css';

export default function AppointmentPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
          <div className="stat-info">
            <h3>Total Appointments</h3>
            <p>124</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p>12</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info">
            <h3>Completed</h3>
            <p>98</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-times-circle"></i></div>
          <div className="stat-info">
            <h3>Cancelled</h3>
            <p>14</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Filter:</span>
          <select className="filter-select">
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
          </select>
        </div>
        <button className="add-appointment-btn" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i> New Appointment
        </button>
      </div>

      {/* Appointment Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Pet Name</th>
              <th>Service Required</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>J</div>
                  Jane Doe
                </div>
              </td>
              <td>Max (Golden Retriever)</td>
              <td>Annual Checkup</td>
              <td>Mar 15, 2024</td>
              <td>09:00 AM</td>
              <td>In-Person</td>
              <td><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', background: '#e6fffa', color: '#319795' }}>Confirmed</span></td>
              <td>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#718096', cursor: 'pointer' }}><i className="fas fa-eye"></i></button>
                  <button style={{ background: 'none', border: 'none', color: '#718096', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>New Appointment</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form>
                {/* Form fields mocked for now */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Client Name</label>
                  <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Search existing client..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2E5E3E', color: 'white', cursor: 'pointer' }}>Save Appointment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
