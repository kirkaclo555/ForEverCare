import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const billingFilePath = path.join(process.cwd(), 'billing.json');

export const dynamic = 'force-dynamic';

function autoCreateInvoiceForOrder(order: any): string | null {
  try {
    let invoices: any[] = [];
    if (fs.existsSync(billingFilePath)) {
      try {
        invoices = JSON.parse(fs.readFileSync(billingFilePath, 'utf-8'));
      } catch (e) {
        invoices = [];
      }
    }
    
    const isPaidStatus = order.status === 'DELIVERED' || order.status === 'COMPLETED';
    const existingIndex = invoices.findIndex((inv: any) => inv.orderId === order.id);

    if (existingIndex !== -1) {
      let changed = false;
      if (isPaidStatus && invoices[existingIndex].status !== 'paid') {
        invoices[existingIndex].status = 'paid';
        changed = true;
      }
      if (order.user?.email && (!invoices[existingIndex].userEmail || invoices[existingIndex].userEmail === '')) {
        invoices[existingIndex].userEmail = order.user.email;
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(billingFilePath, JSON.stringify(invoices, null, 2));
      }
      return invoices[existingIndex].id;
    }

    const invoiceItems = (order.items || []).map((item: any) => ({
      id: item.id,
      name: item.product?.productName || 'Product',
      quantity: item.quantity,
      price: item.product?.price ?? (item.quantity ? item.subtotal / item.quantity : item.subtotal)
    }));

    const newInvoice = {
      id: `INV-${1000 + Math.floor(Math.random() * 9000)}`,
      orderId: order.id,
      clientName: order.user?.fullName || 'Valued Customer',
      userEmail: order.user?.email || '',
      date: new Date().toISOString().split('T')[0],
      items: invoiceItems,
      totalAmount: order.totalAmount,
      status: isPaidStatus ? 'paid' : 'pending',
      source: 'product'
    };

    invoices = [newInvoice, ...invoices];
    fs.writeFileSync(billingFilePath, JSON.stringify(invoices, null, 2));
    console.log(`Successfully auto-created invoice ${newInvoice.id} for order ${order.id}`);
    return newInvoice.id;
  } catch (err) {
    console.error('Error auto-creating invoice:', err);
    return null;
  }
}

async function sendOrderProcessingEmail(order: any) {
  try {
    let userEmail = order.user?.email;
    let userName = order.user?.fullName || 'Valued Customer';

    if (!userEmail && order.userId) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: order.userId },
          select: { email: true, fullName: true }
        });
        if (dbUser?.email) {
          userEmail = dbUser.email;
          userName = dbUser.fullName || userName;
        }
      } catch (e) {
        console.error('[Email] Failed to lookup user for processing email:', e);
      }
    }

    if (!userEmail || userEmail === 'guest@furevercare.com') return;

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

    const itemsHtml = (order.items || []).map((item: any) => {
      const productName = item.product?.productName || 'Product';
      return `
        <tr>
          <td style="padding: 10px 16px; border-bottom: 1px solid #edf2f7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #4a5568;">${productName}</td>
          <td style="padding: 10px 16px; border-bottom: 1px solid #edf2f7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #4a5568; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 16px; border-bottom: 1px solid #edf2f7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2d3748; text-align: right; font-weight: 600;">&#8369;${(item.subtotal || 0).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const refNumber = order.payments?.[0]?.referenceNumber || 'N/A';

    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f7fafc; padding: 0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2D5016 0%, #3a7d55 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <div style="font-size: 28px; color: white; margin-bottom: 4px;">&#128062;</div>
          <h1 style="margin: 0; font-size: 22px; color: white; font-weight: 700;">FurEverPawCare</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">Veterinary Clinic &amp; Pet Shop</p>
        </div>

        <!-- Body -->
        <div style="background: white; padding: 32px 24px; border-left: 1px solid #edf2f7; border-right: 1px solid #edf2f7;">
          <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #2d3748;">Your Order is Being Processed!</h2>
          <p style="margin: 0 0 20px 0; font-size: 15px; color: #718096; line-height: 1.6;">
            Hi <strong>${userName}</strong>, great news! Our team has received your order and it is now being reviewed.
          </p>

          <!-- Status Badge -->
          <div style="background: #FEF3C7; border: 1px solid #F6E05E; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 600;">
              &#9203; Payment Verification in Progress
            </p>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #92400e; line-height: 1.5;">
              We are currently verifying your payment. Once confirmed, we will prepare your items for in-clinic pick-up and notify you when they are ready.
            </p>
          </div>

          <!-- Order Summary -->
          <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #2d3748; border-bottom: 2px solid #EAF3DE; padding-bottom: 8px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <thead>
              <tr style="background: #f7fafc;">
                <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: 600;">Item</th>
                <th style="padding: 10px 16px; text-align: center; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: 600;">Qty</th>
                <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: 600;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals -->
          <table style="width: 100%; border-collapse: collapse; background: #f7fafc; border-radius: 8px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 16px; font-size: 13px; color: #718096;">Payment Method</td>
              <td style="padding: 10px 16px; font-size: 13px; color: #2d3748; font-weight: 600; text-align: right; text-transform: uppercase;">${order.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 10px 16px; font-size: 13px; color: #718096;">Reference Number</td>
              <td style="padding: 10px 16px; font-size: 13px; color: #e53e3e; font-weight: 600; text-align: right;">${refNumber}</td>
            </tr>
            <tr style="border-top: 1px dashed #cbd5e0;">
              <td style="padding: 12px 16px; font-size: 15px; color: #2d3748; font-weight: 700;">Total Amount</td>
              <td style="padding: 12px 16px; font-size: 18px; color: #2D5016; font-weight: 700; text-align: right;">&#8369;${order.totalAmount.toFixed(2)}</td>
            </tr>
          </table>

          <!-- Order ID -->
          <p style="margin: 0 0 20px 0; font-size: 13px; color: #a0aec0; text-align: center;">
            Order ID: <strong style="color: #4a5568;">#${order.id.substring(0, 8).toUpperCase()}</strong>
          </p>

          <!-- What's Next -->
          <div style="background: #EAF3DE; border-radius: 8px; padding: 16px; margin-bottom: 4px;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #2D5016;">What happens next?</h4>
            <ol style="margin: 0; padding-left: 18px; font-size: 13px; color: #4a5568; line-height: 1.7;">
              <li>Our team verifies your payment details.</li>
              <li>Once verified, we will prepare your items.</li>
              <li>You will receive a notification when your order is ready for in-clinic pick-up.</li>
            </ol>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #2d3748; padding: 20px 24px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 4px 0; font-size: 13px; color: rgba(255,255,255,0.7);">
            Questions? Contact us anytime at our clinic.
          </p>
          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.5);">
            &copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"FurEverPawCare" <${smtpUser}>`,
      to: userEmail,
      subject: `Order #${order.id.substring(0, 8).toUpperCase()} is Being Processed - FurEverPawCare`,
      html: emailHtml
    });
    console.log(`[Email] Order processing email sent to ${userEmail}`);
  } catch (err) {
    console.error('[Email Error] sendOrderProcessingEmail failed:', err);
  }
}

async function sendOrderReadyForPickupEmail(order: any, invoiceId?: string) {
  try {
    let userEmail = order.user?.email;
    let userName = order.user?.fullName || 'Valued Customer';

    // If email is missing, query database directly via userId
    if (!userEmail && order.userId) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: order.userId },
          select: { email: true, fullName: true }
        });
        if (dbUser?.email) {
          userEmail = dbUser.email;
          userName = dbUser.fullName || userName;
        }
      } catch (lookupErr) {
        console.error('[Email] Failed to lookup user for ready-for-pickup email:', lookupErr);
      }
    }

    if (!userEmail || userEmail === 'guest@furevercare.com') {
      console.warn(`[Email] Skipping ready for pick up email — invalid or missing recipient (${userEmail}) for order ${order.id}`);
      return;
    }

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

    const itemsHtml = (order.items || []).map((item: any) => {
      const productName = item.product?.productName || 'Product';
      return `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #edf2f7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2d3748; font-weight: 500;">
            ${productName}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #edf2f7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #4a5568; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #edf2f7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2D5016; text-align: right; font-weight: 600;">
            &#8369;${(item.subtotal || 0).toFixed(2)}
          </td>
        </tr>
      `;
    }).join('');

    const refNumber = order.payments?.[0]?.referenceNumber || 'N/A';
    const orderShortId = order.id.substring(0, 8).toUpperCase();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Order is Ready for Pick-Up</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f5; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                  
                  <!-- Header with Clinic Branding -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e4620 0%, #2E5E3E 50%, #15381d 100%); padding: 36px 28px; text-align: center;">
                      <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: rgba(255,255,255,0.15); border-radius: 12px; font-size: 24px; margin-bottom: 8px;">
                        &#128062;
                      </div>
                      <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 700; letter-spacing: -0.3px;">FurEverPawCare</h1>
                      <p style="margin: 6px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.85); letter-spacing: 0.3px; text-transform: uppercase;">Veterinary Clinic &amp; Pet Shop</p>
                    </td>
                  </tr>

                  <!-- Main Content Area -->
                  <tr>
                    <td style="padding: 36px 28px;">
                      
                      <!-- Ready Banner -->
                      <div style="background: #EAF3DE; border: 1.5px solid #7cb387; border-radius: 12px; padding: 18px 20px; margin-bottom: 26px; text-align: center;">
                        <span style="display: inline-block; background: #2E5E3E; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 10px; border-radius: 99px; margin-bottom: 8px;">
                          &#10003; Ready for In-Clinic Pick-Up
                        </span>
                        <h2 style="margin: 6px 0 4px 0; font-size: 20px; color: #1e4620; font-weight: 700;">
                          Your Order is Ready for Pick-Up!
                        </h2>
                        <p style="margin: 0; font-size: 14px; color: #35543d; line-height: 1.5;">
                          Order <strong>#${orderShortId}</strong> has been prepared and packed. You can now claim your items at our clinic.
                        </p>
                      </div>

                      <!-- Greeting -->
                      <p style="margin: 0 0 16px 0; font-size: 15px; color: #2d3748; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 14px; color: #4a5568; line-height: 1.6;">
                        Thank you for your order with FurEverPawCare! All items have been carefully checked, prepared, and packaged. Please drop by our clinic during operating hours to claim your order.
                      </p>

                      <!-- Pick-up Details Card -->
                      <div style="background: #f8faf9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 26px;">
                        <h3 style="margin: 0 0 14px 0; font-size: 14px; color: #2E5E3E; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                          &#128205; Pick-Up Information
                        </h3>
                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 1.8;">
                          <tr>
                            <td style="color: #718096; width: 40%; vertical-align: top; padding: 4px 0;">Order Reference:</td>
                            <td style="color: #1a202c; font-weight: 700; padding: 4px 0;">#${orderShortId}</td>
                          </tr>
                          ${invoiceId ? `
                          <tr>
                            <td style="color: #718096; vertical-align: top; padding: 4px 0;">Official Invoice:</td>
                            <td style="color: #1a202c; font-weight: 600; padding: 4px 0;">${invoiceId}</td>
                          </tr>` : ''}
                          <tr>
                            <td style="color: #718096; vertical-align: top; padding: 4px 0;">Pick-Up Location:</td>
                            <td style="color: #1a202c; font-weight: 600; padding: 4px 0;">FurEverPawCare Veterinary Clinic</td>
                          </tr>
                          <tr>
                            <td style="color: #718096; vertical-align: top; padding: 4px 0;">Counter:</td>
                            <td style="color: #1a202c; font-weight: 600; padding: 4px 0;">Front Desk / Pharmacy Counter</td>
                          </tr>
                          <tr>
                            <td style="color: #718096; vertical-align: top; padding: 4px 0;">Clinic Hours:</td>
                            <td style="color: #1a202c; font-weight: 600; padding: 4px 0;">Monday – Sunday: 8:00 AM – 7:00 PM</td>
                          </tr>
                          <tr>
                            <td style="color: #718096; vertical-align: top; padding: 4px 0;">Status:</td>
                            <td style="padding: 4px 0;">
                              <span style="background: #DEF7EC; color: #03543F; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">
                                Ready for Pick Up
                              </span>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Order Items Table -->
                      <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #2d3748; font-weight: 700;">
                        Order Items Summary
                      </h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px; border: 1px solid #edf2f7; border-radius: 8px; overflow: hidden;">
                        <thead>
                          <tr style="background: #f7fafc; border-bottom: 1px solid #edf2f7;">
                            <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: 700;">Item</th>
                            <th style="padding: 10px 16px; text-align: center; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: 700;">Qty</th>
                            <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #718096; text-transform: uppercase; font-weight: 700;">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                      </table>

                      <!-- Totals & Payment Details -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8faf9; border-radius: 10px; border: 1px solid #edf2f7; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 10px 16px; font-size: 13px; color: #718096;">Payment Method</td>
                          <td style="padding: 10px 16px; font-size: 13px; color: #2d3748; font-weight: 600; text-align: right; text-transform: uppercase;">${order.paymentMethod || 'N/A'}</td>
                        </tr>
                        ${refNumber !== 'N/A' ? `
                        <tr>
                          <td style="padding: 10px 16px; font-size: 13px; color: #718096;">Reference Number</td>
                          <td style="padding: 10px 16px; font-size: 13px; color: #2b6cb0; font-weight: 600; text-align: right;">${refNumber}</td>
                        </tr>` : ''}
                        <tr style="border-top: 1px dashed #cbd5e0;">
                          <td style="padding: 14px 16px; font-size: 15px; color: #2d3748; font-weight: 700;">Total Amount</td>
                          <td style="padding: 14px 16px; font-size: 20px; color: #2E5E3E; font-weight: 800; text-align: right;">&#8369;${Number(order.totalAmount || 0).toFixed(2)}</td>
                        </tr>
                      </table>

                      <!-- How to Claim Notice -->
                      <div style="background: #FFFBEB; border-left: 4px solid #D97706; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 13px; color: #92400E; line-height: 1.6;">
                          <strong>&#128161; What to present:</strong> Please show your Order ID (<strong>#${orderShortId}</strong>) or this email notification to our clinic receptionist when claiming your package.
                        </p>
                      </div>

                      <p style="margin: 0; font-size: 13px; color: #718096; line-height: 1.5;">
                        If you have any questions or need special arrangements regarding your pick-up, please feel free to reach out to our clinic.
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #1c3d27; padding: 24px; text-align: center; border-radius: 0 0 16px 16px;">
                      <p style="margin: 0 0 6px 0; font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500;">
                        FurEverPawCare Veterinary Clinic
                      </p>
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(255,255,255,0.65);">
                        Dedicated to providing compassionate healthcare and quality products for your pets.
                      </p>
                      <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.45);">
                        &copy; ${new Date().getFullYear()} FurEverPawCare. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"FurEverPawCare" <${smtpUser}>`,
      to: userEmail,
      subject: `🐾 Your Order #${orderShortId} is Ready for Pick-Up! - FurEverPawCare`,
      html: emailHtml
    });

    console.log(`[Email] Ready for pick-up email successfully sent to ${userEmail} for order ${order.id}`);
  } catch (err) {
    console.error('[Email Error] sendOrderReadyForPickupEmail failed:', err);
  }
}

async function sendOrderCompletedEmail(order: any, invoiceId?: string) {
  try {
    let userEmail = order.user?.email;
    let userName = order.user?.fullName || 'Valued Customer';

    if (!userEmail && order.userId) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: order.userId },
          select: { email: true, fullName: true }
        });
        if (dbUser?.email) {
          userEmail = dbUser.email;
          userName = dbUser.fullName || userName;
        }
      } catch (lookupErr) {
        console.error('[Email] Failed to lookup user for completed email:', lookupErr);
      }
    }

    if (!userEmail || userEmail === 'guest@furevercare.com') return;

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

    const orderShortId = order.id.substring(0, 8).toUpperCase();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Picked Up - FurEverPawCare</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f7f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7f5; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e4620 0%, #2E5E3E 100%); padding: 32px 24px; text-align: center;">
                      <div style="font-size: 28px; margin-bottom: 6px;">&#128062;</div>
                      <h1 style="margin: 0; font-size: 22px; color: white; font-weight: 700;">FurEverPawCare</h1>
                      <p style="margin: 4px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.85);">Veterinary Clinic &amp; Pet Shop</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 24px;">
                      <div style="background: #EAF3DE; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 22px;">
                        <span style="font-size: 12px; font-weight: 700; color: #2E5E3E; text-transform: uppercase;">&#10004; Order Completed</span>
                        <h2 style="margin: 6px 0 0 0; font-size: 19px; color: #1e4620;">Thank You for Your Purchase!</h2>
                      </div>
                      <p style="margin: 0 0 16px 0; font-size: 15px; color: #2d3748; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 14px; color: #4a5568; line-height: 1.6;">
                        Your order <strong>#${orderShortId}</strong> (Total: &#8369;${Number(order.totalAmount || 0).toFixed(2)}) has been successfully picked up from FurEverPawCare clinic. We hope your pets enjoy their products!
                      </p>
                      ${invoiceId ? `
                      <p style="margin: 0 0 20px 0; font-size: 13px; color: #718096;">
                        Official Invoice Reference: <strong>${invoiceId}</strong>
                      </p>` : ''}
                      <p style="margin: 0; font-size: 13px; color: #718096; line-height: 1.6;">
                        If you have any questions or need guidance on medications or pet care, please do not hesitate to contact our clinic team.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background: #1c3d27; padding: 20px; text-align: center; border-radius: 0 0 16px 16px;">
                      <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.65);">
                        &copy; ${new Date().getFullYear()} FurEverPawCare Clinic. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"FurEverPawCare" <${smtpUser}>`,
      to: userEmail,
      subject: `Order #${orderShortId} Completed - Thank You! - FurEverPawCare`,
      html: emailHtml
    });

    console.log(`[Email] Order completed email sent to ${userEmail} for order ${order.id}`);
  } catch (err) {
    console.error('[Email Error] sendOrderCompletedEmail failed:', err);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Fetch the current order to check its status
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Begin a transaction to update order and adjust stock
    const transaction = [];

    // Update order status
    transaction.push(
      prisma.order.update({
        where: { id },
        data: { status }
      })
    );

    // If moving from PENDING to PROCESSING or DELIVERED, decrement stock
    // Only do this if it wasn't already processed to prevent double decrementing
    if (existingOrder.status === 'PENDING' && (status === 'PROCESSING' || status === 'COMPLETED' || status === 'DELIVERED')) {
      for (const item of existingOrder.items) {
        transaction.push(
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity
              }
            }
          })
        );
      }
    }

    // Execute the transaction
    await prisma.$transaction(transaction);

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        payments: true,
      }
    });

    if (updatedOrder && (status === 'PROCESSING' || status === 'COMPLETED' || status === 'DELIVERED')) {
      const invoiceId = autoCreateInvoiceForOrder(updatedOrder);
      
      // Auto-create notification for the user
      try {
        let notifTitle = "Order Updated";
        let notifMessage = `Your order #${updatedOrder.id.slice(0, 8).toUpperCase()} status has been updated to ${status}.`;

        if (status === 'PROCESSING') {
          notifTitle = "Order Being Processed";
          notifMessage = `Your order #${updatedOrder.id.slice(0, 8).toUpperCase()} is being processed. We are preparing your items for pick-up.`;
        } else if (status === 'DELIVERED') {
          notifTitle = "Order Ready for Pick Up";
          notifMessage = `Great news! Your order #${updatedOrder.id.slice(0, 8).toUpperCase()} is ready for pick-up at FurEverPawCare clinic.`;
        } else if (status === 'COMPLETED') {
          notifTitle = "Order Completed";
          notifMessage = `Your order #${updatedOrder.id.slice(0, 8).toUpperCase()} (₱${updatedOrder.totalAmount.toFixed(2)}) has been claimed. Thank you for choosing FurEverPawCare!`;
        }

        await prisma.notification.create({
          data: {
            userId: updatedOrder.userId,
            title: notifTitle,
            message: notifMessage,
            isRead: false
          }
        });
        console.log(`Successfully created notification for user ${updatedOrder.userId}: ${notifTitle}`);
      } catch (notifErr) {
        console.error('Error creating notification:', notifErr);
      }

      // Send email according to status
      if (status === 'PROCESSING') {
        sendOrderProcessingEmail(updatedOrder).catch(err => console.error('[Email Error] Processing email:', err));
      } else if (status === 'DELIVERED') {
        sendOrderReadyForPickupEmail(updatedOrder, invoiceId || undefined).catch(err => console.error('[Email Error] Ready for pickup email:', err));
      } else if (status === 'COMPLETED') {
        sendOrderCompletedEmail(updatedOrder, invoiceId || undefined).catch(err => console.error('[Email Error] Completed email:', err));
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
