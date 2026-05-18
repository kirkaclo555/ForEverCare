import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, code, newPassword } = body;

    if (!userId || !code || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Retrieve the user from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.resetCode) {
      return NextResponse.json({ error: 'Verification code not found or expired. Please request a new one.' }, { status: 400 });
    }

    if (!user.resetCodeExpiry || new Date() > user.resetCodeExpiry) {
      // Clear expired code
      await prisma.user.update({
        where: { id: userId },
        data: { resetCode: null, resetCodeExpiry: null }
      });
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    if (user.resetCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Code is valid! Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset code in the database
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null
      }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

