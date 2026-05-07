const fs = require('fs');
const path = require('path');

const modules = ['dashboard', 'products', 'billing', 'inventory', 'reports', 'appointment'];

modules.forEach(mod => {
  const adminCssPath = path.join(__dirname, `apps/web/app/admin/${mod}/${mod}.css`);
  const superadminDir = path.join(__dirname, `apps/web/app/superadmin/${mod}`);
  const superadminCssPath = path.join(superadminDir, `${mod}.css`);
  const superadminPagePath = path.join(superadminDir, 'page.tsx');

  // Copy CSS if it exists
  if (fs.existsSync(adminCssPath)) {
    if (!fs.existsSync(superadminDir)) {
      fs.mkdirSync(superadminDir, { recursive: true });
    }
    fs.copyFileSync(adminCssPath, superadminCssPath);
    console.log(`Copied ${mod}.css to superadmin`);

    // Update import in page.tsx
    if (fs.existsSync(superadminPagePath)) {
      let pageContent = fs.readFileSync(superadminPagePath, 'utf8');
      const oldImport = `import '../../admin/${mod}/${mod}.css';`;
      const newImport = `import './${mod}.css';`;
      if (pageContent.includes(oldImport)) {
        pageContent = pageContent.replace(oldImport, newImport);
        fs.writeFileSync(superadminPagePath, pageContent);
        console.log(`Updated import in ${mod}/page.tsx`);
      }
    }
  }
});
