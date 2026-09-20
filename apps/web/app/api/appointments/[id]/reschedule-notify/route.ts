import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { newDate, newTime } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'Appointment ID is required' }, { status: 400 });
    }

    // Fetch the appointment with user and pet details
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
    const userId = (appointment as any).user.id;
    const userEmail = (appointment as any).user.email;
    const petName = (appointment as any).pet?.petName || 'your pet';
    const oldDate = (appointment as any).appointmentDate ? new Date((appointment as any).appointmentDate).toISOString().split('T')[0] : 'N/A';
    const oldTime = (appointment as any).appointmentTime || 'N/A';
    const sessionCode = (appointment as any).sessionCode || '';

    // 1. Create in-app notification for the user
    await (prisma as any).notification.create({
      data: {
        userId: userId,
        title: 'Appointment Rescheduled',
        message: `Your telemedicine session for ${petName} has been rescheduled from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}. Please take note of the new schedule.${sessionCode ? ` Your session code remains: ${sessionCode}` : ''}`
      }
    });

    // 2. Send email notification
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"FurEverPawCare" <${smtpUser || 'noreply@fureverpawcare.com'}>`,
      to: userEmail,
      subject: 'Your Telemedicine Appointment Has Been Rescheduled - FurEverPawCare',
      text: `Hello ${ownerName},\n\nWe would like to inform you that your telemedicine appointment for ${petName} has been rescheduled.\n\nPrevious Schedule: ${oldDate} at ${oldTime}\nNew Schedule: ${newDate} at ${newTime}\n${sessionCode ? `Session Code: ${sessionCode}\n` : ''}\nYou may join the session 5 minutes before the new scheduled time using the FurEverPawCare mobile app.\n\nWe apologize for any inconvenience. Thank you for your understanding!\n\nBest regards,\nFurEverPawCare Team`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2E5E3E;">
            <h2 style="color: #2E5E3E; margin: 0; font-size: 24px;">FurEverPawCare</h2>
            <p style="color: #718096; margin: 5px 0 0 0; font-size: 14px;">Appointment Rescheduled</p>
          </div>
          <div style="padding: 25px 0;">
            <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">Hello <strong>${ownerName}</strong>,</p>
            <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">We would like to inform you that your telemedicine consultation for <strong>${petName}</strong> has been rescheduled by the clinic. Please see the updated details below:</p>
            
            <div style="display: flex; margin: 25px 0;">
              <!-- Previous Schedule -->
              <div style="flex: 1; background: #fff5f5; border-radius: 10px; padding: 15px; border: 1px solid #fed7d7;">
                <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #e53e3e; font-weight: 700;">Previous Schedule</p>
                <p style="margin: 3px 0; font-size: 15px; color: #4a5568; text-decoration: line-through;">${oldDate}</p>
                <p style="margin: 3px 0; font-size: 15px; color: #4a5568; text-decoration: line-through;">${oldTime}</p>
              </div>
              <div style="display: flex; align-items: center; padding: 0 10px; color: #2E5E3E; font-size: 20px;">→</div>
              <!-- New Schedule -->
              <div style="flex: 1; background: #f0fff4; border-radius: 10px; padding: 15px; border: 1px solid #c6f6d5;">
                <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #38a169; font-weight: 700;">New Schedule</p>
                <p style="margin: 3px 0; font-size: 15px; color: #2d3748; font-weight: 600;">${newDate}</p>
                <p style="margin: 3px 0; font-size: 15px; color: #2d3748; font-weight: 600;">${newTime}</p>
              </div>
            </div>

            ${sessionCode ? `
            <div style="background-color: #f7fafc; border-left: 4px solid #2E5E3E; padding: 12px 15px; margin: 15px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #718096;">Your session code remains the same:</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #2E5E3E; font-family: monospace; letter-spacing: 2px;">${sessionCode}</p>
            </div>
            ` : ''}

            <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin-top: 20px;">You may join the session <strong>5 minutes before</strong> the new scheduled time using the FurEverPawCare mobile app.</p>
            
            <p style="font-size: 15px; color: #4a5568; line-height: 1.6;">We apologize for any inconvenience this may cause. Thank you for your understanding!</p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #a0aec0;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">If you have questions, please contact us via the app.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, email: userEmail });
  } catch (error: any) {
    console.error('Error sending reschedule notification:', error);
    return NextResponse.json({ message: 'Error: ' + error.message }, { status: 500 });
  }
}
