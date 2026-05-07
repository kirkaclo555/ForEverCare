const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'apps/web/app/admin/admin.css');
let content = fs.readFileSync(cssPath, 'utf-8');

// 1. Add Fonts and Update body font
content = content.replace(
  /\/\* Global scrollbar and drag fixes \*\//g,
  `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');\n\n/* Global scrollbar and drag fixes */`
);
content = content.replace(
  /font-family: 'Inter',/g,
  `font-family: 'Plus Jakarta Sans',`
);

// 2. Sidebar changes
content = content.replace(
  /width: 280px;\s*background: white;/g,
  `width: 240px;\n            background: #2E5E3E;`
);

content = content.replace(
  /\.sidebar-header h2 {\s*color: #2E5E3E;\s*font-size: 1\.5rem;\s*}/g,
  `.sidebar-header h2 {\n            color: white;\n            font-size: 1.5rem;\n            font-weight: 700;\n        }`
);

content = content.replace(
  /\.sidebar-header h2 span {\s*color: #2E5E3E;\s*font-size: 0\.9rem;\s*display: block;\s*}/g,
  `.sidebar-header h2 span {\n            color: rgba(255,255,255,0.7);\n            font-size: 0.8rem;\n            display: block;\n            text-transform: uppercase;\n        }`
);

// 3. Menu items
content = content.replace(
  /\.menu-item {\s*display: flex;\s*align-items: center;\s*padding: 12px 15px;\s*margin: 5px 0;\s*color: #4a5568;\s*border-radius: 12px;\s*transition: all 0\.3s ease;\s*cursor: pointer;\s*}/g,
  `.menu-item {\n            display: flex;\n            align-items: center;\n            padding: 12px 15px;\n            margin: 5px 0;\n            color: rgba(255, 255, 255, 0.6);\n            border-radius: 8px;\n            transition: all 0.3s ease;\n            cursor: pointer;\n            border-left: 3px solid transparent;\n        }`
);

content = content.replace(
  /\.menu-item i {\s*width: 24px;\s*font-size: 1\.1rem;\s*color: #a0aec0;\s*transition: all 0\.3s ease;\s*}/g,
  `.menu-item i {\n            width: 24px;\n            font-size: 1.1rem;\n            color: rgba(255, 255, 255, 0.6);\n            transition: all 0.3s ease;\n        }`
);

content = content.replace(
  /\.menu-item:hover {\s*background: #f7fafc;\s*color: #2E5E3E;\s*}\s*\.menu-item:hover i {\s*color: #2E5E3E;\s*}/g,
  `.menu-item:hover {\n            background: rgba(255,255,255,0.05);\n            color: white;\n        }\n\n        .menu-item:hover i {\n            color: white;\n        }`
);

content = content.replace(
  /\.menu-item\.active {\s*background: linear-gradient\(135deg, #2E5E3E 0%, #2E5E3E 100%\);\s*color: white;\s*}\s*\.menu-item\.active i {\s*color: white;\s*}/g,
  `.menu-item.active {\n            background: rgba(255,255,255,0.1);\n            color: white;\n            border-left: 3px solid white;\n        }\n\n        .menu-item.active i {\n            color: white;\n        }`
);

// 4. Main content shifted
content = content.replace(
  /\.main-content\.shifted {\s*margin-left: 280px;\s*width: calc\(100% - 280px\);\s*}/g,
  `.main-content.shifted {\n            margin-left: 240px;\n            width: calc(100% - 240px);\n        }`
);

// 5. Top Bar
content = content.replace(
  /\.top-bar {\s*display: flex;\s*align-items: center;\s*justify-content: space-between;\s*padding: 15px 25px;\s*background: white;\s*border-radius: 16px;\s*box-shadow: 0 2px 10px rgba\(0, 0, 0, 0\.02\);\s*margin-bottom: 25px;\s*transition: background-color 0\.3s ease;\s*}/g,
  `.top-bar {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            padding: 0 25px;\n            height: 60px;\n            background: #2E5E3E;\n            color: white;\n            margin-bottom: 25px;\n            transition: background-color 0.3s ease;\n        }`
);

content = content.replace(
  /\.page-title h1 {\s*color: #2d3748;\s*font-size: 1\.8rem;\s*transition: color 0\.3s ease;\s*}/g,
  `.page-title h1 {\n            color: white;\n            font-size: 1.4rem;\n            font-family: 'Lora', serif;\n            font-weight: 600;\n            margin: 0;\n            transition: color 0.3s ease;\n        }`
);

content = content.replace(
  /\.page-title span {\s*background: #e2e8f0;\s*color: #4a5568;\s*padding: 4px 10px;\s*border-radius: 20px;\s*font-size: 0\.9rem;\s*font-weight: 500;\s*}/g,
  `.page-title span {\n            background: rgba(255,255,255,0.15);\n            color: white;\n            padding: 4px 12px;\n            border-radius: 20px;\n            font-size: 0.85rem;\n            font-weight: 500;\n        }`
);

// Update main background to #f5f9f6
content = content.replace(
  /body {\s*background: #f7fafc;/g,
  `body {\n            background: #f5f9f6;`
);

fs.writeFileSync(cssPath, content);
console.log("Updated admin.css successfully.");
