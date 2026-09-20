import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import nodemailer from 'nodemailer';
import { sendSMS } from '../../../../../lib/twilio';


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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, otpMethod = 'email' } = body; // can be email or phone

    if (!identifier) {
      return NextResponse.json({ error: 'Please provide an email or phone number' }, { status: 400 });
    }

    const phoneVariations = getPhoneVariations(identifier);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.trim() },
          { phoneNumber: { in: phoneVariations } },
          { recoveryPhone: { in: phoneVariations } }
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

    console.log(`Generated verification code for ${identifier} (Method: ${otpMethod}): ${code}`);

    // Send using selected method
    if (otpMethod === 'sms') {
      if (!existingUser.phoneNumber) {
        return NextResponse.json({ error: 'No phone number is registered with this account. Please choose Email instead.' }, { status: 400 });
      }
      try {
        const smsResult = await sendSMS(existingUser.phoneNumber, `FurEverPawCare: Your password reset verification code is ${code}. It will expire in 15 minutes.`);
        if (!smsResult.success) {
          return NextResponse.json({ error: `Failed to send SMS: ${smsResult.error}` }, { status: 500 });
        }
      } catch (smsError: any) {
        console.error("Failed to send forgot-password SMS OTP:", smsError);
        return NextResponse.json({ error: 'Failed to send verification SMS: ' + smsError.message }, { status: 500 });
      }
    } else {
      // Send email using nodemailer
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
      } catch (emailError: any) {
        console.error("Failed to send forgot-password email:", emailError);
        return NextResponse.json({ error: 'Failed to send verification email: ' + emailError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Verification code sent to ${otpMethod === 'sms' ? 'phone via SMS' : 'email'}.`,
      userId: existingUser.id
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

