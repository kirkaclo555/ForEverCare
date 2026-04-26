const fs = require('fs');
const path = require('path');

const targetBaseDir = 'd:/FurEverPawCare/apps/web/app/(admin)';
const dirsToFix = ['archive', 'billing', 'telemedicine', 'users', 'profile'];

const cssToObj = (cssString) => {
  const parts = cssString.split(';').filter(Boolean);
  const obj = {};
  for (const part of parts) {
    const [key, val] = part.split(':').map(s => s.trim());
    if (key && val) {
      // camelCase key
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      obj[camelKey] = val;
    }
  }
  return JSON.stringify(obj);
};

dirsToFix.forEach((dir) => {
  const targetPath = path.join(targetBaseDir, dir, 'page.tsx');
  if (!fs.existsSync(targetPath)) return;
  
  let content = fs.readFileSync(targetPath, 'utf8');

  // fix style="xxx" -> style={{xxx}}
  content = content.replace(/style="([^"]*)"/g, (match, cssStr) => {
    return `style={${cssToObj(cssStr)}}`;
  });

  // fix onClick="xxx" -> onClick={() => {}}
  content = content.replace(/onClick="([^"]*)"/g, `onClick={() => {}}`);

  // fix onchange="xxx" -> onChange={() => {}}
  content = content.replace(/onchange="([^"]*)"/gi, `onChange={() => {}}`);

  // fix onsubmit="xxx" -> onSubmit={(e) => e.preventDefault()}
  content = content.replace(/onsubmit="([^"]*)"/gi, `onSubmit={(e) => e.preventDefault()}`);

  // fix onkeyup="xxx" -> onKeyUp={() => {}}
  content = content.replace(/onkeyup="([^"]*)"/gi, `onKeyUp={() => {}}`);

  fs.writeFileSync(targetPath, content);
  console.log(`Fixed ${dir}/page.tsx`);
});
