const fs = require('fs');
const path = require('path');

function fixDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = "";
      let i = 0;
      const searchStr = "={() => console.log('";
      while (i < content.length) {
        let idx = content.indexOf(searchStr, i);
        if (idx === -1) {
          newContent += content.substring(i);
          break;
        }
        newContent += content.substring(i, idx + searchStr.length);
        
        let endIdx = content.indexOf("')}", idx + searchStr.length);
        if (endIdx !== -1) {
          let inner = content.substring(idx + searchStr.length, endIdx);
          if (inner.includes("'")) {
             newContent = newContent.substring(0, newContent.length - 1) + '`'; // replace ' with `
             inner = inner.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
             newContent += inner + '`)}';
          } else {
             newContent += inner + "')}";
          }
          i = endIdx + 3;
        } else {
          i = idx + searchStr.length;
        }
      }

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}
fixDir('app/admin');
fixDir('app/superadmin');
console.log('Fixed quotes!');
