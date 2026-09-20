import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { sendSMS } from '../../../../lib/twilio';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, petId, petName, vaccineName, vaccineType, nextDueDate, vetClinic, status, userEmail, userPhone } = body;

    if (!petName || !vaccineName || !nextDueDate) {
      return NextResponse.json({ error: 'Missing required vaccine details' }, { status: 400 });
    }

    let targetUser: any = null;
    if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
    }

    if (!targetUser && (userEmail || userPhone)) {
      targetUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(userEmail ? [{ email: userEmail }] : []),
            ...(userPhone ? [{ phoneNumber: userPhone }] : [])
          ]
        }
      }).catch(() => null);
    }

    if (!targetUser && petId) {
      try {
        const petObj = await (prisma.pet as any).findUnique({
          where: { id: petId },
          include: { user: true }
        });
        if (petObj && petObj.user) {
          targetUser = petObj.user;
        }
      } catch {}
    }

    if (!targetUser) {
      targetUser = await prisma.user.findFirst().catch(() => null);
    }

    let recipientEmail = userEmail || targetUser?.email;
    if (!recipientEmail || recipientEmail === 'guest@furevercare.com') {
      const validUser = await prisma.user.findFirst({
        where: {
          AND: [
            { email: { not: '' } },
            { email: { not: 'guest@furevercare.com' } }
          ]
        }
      }).catch(() => null);
      if (validUser?.email) {
        recipientEmail = validUser.email;
      }
    }

    const recipientPhone = userPhone || targetUser?.phoneNumber;
    const recipientName = targetUser?.fullName || 'Pet Owner';
    const targetUserId = targetUser?.id;

    const formattedDate = new Date(nextDueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const statusLabel = status === 'overdue' ? 'OVERDUE' : status === 'due_today' ? 'DUE TODAY' : `due on ${formattedDate}`;

    // 1. IN-APP NOTIFICATION BELL
    const notifTitle = `💉 Vaccine Alert: ${petName}`;
    const notifMessage = `${petName}'s ${vaccineName} (${vaccineType || 'Vaccine'}) is ${statusLabel}. Please schedule a visit at ${vetClinic || 'FurEverCare Clinic'}.`;

    let createdNotif = null;
    if (targetUserId) {
      try {
        createdNotif = await (prisma as any).notification.create({
          data: {
            userId: targetUserId,
            title: notifTitle,
            message: notifMessage,
            isRead: false
          }
        });
        console.log(`[Vaccine Notification] In-app notification created for user ${targetUserId}`);
      } catch (nErr: any) {
        console.error('[Vaccine Notification] Error creating in-app notification:', nErr?.message || nErr);
      }
    }

    // 2. SMS NOTIFICATION
    let smsSent = false;
    if (recipientPhone) {
      try {
        const smsMessage = `FurEverPawCare Alert: Hi ${recipientName}, ${petName}'s ${vaccineName} vaccine is ${statusLabel}. Please schedule a visit at FurEverCare Clinic!`;
        const smsRes = await sendSMS(recipientPhone, smsMessage);
        smsSent = smsRes.success;

        if (targetUserId) {
          try {
            await (prisma as any).smsNotification.create({
              data: {
                userId: targetUserId,
                recipient: recipientPhone,
                message: smsMessage,
                status: smsRes.success ? 'SENT' : 'FAILED'
              }
            });
          } catch {}
        }
      } catch (sErr: any) {
        console.error('[Vaccine Notification] SMS sending failed:', sErr?.message || sErr);
      }
    }

    // 3. EMAIL NOTIFICATION VIA GMAIL (NODEMAILER)
    let emailSent = false;
    let emailErrorMsg = '';
    if (recipientEmail && recipientEmail !== 'guest@furevercare.com') {
      try {
        const smtpUser = process.env.SMTP_USER || 'adminfureverpawcare@gmail.com';
        const smtpPass = process.env.SMTP_PASS || 'ivsd ulrw dwmc alop';

        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        const emailHtml = `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7fafc; padding: 0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2D5016 0%, #3a7d55 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
              <div style="font-size: 32px; color: white; margin-bottom: 4px;">💉</div>
              <h1 style="margin: 0; font-size: 22px; color: white; font-weight: 700;">FurEverPawCare</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">Vaccination Reminder & Pet Care</p>
            </div>

            <!-- Body -->
            <div style="background: white; padding: 32px 24px; border-left: 1px solid #edf2f7; border-right: 1px solid #edf2f7;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #2d3748;">Vaccination Reminder for ${petName} 🐾</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #718096; line-height: 1.6;">
                Hi <strong>${recipientName}</strong>, keeping <strong>${petName}</strong> up to date on immunizations is essential for their health and protection!
              </p>

              <!-- Status Alert Card -->
              <div style="background: ${status === 'overdue' ? '#FFF5F5' : '#FEF3C7'}; border: 1px solid ${status === 'overdue' ? '#FEB2B2' : '#F6E05E'}; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: ${status === 'overdue' ? '#C53030' : '#92400E'}; font-weight: 700;">
                  ${status === 'overdue' ? '⚠️ Vaccination Overdue' : '⏰ Vaccination Due Soon'}
                </p>
                <p style="margin: 6px 0 0 0; font-size: 14px; color: ${status === 'overdue' ? '#9B2C2C' : '#78350F'}; line-height: 1.5;">
                  ${petName}'s <strong>${vaccineName}</strong> is ${statusLabel}.
                </p>
              </div>

              <!-- Vaccination Details -->
              <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #2d3748; border-bottom: 2px solid #EAF3DE; padding-bottom: 8px;">Vaccine Details</h3>
              <table style="width: 100%; border-collapse: collapse; background: #f7fafc; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #718096;">Pet Name</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #2d3748; font-weight: 700; text-align: right;">${petName}</td>
                </tr>
                <tr style="border-top: 1px solid #edf2f7;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #718096;">Vaccine</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #2D5016; font-weight: 700; text-align: right;">${vaccineName} (${vaccineType || 'Core'})</td>
                </tr>
                <tr style="border-top: 1px solid #edf2f7;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #718096;">Next Due Date</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: ${status === 'overdue' ? '#e53e3e' : '#dd6b20'}; font-weight: 700; text-align: right;">${formattedDate}</td>
                </tr>
                <tr style="border-top: 1px solid #edf2f7;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #718096;">Clinic</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #2d3748; font-weight: 600; text-align: right;">${vetClinic || 'FurEverCare Clinic'}</td>
                </tr>
              </table>

              <!-- Call to Action -->
              <div style="text-align: center; margin-bottom: 12px;">
                <p style="font-size: 14px; color: #4a5568; margin-bottom: 16px;">
                  Please open the FurEverPawCare Mobile App or contact our clinic to schedule a vaccination appointment.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #2d3748; padding: 20px 24px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 4px 0; font-size: 13px; color: rgba(255,255,255,0.7);">
                FurEverPawCare Veterinary Clinic
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.5);">
                &copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.
              </p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"FurEverPawCare Clinic" <${smtpUser}>`,
          to: recipientEmail,
          subject: `💉 Vaccination Reminder for ${petName}: ${vaccineName} is ${status === 'overdue' ? 'Overdue' : 'Due Soon'}`,
          html: emailHtml
        });
        emailSent = true;
        console.log(`[Vaccine Notification] Email sent successfully to ${recipientEmail}`);
      } catch (eErr: any) {
        emailErrorMsg = eErr?.message || String(eErr);
        console.error('[Vaccine Notification] Email sending failed:', eErr);
      }
    }

    return NextResponse.json({
      success: true,
      channels: {
        notificationBell: !!createdNotif,
        sms: smsSent,
        email: emailSent,
        emailError: emailErrorMsg || undefined,
        sentTo: recipientEmail
      }
    });

  } catch (error: any) {
    console.error('Error handling vaccine notification API:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to process vaccine notification',
      details: String(error)
    }, { status: 500 });
  }
}
