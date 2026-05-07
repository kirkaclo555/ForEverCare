const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'superadmin', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `        <div className="dashboard-grid">
            
            <div className="calendar-section">
                <div className="section-header">
                    <h2><i className="far fa-calendar-alt" style={{"marginRight":"8px"}}></i> <span id="calendarTitle">Calendar Activities</span></h2>
                    <button className="edit-slots-btn-sm" onClick={() => console.log('openTimeSlotPicker()')}><i className="fas fa-edit"></i> Edit Slots</button>
                </div>

                <div className="calendar-header">
                    <h3 id="currentMonthYear"></h3>
                    <div className="calendar-nav">
                        <button onClick={() => console.log('previousMonth()')}><i className="fas fa-chevron-left"></i></button>
                        <button onClick={() => console.log('nextMonth()')}><i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>

                <div className="weekdays">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                </div>

                <div className="calendar-days" id="calendarDaysContainer">
                    
                </div>
            </div>

            
            <div className="right-column">
                <div className="today-schedule">
                    <div className="section-header">
                        <h2><i className="far fa-clock" style={{"marginRight":"8px"}}></i> <span id="scheduleTitle">Today's Schedule</span></h2>
                        <button className="view-all-btn" onClick={() => console.log('viewAllSchedule()')}><span>View All</span></button>
                    </div>
                    <div className="schedule-list" id="scheduleList">
                        
                    </div>
                </div>

                
                <div className="time-slots-status-container">
                    <div className="slot-status-header">
                        <i className="fas fa-list-ul"></i>
                        <h4>Time Slots Status <span style={{"fontSize":"0.75rem","fontWeight":"normal"}}>(Selected Date: <span id="selectedDateLabel">Not selected</span>)</span></h4>
                    </div>
                    <div className="slots-status-list" id="slotsStatusList">
                        <div style={{"padding":"20px","textAlign":"center","color":"#a0aec0"}}>
                            <i className="fas fa-calendar-day"></i> Select a date on the calendar to view time slots
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

const replacementStr = `        <div className="dashboard-grid">
            
            <div className="calendar-section">
                <div className="section-header">
                    <h2><i className="far fa-calendar-alt" style={{"marginRight":"8px"}}></i> <span id="calendarTitle">Calendar Activities</span></h2>
                    <button 
                      className={\`edit-slots-btn-sm \${isEditingSlots ? 'active' : ''}\`} 
                      onClick={() => setIsEditingSlots(!isEditingSlots)}
                    >
                      <i className="fas fa-edit"></i> {isEditingSlots ? 'Done Editing' : 'Edit Slots'}
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
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
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
                        <h2><i className="far fa-clock" style={{"marginRight":"8px"}}></i> <span id="scheduleTitle">Today's Schedule</span></h2>
                        <button className="view-all-btn" onClick={() => console.log('viewAllSchedule()')}><span>View All</span></button>
                    </div>
                    <div className="schedule-list" id="scheduleList">
                        
                    </div>
                </div>

                
                <div className="time-slots-status-container">
                    <div className="slot-status-header">
                        <i className="fas fa-list-ul"></i>
                        <h4>Time Slots Status <span style={{"fontSize":"0.75rem","fontWeight":"normal"}}>(Selected Date: <span id="selectedDateLabel">{formatDateLabel(selectedDate)}</span>)</span></h4>
                    </div>
                    <div className="slots-status-list" id="slotsStatusList">
                        {!selectedDate ? (
                          <div style={{"padding":"20px","textAlign":"center","color":"#a0aec0"}}>
                              <i className="fas fa-calendar-day"></i> Select a date on the calendar to view time slots
                          </div>
                        ) : (
                          <div className="time-slot-grid">
                            {(timeSlotsData[\`\${selectedDate.getFullYear()}-\${String(selectedDate.getMonth() + 1).padStart(2, '0')}-\${String(selectedDate.getDate()).padStart(2, '0')}\`] || defaultSlots.map(t => ({ time: t, enabled: true }))).map((slot, idx) => (
                              <button 
                                key={idx}
                                onClick={() => handleSlotToggle(idx)}
                                className={\`time-slot-btn \${slot.enabled ? 'enabled' : 'disabled'} \${!isEditingSlots ? 'read-only' : ''}\`}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </div>`;

// Use regex to normalize whitespace if strict string matching fails
const regex = new RegExp(targetStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&').replace(/\\\s+/g, '\\s+'));

if (regex.test(content)) {
    content = content.replace(regex, replacementStr);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced calendar section.");
} else {
    console.log("Failed to find target string. Check regex or content.");
}
