import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';


export async function GET() {
  const all = await prisma.petMonitoring.findMany();
  return NextResponse.json(all);
}
