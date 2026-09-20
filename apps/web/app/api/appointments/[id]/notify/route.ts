import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: 'Appointment ID is required' }, { status: 400 });
    }

    // Fetch the appointment along with user and pet details
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        user: true,
        pet: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 });
    }

    if (!appointment.user || !appointment.user.email) {
      return NextResponse.json({ message: 'User or user email not found for this appointment' }, { status: 400 });
    }

    const ownerName = (appointment as any).user.fullName;
    const userEmail = (appointment as any).user.email;
    const petName = (appointment as any).pet?.petName || 'your pet';
    const dateStr = (appointment as any).appointmentDate ? new Date((appointment as any).appointmentDate).toISOString().split('T')[0] : 'N/A';
    const timeStr = (appointment as any).appointmentTime || 'N/A';
    const sessionCode = (appointment as any).sessionCode || 'N/A';

    // Get SMTP credentials
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

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
      to: userEmail,
      subject: 'Your Telemedicine Session is Coming Up Soon! - FurEverPawCare',
      text: `Hello ${ownerName},\n\nThis is a reminder that your telemedicine session for ${petName} is scheduled for ${dateStr} at ${timeStr}.\n\nYour session code is: ${sessionCode}\n\nYou can enter the call 5 minutes before the session starts by opening the mobile app and going to Telemedicine.\n\nThank you!`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2E5E3E;">
            <h2 style="color: #2E5E3E; margin: 0; font-size: 24px;">FurEverPawCare Telemedicine</h2>
          </div>
          <div style="padding: 20px 0;">
            <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">Hello <strong>${ownerName}</strong>,</p>
            <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">This is a friendly reminder that your upcoming telemedicine consultation for <strong>${petName}</strong> is scheduled to start soon!</p>
            
            <div style="background-color: #f7fafc; border-left: 4px solid #2E5E3E; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #2E5E3E; font-size: 18px;">Appointment Details</h3>
              <p style="margin: 5px 0; font-size: 15px; color: #4a5568;"><strong>Date:</strong> ${dateStr}</p>
              <p style="margin: 5px 0; font-size: 15px; color: #4a5568;"><strong>Time:</strong> ${timeStr}</p>
              <p style="margin: 5px 0; font-size: 15px; color: #4a5568;"><strong>Session Code:</strong> <span style="font-family: monospace; font-weight: bold; background: #edf2f7; padding: 2px 6px; border-radius: 4px; font-size: 16px; color: #2E5E3E;">${sessionCode}</span></p>
            </div>

            <p style="font-size: 15px; color: #4a5568; line-height: 1.6;">You can join the consultation room directly from your mobile app <strong>5 minutes before</strong> the scheduled start time by entering the session code above or clicking the active session under <strong>Latest Activity</strong>.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <span style="display: inline-block; background-color: #2E5E3E; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px;">Please join on time</span>
            </div>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #a0aec0;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">If you have any questions or need to reschedule, please contact us via the app or admin support.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, email: userEmail });
  } catch (error: any) {
    console.error('Error sending telemedicine notification email:', error);
    return NextResponse.json({ message: 'Error: ' + error.message }, { status: 500 });
  }
}
