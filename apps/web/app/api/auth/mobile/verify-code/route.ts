import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, code } = body;

    if (!userId || !code) {
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

    // Code is valid
    return NextResponse.json({ success: true, message: 'Code verified successfully' });

  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
