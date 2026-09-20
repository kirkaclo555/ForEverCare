import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import nodemailer from 'nodemailer';


export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ message: 'User not found or not authorized' }, { status: 404 });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode,
        resetCodeExpiry,
      },
    });
    
    // Log code to terminal for easy development testing
    console.log(`\n================================`);
    console.log(`Password reset code for ${email}: ${resetCode}`);
    console.log(`================================\n`);

    // Determine which SMTP credentials to use
    let smtpUser = process.env.SMTP_USER;
    let smtpPass = process.env.SMTP_PASS;

    if (user.role === 'ADMIN') {
      smtpUser = process.env.ADMIN_SMTP_USER || smtpUser;
      smtpPass = process.env.ADMIN_SMTP_PASS || smtpPass;
    } else if (user.role === 'SUPER_ADMIN') {
      smtpUser = process.env.SUPERADMIN_SMTP_USER || smtpUser;
      smtpPass = process.env.SUPERADMIN_SMTP_PASS || smtpPass;
    }

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"FurEverPawCare" <${smtpUser || 'noreply@fureverpawcare.com'}>`,
      to: email,
      subject: 'Password Reset Code - FurEverPawCare',
      text: `Your password reset code is: ${resetCode}\n\nThis code will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your FurEverPawCare admin account.</p>
          <p>Your 6-digit reset code is: <strong style="font-size: 24px; color: #2E5E3E;">${resetCode}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Reset code sent successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in forgot-password API:', error);
    // If SMTP fails, we might still have saved the code to DB, but we should inform the user
    if (error.code === 'EAUTH' || error.syscall === 'getaddrinfo') {
      return NextResponse.json({ message: 'Email server configuration error. Check SMTP settings.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error: ' + error.message }, { status: 500 });
  }
}
