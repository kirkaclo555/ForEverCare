import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';


export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
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

    return NextResponse.json({ message: 'Code verified successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error in verify-code API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
