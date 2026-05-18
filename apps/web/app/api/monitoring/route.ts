import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { petId, symptoms, behaviorChanges, activityChanges, recommendations, reportSummary } = body;

    if (!petId) {
      return NextResponse.json({ error: 'petId is required' }, { status: 400 });
    }

    // Create the monitoring report
    const newReport = await prisma.petMonitoring.create({
      data: {
        petId,
        symptoms,
        behaviorChanges,
        activityChanges,
        recommendations,
        reportSummary,
      },
      include: {
        pet: true,
      }
    });

    // Notify all Admins and Superadmins
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] }
      }
    });

    const notifications = admins.map(admin => ({
      userId: admin.id,
      title: 'New Pet Health Report',
      message: `A new health report was submitted for ${newReport.pet.petName}.`,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    return NextResponse.json({ success: true, report: newReport }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report', details: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // e.g. 'SUPER_ADMIN' or 'ADMIN'

    const reports = await prisma.petMonitoring.findMany({
      include: {
        pet: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let finalReports = reports;

    // If super admin, prioritize forwarded reports
    if (role === 'SUPER_ADMIN') {
      finalReports = reports.sort((a, b) => {
        if (a.isForwarded && !b.isForwarded) return -1;
        if (!a.isForwarded && b.isForwarded) return 1;
        return 0;
      });
    }

    return NextResponse.json({ success: true, reports: finalReports });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports', details: error.message }, { status: 500 });
  }
}
