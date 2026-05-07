const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/web/app/admin/dashboard/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update mock appointments to match exactly:
// "09:00 AM · Max — Checkup · Golden Retriever · Dr. Santos"
// "02:00 PM · Bella — Vaccination · Siamese Cat · Dr. Reyes"
const mockAppsReplacement = `
  const mockAppointments = [
    { id: 1, date: new Date().toISOString().split('T')[0], time: '09:00 AM', petName: 'Max', breed: 'Golden Retriever', type: 'Checkup', doctor: 'Dr. Santos', owner: 'John Doe' },
    { id: 2, date: new Date().toISOString().split('T')[0], time: '02:00 PM', petName: 'Bella', breed: 'Siamese Cat', type: 'Vaccination', doctor: 'Dr. Reyes', owner: 'Jane Smith' },
  ];`;
content = content.replace(/const mockAppointments = \[[\s\S]*?\];/, mockAppsReplacement.trim());

// 2. Default slots
const defaultSlotsReplacement = `
  const defaultSlots = [
    { time: "09:00 AM", enabled: true },
    { time: "10:00 AM", enabled: false },
    { time: "11:00 AM", enabled: true },
    { time: "12:00 PM", enabled: true },
    { time: "01:00 PM", enabled: false },
    { time: "02:00 PM", enabled: true },
    { time: "03:00 PM", enabled: true },
  ];`;
// Since the original was just string array, we need to adapt it. Wait, the state logic uses string array for defaultSlots:
// \`[dateKey]: defaultSlots.map(time => ({ time, enabled: true }))\`
// So instead of changing defaultSlots to an object, let's just replace the useEffect logic that sets the initial state:
const useEffectReplacement = `
  useEffect(() => {
    // Initialize today on mount
    const today = new Date();
    const dateKey = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    setTimeSlotsData(prev => ({
        ...prev,
        [dateKey]: [
          { time: "09:00 AM", enabled: true },
          { time: "10:00 AM", enabled: false },
          { time: "11:00 AM", enabled: true },
          { time: "12:00 PM", enabled: true },
          { time: "01:00 PM", enabled: false },
          { time: "02:00 PM", enabled: true },
          { time: "03:00 PM", enabled: true },
        ]
    }));
  }, []);`;
content = content.replace(/useEffect\(\(\) => \{\s*\/\/ Initialize today on mount[\s\S]*?\}, \[\]\);/, useEffectReplacement.trim());

// 3. Stats grid values
const statsGridRegex = /<div className="stats-grid">[\s\S]*?<\/div>\s*<\/div>\s*<div className="dashboard-grid">/;
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
                    <i className="fas fa-video"></i>
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
content = content.replace(statsGridRegex, newStatsGrid);

// 4. Update the schedule-list mapping to match new design
const scheduleListReplacement = `
                    <div className="schedule-list" id="scheduleList">
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
                                        <div className="schedule-desc">{app.breed} <span style={{fontWeight: 'normal', color: '#a0aec0'}}>·</span> {app.doctor}</div>
                                    </div>
                                    <span className="badge-confirmed">Confirmed</span>
                                </div>
                            ))
                        )}
                    </div>`;
content = content.replace(/<div className="schedule-list" id="scheduleList">[\s\S]*?<\/div>\s*<\/div>\s*<div className="time-slots-status-container">/, scheduleListReplacement.trim() + '\n                </div>\n\n                <div className="time-slots-status-container">');

fs.writeFileSync(filePath, content);
console.log("Updated page.tsx successfully.");
