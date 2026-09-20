import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        address: true,
        profileImage: true,
        language: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage,
        language: user.language
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, fullName, email, phoneNumber, profileImage, language, address } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        phoneNumber,
        profileImage,
        language,
        address
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        profileImage: updatedUser.profileImage,
        language: updatedUser.language
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
