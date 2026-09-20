import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

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
      take: 200, // Fetch more to allow room for deduplication
      select: {
        id: true,
        userId: true,
        title: true,
        message: true,
        isRead: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        }
      }
    });

    // Deduplicate by title, message, and rounded timestamp (within 5 seconds)
    const uniqueNotifications: any[] = [];
    const seen = new Set<string>();

    for (const notif of notifications) {
      const timeBucket = Math.round(new Date(notif.createdAt).getTime() / 5000);
      const key = `${notif.title}|${notif.message}|${timeBucket}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueNotifications.push(notif);
      } else {
        // If we find a duplicate that is read, and the one we kept is unread,
        // let's make sure the kept one reflects the read status.
        const existingIndex = uniqueNotifications.findIndex(n => {
          const tBucket = Math.round(new Date(n.createdAt).getTime() / 5000);
          return n.title === notif.title && n.message === notif.message && tBucket === timeBucket;
        });
        if (existingIndex !== -1 && notif.isRead) {
          uniqueNotifications[existingIndex].isRead = true;
        }
      }
    }

    // Limit to 50 items after deduplication
    const finalNotifications = uniqueNotifications.slice(0, 50);

    return NextResponse.json({ success: true, notifications: finalNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    if (data.action === 'markAllRead') {
       if (data.userId) {
         await prisma.notification.updateMany({
           where: { userId: data.userId, isRead: false },
           data: { isRead: true }
         });
         return NextResponse.json({ success: true });
       } else if (data.role) {
         await prisma.notification.updateMany({
           where: { user: { role: data.role }, isRead: false },
           data: { isRead: true }
         });
         return NextResponse.json({ success: true });
       }
    }

    if (!data.id) {
       return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const notif = await prisma.notification.findUnique({
      where: { id: data.id }
    });

    if (!notif) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Update the notification itself
    const updated = await prisma.notification.update({
      where: { id: data.id },
      data: { isRead: true }
    });

    // Also update any duplicates created around the same time (within 5 seconds)
    const timeLimitStart = new Date(notif.createdAt.getTime() - 5000);
    const timeLimitEnd = new Date(notif.createdAt.getTime() + 5000);

    await prisma.notification.updateMany({
      where: {
        title: notif.title,
        message: notif.message,
        createdAt: {
          gte: timeLimitStart,
          lte: timeLimitEnd
        },
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, notification: updated });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
