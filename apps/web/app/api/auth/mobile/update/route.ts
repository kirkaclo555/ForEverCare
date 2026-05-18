import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, fullName, email, phoneNumber, profileImage } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        phoneNumber,
        profileImage
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        profileImage: updatedUser.profileImage
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
