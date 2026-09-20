import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { sendSMS } from '../../../../../../lib/twilio';

function getPhoneVariations(input: string): string[] {
  const cleaned = input.trim();
  const variations = [cleaned];
  const digits = cleaned.replace(/\D/g, '');
  if (digits) {
    variations.push(digits);
    if (digits.startsWith('09') && digits.length === 11) {
      variations.push(`${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`);
      variations.push(`+63${digits.slice(1)}`);
      variations.push(`63${digits.slice(1)}`);
    } else if (digits.startsWith('639') && digits.length === 12) {
      const local = '0' + digits.slice(2);
      variations.push(local);
      variations.push(`${local.slice(0, 4)}-${local.slice(4, 7)}-${local.slice(7)}`);
      variations.push(`+${digits}`);
    } else if (cleaned.startsWith('+639')) {
      const local = '0' + digits.slice(2);
      variations.push(local);
      variations.push(`${local.slice(0, 4)}-${local.slice(4, 7)}-${local.slice(7)}`);
    }
  }
  return Array.from(new Set(variations));
}

const secret = process.env.JWT_SECRET || 'furever_paw_care_signup_secret_key';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phoneNumber, otpMethod = 'email' } = body;

    if (!email || !phoneNumber) {
      return NextResponse.json({ error: 'Please provide both an email and phone number' }, { status: 400 });
    }

    const phoneVariations = getPhoneVariations(phoneNumber);

    // Check if the user already exists (by email or phone)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { phoneNumber: { in: phoneVariations } }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email or Phone Number already exists' }, { status: 409 });
    }

    // Generate a 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes from now

    // Create secure verification token cryptographically
    const payload = `${email.trim().toLowerCase()}:${code}:${expires}`;
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const verificationToken = `${payload}:${signature}`;

    console.log(`Generated signup verification code for ${email} (Method: ${otpMethod}): ${code}`);

    // Send email using nodemailer if chosen
    if (otpMethod === 'email') {
      try {
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
          to: email.trim().toLowerCase(),
          subject: 'Email Verification Code - FurEverPawCare',
          text: `Your email verification code is: ${code}\n\nThis code will expire in 15 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Email Verification Request</h2>
              <p>Welcome to FurEverPawCare! Please verify your email address to complete your registration.</p>
              <p>Your 6-digit verification code is: <strong style="font-size: 24px; color: #2E5E3E;">${code}</strong></p>
              <p>This code will expire in 15 minutes.</p>
              <p>If you did not initiate this, please ignore this email.</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError: any) {
        console.error("Failed to send signup email OTP:", emailError);
        return NextResponse.json({ error: 'Failed to send verification email: ' + emailError.message }, { status: 500 });
      }
    }

    // Send SMS using Twilio helper if chosen
    if (otpMethod === 'sms') {
      try {
        const smsResult = await sendSMS(phoneNumber, `FurEverPawCare: Your signup OTP code is ${code}. It will expire in 15 minutes.`);
        if (!smsResult.success) {
          return NextResponse.json({ error: `Failed to send SMS: ${smsResult.error}` }, { status: 500 });
        }
      } catch (smsError: any) {
        console.error("Failed to send signup SMS OTP:", smsError);
        return NextResponse.json({ error: 'Failed to send verification SMS: ' + smsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Verification code sent successfully to ${otpMethod === 'sms' ? 'phone' : 'email'}.`,
      verificationToken
    });

  } catch (error) {
    console.error("Send OTP signup error:", error);
    return NextResponse.json({ error: 'Internal server error while sending verification email' }, { status: 500 });
  }
}
