const fs = require('fs');
const path = require('path');

const adminCssPath = path.join(__dirname, 'app', 'admin', 'admin.css');
const dashboardCssPath = path.join(__dirname, 'app', 'superadmin', 'dashboard', 'dashboard.css');
const pagePath = path.join(__dirname, 'app', 'superadmin', 'dashboard', 'page.tsx');

// 1. Update admin.css
let adminCss = fs.readFileSync(adminCssPath, 'utf8');

// Hide scrollbar and prevent horizontal overflow
const scrollbarFix = `
/* Global scrollbar and drag fixes */
html, body {
    overflow-x: hidden;
    scrollbar-width: none; /* Firefox */
}
::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
}
`;
if (!adminCss.includes('::-webkit-scrollbar {')) {
    adminCss = scrollbarFix + adminCss;
}

// Remove setting icon highlight
adminCss = adminCss.replace(
    /(\.settings-icon:hover\s*{[\s\S]*?})/,
    '.settings-icon:hover { color: #2E5E3E; opacity: 0.8; }'
);
adminCss = adminCss.replace(
    /(body\.dark-mode\s+\.settings-icon:hover\s*{[\s\S]*?})/,
    'body.dark-mode .settings-icon:hover { color: white; opacity: 0.8; }'
);

fs.writeFileSync(adminCssPath, adminCss, 'utf8');
console.log("Updated admin.css");

// 2. Update dashboard.css
let dashboardCss = fs.readFileSync(dashboardCssPath, 'utf8');
dashboardCss = dashboardCss.replace(
    'grid-template-columns: repeat(2, 1fr);',
    'grid-template-columns: repeat(4, 1fr);'
);
fs.writeFileSync(dashboardCssPath, dashboardCss, 'utf8');
console.log("Updated dashboard.css");

// 3. Update page.tsx for View All modal
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Add state
if (!pageContent.includes('showViewAllScheduleModal')) {
    pageContent = pageContent.replace(
        'const [showEditSlotsModal, setShowEditSlotsModal] = useState(false);',
        'const [showEditSlotsModal, setShowEditSlotsModal] = useState(false);\n  const [showViewAllScheduleModal, setShowViewAllScheduleModal] = useState(false);'
    );
}

// Update View All button click handler
pageContent = pageContent.replace(
    '<button className="view-all-btn" onClick={() => console.log(\'viewAllSchedule()\')}>',
    '<button className="view-all-btn" onClick={() => setShowViewAllScheduleModal(true)}>'
);

// Add Modal JSX at the bottom before </>
const viewAllModalJSX = `
    {/* View All Schedule Modal */}
    <div className={\`modal \${showViewAllScheduleModal ? 'show' : ''}\`} style={{display: showViewAllScheduleModal ? 'flex' : 'none', zIndex: 9999}} onClick={() => setShowViewAllScheduleModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: "600px", maxHeight: "80vh", display: "flex", flexDirection: "column"}}>
            <div className="modal-header">
                <h3><i className="far fa-clock" style={{marginRight:"10px",color:"#2E5E3E"}}></i> All Schedules for {formatDateLabel(selectedDate)}</h3>
                <button className="modal-close" onClick={() => setShowViewAllScheduleModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body" style={{overflowY: "auto", padding: "20px"}}>
                {todaysAppointments.length === 0 ? (
                    <div style={{padding:"40px",textAlign:"center",color:"#a0aec0"}}>
                        <i className="fas fa-calendar-times" style={{fontSize: "3rem", marginBottom: "15px"}}></i>
                        <p>No confirmed appointments for this date</p>
                    </div>
                ) : (
                    todaysAppointments.map(app => (
                        <div key={app.id} style={{padding: "15px", borderBottom: "1px solid #edf2f7", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", background: "#f7fafc", borderRadius: "12px"}}>
                            <div style={{display: "flex", gap: "15px", alignItems: "center"}}>
                                <div style={{background: "#e6f4ea", color: "#2E5E3E", padding: "10px", borderRadius: "10px", fontWeight: "bold"}}>
                                    {app.time}
                                </div>
                                <div>
                                    <div style={{fontWeight: 600, color: "#2d3748", fontSize: "1.1rem"}}>{app.petName}</div>
                                    <div style={{fontSize: "0.85rem", color: "#718096"}}>Owner: {app.owner} • {app.type}</div>
                                </div>
                            </div>
                            <span style={{background: "#2E5E3E", color: "white", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600}}>Confirmed</span>
                        </div>
                    ))
                )}
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => setShowViewAllScheduleModal(false)}>Close</button>
            </div>
        </div>
    </div>
`;

if (!pageContent.includes('View All Schedule Modal')) {
    pageContent = pageContent.replace(
        '{/* Edit Slots Modal */}',
        viewAllModalJSX + '\n\n    {/* Edit Slots Modal */}'
    );
    fs.writeFileSync(pagePath, pageContent, 'utf8');
    console.log("Updated page.tsx with modal");
}
