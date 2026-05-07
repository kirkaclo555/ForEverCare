const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'apps/web/app/admin/admin.css');
let content = fs.readFileSync(cssPath, 'utf-8');

let replacement = "\n.settings-icon {\n    background-color: transparent !important;\n    border: none !important;\n    box-shadow: none !important;\n}\n.settings-icon i {\n    color: white !important;\n    background: transparent !important;\n}\n.settings-icon:hover {\n    background-color: rgba(255,255,255,0.1) !important;\n}";

if (content.includes('.settings-icon {\\r\\n    color: white !important;\\r\\n}')) {
    content = content.replace('.settings-icon {\\r\\n    color: white !important;\\r\\n}\\r\\n.settings-icon:hover {\\r\\n    background: rgba(255,255,255,0.1) !important;\\r\\n}', replacement);
} else if (content.includes('.settings-icon {\\n    color: white !important;\\n}')) {
    content = content.replace('.settings-icon {\\n    color: white !important;\\n}\\n.settings-icon:hover {\\n    background: rgba(255,255,255,0.1) !important;\\n}', replacement);
} else {
    content += replacement;
}

fs.writeFileSync(cssPath, content);
console.log("Updated admin.css settings icon");
