const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'superadmin', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const split1 = content.split('export default function DashboardPage() {');
const split2 = split1[1].split('    <div className="modal" id="generalSettingsModal"');

const newCode = `
  const router = useRouter();

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showEditSlotsModal, setShowEditSlotsModal] = useState(false);
  
  // time slots dictionary: 'YYYY-MM-DD' -> [{ time: '09:00 AM', enabled: true }, ...]
  const [timeSlotsData, setTimeSlotsData] = useState<Record<string, { time: string, enabled: boolean }[]>>({});

  const defaultSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  // Mock appointments
  const mockAppointments = [
    { id: 1, date: new Date().toISOString().split('T')[0], time: '09:00 AM', petName: 'Max', owner: 'John Doe', type: 'Checkup' },
    { id: 2, date: new Date().toISOString().split('T')[0], time: '02:00 PM', petName: 'Bella', owner: 'Jane Smith', type: 'Vaccination' },
  ];

  useEffect(() => {
    // Initialize today on mount
    const today = new Date();
    const dateKey = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
    setTimeSlotsData(prev => ({
        ...prev,
        [dateKey]: defaultSlots.map(time => ({ time, enabled: true }))
    }));
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);
    
    const dateKey = \`\${newSelectedDate.getFullYear()}-\${String(newSelectedDate.getMonth() + 1).padStart(2, '0')}-\${String(newSelectedDate.getDate()).padStart(2, '0')}\`;
    if (!timeSlotsData[dateKey]) {
      setTimeSlotsData(prev => ({
        ...prev,
        [dateKey]: defaultSlots.map(time => ({ time, enabled: true }))
      }));
    }
  };

  const handleSlotToggle = (timeIndex: number) => {
    if (!selectedDate) return;
    const dateKey = \`\${selectedDate.getFullYear()}-\${String(selectedDate.getMonth() + 1).padStart(2, '0')}-\${String(selectedDate.getDate()).padStart(2, '0')}\`;
    
    setTimeSlotsData(prev => {
      const daySlots = [...(prev[dateKey] || [])];
      if (daySlots[timeIndex]) {
        daySlots[timeIndex] = { ...daySlots[timeIndex], enabled: !daySlots[timeIndex].enabled };
      }
      return { ...prev, [dateKey]: daySlots };
    });
  };

  const formatDateLabel = (date: Date | null) => {
    if (!date) return "Not selected";
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const selectedDateStr = selectedDate ? \`\${selectedDate.getFullYear()}-\${String(selectedDate.getMonth() + 1).padStart(2, '0')}-\${String(selectedDate.getDate()).padStart(2, '0')}\` : '';
  const todaysAppointments = mockAppointments.filter(app => app.date === selectedDateStr);

  return (
    <>
    <div className="module-content" id="mainContent">
        <div className="dashboard-title">
            <h1 id="greetingMessage">Good morning, Super Admin!</h1>
            <p id="subGreeting"> </p>
        </div>

        <div className="stats-grid">
            <div className="stat-card" onClick={() => console.log(\`viewDetails('appointments')\`)}>
                <div className="stat-header">
                    <i className="fas fa-calendar-check"></i>
                    <h3 id="todayAppointmentsLabel">Today's Appointments</h3>
                </div>
                <div className="stat-value">3</div>
                <div className="stat-trend">↑ 12% from yesterday</div>
            </div>

            <div className="stat-card" onClick={() => console.log(\`viewDetails('patients')\`)}>
                <div className="stat-header">
                    <i className="fas fa-paw"></i>
                    <h3 id="totalPatientsLabel">Total Pets</h3>
                </div>
                <div className="stat-value">1</div>
                <div className="stat-trend">↑ 5% this month</div>
            </div>

            <div className="stat-card" onClick={() => console.log(\`viewDetails('consultations')\`)}>
                <div className="stat-header">
                    <i className="fas fa-clock"></i>
                    <h3 id="pendingConsultationsLabel">Pending Consultations</h3>
                </div>
                <div className="stat-value">3</div>
                <div className="stat-trend">↓ 3 from yesterday</div>
            </div>

            <div className="stat-card" onClick={() => console.log(\`viewDetails('revenue')\`)}>
                <div className="stat-header">
                    <i className="fas fa-peso-sign"></i>
                    <h3 id="todayRevenueLabel">Revenue</h3>
                </div>
                <div className="stat-value">₱2,450</div>
                <div className="stat-trend">↑ 1.5% from average</div>
            </div>
        </div>

        <div className="dashboard-grid">
            <div className="calendar-section">
                <div className="section-header">
                    <h2><i className="far fa-calendar-alt" style={{marginRight:"8px"}}></i> <span id="calendarTitle">Calendar Activities</span></h2>
                    <button 
                      className="edit-slots-btn-sm" 
                      onClick={() => setShowEditSlotsModal(true)}
                    >
                      <i className="fas fa-edit"></i> Edit Slots
                    </button>
                </div>

                <div className="calendar-header">
                    <h3 id="currentMonthYear">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="calendar-nav">
                        <button onClick={prevMonth}><i className="fas fa-chevron-left"></i></button>
                        <button onClick={nextMonth}><i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>

                <div className="weekdays">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>

                <div className="calendar-days" id="calendarDaysContainer">
                    {Array.from({ length: getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, idx) => (
                      <div key={\`empty-\${idx}\`} className="calendar-day empty"></div>
                    ))}
                    {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, idx) => {
                      const day = idx + 1;
                      const isSelected = selectedDate && 
                        selectedDate.getDate() === day && 
                        selectedDate.getMonth() === currentDate.getMonth() && 
                        selectedDate.getFullYear() === currentDate.getFullYear();
                      
                      const dateKey = \`\${currentDate.getFullYear()}-\${String(currentDate.getMonth() + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
                      const hasSlots = timeSlotsData[dateKey] && timeSlotsData[dateKey].some(s => s.enabled);

                      return (
                        <button 
                          key={\`day-\${day}\`} 
                          className={\`calendar-day \${isSelected ? 'active' : ''} \${hasSlots ? 'has-slots' : ''}\`}
                          onClick={() => handleDateClick(day)}
                        >
                          {day}
                        </button>
                      );
                    })}
                </div>
            </div>

            <div className="right-column">
                <div className="today-schedule">
                    <div className="section-header">
                        <h2><i className="far fa-clock" style={{marginRight:"8px"}}></i> <span id="scheduleTitle">Schedule for {formatDateLabel(selectedDate)}</span></h2>
                        <button className="view-all-btn" onClick={() => console.log('viewAllSchedule()')}><span>View All</span></button>
                    </div>
                    <div className="schedule-list" id="scheduleList">
                        {todaysAppointments.length === 0 ? (
                            <div style={{padding:"20px",textAlign:"center",color:"#a0aec0"}}>
                                <i className="fas fa-calendar-times" style={{fontSize: "2rem", marginBottom: "10px"}}></i>
                                <p>No appointments for this date</p>
                            </div>
                        ) : (
                            todaysAppointments.map(app => (
                                <div key={app.id} style={{padding: "15px", borderBottom: "1px solid #edf2f7", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                    <div>
                                        <div style={{fontWeight: 600, color: "#2d3748"}}>{app.time}</div>
                                        <div style={{fontSize: "0.85rem", color: "#718096"}}>{app.petName} - {app.type}</div>
                                    </div>
                                    <span style={{background: "#e6f4ea", color: "#2E5E3E", padding: "4px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600}}>Confirmed</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="time-slots-status-container">
                    <div className="slot-status-header">
                        <i className="fas fa-list-ul"></i>
                        <h4>Time Slots Status <span style={{fontSize:"0.75rem",fontWeight:"normal"}}>(Selected Date: <span id="selectedDateLabel">{formatDateLabel(selectedDate)}</span>)</span></h4>
                    </div>
                    <div className="slots-status-list" id="slotsStatusList">
                        {!selectedDate ? (
                          <div style={{padding:"20px",textAlign:"center",color:"#a0aec0"}}>
                              <i className="fas fa-calendar-day"></i> Select a date on the calendar to view time slots
                          </div>
                        ) : (
                          <div className="time-slot-grid">
                            {(timeSlotsData[selectedDateStr] || defaultSlots.map(t => ({ time: t, enabled: true }))).map((slot, idx) => (
                              <div 
                                key={idx}
                                className={\`time-slot-btn \${slot.enabled ? 'enabled' : 'disabled'} read-only\`}
                              >
                                {slot.time}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Edit Slots Modal */}
    <div className={\`modal \${showEditSlotsModal ? 'show' : ''}\`} style={{display: showEditSlotsModal ? 'flex' : 'none', zIndex: 9999}} onClick={() => setShowEditSlotsModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: "500px"}}>
            <div className="modal-header">
                <h3><i className="fas fa-edit" style={{marginRight:"10px",color:"#2E5E3E"}}></i> Edit Slots for {formatDateLabel(selectedDate)}</h3>
                <button className="modal-close" onClick={() => setShowEditSlotsModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <p style={{marginBottom: "15px", color: "#718096", fontSize: "0.9rem"}}>Click on a time slot to enable or disable it for this date.</p>
                <div className="time-slot-grid">
                    {(timeSlotsData[selectedDateStr] || defaultSlots.map(t => ({ time: t, enabled: true }))).map((slot, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleSlotToggle(idx)}
                            className={\`time-slot-btn \${slot.enabled ? 'enabled' : 'disabled'}\`}
                        >
                            {slot.time}
                        </button>
                    ))}
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => setShowEditSlotsModal(false)}>Done</button>
            </div>
        </div>
    </div>

    <div className="modal" id="generalSettingsModal"`;

const finalContent = split1[0] + 'export default function DashboardPage() {' + newCode + split2[1];
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("Successfully replaced script and modals.");
