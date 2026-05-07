const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, 'apps/web/app/admin/reports/page.tsx');
const superadminPath = path.join(__dirname, 'apps/web/app/superadmin/reports/page.tsx');

let adminContent = fs.readFileSync(adminPath, 'utf8');

// Update the CSS import
adminContent = adminContent.replace("import './reports.css';", "import '../../admin/reports/reports.css';");

fs.writeFileSync(superadminPath, adminContent);
console.log("Copied admin reports UI to superadmin");
