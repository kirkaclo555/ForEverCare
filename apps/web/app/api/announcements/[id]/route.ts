import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { AnnouncementStatus } from '@prisma/client';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { title, content, status } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        status: status === 'draft' ? AnnouncementStatus.DRAFT : AnnouncementStatus.PUBLISHED
      }
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error: any) {
    console.error("Failed to update announcement:", error);
    return NextResponse.json({ error: 'Failed to update announcement', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    await prisma.announcement.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete announcement:", error);
    return NextResponse.json({ error: 'Failed to delete announcement', details: error.message }, { status: 500 });
  }
}
