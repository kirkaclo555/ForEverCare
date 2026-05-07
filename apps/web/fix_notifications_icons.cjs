const fs = require('fs');
const path = require('path');

const adminCssPath = path.join(__dirname, 'app', 'admin', 'admin.css');
const topBarPath = path.join(__dirname, 'components', 'TopBar.tsx');

// 1. Update TopBar.tsx for notification panel positioning
let topBarContent = fs.readFileSync(topBarPath, 'utf8');

// If not already wrapped
if (!topBarContent.includes('className="notifications-container"')) {
    topBarContent = topBarContent.replace(
        /\{\/\* Notifications \*\/\}([\s\S]*?)<div className="notifications"([\s\S]*?)\{\/\* Settings Dropdown \*\/\}/,
        `{/* Notifications */}
        <div className="notifications-container" style={{ position: 'relative' }}>
          <div className="notifications" onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowSettings(false); }}>
            <i className="far fa-bell"></i>
            <span className="badge">3</span>
          </div>

          {/* Notification Panel */}
          <div className={\`notification-panel \${showNotifications ? 'show' : ''}\`} onClick={(e) => e.stopPropagation()}>
            <div className="notification-header">
              <h3>Notifications</h3>
              <span className="mark-read">Mark all as read</span>
            </div>
            <div className="notification-list">
              <div className="notification-item unread">
                <div className="notification-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="notification-content">
                  <div className="notification-title">New Appointment Request</div>
                  <div className="notification-desc">Max (Golden Retriever) - Checkup</div>
                  <div className="notification-time">5 minutes ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Dropdown */}`
    );
    fs.writeFileSync(topBarPath, topBarContent, 'utf8');
    console.log("Updated TopBar.tsx");
}

// 2. Update admin.css
let adminCss = fs.readFileSync(adminCssPath, 'utf8');

// Fix notification panel position
adminCss = adminCss.replace(
    /\.notification-panel\s*{[\s\S]*?z-index:\s*1002;\s*}/,
    `.notification-panel {
            position: absolute;
            top: 50px;
            right: -10px;
            width: 350px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1002;
        }`
);

// Remove opacity from stat icons
adminCss = adminCss.replace(
    /\.stat-header\s*i\s*{[\s\S]*?opacity:\s*0\.5;\s*}/,
    `.stat-header i {
            font-size: 2.2rem;
            color: #2E5E3E;
        }`
);

// Add dark mode stats styles if missing
const darkModeStatsStyles = `
        body.dark-mode .stat-header i { color: #68d391; }
        body.dark-mode .stat-value { color: #f7fafc; }
        body.dark-mode .stat-trend { color: #68d391; }
`;
if (!adminCss.includes('body.dark-mode .stat-value')) {
    adminCss += darkModeStatsStyles;
}

fs.writeFileSync(adminCssPath, adminCss, 'utf8');
console.log("Updated admin.css");
