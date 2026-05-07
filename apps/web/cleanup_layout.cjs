const fs = require('fs');
const path = require('path');

function removeElement(content, startString) {
    let startIndex = content.indexOf(startString);
    if (startIndex === -1) return content;

    // Find the end of the start tag
    let tagEndIndex = content.indexOf('>', startIndex);
    if (tagEndIndex === -1) return content;

    let i = tagEndIndex + 1;
    let stack = 1;
    
    while (i < content.length && stack > 0) {
        if (content.substring(i, i + 4) === '<div') {
            stack++;
            i += 4;
        } else if (content.substring(i, i + 6) === '</div>') {
            stack--;
            if (stack === 0) {
                return content.substring(0, startIndex) + content.substring(i + 6);
            }
            i += 6;
        } else {
            i++;
        }
    }
    return content;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Remove sidebar
    content = removeElement(content, '<div className="sidebar"');
    
    // Remove top-bar
    content = removeElement(content, '<div className="top-bar"');

    // Change main-content to something else so it doesn't get the duplicate margin
    // But we don't need to unwrap it, just rename the class to avoid CSS conflicts
    // It will just act as a standard block container
    content = content.replace(/className="main-content"/g, 'className="module-content" style={{ width: "100%", padding: 0, margin: 0 }}');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Cleaned layout in:', filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('page.tsx')) {
            processFile(fullPath);
        }
    }
}

// Process admin and superadmin
walkDir(path.join(__dirname, 'app', 'admin'));
walkDir(path.join(__dirname, 'app', 'superadmin'));

console.log('Layout cleanup completed.');
