const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, 'apps/web/app/admin/inventory/page.tsx');
const superadminPath = path.join(__dirname, 'apps/web/app/superadmin/inventory/page.tsx');

let adminContent = fs.readFileSync(adminPath, 'utf8');

// Update the CSS import
adminContent = adminContent.replace("import './inventory.css';", "import '../../admin/inventory/inventory.css';");

fs.writeFileSync(superadminPath, adminContent);
console.log("Copied admin inventory UI to superadmin");
