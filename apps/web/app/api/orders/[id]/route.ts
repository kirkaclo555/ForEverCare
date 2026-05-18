import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

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
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
