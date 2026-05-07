const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/web/app/superadmin/dashboard/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Change the CSS import to reuse the newly styled admin dashboard.css
content = content.replace("import './dashboard.css';", "import '../../admin/dashboard/dashboard.css';");

// 2. Update stats grid to include positive/negative trend classes
const oldStatsGridRegex = /<div className="stats-grid">[\s\S]*?<\/div>\s*<\/div>\s*<div className="dashboard-grid">/;
const newStatsGrid = `<div className="stats-grid">
            <div className="stat-card" onClick={() => console.log('viewDetails(\\'appointments\\')')}>
                <div className="stat-header">
                    <i className="fas fa-calendar-check"></i>
                    <h3 id="todayAppointmentsLabel">Today's Appointments</h3>
                </div>
                <div className="stat-value">3</div>
                <div className="stat-trend positive">↑ 12% from yesterday</div>
            </div>

            <div className="stat-card" onClick={() => console.log('viewDetails(\\'patients\\')')}>
                <div className="stat-header">
                    <i className="fas fa-paw"></i>
                    <h3 id="totalPatientsLabel">Total Pets</h3>
                </div>
                <div className="stat-value">1</div>
                <div className="stat-trend positive">↑ 5% this month</div>
            </div>

            <div className="stat-card" onClick={() => console.log('viewDetails(\\'consultations\\')')}>
                <div className="stat-header">
                    <i className="fas fa-clock"></i>
                    <h3 id="pendingConsultationsLabel">Pending Consultations</h3>
                </div>
                <div className="stat-value">3</div>
                <div className="stat-trend negative">↓ 3 from yesterday</div>
            </div>

            <div className="stat-card" onClick={() => console.log('viewDetails(\\'revenue\\')')}>
                <div className="stat-header">
                    <i className="fas fa-peso-sign"></i>
                    <h3 id="todayRevenueLabel">Revenue</h3>
                </div>
                <div className="stat-value">₱2,450</div>
                <div className="stat-trend positive">↑ 1.5% from average</div>
            </div>
        </div>

        <div className="dashboard-grid">`;
content = content.replace(oldStatsGridRegex, newStatsGrid);

// 3. Update the schedule-list mapping to match new design
const oldScheduleListRegex = /<div className="schedule-list" id="scheduleList">[\s\S]*?<\/div>\s*<\/div>\s*<div className="time-slots-status-container">/;
const scheduleListReplacement = `<div className="schedule-list" id="scheduleList">
                        {todaysAppointments.length === 0 ? (
                            <div style={{padding:"20px",textAlign:"center",color:"#a0aec0"}}>
                                <i className="fas fa-calendar-times" style={{fontSize: "2rem", marginBottom: "10px"}}></i>
                                <p>No appointments for this date</p>
                            </div>
                        ) : (
                            todaysAppointments.map(app => (
                                <div key={app.id} className="schedule-row">
                                    <div className="schedule-details">
                                        <div className="schedule-time" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                            {app.time} <span style={{fontWeight: 'normal', color: '#a0aec0'}}>·</span> {app.petName} <span style={{fontWeight: 'normal', color: '#a0aec0'}}>—</span> {app.type}
                                        </div>
                                        <div className="schedule-desc">{app.owner}</div>
                                    </div>
                                    <span className="badge-confirmed">Confirmed</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="time-slots-status-container">`;
content = content.replace(oldScheduleListRegex, scheduleListReplacement);

fs.writeFileSync(filePath, content);
console.log("Updated superadmin dashboard to use admin layout.");
