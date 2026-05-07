const fs = require('fs');
const path = require('path');

const superadminDashboardCssPath = path.join(__dirname, 'app', 'superadmin', 'dashboard', 'dashboard.css');
const superadminDashboardPagePath = path.join(__dirname, 'app', 'superadmin', 'dashboard', 'page.tsx');

const adminDashboardCssPath = path.join(__dirname, 'app', 'admin', 'dashboard', 'dashboard.css');
const adminDashboardPagePath = path.join(__dirname, 'app', 'admin', 'dashboard', 'page.tsx');

const inventoryCssPath = path.join(__dirname, 'app', 'superadmin', 'inventory', 'inventory.css');

// 1. Copy dashboard.css
let saDashCss = fs.readFileSync(superadminDashboardCssPath, 'utf8');
fs.writeFileSync(adminDashboardCssPath, saDashCss, 'utf8');
console.log('Copied dashboard.css to admin');

// 2. Copy and modify page.tsx
let saDashPage = fs.readFileSync(superadminDashboardPagePath, 'utf8');
saDashPage = saDashPage.replace(/Good morning, Super Admin!/g, 'Good morning, Admin!');
fs.writeFileSync(adminDashboardPagePath, saDashPage, 'utf8');
console.log('Copied and updated page.tsx to admin');

// 3. Clean up inventory.css
function removeCssBlock(content, blockRegex) {
    return content.replace(blockRegex, '');
}

if (fs.existsSync(inventoryCssPath)) {
    let inventoryCss = fs.readFileSync(inventoryCssPath, 'utf8');
    
    // Remove .main-content
    inventoryCss = inventoryCss.replace(/\.main-content\s*\{[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/\.main-content::-webkit-scrollbar\s*\{[\s\S]*?\}/g, '');
    
    // Remove .sidebar
    inventoryCss = inventoryCss.replace(/\.sidebar\s*\{[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/\.sidebar::-webkit-scrollbar\s*\{[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/\.sidebar-header\s*\{[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/\.sidebar-header\s*h2[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/\.sidebar-menu\s*\{[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/\.close-sidebar\s*\{[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/body\.dark-mode\s*\.sidebar[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/body\.dark-mode\s*\.sidebar-header\s*\{[\s\S]*?\}/g, '');
    
    // Remove .top-bar
    inventoryCss = inventoryCss.replace(/\.top-bar\s*\{[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/body\.dark-mode\s*\.top-bar\s*\{[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/\.menu-toggle\s*\{[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/\.menu-toggle:hover\s*\{[\s\S]*?\}/g, '');
    inventoryCss = inventoryCss.replace(/body\.dark-mode\s*\.menu-toggle[\s\S]*?\}/g, '');

    fs.writeFileSync(inventoryCssPath, inventoryCss, 'utf8');
    console.log('Cleaned up inventory.css');
}
