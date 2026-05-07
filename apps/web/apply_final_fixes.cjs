const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'app', 'admin', 'admin.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// 1. Fix .dashboard-grid overflow by using fr units instead of percentages
cssContent = cssContent.replace(
    'grid-template-columns: 60% 40%;',
    'grid-template-columns: 1.5fr 1fr;'
);

// 2. Remove white highlight from setting icon
// We use a regex to match the exact block to safely replace the background
cssContent = cssContent.replace(
    /(\.settings-icon\s*{[\s\S]*?)background:\s*#f7fafc;([\s\S]*?})/,
    '$1background: transparent;$2'
);

// Write back to admin.css
fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log("Successfully fixed dashboard alignment and settings icon styling.");
