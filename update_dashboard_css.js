const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'apps/web/app/admin/dashboard/dashboard.css');

const newStyles = `
/* =========================================
   DASHBOARD REDESIGN OVERRIDES
   ========================================= */
.dashboard-title h1 {
    font-family: 'Lora', serif;
    color: #2E5E3E !important;
    font-size: 2rem;
    font-weight: 700;
}
.dashboard-title p {
    color: #4a5568 !important;
    font-size: 1rem;
}

/* Stat Cards */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 20px;
}

.stat-card {
    background: white !important;
    border: 1px solid #cde0d4 !important;
    border-radius: 14px !important;
    border-top: 3px solid #2E5E3E !important;
    box-shadow: none !important;
    padding: 20px !important;
    position: relative;
    display: flex;
    flex-direction: column;
}

.stat-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
}

.stat-header i {
    background: #eaf4ee !important;
    color: #2E5E3E !important;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem !important;
}

.stat-header h3 {
    color: #4a5568 !important;
    font-size: 0.95rem !important;
    margin: 0;
}

.stat-value {
    font-size: 1.8rem !important;
    color: #1a202c !important;
    margin-bottom: 5px;
}

.stat-trend {
    font-size: 0.85rem !important;
}
.stat-trend.positive { color: #2E5E3E !important; font-weight: 600; }
.stat-trend.negative { color: #e53e3e !important; font-weight: 600; }

/* Dashboard Two-Column Grid */
.dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 340px !important;
    gap: 24px;
}

/* Calendar & Right Column Cards */
.calendar-section, .today-schedule, .time-slots-status-container {
    background: white !important;
    border: 1px solid #cde0d4 !important;
    border-radius: 16px !important;
    box-shadow: none !important;
    padding: 24px !important;
}

.section-header h2 {
    font-family: 'Lora', serif;
    color: #2d3748 !important;
    font-size: 1.3rem;
}

.edit-slots-btn-sm {
    background: white;
    color: #2E5E3E;
    border: 1px solid #2E5E3E;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.edit-slots-btn-sm:hover {
    background: #2E5E3E;
    color: white;
}

/* Calendar Grid */
.calendar-header h3 {
    font-family: 'Lora', serif;
    color: #2E5E3E !important;
}

.weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr) !important;
    text-align: center;
    color: #718096 !important;
    font-weight: 600 !important;
    font-size: 0.8rem;
    margin-bottom: 10px;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr) !important;
    gap: 5px;
}

.calendar-day {
    aspect-ratio: 1;
    border-radius: 50% !important;
    border: none !important;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    color: #4a5568 !important;
    background: transparent !important;
    cursor: pointer;
    position: relative;
}
.calendar-day:hover {
    background: #eaf4ee !important;
    color: #2E5E3E !important;
}
.calendar-day.active {
    background: #2E5E3E !important;
    color: white !important;
    font-weight: 700;
}

/* Event Dots */
.calendar-day.has-slots::after {
    content: '';
    position: absolute;
    bottom: 4px;
    width: 6px;
    height: 6px;
    background: #48bb78;
    border-radius: 50%;
}
.calendar-day.active.has-slots::after {
    background: white;
}

/* Today's Schedule Card */
.view-all-btn {
    color: #2E5E3E !important;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
}

.schedule-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #edf2f7;
}

.schedule-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.schedule-time {
    font-weight: 700 !important;
    color: #1a202c !important;
    background: none !important;
    padding: 0 !important;
    border: none !important;
}

.schedule-desc {
    color: #4a5568;
    font-size: 0.9rem;
}

.badge-confirmed {
    background: #c8e6d4 !important;
    color: #1a3d2a !important;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
}

/* Time Slots */
.time-slot-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
}

.time-slot-btn {
    padding: 8px 12px !important;
    border-radius: 20px !important;
    font-size: 0.85rem !important;
    font-weight: 600 !important;
    text-align: center;
}

.time-slot-btn.enabled {
    background: #2E5E3E !important;
    color: white !important;
    border: none !important;
}

.time-slot-btn.disabled {
    background: #eaf4ee !important;
    color: #718096 !important;
    text-decoration: line-through;
    border: none !important;
}
`;

fs.appendFileSync(cssPath, newStyles);
console.log("Appended dashboard redesign styles to dashboard.css");
