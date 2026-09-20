import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import prisma from '../../../lib/prisma';


export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'billing.json');

const DEFAULT_INVOICES = [
  {
    id: 'INV-1001',
    clientName: 'Juan Dela Cruz',
    date: new Date().toISOString().split('T')[0] || '',
    items: [{ id: '1', name: 'Premium Dog Food', quantity: 2, price: 45.99 }],
    totalAmount: 91.98,
    status: 'paid',
    source: 'product'
  },
  {
    id: 'INV-1002',
    clientName: 'Maria Santos',
    date: new Date().toISOString().split('T')[0] || '',
    items: [{ id: '2', name: 'Consultation Fee', quantity: 1, price: 500.00 }],
    totalAmount: 500.00,
    status: 'pending',
    source: 'appointment'
  }
];

const initializeDataFile = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(DEFAULT_INVOICES, null, 2));
  }
};

async function sendInvoiceEmail(invoice: any) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'fureverpawcareadmin@gmail.com',
        pass: process.env.SMTP_PASS || 'xjxw svro yxan hgnj',
      },
    });

    const itemsHtml = invoice.items.map((item: any) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; text-align: left; color: #2d3748;">${item.name}</td>
        <td style="padding: 12px; text-align: center; color: #4a5568;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; color: #4a5568;">₱${Number(item.price).toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; color: #2d3748;">₱${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Your FurEverPawCare Receipt</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
            body {
              font-family: 'Outfit', 'Inter', sans-serif;
              background-color: #f7fafc;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
              overflow: hidden;
              border: 1px solid #e2e8f0;
            }
            .header {
              background: linear-gradient(135deg, #2E5E3E 0%, #1c3d27 100%);
              padding: 32px;
              text-align: center;
              color: #ffffff;
            }
            .header h1 {
              margin: 0;
              font-size: 26px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 14px;
              opacity: 0.9;
            }
            .body {
              padding: 40px;
            }
            .greeting {
              font-size: 18px;
              color: #2d3748;
              margin-bottom: 24px;
              font-weight: 600;
            }
            .details-box {
              background-color: #f7fafc;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 30px;
              border: 1px solid #edf2f7;
            }
            .details-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .details-row:last-child {
              margin-bottom: 0;
            }
            .label {
              color: #718096;
            }
            .value {
              color: #2d3748;
              font-weight: 600;
            }
            .badge {
              background-color: #C6F6D5;
              color: #22543D;
              padding: 4px 12px;
              border-radius: 99px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #edf2f7;
              padding: 12px;
              font-size: 12px;
              text-transform: uppercase;
              color: #718096;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .total-section {
              border-top: 2px solid #edf2f7;
              padding-top: 20px;
              text-align: right;
            }
            .total-amount {
              font-size: 24px;
              font-weight: 700;
              color: #2E5E3E;
            }
            .footer {
              background-color: #edf2f7;
              padding: 24px;
              text-align: center;
              font-size: 12px;
              color: #718096;
              border-top: 1px solid #edf2f7;
            }
            .footer a {
              color: #2E5E3E;
              text-decoration: none;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FurEverPawCare Clinic</h1>
              <p>Professional Care For Your Beloved Companions</p>
            </div>
            <div class="body">
              <div class="greeting">Hi ${invoice.clientName || 'Valued Customer'},</div>
              <p style="color: #4a5568; line-height: 1.6; margin-bottom: 24px;">
                Thank you for your trust and purchase at FurEverPawCare! We are pleased to send you the digital invoice for your recent transaction. Your payment has been successfully verified. Your order has been confirmed and ready for pick up.
              </p>
              
              <div class="details-box">
                <table style="width:100%; margin:0; border:none;" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#718096; font-size:14px; padding-bottom:8px;">Invoice Reference:</td>
                    <td style="color:#2d3748; font-size:14px; font-weight:600; text-align:right; padding-bottom:8px;">${invoice.id}</td>
                  </tr>
                  <tr>
                    <td style="color:#718096; font-size:14px; padding-bottom:8px;">Date Generated:</td>
                    <td style="color:#2d3748; font-size:14px; font-weight:600; text-align:right; padding-bottom:8px;">${invoice.date}</td>
                  </tr>
                  <tr>
                    <td style="color:#718096; font-size:14px;">Status:</td>
                    <td style="text-align:right;">
                      <span class="badge">PAID</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <table style="width:100%;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 12px;">Item / Service Description</th>
                    <th style="text-align: center; padding: 12px;">Qty</th>
                    <th style="text-align: right; padding: 12px;">Unit Price</th>
                    <th style="text-align: right; padding: 12px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="total-section">
                <span style="font-size: 14px; color: #718096; font-weight: 600;">Total Paid Amount:</span>
                <div class="total-amount">₱${Number(invoice.totalAmount).toFixed(2)}</div>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0 0 8px 0;">If you have any questions, please contact our support at <a href="mailto:support@fureverpawcare.com">support@fureverpawcare.com</a></p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `"FurEverPawCare Clinic" <${process.env.SMTP_USER || 'fureverpawcareadmin@gmail.com'}>`,
      to: invoice.userEmail,
      subject: `Official Receipt - Invoice ${invoice.id} - FurEverPawCare`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Successfully emailed invoice receipt ${invoice.id} to ${invoice.userEmail}`);
  } catch (err) {
    console.error(`Error sending invoice email for ${invoice.id}:`, err);
  }
}

export async function GET() {
  initializeDataFile();
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const invoices = JSON.parse(data);
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read billing data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  initializeDataFile();
  try {
    const newInvoices = await request.json();
    
    let dataToWrite;
    if (Array.isArray(newInvoices)) {
      dataToWrite = newInvoices;
    } else {
      const data = fs.readFileSync(dataFilePath, 'utf-8');
      const existing = JSON.parse(data);
      dataToWrite = [newInvoices, ...existing];
    }

    // Load old invoices before save to see status transition changes
    let invoicesBefore = [];
    if (fs.existsSync(dataFilePath)) {
      try {
        invoicesBefore = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
      } catch (e) {}
    }

    // Send email and create notification for paid invoices that were not paid previously (in background)
    const tasksToRunInBackground: Array<() => Promise<void>> = [];

    for (const newInv of dataToWrite) {
      if (newInv.status === 'paid') {
        const oldInv = invoicesBefore.find((old: any) => old.id === newInv.id);
        const wasNotPaidYet = !oldInv || oldInv.status !== 'paid' || !oldInv.emailed;
        if (wasNotPaidYet && !newInv.emailed) {

          // Resolve the user email — use stored one or fall back to DB lookup via appointmentId
          let resolvedEmail: string | null = newInv.userEmail || null;
          let resolvedUserId: string | null = null;

          if (!resolvedEmail && newInv.appointmentId) {
            try {
              const linkedAppt = await prisma.appointment.findUnique({
                where: { id: newInv.appointmentId },
                include: { user: { select: { id: true, email: true } } }
              });
              if (linkedAppt?.user?.email) {
                resolvedEmail = linkedAppt.user.email;
                resolvedUserId = linkedAppt.user.id;
                newInv.userEmail = resolvedEmail; // persist for next time
              }
            } catch (lookupErr) {
              console.error('[Billing] Failed to look up user email via appointmentId:', lookupErr);
            }
          }

          if (!resolvedEmail) {
            console.warn(`[Billing] Skipping email for invoice ${newInv.id} — no userEmail found.`);
          } else {
            newInv.emailed = true; // Mark as emailed immediately to avoid resend

            const invData = { ...newInv, userEmail: resolvedEmail }; // Capture values for async task
            const capturedUserId = resolvedUserId;
            tasksToRunInBackground.push(async () => {
              await sendInvoiceEmail(invData);

              // Determine notification message based on invoice source
              const isAppointment = invData.source === 'appointment' || invData.source === 'telemedicine';
              const notifTitle = isAppointment ? 'Payment Verified' : 'Order Ready for Pick Up';
              const notifMessage = isAppointment
                ? `Your appointment payment has been verified by the clinic. Your official receipt (Invoice ${invData.id}) has been emailed to you.`
                : `Your order has been confirmed and is ready for in-clinic pick up. Invoice ${invData.id} has been emailed to you.`;

              // Create database notification for mobile app
              try {
                const user = capturedUserId
                  ? await prisma.user.findUnique({ where: { id: capturedUserId } })
                  : await prisma.user.findFirst({ where: { email: invData.userEmail } });
                if (user) {
                  await prisma.notification.create({
                    data: {
                      userId: user.id,
                      title: notifTitle,
                      message: notifMessage,
                      isRead: false
                    }
                  });
                  console.log(`[Billing] Notification created for user ${user.id} — invoice ${invData.id}`);
                }
              } catch (notifErr) {
                console.error('Error creating mobile notification for billing:', notifErr);
              }

              // Update Order Status in DB to DELIVERED (which maps to Ready for Pick Up in UI)
              if (invData.orderId) {
                try {
                  await prisma.order.update({
                    where: { id: invData.orderId },
                    data: { status: 'DELIVERED' }
                  });
                } catch (err) {
                  console.error('Failed to update order status to DELIVERED:', err);
                }
              }
            });
          }
        }
      }
    }

    // Handle completed status: update linked order to COMPLETED
    for (const newInv of dataToWrite) {
      if (newInv.status === 'completed' && newInv.orderId) {
        const oldInv = invoicesBefore.find((old: any) => old.id === newInv.id);
        const wasNotCompletedYet = !oldInv || oldInv.status !== 'completed';
        if (wasNotCompletedYet) {
          const invData = { ...newInv };
          tasksToRunInBackground.push(async () => {
            try {
              await prisma.order.update({
                where: { id: invData.orderId },
                data: { status: 'COMPLETED' }
              });
              console.log(`Order ${invData.orderId} marked as COMPLETED via billing.`);
            } catch (err) {
              console.error('Failed to update order status to COMPLETED:', err);
            }
          });
        }
      }
    }
    
    fs.writeFileSync(dataFilePath, JSON.stringify(dataToWrite, null, 2));

    // Run the queued tasks asynchronously without blocking the response
    (async () => {
      for (const task of tasksToRunInBackground) {
        try {
          await task();
        } catch (taskErr) {
          console.error('Failed executing background billing task:', taskErr);
        }
      }
    })().catch((err) => {
      console.error('Failed background billing execution:', err);
    });

    return NextResponse.json({ success: true, invoices: dataToWrite });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write billing data' }, { status: 500 });
  }
}
