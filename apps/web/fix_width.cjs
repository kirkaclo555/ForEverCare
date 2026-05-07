const fs = require('fs');
const path = require('path');

const adminCssPath = path.join(__dirname, 'app', 'admin', 'admin.css');
let adminCss = fs.readFileSync(adminCssPath, 'utf8');

// Ensure .main-content has border-box and correct shifted width
adminCss = adminCss.replace(
    /\.main-content\s*{[\s\S]*?width:\s*100%;\s*}/,
    `.main-content {
            margin-left: 0;
            transition: margin-left 0.3s ease, width 0.3s ease;
            padding: 20px;
            width: 100%;
            box-sizing: border-box;
        }`
);

adminCss = adminCss.replace(
    /\.main-content\.shifted\s*{[\s\S]*?margin-left:\s*280px;\s*}/,
    `.main-content.shifted {
            margin-left: 280px;
            width: calc(100% - 280px);
        }`
);

fs.writeFileSync(adminCssPath, adminCss, 'utf8');
console.log("Updated admin.css main-content shifted width");
