import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportId, findings, role } = body; // role should be 'ADMIN' or 'SUPER_ADMIN'

    if (!reportId || !findings) {
      return NextResponse.json({ error: 'reportId and findings are required' }, { status: 400 });
    }

    const updateData: any = {};
    if (role === 'SUPER_ADMIN') {
      updateData.superAdminFindings = findings;
    } else {
      updateData.adminFindings = findings;
    }

    const updatedReport = await prisma.petMonitoring.update({
      where: { id: reportId },
      data: updateData,
      include: {
        pet: {
          include: {
            user: true
          }
        }
      }
    });

    const user = updatedReport.pet.user;
    const roleName = role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin';

    // 1. In-App Notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Findings updated for ${updatedReport.pet.petName}`,
        message: `The ${roleName} has updated the findings for your pet's health report.`,
      }
    });

    // 2. SMS Notification (Queued in database)
    if (user.phoneNumber) {
      await prisma.smsNotification.create({
        data: {
          userId: user.id,
          message: `FurEverPawCare: The ${roleName} has reviewed ${updatedReport.pet.petName}'s report. Please check your app for findings.`,
          notificationType: 'REPORT_UPDATE'
        }
      });
    }

    // 3. Email Notification
    if (user.email) {
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
          to: user.email,
          subject: `Health Report Update for ${updatedReport.pet.petName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Report Findings Updated</h2>
              <p>The ${roleName} has added new findings to your recent health report for <strong>${updatedReport.pet.petName}</strong>.</p>
              <p><strong>Findings:</strong><br/>${findings}</p>
              <p>Please open the FurEver Paw Care app for more details.</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Do not fail the whole request if just email fails
      }
    }

    return NextResponse.json({ success: true, report: updatedReport }, { status: 200 });
  } catch (error: any) {
    console.error('Error adding findings:', error);
    return NextResponse.json({ error: 'Failed to add findings', details: error.message }, { status: 500 });
  }
}
