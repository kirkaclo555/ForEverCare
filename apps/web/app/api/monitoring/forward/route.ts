import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 });
    }

    const updatedReport = await prisma.petMonitoring.update({
      where: { id: reportId },
      data: {
        isForwarded: true,
        forwardedAt: new Date(),
      },
      include: {
        pet: true,
      }
    });

    // Notify Superadmins about the forwarded report
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' }
    });

    const notifications = superAdmins.map(admin => ({
      userId: admin.id,
      title: 'Report Forwarded',
      message: `A pet health report for ${updatedReport.pet.petName} was forwarded to you.`,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    return NextResponse.json({ success: true, report: updatedReport }, { status: 200 });
  } catch (error: any) {
    console.error('Error forwarding report:', error);
    return NextResponse.json({ error: 'Failed to forward report', details: error.message }, { status: 500 });
  }
}
