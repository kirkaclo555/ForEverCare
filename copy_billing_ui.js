const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, 'apps/web/app/admin/billing/page.tsx');
const superadminPath = path.join(__dirname, 'apps/web/app/superadmin/billing/page.tsx');

let adminContent = fs.readFileSync(adminPath, 'utf8');

// Update the CSS import
adminContent = adminContent.replace("import './billing.css';", "import '../../admin/billing/billing.css';");

fs.writeFileSync(superadminPath, adminContent);
console.log("Copied admin billing UI to superadmin");
