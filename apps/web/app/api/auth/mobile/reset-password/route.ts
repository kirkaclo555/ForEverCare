import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, identifier, code, newPassword } = body;

    if ((!userId && !identifier) || !code || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Retrieve the user from database
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
    }

    // Fallback: look up by email or phone
    if (!user && identifier) {
      const digits = String(identifier).replace(/\D/g, '');
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: String(identifier).trim().toLowerCase() },
            { phoneNumber: identifier.trim() },
            { phoneNumber: digits },
          ]
        }
      });
    }

    const trimmedCode = code ? String(code).trim() : '';

    if (!user || !user.resetCode) {
      return NextResponse.json({ error: 'Verification code not found or expired. Please request a new one.' }, { status: 400 });
    }

    if (!user.resetCodeExpiry || new Date() > user.resetCodeExpiry) {
      // Clear expired code
      await prisma.user.update({
        where: { id: user.id },
        data: { resetCode: null, resetCodeExpiry: null }
      });
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    if (user.resetCode.trim() !== trimmedCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Code is valid! Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset code in the database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        profileImage: updatedUser.profileImage || null,
        language: updatedUser.language || 'en',
      }
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

