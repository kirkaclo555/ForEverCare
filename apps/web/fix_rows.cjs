const fs = require('fs');
const path = require('path');

function replaceRows(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceRows(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content.replace(/rows="([0-9]+)"/g, 'rows={$1}');
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}
replaceRows('app/admin');
replaceRows('app/superadmin');
console.log('Fixed textarea rows prop errors!');
