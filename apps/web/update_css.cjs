const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'app', 'superadmin', 'dashboard', 'dashboard.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Update time-slot-grid to 2 columns
cssContent = cssContent.replace(
    'grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));',
    'grid-template-columns: repeat(2, 1fr);'
);

// Write changes back to dashboard.css
fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log("Updated dashboard.css");
