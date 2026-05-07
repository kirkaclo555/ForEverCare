const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'apps/web/app/admin/admin.css');
let content = fs.readFileSync(cssPath, 'utf-8');

const extraCss = `
/* Extra TopBar fixes for dark theme */
.notifications i {
    color: white !important;
}
.settings-icon {
    color: white !important;
}
.settings-icon:hover {
    background: rgba(255,255,255,0.1) !important;
}
`;
fs.appendFileSync(cssPath, extraCss);
console.log("Appended to admin.css");
