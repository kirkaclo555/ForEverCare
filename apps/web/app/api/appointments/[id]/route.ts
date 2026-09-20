import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { sendSMS } from '../../../../lib/twilio';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await request.json();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    const existingApp: any = await prisma.appointment.findUnique({
      where: { id },
      include: { user: true, pet: true, payments: true }
    });

    if (!existingApp) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (existingApp.status === 'PAID' && data.status) {
      const targetStatus = data.status.toLowerCase();
      if (targetStatus === 'pending' || targetStatus === 'declined' || targetStatus === 'cancelled') {
        return NextResponse.json({ error: 'Once paid, the appointment status cannot be set to pending, declined, or cancelled.' }, { status: 400 });
      }
    }

    if (data.cancelRequested) {
      let newPurpose = existingApp.purpose;
      if (!newPurpose.startsWith('[CANCEL_REQUESTED]')) {
        newPurpose = `[CANCEL_REQUESTED] ${newPurpose}`;
      }
      const updated: any = await prisma.appointment.update({
        where: { id },
        data: { purpose: newPurpose },
        include: { user: true, pet: true, payments: true }
      });
      
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
      });
      for (const admin of admins) {
        await (prisma as any).notification.create({
          data: {
            userId: admin.id,
            title: 'Cancellation Request Submitted',
            message: `Notice of Cancellation: User ${existingApp.user?.fullName} has requested cancellation for pet ${existingApp.pet?.petName} scheduled on ${existingApp.appointmentDate.toISOString().split('T')[0]} at ${existingApp.appointmentTime}.`
          }
        });
      }
      
      const formatted = {
        id: updated.id,
        owner: updated.user?.fullName || 'Unknown',
        contact: updated.user?.phoneNumber || 'N/A',
        pet: updated.pet?.petName || 'Unknown',
        species: updated.pet?.species || 'N/A',
        breed: updated.pet?.breed || 'N/A',
        date: updated.appointmentDate ? new Date(updated.appointmentDate).toISOString().split('T')[0] : '',
        time: updated.appointmentTime || '',
        type: updated.type || 'inperson',
        purpose: updated.purpose || '',
        status: updated.status?.toLowerCase() || 'pending',
        sessionCode: updated.sessionCode || undefined,
        isArchived: updated.isArchived,
        createdAt: updated.createdAt.toISOString()
      };
      return NextResponse.json({ success: true, appointment: formatted });
    }

    if (data.withdrawCancel) {
      let newPurpose = existingApp.purpose;
      if (newPurpose.startsWith('[CANCEL_REQUESTED]')) {
        newPurpose = newPurpose.replace('[CANCEL_REQUESTED] ', '').replace('[CANCEL_REQUESTED]', '');
      }
      const updated: any = await prisma.appointment.update({
        where: { id },
        data: { purpose: newPurpose },
        include: { user: true, pet: true, payments: true }
      });
      
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
      });
      for (const admin of admins) {
        await (prisma as any).notification.create({
          data: {
            userId: admin.id,
            title: 'Cancellation Request Withdrawn',
            message: `Withdrawal of Cancellation: User ${existingApp.user?.fullName} has withdrawn the cancellation request for pet ${existingApp.pet?.petName} scheduled on ${existingApp.appointmentDate.toISOString().split('T')[0]} at ${existingApp.appointmentTime}.`
          }
        });
      }
      
      const formatted = {
        id: updated.id,
        owner: updated.user?.fullName || 'Unknown',
        contact: updated.user?.phoneNumber || 'N/A',
        pet: updated.pet?.petName || 'Unknown',
        species: updated.pet?.species || 'N/A',
        breed: updated.pet?.breed || 'N/A',
        date: updated.appointmentDate ? new Date(updated.appointmentDate).toISOString().split('T')[0] : '',
        time: updated.appointmentTime || '',
        type: updated.type || 'inperson',
        purpose: updated.purpose || '',
        status: updated.status?.toLowerCase() || 'pending',
        sessionCode: updated.sessionCode || undefined,
        isArchived: updated.isArchived,
        createdAt: updated.createdAt.toISOString()
      };
      return NextResponse.json({ success: true, appointment: formatted });
    }

    if (data.remindCancel) {
      const superAdmins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' }
      });
      for (const sa of superAdmins) {
        await (prisma as any).notification.create({
          data: {
            userId: sa.id,
            title: 'Reminder: Cancellation Request Pending',
            message: `Admin reminder: Appointment cancellation request for pet ${existingApp.pet?.petName} (${existingApp.user?.fullName}) is pending your approval.`
          }
        });
      }
      return NextResponse.json({ success: true });
    }

    if (data.approveCancel) {
      let cleanPurpose = existingApp.purpose.replace('[CANCEL_REQUESTED] ', '');
      const updated: any = await prisma.appointment.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          purpose: cleanPurpose
        },
        include: { user: true, pet: true, payments: true }
      });

      // Remove invoice from billing.json
      const dataFilePath = path.join(process.cwd(), 'billing.json');
      if (fs.existsSync(dataFilePath)) {
        try {
          let invoices = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
          invoices = invoices.filter((inv: any) => inv.appointmentId !== id);
          fs.writeFileSync(dataFilePath, JSON.stringify(invoices, null, 2));
        } catch (e) {
          console.error('Error removing invoice from billing.json:', e);
        }
      }

      // Send email to user (in background)
      if (updated.user?.email) {
        const wasPaymentVerified = existingApp.status === 'PAID';
        (async () => {
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
            
            const emailHtml = wasPaymentVerified ? `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <title>Cancellation & Refund Approved</title>
                  <style>
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
                    body {
                      font-family: 'Outfit', sans-serif;
                      background-color: #f7fafc;
                      margin: 0;
                      padding: 0;
                    }
                    .container {
                      max-width: 600px;
                      margin: 40px auto;
                      background-color: #ffffff;
                      border-radius: 16px;
                      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                      overflow: hidden;
                      border: 1px solid #e2e8f0;
                    }
                    .header {
                      background: linear-gradient(135deg, #e53e3e 0%, #b83280 100%);
                      padding: 32px;
                      text-align: center;
                      color: #ffffff;
                    }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
                    .body { padding: 40px; color: #4a5568; line-height: 1.6; }
                    .refund-info {
                      background-color: #fff5f5;
                      border-left: 4px solid #e53e3e;
                      padding: 15px;
                      border-radius: 4px;
                      margin: 20px 0;
                    }
                    .footer {
                      background-color: #edf2f7;
                      padding: 24px;
                      text-align: center;
                      font-size: 12px;
                      color: #718096;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Cancellation & Refund Approved</h1>
                    </div>
                    <div class="body">
                      <p>Dear ${updated.user.fullName || 'Valued Customer'},</p>
                      <p>We would like to inform you that your booking appointment cancellation request has been approved by the admin. Since your payment was previously verified, a refund has been initiated.</p>
                      <div class="refund-info">
                        <strong>Appointment Details:</strong><br/>
                        Pet Name: ${updated.pet?.petName || 'Unknown'}<br/>
                        Schedule: ${updated.appointmentDate.toISOString().split('T')[0]} at ${updated.appointmentTime}<br/>
                        Payment Status: Payment Verified<br/>
                        Status: Cancelled & Refund Approved
                      </div>
                      <p>Please wait for <strong>3-5 business days</strong> until your payment is returned to your account.</p>
                      <p>Thank you for choosing FurEverPawCare.</p>
                    </div>
                    <div class="footer">
                      <p>&copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>
            ` : `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <title>Appointment Cancellation Confirmed</title>
                  <style>
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
                    body {
                      font-family: 'Outfit', sans-serif;
                      background-color: #f7fafc;
                      margin: 0;
                      padding: 0;
                    }
                    .container {
                      max-width: 600px;
                      margin: 40px auto;
                      background-color: #ffffff;
                      border-radius: 16px;
                      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                      overflow: hidden;
                      border: 1px solid #e2e8f0;
                    }
                    .header {
                      background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
                      padding: 32px;
                      text-align: center;
                      color: #ffffff;
                    }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
                    .body { padding: 40px; color: #4a5568; line-height: 1.6; }
                    .info-box {
                      background-color: #edf2f7;
                      border-left: 4px solid #4a5568;
                      padding: 15px;
                      border-radius: 4px;
                      margin: 20px 0;
                    }
                    .footer {
                      background-color: #edf2f7;
                      padding: 24px;
                      text-align: center;
                      font-size: 12px;
                      color: #718096;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Appointment Cancellation Confirmed</h1>
                    </div>
                    <div class="body">
                      <p>Dear ${updated.user.fullName || 'Valued Customer'},</p>
                      <p>We would like to inform you that your booking appointment cancellation request has been approved by the admin.</p>
                      <div class="info-box">
                        <strong>Appointment Details:</strong><br/>
                        Pet Name: ${updated.pet?.petName || 'Unknown'}<br/>
                        Schedule: ${updated.appointmentDate.toISOString().split('T')[0]} at ${updated.appointmentTime}<br/>
                        Payment Status: Awaiting Verification (Not yet verified)<br/>
                        Status: Cancelled
                      </div>
                      <p>Since your payment was not yet verified by the clinic at the time of cancellation, no refund is applicable. If you believe your payment was already processed, please contact us directly for assistance.</p>
                      <p>Thank you for choosing FurEverPawCare.</p>
                    </div>
                    <div class="footer">
                      <p>&copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>
            `;
            
            await transporter.sendMail({
              from: `"FurEverPawCare Clinic" <${process.env.SMTP_USER || 'fureverpawcareadmin@gmail.com'}>`,
              to: updated.user.email,
              subject: wasPaymentVerified 
                ? 'Appointment Cancellation & Refund Approved - FurEverPawCare'
                : 'Appointment Cancellation Confirmed - FurEverPawCare',
              html: emailHtml
            });
          } catch (e) {
            console.error('[Nodemailer Error] Cancellation approved email dispatch failed:', e);
          }
        })().catch((err) => {
          console.error('[Background Error] Cancellation approved background email dispatch failed:', err);
        });
      }

      // Send User notification — differentiate by payment status
      const wasPaymentVerifiedForNotif = existingApp.status === 'PAID';
      await (prisma as any).notification.create({
        data: {
          userId: updated.userId,
          title: wasPaymentVerifiedForNotif ? 'Cancellation Approved & Refund Initiated' : 'Cancellation Approved',
          message: wasPaymentVerifiedForNotif 
            ? `Your booking appointment cancellation request for ${updated.pet?.petName || 'your pet'} has been approved. Since your payment was verified, please wait 3-5 business days for your refund.`
            : `Your booking appointment cancellation request for ${updated.pet?.petName || 'your pet'} has been approved. As payment was not yet verified, no refund is applicable. Contact us if you have questions.`
        }
      });

      const formatted = {
        id: updated.id,
        owner: updated.user?.fullName || 'Unknown',
        contact: updated.user?.phoneNumber || 'N/A',
        pet: updated.pet?.petName || 'Unknown',
        species: updated.pet?.species || 'N/A',
        breed: updated.pet?.breed || 'N/A',
        date: updated.appointmentDate ? new Date(updated.appointmentDate).toISOString().split('T')[0] : '',
        time: updated.appointmentTime || '',
        type: updated.type || 'inperson',
        purpose: updated.purpose || '',
        status: updated.status?.toLowerCase() || 'pending',
        sessionCode: updated.sessionCode || undefined,
        createdAt: updated.createdAt.toISOString()
      };
      return NextResponse.json({ success: true, appointment: formatted });
    }

    const updateData: any = {};
    if (data.status) {
      updateData.status = 
        data.status.toLowerCase() === 'confirmed' ? 'CONFIRMED' : 
        data.status.toLowerCase() === 'done' || data.status.toLowerCase() === 'completed' ? 'COMPLETED' : 
        data.status.toLowerCase() === 'cancelled' ? 'CANCELLED' : 
        data.status.toLowerCase() === 'paid' ? 'PAID' : 
        data.status.toLowerCase() === 'declined' ? 'DECLINED' :
        'PENDING';
    }
    if (data.sessionCode !== undefined) updateData.sessionCode = data.sessionCode;
    if (data.date) updateData.appointmentDate = new Date(data.date);
    if (data.time) updateData.appointmentTime = data.time;
    if (data.isArchived !== undefined) updateData.isArchived = data.isArchived;

    // Check if the appointment status is changing to PAID
    let isTransitioningToPaid = false;
    if (updateData.status === 'PAID') {
      if (existingApp && existingApp.status !== 'PAID') {
        isTransitioningToPaid = true;
      }
    }

    // Generate session code if becoming PAID and it's a telemedicine appt
    let generatedSessionCode = '';
    if (isTransitioningToPaid && existingApp) {
      if (existingApp.type === 'telemedicine' && !existingApp.sessionCode && !data.sessionCode) {
        generatedSessionCode = `FC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        updateData.sessionCode = generatedSessionCode;
      }
    }

    const updatedAppointment: any = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        pet: true,
        payments: true
      }
    });

    if (isTransitioningToPaid && existingApp) {
      // 1. Find or create invoice in billing.json
      const dataFilePath = path.join(process.cwd(), 'billing.json');
      let invoices = [];
      if (fs.existsSync(dataFilePath)) {
        try {
          invoices = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
        } catch (e) {
          invoices = [];
        }
      }

      const payment = updatedAppointment.payments?.[0];
      let fee = updatedAppointment.type === 'telemedicine' ? 800 : 500;
      try {
        const pricesFilePath = path.join(process.cwd(), 'appointment_prices.json');
        if (fs.existsSync(pricesFilePath)) {
          const prices = JSON.parse(fs.readFileSync(pricesFilePath, 'utf-8'));
          if (updatedAppointment.type === 'telemedicine') {
            fee = prices.telemedicine || 800;
          } else {
            fee = prices.inperson || 500;
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic prices in PUT route:', err);
      }
      const amount = payment?.paymentAmount || fee;

      let invoice = invoices.find((inv: any) => inv.appointmentId === id);
      if (invoice) {
        invoice.status = 'paid';
        invoice.emailed = true; // Mark emailed immediately
      } else {
        invoice = {
          id: `INV-${1000 + Math.floor(Math.random() * 9000)}`,
          appointmentId: id,
          clientName: updatedAppointment.user?.fullName || 'Unknown',
          userEmail: updatedAppointment.user?.email || 'guest@furevercare.com',
          date: new Date().toISOString().split('T')[0],
          items: [{
            id: Date.now().toString(),
            name: updatedAppointment.type === 'telemedicine' ? 'Telemedicine Consultation Fee' : 'In-Person Consultation Fee',
            quantity: 1,
            price: amount
          }],
          totalAmount: amount,
          status: 'paid',
          source: updatedAppointment.type === 'telemedicine' ? 'telemedicine' : 'appointment',
          emailed: true // Mark emailed immediately
        };
        invoices.unshift(invoice);
      }

      // Save billing
      fs.writeFileSync(dataFilePath, JSON.stringify(invoices, null, 2));

      // 2. Build the notification/SMS message first
      const userEmail = updatedAppointment.user?.email;
      const userPhone = updatedAppointment.user?.phoneNumber;
      const clientName = invoice.clientName;
      const invoiceId = invoice.id;
      const invoiceDate = invoice.date;
      const invoiceTotal = invoice.totalAmount;
      const itemsCopy = [...invoice.items];

      const sCode = updatedAppointment.sessionCode || generatedSessionCode;
      const apptDate = updatedAppointment.appointmentDate
        ? new Date(updatedAppointment.appointmentDate).toISOString().split('T')[0]
        : 'your scheduled date';
      const petName = updatedAppointment.pet?.petName || 'your pet';
      let paidMsg = `Your payment for the appointment of ${petName} on ${apptDate} has been verified by the clinic. Your official receipt has been sent to your email.`;
      if (updatedAppointment.type === 'telemedicine') {
        paidMsg = `Your payment for the telemedicine appointment of ${petName} on ${apptDate} has been verified. Your unique session code is: ${sCode || 'N/A'}. Please enter this in the app at your scheduled time. Your receipt has been sent to your email.`;
      }

      // ── STEP 3: Create in-app notification SYNCHRONOUSLY before response ──
      // IMPORTANT: Must NOT be inside a fire-and-forget IIFE. With pgbouncer in
      // transaction mode, the DB connection is released when the HTTP response is
      // flushed — async IIFE DB writes execute AFTER that and fail silently.
      try {
        await (prisma as any).notification.create({
          data: {
            userId: updatedAppointment.userId,
            title: 'Payment Verified',
            message: paidMsg,
            isRead: false
          }
        });
        console.log(`[Notification] "Payment Verified" created for userId=${updatedAppointment.userId}`);
      } catch (notifErr) {
        console.error('[Notification] Failed to create payment verified notification:', notifErr);
      }

      // ── STEP 4: Send SMS in background — non-blocking (Twilio API takes 1-3s) ──
      if (userPhone) {
        sendSMS(userPhone, paidMsg).catch((smsErr) => {
          console.error('[SMS] Failed to send payment verified SMS:', smsErr);
        });
      }

      // ── STEP 5: Send email receipt — fire-and-forget (SMTP is slow, ~1-3s) ──
      if (userEmail) {
        const capturedEmail = userEmail;
        (async () => {
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

            const itemsHtml = itemsCopy.map((item: any) => `
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
                    body { font-family: 'Outfit', 'Inter', sans-serif; background-color: #f7fafc; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0; }
                    .header { background: linear-gradient(135deg, #2E5E3E 0%, #1c3d27 100%); padding: 32px; text-align: center; color: #ffffff; }
                    .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
                    .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
                    .body { padding: 40px; }
                    .greeting { font-size: 18px; color: #2d3748; margin-bottom: 24px; font-weight: 600; }
                    .details-box { background-color: #f7fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #edf2f7; }
                    .badge { background-color: #C6F6D5; color: #22543D; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background-color: #edf2f7; padding: 12px; font-size: 12px; text-transform: uppercase; color: #718096; font-weight: 700; }
                    .total-section { border-top: 2px solid #edf2f7; padding-top: 20px; text-align: right; }
                    .total-amount { font-size: 24px; font-weight: 700; color: #2E5E3E; }
                    .footer { background-color: #edf2f7; padding: 24px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #edf2f7; }
                    .footer a { color: #2E5E3E; text-decoration: none; font-weight: 600; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>FurEverPawCare Clinic</h1>
                      <p>Professional Care For Your Beloved Companions</p>
                    </div>
                    <div class="body">
                      <div class="greeting">Hi ${clientName || 'Valued Customer'},</div>
                      <p style="color: #4a5568; line-height: 1.6; margin-bottom: 24px;">Thank you for your trust at FurEverPawCare! Your payment has been successfully verified by our clinic.</p>
                      <div class="details-box">
                        <table style="width:100%; margin:0; border:none;" cellpadding="0" cellspacing="0">
                          <tr><td style="color:#718096; font-size:14px; padding-bottom:8px;">Invoice Reference:</td><td style="color:#2d3748; font-size:14px; font-weight:600; text-align:right; padding-bottom:8px;">${invoiceId}</td></tr>
                          <tr><td style="color:#718096; font-size:14px; padding-bottom:8px;">Date Generated:</td><td style="color:#2d3748; font-size:14px; font-weight:600; text-align:right; padding-bottom:8px;">${invoiceDate}</td></tr>
                          <tr><td style="color:#718096; font-size:14px;">Status:</td><td style="text-align:right;"><span class="badge">PAID</span></td></tr>
                        </table>
                      </div>
                      <table style="width:100%;">
                        <thead><tr>
                          <th style="text-align: left; padding: 12px;">Item / Service</th>
                          <th style="text-align: center; padding: 12px;">Qty</th>
                          <th style="text-align: right; padding: 12px;">Unit Price</th>
                          <th style="text-align: right; padding: 12px;">Total</th>
                        </tr></thead>
                        <tbody>${itemsHtml}</tbody>
                      </table>
                      <div class="total-section">
                        <span style="font-size: 14px; color: #718096; font-weight: 600;">Total Paid Amount:</span>
                        <div class="total-amount">₱${Number(invoiceTotal).toFixed(2)}</div>
                      </div>
                    </div>
                    <div class="footer">
                      <p style="margin: 0 0 8px 0;">Questions? Contact us at <a href="mailto:support@fureverpawcare.com">support@fureverpawcare.com</a></p>
                      <p style="margin: 0;">&copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>
            `;

            await transporter.sendMail({
              from: `"FurEverPawCare Clinic" <${process.env.SMTP_USER || 'fureverpawcareadmin@gmail.com'}>`,
              to: capturedEmail,
              subject: `Official Receipt - Invoice ${invoiceId} - FurEverPawCare`,
              html: emailHtml,
            });
            console.log(`[Nodemailer] Receipt sent to ${capturedEmail} for invoice ${invoiceId}`);
          } catch (err) {
            console.error('[Nodemailer] Receipt dispatch failed:', err);
          }
        })().catch((bgErr) => {
          console.error('[Background Email] Unhandled error:', bgErr);
        });
      }


    }

    if ((data.status || data.sessionCode || data.date || data.time || generatedSessionCode) && !isTransitioningToPaid) {
       if (updateData.status === 'DECLINED') {
         const reasonText = data.declineReason ? ` Reason: ${data.declineReason}` : '';
         await (prisma as any).notification.create({
           data: {
             userId: updatedAppointment.userId,
             title: 'Appointment Declined',
             message: `Your ${updatedAppointment.type === 'telemedicine' ? 'telemedicine' : 'in-person'} appointment for ${updatedAppointment.pet?.petName || 'your pet'} scheduled on ${updatedAppointment.appointmentDate ? new Date(updatedAppointment.appointmentDate).toISOString().split('T')[0] : 'N/A'} at ${updatedAppointment.appointmentTime || 'N/A'} has been declined by the clinic.${reasonText} Please book a new appointment or contact us for assistance.`
           }
         });

         // Send email to user's registered email
         if (updatedAppointment.user?.email) {
           const userEmail = updatedAppointment.user.email;
           const userName = updatedAppointment.user.fullName || 'Valued Client';
           const petName = updatedAppointment.pet?.petName || 'your pet';
           const apptDate = updatedAppointment.appointmentDate ? new Date(updatedAppointment.appointmentDate).toISOString().split('T')[0] : 'N/A';
           const apptTime = updatedAppointment.appointmentTime || 'N/A';
           const apptType = updatedAppointment.type === 'telemedicine' ? 'Telemedicine' : 'In-Person';
           const declineReasonMsg = data.declineReason ? data.declineReason : 'No specific reason provided.';

           (async () => {
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

               const emailHtml = `
                 <!DOCTYPE html>
                 <html>
                   <head>
                     <meta charset="utf-8">
                     <title>Appointment Declined</title>
                     <style>
                       @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
                       body {
                         font-family: 'Outfit', sans-serif;
                         background-color: #f7fafc;
                         margin: 0;
                         padding: 0;
                       }
                       .container {
                         max-width: 600px;
                         margin: 40px auto;
                         background-color: #ffffff;
                         border-radius: 16px;
                         box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                         overflow: hidden;
                         border: 1px solid #e2e8f0;
                       }
                       .header {
                         background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
                         padding: 32px;
                         text-align: center;
                         color: #ffffff;
                       }
                       .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
                       .body { padding: 40px; color: #4a5568; line-height: 1.6; }
                       .details-box {
                         background-color: #fff5f5;
                         border-left: 4px solid #e53e3e;
                         padding: 15px;
                         border-radius: 4px;
                         margin: 20px 0;
                       }
                       .reason-box {
                         background-color: #edf2f7;
                         border-left: 4px solid #4a5568;
                         padding: 15px;
                         border-radius: 4px;
                         margin: 20px 0;
                       }
                       .footer {
                         background-color: #edf2f7;
                         padding: 24px;
                         text-align: center;
                         font-size: 12px;
                         color: #718096;
                       }
                       .btn-rebook {
                         display: inline-block;
                         background: #2E5E3E;
                         color: #ffffff !important;
                         padding: 12px 24px;
                         border-radius: 30px;
                         text-decoration: none;
                         font-weight: 600;
                         margin-top: 15px;
                         transition: all 0.3s ease;
                       }
                     </style>
                   </head>
                   <body>
                     <div class="container">
                       <div class="header">
                         <h1>Appointment Declined</h1>
                       </div>
                       <div class="body">
                         <p>Dear ${userName},</p>
                         <p>We regret to inform you that your appointment request at FurEverPawCare Clinic has been declined by our administration team.</p>
                         
                         <div class="details-box">
                           <strong>Declined Appointment Details:</strong><br/>
                           Pet Name: ${petName}<br/>
                           Schedule: ${apptDate} at ${apptTime}<br/>
                           Type: ${apptType}
                         </div>

                         <div class="reason-box">
                           <strong>Reason for Decline:</strong><br/>
                           ${declineReasonMsg}
                         </div>

                         <p>If you'd like to schedule another appointment, please click the button below to log back in and schedule a new slot.</p>
                         <div style="text-align: center;">
                           <a href="http://localhost:3000" class="btn-rebook" style="color: #ffffff;">Schedule New Appointment</a>
                         </div>
                         <p>Thank you for your understanding. Please reach out to us if you need further assistance.</p>
                       </div>
                       <div class="footer">
                         <p>If you have any questions, please contact our support at <a href="mailto:support@fureverpawcare.com">support@fureverpawcare.com</a></p>
                         <p>&copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.</p>
                       </div>
                     </div>
                   </body>
                 </html>
               `;

               await transporter.sendMail({
                 from: `"FurEverPawCare Clinic" <${process.env.SMTP_USER || 'fureverpawcareadmin@gmail.com'}>`,
                 to: userEmail,
                 subject: 'Appointment Declined - FurEverPawCare',
                 html: emailHtml
               });
               console.log(`[Nodemailer] Decline email successfully sent to ${userEmail}`);
             } catch (e) {
               console.error('[Nodemailer Error] Decline email dispatch failed:', e);
             }
           })().catch((err) => {
             console.error('[Background Error] Decline background email dispatch failed:', err);
           });
         }
       } else {
         let msg = `Your ${updatedAppointment.type} appointment for ${updatedAppointment.pet?.petName || 'your pet'} has been updated. Status: ${updatedAppointment.status}.`;
         if (generatedSessionCode) {
           msg += ` Your telemedicine session code is: ${generatedSessionCode}. Please enter this in the mobile app at your scheduled time.`;
         }
         await (prisma as any).notification.create({
           data: {
             userId: updatedAppointment.userId,
             title: 'Appointment Updated',
             message: msg
           }
         });
       }
    }

    const payment = updatedAppointment.payments?.[0];
    const formattedAppointment = {
        id: updatedAppointment.id,
        owner: updatedAppointment.user?.fullName || 'Unknown',
        contact: updatedAppointment.user?.phoneNumber || 'N/A',
        pet: updatedAppointment.pet?.petName || 'Unknown',
        species: updatedAppointment.pet?.species || 'N/A',
        breed: updatedAppointment.pet?.breed || 'N/A',
        date: updatedAppointment.appointmentDate ? new Date(updatedAppointment.appointmentDate).toISOString().split('T')[0] : '',
        time: updatedAppointment.appointmentTime || '',
        type: updatedAppointment.type || 'inperson',
        purpose: updatedAppointment.purpose || '',
        status: updatedAppointment.status?.toLowerCase() || 'pending',
        sessionCode: updatedAppointment.sessionCode || undefined,
        referenceNumber: payment?.referenceNumber || undefined,
        amountPaid: payment?.paymentAmount || undefined,
        receiptImage: payment?.receiptImage || undefined,
        isArchived: updatedAppointment.isArchived,
        createdAt: updatedAppointment.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, appointment: formattedAppointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    await prisma.appointment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
