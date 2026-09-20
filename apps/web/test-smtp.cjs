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
    const targetEmail = 'ranidojealenemae@gmail.com';
    console.log('Sending test email to ' + targetEmail + '...');
    transporter.sendMail({
      from: `"FurEverPawCare" <${env.SMTP_USER}>`,
      to: targetEmail,
      subject: '🐾 FurEverPawCare - SMTP Test Email',
      text: 'Hello! This is a test email from FurEverPawCare confirming that the email sending service is working properly!',
      html: '<h2>🐾 FurEverPawCare Test Email</h2><p>Hello Jealene Mae!</p><p>Great news! The FurEverPawCare email sending service using the new Gmail credentials is <b>working 100% properly</b>!</p>'
    }, (sendErr, info) => {
      if (sendErr) {
        console.error('FAILED TO SEND EMAIL:', sendErr);
      } else {
        console.log('EMAIL SENT SUCCESSFULLY! 🎉 Message ID:', info.messageId);
      }
    });
  }
});
