import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const all = await prisma.petMonitoring.findMany();
  return NextResponse.json(all);
}
