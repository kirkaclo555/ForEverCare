import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'timeslots.json');

const initializeDataFile = async () => {
  try {
    await fs.promises.access(dataFilePath);
  } catch {
    const DEFAULT_TIMESLOTS = {};
    await fs.promises.writeFile(dataFilePath, JSON.stringify(DEFAULT_TIMESLOTS, null, 2));
  }
};

export async function GET() {
  await initializeDataFile();
  try {
    const data = await fs.promises.readFile(dataFilePath, 'utf-8');
    const timeslots = JSON.parse(data);
    return NextResponse.json(timeslots);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read timeslots' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await initializeDataFile();
  try {
    const newTimeSlots = await request.json();
    await fs.promises.writeFile(dataFilePath, JSON.stringify(newTimeSlots, null, 2));
    return NextResponse.json({ success: true, timeslots: newTimeSlots });
  } catch (error) {
    console.error('Failed to write timeslots to disk:', error);
    return NextResponse.json({ error: 'Failed to write timeslots' }, { status: 500 });
  }
}
