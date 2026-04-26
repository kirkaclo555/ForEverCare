"use client";

import React, { useState } from 'react';
import './reports.css';

export default function ReportsPage() {
  const [activeRange, setActiveRange] = useState('This Month');

  return (
    <>
      <div className="date-range">
        <h3><i className="fas fa-calendar-alt"></i> Date Range</h3>
        <div className="range-selector">
          <button 
            className={`range-btn ${activeRange === 'Today' ? 'active' : ''}`}
            onClick={() => setActiveRange('Today')}
          >
            Today
          </button>
          <button 
            className={`range-btn ${activeRange === 'This Week' ? 'active' : ''}`}
            onClick={() => setActiveRange('This Week')}
          >
            This Week
          </button>
          <button 
            className={`range-btn ${activeRange === 'This Month' ? 'active' : ''}`}
            onClick={() => setActiveRange('This Month')}
          >
            This Month
          </button>
          <button 
            className={`range-btn ${activeRange === 'This Year' ? 'active' : ''}`}
            onClick={() => setActiveRange('This Year')}
          >
            This Year
          </button>
        </div>
        <button className="export-btn">
          <i className="fas fa-download"></i> Export Report
        </button>
      </div>

      <div className="reports-grid">
        {/* Financial Summary */}
        <div className="report-card">
          <div className="report-header">
            <h2><i className="fas fa-chart-line"></i> Financial Summary</h2>
            <span>vs Last Period</span>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">$45,280</div>
              <div className="stat-subtitle" style={{ color: '#38a169' }}>
                <i className="fas fa-arrow-up"></i> 12.5%
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Expenses</div>
              <div className="stat-value">$18,450</div>
              <div className="stat-subtitle" style={{ color: '#e53e3e' }}>
                <i className="fas fa-arrow-up"></i> 4.2%
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Net Profit</div>
              <div className="stat-value">$26,830</div>
              <div className="stat-subtitle" style={{ color: '#38a169' }}>
                <i className="fas fa-arrow-up"></i> 15.8%
              </div>
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <span className="progress-title">Revenue Target</span>
              <span className="percentage-text">85%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '85%' }}></div>
            </div>
            <div className="progress-stats">
              <span>$42,500 Achieved</span>
              <span>Goal: $50,000</span>
            </div>
          </div>
        </div>

        {/* Patient Metrics */}
        <div className="report-card">
          <div className="report-header">
            <h2><i className="fas fa-users"></i> Patient Metrics</h2>
            <span>vs Last Period</span>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-label">New Patients</div>
              <div className="stat-value">124</div>
              <div className="stat-subtitle" style={{ color: '#38a169' }}>
                <i className="fas fa-arrow-up"></i> 8.5%
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Visits</div>
              <div className="stat-value">486</div>
              <div className="stat-subtitle" style={{ color: '#38a169' }}>
                <i className="fas fa-arrow-up"></i> 14.2%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <div style={{ flex: 1, background: '#f7fafc', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
              <i className="fas fa-dog" style={{ fontSize: '1.5rem', color: '#805ad5', marginBottom: '10px' }}></i>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2d3748' }}>65%</div>
              <div style={{ fontSize: '0.85rem', color: '#718096' }}>Dogs</div>
            </div>
            <div style={{ flex: 1, background: '#f7fafc', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
              <i className="fas fa-cat" style={{ fontSize: '1.5rem', color: '#dd6b20', marginBottom: '10px' }}></i>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2d3748' }}>28%</div>
              <div style={{ fontSize: '0.85rem', color: '#718096' }}>Cats</div>
            </div>
            <div style={{ flex: 1, background: '#f7fafc', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
              <i className="fas fa-paw" style={{ fontSize: '1.5rem', color: '#48bb78', marginBottom: '10px' }}></i>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2d3748' }}>7%</div>
              <div style={{ fontSize: '0.85rem', color: '#718096' }}>Other</div>
            </div>
          </div>
        </div>

        {/* Medical Statistics */}
        <div className="report-card">
          <div className="report-header">
            <h2><i className="fas fa-stethoscope"></i> Top Diagnoses</h2>
          </div>

          <div className="diagnosis-list">
            <div className="diagnosis-item">
              <span className="diagnosis-name">Dental Calculus</span>
              <span className="diagnosis-count">45 cases</span>
            </div>
            <div className="diagnosis-item">
              <span className="diagnosis-name">Otitis Externa (Ear Infection)</span>
              <span className="diagnosis-count">38 cases</span>
            </div>
            <div className="diagnosis-item">
              <span className="diagnosis-name">Fleas/Ticks/Parasites</span>
              <span className="diagnosis-count">32 cases</span>
            </div>
            <div className="diagnosis-item">
              <span className="diagnosis-name">Gastroenteritis</span>
              <span className="diagnosis-count">28 cases</span>
            </div>
            <div className="diagnosis-item">
              <span className="diagnosis-name">Osteoarthritis</span>
              <span className="diagnosis-count">24 cases</span>
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="report-card">
          <div className="report-header">
            <h2><i className="fas fa-user-md"></i> Staff Performance</h2>
          </div>

          <div className="vet-list">
            <div className="vet-item">
              <div className="vet-info">
                <div className="vet-avatar">SJ</div>
                <span className="vet-name">Dr. Sarah Johnson</span>
              </div>
              <span className="vet-count">145 appointments</span>
            </div>
            
            <div className="vet-item">
              <div className="vet-info">
                <div className="vet-avatar" style={{ background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)' }}>MC</div>
                <span className="vet-name">Dr. Michael Chen</span>
              </div>
              <span className="vet-count">132 appointments</span>
            </div>

            <div className="vet-item">
              <div className="vet-info">
                <div className="vet-avatar" style={{ background: 'linear-gradient(135deg, #dd6b20 0%, #c05621 100%)' }}>EW</div>
                <span className="vet-name">Dr. Emily Williams</span>
              </div>
              <span className="vet-count">118 appointments</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
