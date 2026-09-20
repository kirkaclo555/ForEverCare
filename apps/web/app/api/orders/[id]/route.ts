import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const billingFilePath = path.join(process.cwd(), 'billing.json');

export const dynamic = 'force-dynamic';

function autoCreateInvoiceForOrder(order: any) {
  try {
    let invoices = [];
    if (fs.existsSync(billingFilePath)) {
      try {
        invoices = JSON.parse(fs.readFileSync(billingFilePath, 'utf-8'));
      } catch (e) {
        invoices = [];
      }
    }
    
    // Check if an invoice for this order already exists to prevent duplicate generation
    const exists = invoices.some((inv: any) => inv.orderId === order.id);
    if (exists) return;

    const invoiceItems = order.items.map((item: any) => ({
      id: item.id,
      name: item.product.productName,
      quantity: item.quantity,
      price: item.product.price
    }));

    const newInvoice = {
      id: `INV-${1000 + Math.floor(Math.random() * 9000)}`,
      orderId: order.id,
      clientName: order.user.fullName,
      userEmail: order.user.email,
      date: new Date().toISOString().split('T')[0],
      items: invoiceItems,
      totalAmount: order.totalAmount,
      status: 'pending',
      source: 'product'
    };

    invoices = [newInvoice, ...invoices];
    fs.writeFileSync(billingFilePath, JSON.stringify(invoices, null, 2));
    console.log(`Successfully auto-created invoice ${newInvoice.id} for order ${order.id}`);
  } catch (err) {
    console.error('Error auto-creating invoice:', err);
  }
}

function sendOrderProcessingEmail(order: any) {
  try {
    const userEmail = order.user?.email;
    const userName = order.user?.fullName || 'Valued Customer';

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

    const itemsHtml = order.items.map((item: any) => {
      const productName = item.product?.productName || 'Product';
      return `
        <tr>
          <td style="padding: 10px 16px; border-bottom: 1px solid #edf2f7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #4a5568;">${productName}</td>
          <td style="padding: 10px 16px; border-bottom: 1px solid #edf2f7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #4a5568; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 16px; border-bottom: 1px solid #edf2f7; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #2d3748; text-align: right; font-weight: 600;">&#8369;${item.subtotal.toFixed(2)}</td>
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

    transporter.sendMail({
      from: `"FurEverPawCare" <${smtpUser}>`,
      to: userEmail,
      subject: `Order #${order.id.substring(0, 8).toUpperCase()} is Being Processed - FurEverPawCare`,
      html: emailHtml
    }).then(() => {
      console.log(`[Email] Order processing email sent to ${userEmail}`);
    }).catch((emailErr: any) => {
      console.error('[Email Error] Failed to send processing email:', emailErr);
    });

  } catch (err) {
    console.error('[Email Error] sendOrderProcessingEmail failed:', err);
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
      autoCreateInvoiceForOrder(updatedOrder);
      
      // Auto-create notification for the user
      try {
        await prisma.notification.create({
          data: {
            userId: updatedOrder.userId,
            title: status === 'PROCESSING' ? "Order Processed" : "Order Completed",
            message: status === 'PROCESSING'
              ? `your order is being processed, please wait for the email confirmation and invoice sent via email`
              : `Your order of ₱${updatedOrder.totalAmount.toFixed(2)} has been successfully picked up. Thank you!`,
            isRead: false
          }
        });
        console.log(`Successfully created notification for user ${updatedOrder.userId}`);
      } catch (notifErr) {
        console.error('Error creating notification:', notifErr);
      }

      // Send email when order is moved to PROCESSING
      if (status === 'PROCESSING') {
        sendOrderProcessingEmail(updatedOrder);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
