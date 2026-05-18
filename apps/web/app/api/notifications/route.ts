import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId && !role) {
      return NextResponse.json({ error: 'User ID or role is required' }, { status: 400 });
    }

    let queryWhere: any = {};
    if (userId) {
      queryWhere = { userId };
    } else if (role) {
      queryWhere = { user: { role: role } };
    }

    const notifications = await prisma.notification.findMany({
      where: queryWhere,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: true }
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    if (data.action === 'markAllRead' && data.userId) {
       await prisma.notification.updateMany({
         where: { userId: data.userId, isRead: false },
         data: { isRead: true }
       });
       return NextResponse.json({ success: true });
    }

    if (!data.id) {
       return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: { id: data.id },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, notification: updated });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
