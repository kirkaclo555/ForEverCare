const fs = require('fs');
const path = require('path');

const routes = new Set();
function findRoutes(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findRoutes(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/router\.push\('([^']+)'\)/g);
      if (matches) {
        matches.forEach(m => routes.add(m.replace("router.push('", '').replace("')", '')));
      }
    }
  }
}
findRoutes('app');
const uniqueRoutes = Array.from(routes).sort();
console.log('Unique routes being pushed to:');
uniqueRoutes.forEach(r => {
    // Determine if app/${r}/page.tsx exists
    const fileTarget = path.join('app', r, 'page.tsx');
    const exists = fs.existsSync(fileTarget);
    console.log(`- ${r}: ${exists ? 'EXISTS' : 'MISSING'}`);
});
