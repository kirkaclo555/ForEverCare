import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { AnnouncementStatus } from '@prisma/client';


export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Fetch announcements with reactions
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reactions: true,
      }
    });

    const formatted = announcements.map(ann => {
      const hearts = ann.reactions.filter(r => r.type === 'HEART').length;
      const likes = ann.reactions.filter(r => r.type === 'LIKE').length;
      
      let userReaction = null;
      if (userId) {
        const reaction = ann.reactions.find(r => r.userId === userId);
        if (reaction) userReaction = reaction.type;
      }

      let cleanContent = ann.content;
      let files: any[] = [];
      let media: any[] = [];

      const parts = ann.content.split('---ATTACHMENTS---');
      const partsFirst = parts[0];
      const partsSecond = parts[1];
      if (partsFirst !== undefined && partsSecond !== undefined) {
        try {
          const attachments = JSON.parse(partsSecond.trim());
          cleanContent = partsFirst.trim();
          files = attachments.files || [];
          media = attachments.media || [];
        } catch (err) {
          // ignore
        }
      }

      // Format media structure to match expected fields (url, name, isImage, isVideo)
      const formattedMedia = media.map((m: any) => {
        const name = m.name || '';
        const url = m.url || '';
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name) || name.toLowerCase().includes('image');
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(name) || name.toLowerCase().includes('video');
        return { name, url, isImage, isVideo };
      });

      return {
        id: ann.id,
        title: ann.title,
        content: cleanContent,
        status: ann.status,
        date: ann.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        hearts,
        likes,
        userReaction,
        files,
        media: formattedMedia
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, status } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content' }, { status: 400 });
    }

    // Find the first available admin or superadmin to assign as the creator
    // In a real app, this would come from the session context
    let admin = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'SUPER_ADMIN' },
          { role: 'ADMIN' }
        ]
      }
    });

    if (!admin) {
        // Fallback if no admin exists
        admin = await prisma.user.create({
            data: {
                fullName: 'System Admin',
                email: 'dummyadmin' + Math.random() + '@furevercare.com',
                password: 'password123',
                role: 'SUPER_ADMIN'
            }
        });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        status: status === 'draft' ? AnnouncementStatus.DRAFT : AnnouncementStatus.PUBLISHED,
        adminId: admin.id
      }
    });

    if (announcement.status === AnnouncementStatus.PUBLISHED) {
      try {
        const targetUsers = await prisma.user.findMany({
          where: {
            role: {
              notIn: ['ADMIN', 'SUPER_ADMIN']
            }
          }
        });

        if (targetUsers.length > 0) {
          const notifications = targetUsers.map(u => ({
            userId: u.id,
            title: `New Announcement: ${title}`,
            message: content.length > 120 ? content.substring(0, 120) + '...' : content
          }));

          await prisma.notification.createMany({
            data: notifications
          });
        }
      } catch (err) {
        console.error("Failed to generate user notifications for announcement:", err);
      }
    }

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
