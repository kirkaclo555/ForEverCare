import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import nodemailer from 'nodemailer';


export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (userId) {
      whereClause.userId = userId;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        userId: true,
        orderDate: true,
        totalAmount: true,
        paymentMethod: true,
        status: true,
        deliveryAddress: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            orderId: true,
            productId: true,
            quantity: true,
            subtotal: true,
            product: {
              select: {
                id: true,
                productName: true,
                price: true,
                productImage: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        payments: {
          select: {
            id: true,
            paymentAmount: true,
            paymentStatus: true,
            paymentDate: true,
            referenceNumber: true,
            receiptImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, items: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, totalAmount, paymentMethod, deliveryAddress, userId, referenceNumber } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
    }

    let orderUserId = userId;

    if (!orderUserId) {
      // Find or create a default guest user for mobile app
      let guestUser = await prisma.user.findFirst({ where: { email: 'guest@furevercare.com' } });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: 'guest@furevercare.com',
            password: 'dummy_password', // won't be used to login
            fullName: 'Walk-in Customer',
            role: 'USER'
          }
        });
      }
      orderUserId = guestUser.id;
    }

    const newOrder = await prisma.order.create({
      data: {
        userId: orderUserId,
        totalAmount: parseFloat(totalAmount) || 0,
        paymentMethod: paymentMethod || 'cash',
        deliveryAddress: deliveryAddress || 'In-Clinic Pick Up',
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            subtotal: parseFloat(item.subtotal) || 0,
          }))
        },
        payments: referenceNumber ? {
          create: {
            paymentAmount: parseFloat(totalAmount) || 0,
            paymentStatus: 'PENDING',
            referenceNumber: referenceNumber
          }
        } : undefined
      },
      include: {
        items: true,
        payments: true
      }
    });

    // Notify Admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } }
    });

    const notifications = admins.map(admin => ({
      userId: admin.id,
      title: 'New Order Received',
      message: `Order #${newOrder.id.substring(0, 8)} placed for ₱${newOrder.totalAmount}. Payment: ${paymentMethod}.`,
      isRead: false
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    // Send Email to User in background
    prisma.user.findUnique({ where: { id: orderUserId } }).then((userForEmail) => {
      if (userForEmail && userForEmail.email && userForEmail.email !== 'guest@furevercare.com') {
        const smtpUser = process.env.SMTP_USER || 'fureverpawcareadmin@gmail.com';
        const smtpPass = process.env.SMTP_PASS || 'xjxw svro yxan hgnj';

        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        transporter.sendMail({
          from: `"FurEverPawCare" <${smtpUser}>`,
          to: userForEmail.email,
          subject: 'Order Confirmation - FurEverPawCare',
          html: `
            <h2>Thank you for your order!</h2>
            <p>Your order <strong>#${newOrder.id.substring(0, 8)}</strong> has been successfully placed.</p>
            <p><strong>Total Amount:</strong> ₱${newOrder.totalAmount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
            <p><strong>Reference Number:</strong> ${referenceNumber || 'N/A'}</p>
            <p>We will process it shortly.</p>
            <br/>
            <p>Regards,<br/>FurEverPawCare Team</p>
          `
        }).catch((emailErr) => {
          console.error('Failed to send confirmation email in background:', emailErr);
        });
      }
    }).catch((queryErr) => {
      console.error('Failed to query user for order email:', queryErr);
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
