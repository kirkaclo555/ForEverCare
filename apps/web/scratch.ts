import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_USER:", process.env.SMTP_USER ? "Provided" : "Missing");
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Provided" : "Missing");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("Nodemailer error:", error);
  } else {
    console.log("SMTP connection successful");
  }
});
