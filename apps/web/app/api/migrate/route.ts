import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, string> = {};

  const statements = [
    {
      name: 'pets.verification_status',
      sql: `ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "verification_status" TEXT DEFAULT 'PENDING';`
    },
    {
      name: 'pets.verified_at',
      sql: `ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP(3);`
    },
    {
      name: 'pets.verified_by',
      sql: `ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "verified_by" TEXT;`
    },
    {
      name: 'pet_monitoring.severity',
      sql: `ALTER TABLE "pet_monitoring" ADD COLUMN IF NOT EXISTS "severity" TEXT DEFAULT 'MILD';`
    },
    {
      name: 'pet_monitoring.monitoring_type',
      sql: `ALTER TABLE "pet_monitoring" ADD COLUMN IF NOT EXISTS "monitoring_type" TEXT DEFAULT 'HOME_MONITORING';`
    },
    {
      name: 'pet_monitoring.behavior_changes',
      sql: `ALTER TABLE "pet_monitoring" ADD COLUMN IF NOT EXISTS "behavior_changes" TEXT;`
    },
    {
      name: 'pet_monitoring.activity_changes',
      sql: `ALTER TABLE "pet_monitoring" ADD COLUMN IF NOT EXISTS "activity_changes" TEXT;`
    },
    {
      name: 'pet_monitoring.recommendations',
      sql: `ALTER TABLE "pet_monitoring" ADD COLUMN IF NOT EXISTS "recommendations" TEXT;`
    },
    {
      name: 'pet_monitoring.medications',
      sql: `ALTER TABLE "pet_monitoring" ADD COLUMN IF NOT EXISTS "medications" TEXT;`
    },
    {
      name: 'pet_monitoring.diet_instructions',
      sql: `ALTER TABLE "pet_monitoring" ADD COLUMN IF NOT EXISTS "diet_instructions" TEXT;`
    },
    {
      name: 'pet_monitoring.care_instructions',
      sql: `ALTER TABLE "pet_monitoring" ADD COLUMN IF NOT EXISTS "care_instructions" TEXT;`
    },
    {
      name: 'pet_monitoring.updates_log',
      sql: `ALTER TABLE "pet_monitoring" ADD COLUMN IF NOT EXISTS "updates_log" JSONB;`
    },
    {
      name: 'pet_monitoring.report_summary',
      sql: `ALTER TABLE "pet_monitoring" ADD COLUMN IF NOT EXISTS "report_summary" TEXT;`
    }
  ];

  for (const item of statements) {
    try {
      await prisma.$executeRawUnsafe(item.sql);
      results[item.name] = 'SUCCESS';
    } catch (err: any) {
      results[item.name] = `ERROR: ${err.message}`;
    }
  }

  // Disconnect so connection pool resets prepared statement cache
  await prisma.$disconnect();

  let testResult: any = null;
  try {
    testResult = await prisma.pet.findMany({
      take: 2,
      include: {
        monitoring: true
      }
    });
  } catch (err: any) {
    testResult = { error: err.message, stack: err.stack };
  }

  return NextResponse.json({
    results,
    testResult
  });
}
