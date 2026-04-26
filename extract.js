const fs = require('fs');
const html = fs.readFileSync('D:/CAPSTONE_APR/Capstone/Reports.html', 'utf8');

const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>');
const styles = html.substring(styleStart + 7, styleEnd);

fs.writeFileSync('d:/FurEverPawCare/apps/web/app/(admin)/reports/reports.css', styles);
console.log('Reports Styles extracted');
