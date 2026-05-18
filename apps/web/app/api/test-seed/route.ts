import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const pet = await prisma.pet.findFirst({ include: { user: true } });
    if (!pet) {
      return NextResponse.json({ error: 'No pet found to associate with test report' });
    }

    const report = await prisma.petMonitoring.create({
      data: {
        petId: pet.id,
        symptoms: 'Test Symptom from seed script',
        behaviorChanges: 'Test Behavior',
        activityChanges: 'Test Activity',
        reportSummary: 'Test Summary',
        recommendations: 'Monitor closely',
      }
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
