"use client";

import React, { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [appointmentsCount, setAppointmentsCount] = useState(3);
  const [revenue, setRevenue] = useState(2450);

  // Example dynamic calendar generation
  const [days, setDays] = useState<number[]>([]);
  useEffect(() => {
    // Generate simple 30 days for display mock
    const daysArr = [];
    for(let i=1; i<=30; i++) daysArr.push(i);
    setDays(daysArr);
  }, []);

  return (
    <>
      <div className="dashboard-title">
        <h1>Good morning, Admin! 👋</h1>
        <p>Here's what's happening with your clinic today</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <i className="fas fa-calendar-check"></i>
            <h3>Today's Appointments</h3>
          </div>
          <div className="stat-value">{appointmentsCount}</div>
          <div className="stat-trend" style={{ color: '#48bb78' }}>↑ 12% from yesterday</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <i className="fas fa-paw"></i>
            <h3>Total Patients</h3>
          </div>
          <div className="stat-value">124</div>
          <div className="stat-trend" style={{ color: '#48bb78' }}>↑ 5% this month</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <i className="fas fa-clock"></i>
            <h3>Pending Consultations</h3>
          </div>
          <div className="stat-value">3</div>
          <div className="stat-trend" style={{ color: '#fc8181' }}>↓ 3 from yesterday</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <i className="fas fa-dollar-sign"></i>
            <h3>Revenue</h3>
          </div>
          <div className="stat-value">${revenue.toLocaleString()}</div>
          <div className="stat-trend" style={{ color: '#48bb78' }}>↑ 1.5% from average</div>
        </div>
      </div>

      {/* Dashboard Grid with 2 Sections */}
      <div className="dashboard-grid">
        {/* Calendar Activities Section */}
        <div className="calendar-section">
          <div className="section-header">
            <h2>
              <i className="far fa-calendar-alt" style={{ marginRight: '8px' }}></i> 
              <span>Calendar Activities</span>
            </h2>
            <button className="menu-toggle" style={{ background: 'none', border: 'none', color: '#2E5E3E', cursor: 'pointer' }}>
              <span>View All</span>
            </button>
          </div>

          <div className="calendar-header">
            <h3>March 2024</h3>
            <div className="calendar-nav">
              <button><i className="fas fa-chevron-left"></i></button>
              <button><i className="fas fa-chevron-right"></i></button>
            </div>
          </div>

          <div className="weekdays">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="calendar-days">
            {/* Empty days offset */}
            <div className="calendar-day"></div>
            <div className="calendar-day"></div>
            <div className="calendar-day"></div>
            {days.map(d => (
              <div key={d} className={`calendar-day ${d === 12 ? 'active' : ''} ${[13, 14, 25].includes(d) ? 'has-slots' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          <div className="event-list">
            <div className="event-item">
              <div className="event-badge" style={{ background: '#2E5E3E' }}></div>
              <div className="event-time">09:00 AM</div>
              <div className="event-title">Vaccination - Max (Dog)</div>
            </div>
            <div className="event-item">
              <div className="event-badge" style={{ background: '#48bb78' }}></div>
              <div className="event-time">11:30 AM</div>
              <div className="event-title">Checkup - Luna (Cat)</div>
            </div>
            <div className="event-item">
              <div className="event-badge" style={{ background: '#f6ad55' }}></div>
              <div className="event-time">02:00 PM</div>
              <div className="event-title">Surgery - Rocky (Rabbit)</div>
            </div>
          </div>
        </div>

        {/* Today's Schedule Section */}
        <div className="today-schedule">
          <div className="section-header">
            <h2>
              <i className="far fa-clock" style={{ marginRight: '8px' }}></i> 
              <span>Today's Schedule</span>
            </h2>
            <button className="view-all-btn"><span>View All</span></button>
          </div>
          <div className="schedule-list">
            <div className="schedule-item">
              <div className="schedule-time">09:00 AM</div>
              <div className="schedule-info">
                <h4>Max (Jane Doe)</h4>
                <p>🏥 In-Person - Vaccination</p>
              </div>
              <span className="schedule-status status-confirmed">Confirmed</span>
            </div>
            <div className="schedule-item">
              <div className="schedule-time">11:30 AM</div>
              <div className="schedule-info">
                <h4>Luna (John Smith)</h4>
                <p>🏥 In-Person - Checkup</p>
              </div>
              <span className="schedule-status status-confirmed">Confirmed</span>
            </div>
            <div className="schedule-item">
              <div className="schedule-time">02:00 PM</div>
              <div className="schedule-info">
                <h4>Rocky (Mike Davis)</h4>
                <p>📹 Telemedicine - Consultation</p>
              </div>
              <span className="schedule-status status-pending">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
