import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, videoLink, category } = body;

    if (!title || !videoLink) {
      return NextResponse.json({ success: false, error: 'Missing title or videoLink' }, { status: 400 });
    }

    const updatedTutorial = await prisma.petTutorial.update({
      where: { id },
      data: {
        title,
        description: description || '',
        videoLink,
        category: category || 'Other',
      },
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, tutorial: updatedTutorial });
  } catch (error: any) {
    console.error('Failed to update tutorial:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.petTutorial.delete({
      where: { id }
    });
    return NextResponse.json({ success: true, message: 'Tutorial deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete tutorial:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
