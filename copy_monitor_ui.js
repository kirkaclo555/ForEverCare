const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, 'apps/web/app/admin/monitor/page.tsx');
const superadminDir = path.join(__dirname, 'apps/web/app/superadmin/monitor');
const superadminPath = path.join(superadminDir, 'page.tsx');

// Ensure directory exists
if (!fs.existsSync(superadminDir)) {
  fs.mkdirSync(superadminDir, { recursive: true });
}

let adminContent = fs.readFileSync(adminPath, 'utf8');

// Update the CSS import
adminContent = adminContent.replace("import './monitor.css';", "import '../../admin/monitor/monitor.css';");

fs.writeFileSync(superadminPath, adminContent);
console.log("Copied admin monitor UI to superadmin");
