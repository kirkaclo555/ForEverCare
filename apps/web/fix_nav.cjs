const fs = require('fs');
const path = require('path');

function processDir(dir, prefix) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath, prefix);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      
      // Inject useRouter if needed
      if (content.includes('navigateTo(') && !content.includes('next/navigation')) {
        content = content.replace(/import React(.*?)from 'react';/, "import React$1from 'react';\nimport { useRouter } from 'next/navigation';");
        content = content.replace(/export default function ([A-Za-z0-9_]+)\(\) \{/, "export default function $1() {\n  const router = useRouter();");
        changed = true;
      }
      
      // Replace nav bar clicks
      const navRegex = /onClick="navigateTo\('([^']+)'\)"/g;
      if (navRegex.test(content)) {
        content = content.replace(navRegex, `onClick={() => router.push('/${prefix}/$1')}`);
        changed = true;
      }
      
      // Replace other string event handlers to prevent React errors
      const events = ['onClick', 'onChange', 'onSubmit', 'onKeyUp', 'onKeyDown'];
      for (const ev of events) {
        const regex = new RegExp(ev + '="([^"]+)"', 'g');
        if (regex.test(content)) {
          content = content.replace(regex, ev + `={() => console.log('$1')}`);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(path.join(__dirname, 'app', 'admin'), 'admin');
processDir(path.join(__dirname, 'app', 'superadmin'), 'superadmin');
console.log('Done fixing navbar and string events!');
