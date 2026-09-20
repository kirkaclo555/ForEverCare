const nodemailer = require('nodemailer');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  env[key] = val;
}

console.log('=== SMTP ENV VALUES ===');
console.log('SMTP_HOST:', env.SMTP_HOST);
console.log('SMTP_PORT:', env.SMTP_PORT);
console.log('SMTP_USER:', env.SMTP_USER);
console.log('SMTP_PASS length:', env.SMTP_PASS ? env.SMTP_PASS.length : 'undefined');
console.log('SMTP_PASS raw:', JSON.stringify(env.SMTP_PASS));

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

console.log('\n=== VERIFYING SMTP CONNECTION ===');
transporter.verify(function(err, success) {
  if (err) {
    console.error('SMTP ERROR CODE:', err.code);
    console.error('SMTP ERROR MESSAGE:', err.message);
    console.error('SMTP RESPONSE CODE:', err.responseCode);
    console.error('Full error:', JSON.stringify(err, null, 2));
  } else {
    console.log('SUCCESS! SMTP connection verified. Server is ready to accept messages.');
  }
});
