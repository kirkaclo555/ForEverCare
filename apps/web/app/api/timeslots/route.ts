import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'timeslots.json');

const initializeDataFile = () => {
  if (!fs.existsSync(dataFilePath)) {
    const DEFAULT_TIMESLOTS = {};
    fs.writeFileSync(dataFilePath, JSON.stringify(DEFAULT_TIMESLOTS, null, 2));
  }
};

export async function GET() {
  initializeDataFile();
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const timeslots = JSON.parse(data);
    return NextResponse.json(timeslots);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read timeslots' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  initializeDataFile();
  try {
    const newTimeSlots = await request.json();
    fs.writeFileSync(dataFilePath, JSON.stringify(newTimeSlots, null, 2));
    return NextResponse.json({ success: true, timeslots: newTimeSlots });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write timeslots' }, { status: 500 });
  }
}
