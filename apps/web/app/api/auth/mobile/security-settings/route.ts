import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';


// Get security settings
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        recoveryPhone: true,
        twoFactorEnabled: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Fetch security settings error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update security settings (recoveryPhone or twoFactorEnabled)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, recoveryPhone, twoFactorEnabled } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (recoveryPhone !== undefined) dataToUpdate.recoveryPhone = recoveryPhone;
    if (twoFactorEnabled !== undefined) dataToUpdate.twoFactorEnabled = twoFactorEnabled;

    const user = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        recoveryPhone: true,
        twoFactorEnabled: true
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update security settings error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
