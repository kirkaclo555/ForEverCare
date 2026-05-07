const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'apps/web/app/admin/profile/profile.css');
let content = fs.readFileSync(cssPath, 'utf-8');

const overrideCSS = `
/* Fix for narrow stats grid in profile sidebar */
.profile-sidebar .stats-grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
}
.profile-sidebar .stat-card {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 15px 20px !important;
    text-align: left !important;
    flex-direction: row-reverse;
}
.profile-sidebar .stats-number {
    font-size: 1.4rem !important;
    margin-bottom: 0 !important;
}
.profile-sidebar .stats-label {
    font-size: 0.95rem !important;
    white-space: normal !important;
}
`;

content += overrideCSS;
fs.writeFileSync(cssPath, content);
console.log("Appended profile stats grid fix");
