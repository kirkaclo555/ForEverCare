const fs = require('fs');
const path = require('path');

const config = [
  { source: 'D:/FurEverCare/FurEverCare_Admin', target: 'D:/FurEverPawCare_User/apps/web/app/(admin)' },
  { source: 'D:/FurEverCare/FurEverCare_SuperAdmin', target: 'D:/FurEverPawCare_User/apps/web/app/(superadmin)' }
];

const fileMap = {
  'AdminProfie.html': 'profile',
  'SuperAdminProfie.html': 'profile',
  'Announcement.html': 'announcement',
  'Appointment.html': 'appointment',
  'Archive.html': 'archive',
  'Billing.html': 'billing',
  'Dashboard.html': 'dashboard',
  'Inventory.html': 'inventory',
  'Loginpage.html': 'login',
  'Petrecord.html': 'records',
  'PetRecord.html': 'records',
  'Product.html': 'store',
  'Reports.html': 'reports',
  'SMSCenter.html': 'sms',
  'Signup.html': 'signup',
  'Telemedicine.html': 'telemedicine',
  'Tutorials.html': 'tutorials',
  'Users.html': 'users',
  'Welcome.html': 'welcome'
};

function convertStyleStringToObject(styleStr) {
  if (!styleStr || !styleStr.trim()) return '{}';
  const styleObj = {};
  const rules = styleStr.split(';');
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i].trim();
    if (!rule) continue;
    const parts = rule.split(':');
    if (parts.length >= 2) {
      let key = parts[0].trim();
      let value = parts.slice(1).join(':').trim();
      // Camel case key
      key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      styleObj[key] = value;
    }
  }
  return JSON.stringify(styleObj);
}

function processHtmlFile(srcPath, destDir, componentName, cssName) {
  let htmlContent = fs.readFileSync(srcPath, 'utf8');

  // Extract <style>
  let styles = '';
  const styleStart = htmlContent.indexOf('<style>');
  const styleEnd = htmlContent.indexOf('</style>');
  if (styleStart !== -1 && styleEnd !== -1) {
    styles = htmlContent.substring(styleStart + 7, styleEnd);
  }

  // Extract <body> content
  let bodyContent = '';
  const bodyStartMatch = htmlContent.match(/<body[^>]*>/i);
  const bodyEndIdx = htmlContent.toLowerCase().lastIndexOf('</body>');
  if (bodyStartMatch && bodyEndIdx !== -1) {
    bodyContent = htmlContent.substring(bodyStartMatch.index + bodyStartMatch[0].length, bodyEndIdx);
  } else {
    // If no body, just take everything
    bodyContent = htmlContent;
  }

  // String-aware script remover
  let newBody = "";
  let i = 0;
  while (i < bodyContent.length) {
    let scriptStart = bodyContent.toLowerCase().indexOf('<script', i);
    if (scriptStart === -1) {
      newBody += bodyContent.substring(i);
      break;
    }
    newBody += bodyContent.substring(i, scriptStart);
    
    let scriptEnd = -1;
    let inSingle = false;
    let inDouble = false;
    let inBacktick = false;
    for (let j = scriptStart; j < bodyContent.length; j++) {
      let c = bodyContent[j];
      let prevC = j > 0 ? bodyContent[j-1] : '';
      if (c === "'" && prevC !== '\\' && !inDouble && !inBacktick) inSingle = !inSingle;
      if (c === '"' && prevC !== '\\' && !inSingle && !inBacktick) inDouble = !inDouble;
      if (c === '`' && prevC !== '\\' && !inSingle && !inDouble) inBacktick = !inBacktick;
      
      if (!inSingle && !inDouble && !inBacktick) {
        if (bodyContent.substring(j, j + 9).toLowerCase() === '</script>') {
          scriptEnd = j + 9;
          break;
        }
      }
    }
    
    if (scriptEnd === -1) {
      scriptEnd = bodyContent.length;
    }
    i = scriptEnd;
  }
  bodyContent = newBody;

  // Convert HTML attributes to JSX
  let tsxContent = bodyContent
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/onclick=/gi, 'onClick=')
    .replace(/onchange=/gi, 'onChange=')
    .replace(/onsubmit=/gi, 'onSubmit=')
    .replace(/tabindex=/gi, 'tabIndex=')
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    // Convert style="..." to style={{...}}
    .replace(/style="([^"]*)"/g, (match, p1) => {
      return `style={${convertStyleStringToObject(p1)}}`;
    })
    // SVG and other specific React attribute fixes
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
    // Fix self closing tags
    .replace(/<(input|img|br|hr|meta|link)([^>]*?)>/gi, (match, tag, attrs) => {
      let cleanAttrs = attrs.trim();
      if (cleanAttrs.endsWith('/')) {
          cleanAttrs = cleanAttrs.slice(0, -1).trim();
      }
      return `<${tag} ${cleanAttrs} />`;
    })
    // Form default selected vs checked
    .replace(/ selected([ >])/g, ' defaultValue$1');

  // Next.js page generation
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const cssPath = path.join(destDir, `${cssName}.css`);
  fs.writeFileSync(cssPath, styles);

  const tsxPath = path.join(destDir, 'page.tsx');
  const pageCode = `"use client";\n\nimport React, { useState } from 'react';\nimport './${cssName}.css';\n\nexport default function ${componentName}Page() {\n  return (\n    <>\n      ${tsxContent}\n    </>\n  );\n}\n`;
  fs.writeFileSync(tsxPath, pageCode);

  console.log(`Converted ${srcPath} -> ${tsxPath}`);
}

config.forEach(cfg => {
  if (!fs.existsSync(cfg.source)) {
    console.log(`Source dir not found: ${cfg.source}`);
    return;
  }
  const files = fs.readdirSync(cfg.source);
  files.forEach(file => {
    if (file.endsWith('.html') && fileMap[file]) {
      const srcPath = path.join(cfg.source, file);
      const routeName = fileMap[file];
      const destDir = path.join(cfg.target, routeName);
      
      const componentName = routeName.charAt(0).toUpperCase() + routeName.slice(1);
      processHtmlFile(srcPath, destDir, componentName, routeName);
    }
  });
});
