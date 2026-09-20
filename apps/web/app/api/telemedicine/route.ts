import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbTelemedicine = await prisma.telemedicine.findMany({
      include: {
        pet: true,
        user: true,
        veterinarian: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formatted = dbTelemedicine.map((t) => {
      const dateStr = t.consultationDate 
        ? new Date(t.consultationDate).toISOString().split('T')[0] 
        : new Date(t.createdAt).toISOString().split('T')[0];

      return {
        id: t.id,
        date: dateStr,
        duration: '20 mins', // default duration since it's not stored in DB
        patient: t.pet?.petName || 'Unknown',
        doctor: t.veterinarian?.fullName || 'Dr. Smith',
        status: t.status === 'COMPLETED' ? 'Successful' : t.status === 'CANCELLED' ? 'Cancelled' : 'Pending'
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error fetching telemedicine logs:', error);
    return NextResponse.json({ error: 'Failed to fetch telemedicine logs' }, { status: 500 });
  }
}
