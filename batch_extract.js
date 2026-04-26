const fs = require('fs');
const path = require('path');

const files = [
  { name: 'Archive.html', dir: 'archive', css: 'archive.css' },
  { name: 'Billing.html', dir: 'billing', css: 'billing.css' },
  { name: 'Telemedicine.html', dir: 'telemedicine', css: 'telemedicine.css' },
  { name: 'Users.html', dir: 'users', css: 'users.css' },
  { name: 'AdminProfie.html', dir: 'profile', css: 'profile.css' }
];

const sourceDir = 'D:/CAPSTONE_APR/Capstone';
const targetBaseDir = 'd:/FurEverPawCare/apps/web/app/(admin)';

files.forEach(({ name, dir, css }) => {
  const htmlPath = path.join(sourceDir, name);
  if (!fs.existsSync(htmlPath)) {
    console.log(`Skipping ${name}, not found.`);
    return;
  }
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Extract styles
  const styleStart = htmlContent.indexOf('<style>');
  const styleEnd = htmlContent.indexOf('</style>');
  let styles = '';
  if (styleStart !== -1 && styleEnd !== -1) {
    styles = htmlContent.substring(styleStart + 7, styleEnd);
  }

  // Find main content
  let bodyContent = '';
  // Most pages have a <main class="main-content"> or similar, or we can extract everything inside #main-content or inside <body> excluding sidebar/header
  const mainStart = htmlContent.indexOf('<main');
  const mainEnd = htmlContent.lastIndexOf('</main>');
  if (mainStart !== -1 && mainEnd !== -1) {
    bodyContent = htmlContent.substring(mainStart, mainEnd + 7);
  } else {
    // try finding something else, e.g. <div class="main-content">
    const divMainStart = htmlContent.indexOf('<div class="main-content"');
    if (divMainStart !== -1) {
      // Find matching closing div for this main content, assuming it's the last closing div of the body roughly
      // We will just do a rough substring
      const bodyEnd = htmlContent.indexOf('</body>');
      bodyContent = htmlContent.substring(divMainStart, bodyEnd);
      // clean trailing scripts roughly
      bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/g, '');
    }
  }

  // basic TSX transformation
  let tsxContent = bodyContent
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/onclick=/g, 'onClick=')
    .replace(/style="([^"]*)"/g, (match, p1) => {
      // Very naive style to object converter, actually just strip inline style or ignore it
      // we can let the AI fix it later if it fails
      return match;
    })
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    // Convert self-closing tags
    .replace(/<(input|img|br|hr)([^>]*[^\/])>/g, '<$1$2 />');

  // some specific tweaks for certain files
  if (name === 'Telemedicine.html') {
    tsxContent = tsxContent.replace(/selected /g, 'defaultValue ');
  }

  const targetDir = path.join(targetBaseDir, dir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(path.join(targetDir, css), styles);

  const finalTsx = `"use client";

import React, { useState } from 'react';
import './${css}';

export default function ${dir.charAt(0).toUpperCase() + dir.slice(1)}Page() {
  return (
    <>
      ${tsxContent}
    </>
  );
}
`;
  
  fs.writeFileSync(path.join(targetDir, 'page.tsx'), finalTsx);
  console.log(`Extracted ${name} to ${dir}`);
});
