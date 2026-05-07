const fs = require('fs');
let css = fs.readFileSync('apps/web/app/admin/admin.css', 'utf8');

const brokenSection = `        body {
            background: #f5f9f6;
            display: flex;
            transition: background-color 0.3s ease;
        body.dark-mode .schedule-info h4,`;

const fixedSection = `        body {
            background: #f5f9f6;
            display: flex;
            transition: background-color 0.3s ease;
        }

        body.dark-mode {
            background: #1a202c;
        }

        body.dark-mode .stat-card,
        body.dark-mode .calendar-section,
        body.dark-mode .patient-summary,
        body.dark-mode .today-schedule,
        body.dark-mode .notification-panel,
        body.dark-mode .modal-content {
            background: #2d3748;
            color: #f7fafc;
        }

        body.dark-mode .sidebar,
        body.dark-mode .top-bar {
            background: #2a5e3e;
            color: #f7fafc;
        }

        body.dark-mode .dashboard-title h1,
        body.dark-mode .dashboard-title p,
        body.dark-mode .stat-value,
        body.dark-mode .section-header h2,
        body.dark-mode .calendar-header h3,
        body.dark-mode .calendar-day,
        body.dark-mode .event-title,
        body.dark-mode .patient-info h4,
        body.dark-mode .schedule-info h4,`;

css = css.replace(/\r\n/g, '\n');
let s1 = brokenSection.replace(/\r\n/g, '\n');

if (css.includes(s1)) {
    css = css.replace(s1, fixedSection);
    fs.writeFileSync('apps/web/app/admin/admin.css', css);
    console.log("Fixed admin.css");
} else {
    console.log("Could not find the broken section in admin.css");
}
