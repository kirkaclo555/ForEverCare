const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, 'apps/web/app/admin/products/page.tsx');
const superadminPath = path.join(__dirname, 'apps/web/app/superadmin/products/page.tsx');

let adminContent = fs.readFileSync(adminPath, 'utf8');

// Update the CSS import
adminContent = adminContent.replace("import './products.css';", "import '../../admin/products/products.css';");

fs.writeFileSync(superadminPath, adminContent);
console.log("Copied admin products UI to superadmin");
