import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier } = body; // can be email or phone

    if (!identifier) {
      return NextResponse.json({ error: 'Please provide an email or phone number' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.trim() },
          { phoneNumber: identifier.trim() }
        ]
      }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Account not found with this email or phone number' }, { status: 404 });
    }

    // Generate a 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Store the code associated with the user's ID in database
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        resetCode: code,
        resetCodeExpiry: expires
      }
    });

    console.log(`Generated verification code for ${identifier}: ${code}`);

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"FurEverPawCare" <${process.env.SMTP_USER || 'noreply@fureverpawcare.com'}>`,
      to: existingUser.email,
      subject: 'Password Reset Code - FurEverPawCare',
      text: `Your password reset code is: ${code}\n\nThis code will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your FurEverPawCare account.</p>
          <p>Your 6-digit reset code is: <strong style="font-size: 24px; color: #2E5E3E;">${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent',
      userId: existingUser.id
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

