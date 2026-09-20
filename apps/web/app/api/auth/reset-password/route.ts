import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';


export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Verify code and expiry
    if (user.resetCode !== code) {
      return NextResponse.json({ message: 'Invalid reset code' }, { status: 400 });
    }

    if (!user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
      return NextResponse.json({ message: 'Reset code has expired' }, { status: 400 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user and clear reset code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error in reset-password API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
