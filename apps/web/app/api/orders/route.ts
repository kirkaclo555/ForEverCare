import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereClause = {};
    if (status) {
      whereClause = { status };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
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
    const { items, totalAmount, paymentMethod, deliveryAddress, userId } = body;

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
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
