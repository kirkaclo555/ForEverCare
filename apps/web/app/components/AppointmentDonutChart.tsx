"use client";

import React from 'react';

export type AppointmentItem = {
  id: string;
  date: string;
  time: string;
  pet: string;
  owner: string;
  type: string;
  status: string;
};

interface AppointmentDonutChartProps {
  appointments: AppointmentItem[];
}

export default function AppointmentDonutChart({ appointments }: AppointmentDonutChartProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Filter appointments for current month (excluding cancelled)
  const monthApps = appointments.filter(a => 
    a.date && a.date.startsWith(currentMonthPrefix) && a.status.toLowerCase() !== 'cancelled'
  );

  const totalMonthCount = monthApps.length;

  // Breakdown metrics
  const todayApps = monthApps.filter(a => a.date === todayStr);
  const completedApps = monthApps.filter(a => a.status.toLowerCase() === 'done');
  const upcomingApps = monthApps.filter(a => a.date > todayStr && a.status.toLowerCase() !== 'done');
  
  const todayCount = todayApps.length;
  const completedCount = completedApps.length;
  const upcomingCount = upcomingApps.length;

  const displayTotal = totalMonthCount;

  // Donut SVG parameters
  const size = 160;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Segments calculation
  const segments = [
    { label: "Today's", count: todayCount, color: '#2D5016' },
    { label: 'Upcoming', count: upcomingCount, color: '#7CB342' },
    { label: 'Completed', count: completedCount, color: '#3182CE' },
  ];

  let cumulativeOffset = 0;

  return (
    <div className="appointment-chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title-row">
          <i className="fas fa-chart-pie chart-icon"></i>
          <div>
            <h3>Appointments Summary</h3>
            <p>{monthName}</p>
          </div>
        </div>
        <span className="total-badge">{displayTotal} This Month</span>
      </div>

      <div className="chart-card-body">
        {/* Donut SVG Ring */}
        <div className="donut-wrapper" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#EDF2F7"
              strokeWidth={strokeWidth}
            />

            {displayTotal > 0 && segments.map((seg, idx) => {
              if (seg.count === 0) return null;
              const segLength = (seg.count / displayTotal) * circumference;
              const strokeDasharray = `${segLength} ${circumference - segLength}`;
              const strokeDashoffset = -cumulativeOffset;
              cumulativeOffset += segLength;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="donut-segment"
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease'
                  }}
                />
              );
            })}
          </svg>

          {/* Center Text overlay */}
          <div className="donut-center-text">
            <span className="center-number">{displayTotal}</span>
            <span className="center-label">Booked</span>
          </div>
        </div>

        {/* Legend */}
        <div className="chart-legend-list">
          {segments.map((seg, idx) => {
            const pct = displayTotal > 0 ? Math.round((seg.count / displayTotal) * 100) : 0;
            return (
              <div key={idx} className="legend-item">
                <div className="legend-left">
                  <span className="legend-dot" style={{ backgroundColor: seg.color }}></span>
                  <span className="legend-name">{seg.label}</span>
                </div>
                <div className="legend-right">
                  <span className="legend-count">{seg.count}</span>
                  <span className="legend-pct">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
