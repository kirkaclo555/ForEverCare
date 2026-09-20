import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const feedbacks = await prisma.feedback.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { submittedAt: 'desc' },
      include: {
        user: true,
      },
    });
    return NextResponse.json({ success: true, feedbacks });
  } catch (error: any) {
    console.error('Failed to fetch feedback:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, rating, category, comments } = body;

    if (!userId || !rating) {
      return NextResponse.json({ success: false, error: 'Missing userId or rating' }, { status: 400 });
    }

    // Format category inside comments to store it safely without breaking schema constraints
    const formattedComments = `[${category || 'Other'}] ${comments || ''}`;

    const newFeedback = await prisma.feedback.create({
      data: {
        userId,
        rating: parseInt(rating, 10),
        comments: formattedComments,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error: any) {
    console.error('Failed to save feedback:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { feedbackId, userId, rating, category, comments } = body;

    if (!feedbackId || !userId || !rating) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Ownership check — ensure this feedback belongs to the user
    const existing = await prisma.feedback.findFirst({
      where: { id: feedbackId, userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Feedback not found or access denied' }, { status: 404 });
    }

    const formattedComments = `[${category || 'Other'}] ${comments || ''}`;

    const updated = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        rating: parseInt(rating, 10),
        comments: formattedComments,
      },
      include: { user: true },
    });

    return NextResponse.json({ success: true, feedback: updated });
  } catch (error: any) {
    console.error('Failed to update feedback:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

