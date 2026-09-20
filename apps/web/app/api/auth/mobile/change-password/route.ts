import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, oldPassword, newPassword } = body;

    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    // Send confirmation email in background
    (async () => {
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

        const formattedDateTime = new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Manila',
          dateStyle: 'medium',
          timeStyle: 'short'
        }) + ' (PHT)';

        const emailHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert: Password Changed</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
      body {
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f4f1ec;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }
      .wrapper {
        width: 100%;
        background-color: #f4f1ec;
        padding: 40px 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.05);
      }
      .header {
        background: linear-gradient(135deg, #2D5016 0%, #1e3a0f 100%);
        padding: 35px 40px;
        text-align: center;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
      }
      .header-sub {
        font-size: 14px;
        color: #a3b899;
        margin-top: 5px;
        font-weight: 500;
      }
      .body {
        padding: 40px;
        color: #2d3748;
        line-height: 1.6;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #2D5016;
      }
      .message {
        font-size: 15px;
        color: #4a5568;
        margin-bottom: 30px;
      }
      .details-card {
        background-color: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
      }
      .warning-box {
        background-color: #fff5f5;
        border-left: 4px solid #e53e3e;
        border-radius: 6px;
        padding: 15px 20px;
        margin-bottom: 30px;
      }
      .warning-title {
        font-weight: 700;
        color: #c53030;
        font-size: 14px;
        margin-bottom: 5px;
      }
      .warning-text {
        font-size: 13.5px;
        color: #9b2c2c;
        margin: 0;
      }
      .footer {
        background-color: #edf2f7;
        padding: 25px 40px;
        text-align: center;
        font-size: 12px;
        color: #718096;
        border-top: 1px solid #e2e8f0;
      }
      .footer a {
        color: #2D5016;
        text-decoration: none;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <h1>Security Notification</h1>
          <div class="header-sub">FurEverPawCare Account Services</div>
        </div>
        <div class="body">
          <div class="greeting">Hello, ${user.fullName || 'Valued Customer'},</div>
          <p class="message">This email is to confirm that the password for your <strong>FurEverPawCare</strong> account was recently changed successfully.</p>
          
          <div class="details-card">
            <div style="font-weight: 700; color: #2D5016; margin-bottom: 12px; font-size: 15px;">Change Details:</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
              <tr style="border-bottom: 1px dashed #e2e8f0;">
                <td style="padding: 10px 0; font-weight: 600; color: #718096;">Date & Time</td>
                <td style="padding: 10px 0; text-align: right; color: #2d3748;">${formattedDateTime}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #718096;">Account Email</td>
                <td style="padding: 10px 0; text-align: right; color: #2d3748;">${user.email}</td>
              </tr>
            </table>
          </div>

          <div class="warning-box">
            <div class="warning-title">Didn't request this change?</div>
            <p class="warning-text">If you did not change your password, please contact our support team immediately at <a href="mailto:support@fureverpawcare.com" style="color: #c53030; text-decoration: underline; font-weight: 600;">support@fureverpawcare.com</a> or use the Forgot Password option on the app's login screen to secure your account.</p>
          </div>
          
          <p style="font-size: 14px; color: #718096; margin-bottom: 0;">Best regards,<br><strong>FurEverPawCare Team</strong></p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 8px 0;">Have questions? Contact us at <a href="mailto:support@fureverpawcare.com">support@fureverpawcare.com</a></p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>
      `;

        await transporter.sendMail({
          from: `"FurEverPawCare Security" <${process.env.SMTP_USER || 'fureverpawcareadmin@gmail.com'}>`,
          to: user.email,
          subject: 'Security Alert: Your password was changed - FurEverPawCare',
          html: emailHtml
        });
      } catch (emailErr) {
        console.error('[Nodemailer Error] Change password confirmation email dispatch failed in background:', emailErr);
      }
    })().catch((bgErr) => {
      console.error('[Background Error] change-password background email queue execution failed:', bgErr);
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
