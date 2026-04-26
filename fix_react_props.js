const fs = require('fs');
const path = require('path');

const targetBaseDir = 'd:/FurEverPawCare/apps/web/app/(admin)';
const dirsToFix = ['archive', 'billing', 'telemedicine', 'users', 'profile'];

dirsToFix.forEach((dir) => {
  const targetPath = path.join(targetBaseDir, dir, 'page.tsx');
  if (!fs.existsSync(targetPath)) return;
  
  let content = fs.readFileSync(targetPath, 'utf8');

  // Next build often errors on </span></div></div> left over
  content = content.replace(/maxlength="/g, 'maxLength="');
  content = content.replace(/tabindex="/g, 'tabIndex="');
  content = content.replace(/readonly/g, 'readOnly');
  content = content.replace(/colspan="/g, 'colSpan="');
  content = content.replace(/rowspan="/g, 'rowSpan="');
  content = content.replace(/for="/g, 'htmlFor="');

  fs.writeFileSync(targetPath, content);
  console.log(`Cleaned react dom props from ${dir}/page.tsx`);
});
