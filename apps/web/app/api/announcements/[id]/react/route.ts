import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { ReactionType } from '@prisma/client';


export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { userId, type } = body; // type is 'HEART' or 'LIKE'

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing userId or type' }, { status: 400 });
    }

    const validTypes = ['HEART', 'LIKE'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    // Check if the user has already reacted to this announcement
    const existingReaction = await prisma.announcementReaction.findUnique({
      where: {
        userId_announcementId: {
          userId,
          announcementId: id
        }
      }
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Toggle off (remove reaction) if clicking the same one
        await prisma.announcementReaction.delete({
          where: { id: existingReaction.id }
        });
        return NextResponse.json({ success: true, action: 'removed' });
      } else {
        // Change reaction type
        await prisma.announcementReaction.update({
          where: { id: existingReaction.id },
          data: { type: type as ReactionType }
        });
        return NextResponse.json({ success: true, action: 'updated' });
      }
    } else {
      // Create new reaction
      await prisma.announcementReaction.create({
        data: {
          userId,
          announcementId: id,
          type: type as ReactionType
        }
      });
      return NextResponse.json({ success: true, action: 'added' });
    }

  } catch (error) {
    console.error("Failed to react to announcement:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
