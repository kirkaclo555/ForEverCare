import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!id && !email && !phone) {
      return NextResponse.json({ error: 'User identifier (id, email, or phone) is required' }, { status: 400 });
    }

    let user = null;
    if (id) {
      user = await prisma.user.findUnique({
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
    }

    if (!user && email) {
      user = await prisma.user.findFirst({
        where: { email: email.trim().toLowerCase() },
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
    }

    if (!user && phone) {
      user = await prisma.user.findFirst({
        where: { phoneNumber: phone.trim() },
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
    }

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
    }, { 
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
    });

  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, fullName, email, phoneNumber, profileImage, language, address } = body;

    if (!id && !email && !phoneNumber) {
      return NextResponse.json({ error: 'User ID or identifier is required' }, { status: 400 });
    }

    // Locate existing user
    let existingUser = null;
    if (id) {
      existingUser = await prisma.user.findUnique({ where: { id } });
    }
    if (!existingUser && email) {
      existingUser = await prisma.user.findFirst({ where: { email: email.trim().toLowerCase() } });
    }
    if (!existingUser && phoneNumber) {
      existingUser = await prisma.user.findFirst({ where: { phoneNumber: phoneNumber.trim() } });
    }

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }

    const updateData: any = {};

    if (fullName !== undefined && fullName !== null) {
      const trimmed = String(fullName).trim();
      if (trimmed) updateData.fullName = trimmed;
    }

    if (phoneNumber !== undefined && phoneNumber !== null) {
      const trimmedPhone = String(phoneNumber).trim();
      if (trimmedPhone) updateData.phoneNumber = trimmedPhone;
    }

    if (address !== undefined) {
      updateData.address = address !== null ? String(address).trim() : null;
    }

    if (language !== undefined && language !== null) {
      const trimmedLang = String(language).trim();
      if (trimmedLang) updateData.language = trimmedLang;
    }

    if (profileImage !== undefined && profileImage !== null) {
      const trimmedImg = String(profileImage).trim();
      if (trimmedImg) updateData.profileImage = trimmedImg;
    }

    if (email !== undefined && email !== null) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (cleanEmail && cleanEmail !== existingUser.email.toLowerCase()) {
        const conflict = await prisma.user.findFirst({
          where: {
            email: cleanEmail,
            id: { not: existingUser.id }
          }
        });
        if (conflict) {
          return NextResponse.json({ error: 'This email address is already in use by another account.' }, { status: 409 });
        }
        updateData.email = cleanEmail;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
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
    }, { 
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
    });

  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
