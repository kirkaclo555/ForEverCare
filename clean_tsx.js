const fs = require('fs');
const path = require('path');

const targetBaseDir = 'd:/FurEverPawCare/apps/web/app/(admin)';
const dirsToFix = ['archive', 'billing', 'telemedicine', 'users', 'profile'];

dirsToFix.forEach((dir) => {
  const targetPath = path.join(targetBaseDir, dir, 'page.tsx');
  if (!fs.existsSync(targetPath)) return;
  
  let content = fs.readFileSync(targetPath, 'utf8');

  // Strip anything from <script> to the end of the file, then close the component properly.
  const scriptIdx = content.indexOf('<script>');
  if (scriptIdx !== -1) {
    content = content.substring(0, scriptIdx) + '\n    </>\n  );\n}';
  }

  // Next build often errors on </span></div></div> left over
  content = content.replace(/<\/span><\/div><\/div><\/td>/g, '</td>');
  content = content.replace(/<\/span><\/div><\/div><\/tr>/g, '</tr>');

  fs.writeFileSync(targetPath, content);
  console.log(`Cleaned script from ${dir}/page.tsx`);
});
