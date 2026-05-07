const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, 'apps/web/app/admin/appointment/page.tsx');
const superadminPath = path.join(__dirname, 'apps/web/app/superadmin/appointment/page.tsx');

let adminContent = fs.readFileSync(adminPath, 'utf8');

// Update the CSS import
adminContent = adminContent.replace("import './appointment.css';", "import '../../admin/appointment/appointment.css';");

fs.writeFileSync(superadminPath, adminContent);
console.log("Copied admin appointment UI to superadmin");
