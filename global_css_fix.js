const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'apps/web/app/admin/admin.css');
let content = fs.readFileSync(cssPath, 'utf-8');

const overrideCSS = `
/* GLOBAL OVERRIDES FOR ALL MODULES */
.top-bar {
    background: #2E5E3E !important;
    color: white !important;
    height: auto !important;
    padding: 18px 25px !important;
    border-radius: 16px !important;
}
.page-title h1 {
    color: white !important;
    font-family: 'Lora', serif !important;
}
.page-title span {
    background: rgba(255,255,255,0.15) !important;
    color: white !important;
}
`;

content += overrideCSS;
fs.writeFileSync(cssPath, content);
console.log("Appended global overrides");
