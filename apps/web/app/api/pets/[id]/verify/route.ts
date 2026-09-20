import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { verifiedBy } = body;

    if (!id) {
      return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 });
    }

    const existingPet = await (prisma.pet as any).findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingPet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    const updatedPet = await (prisma.pet as any).update({
      where: { id },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: verifiedBy || 'Clinic Admin'
      }
    });

    // Create notification for owner
    if (existingPet.userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: existingPet.userId,
            title: 'Pet Verified at Clinic! 🎉',
            message: `${existingPet.petName} has been verified by the clinic staff. Pet health monitoring is now fully unlocked for this pet!`
          }
        });
      } catch (notifErr) {
        console.error('Failed to create notification for pet verification:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${existingPet.petName} verified successfully.`,
      pet: updatedPet
    });
  } catch (error: any) {
    console.error('Error verifying pet:', error);
    return NextResponse.json(
      { error: 'Failed to verify pet', details: error?.message },
      { status: 500 }
    );
  }
}
