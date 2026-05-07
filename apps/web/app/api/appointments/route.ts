import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// This is a simple JSON file-based database to store appointments locally
const dataFilePath = path.join(process.cwd(), 'appointments.json');

// Initialize the file if it doesn't exist
const initializeDataFile = () => {
  if (!fs.existsSync(dataFilePath)) {
    const DEFAULT_APPOINTMENTS: any[] = [];
    fs.writeFileSync(dataFilePath, JSON.stringify(DEFAULT_APPOINTMENTS, null, 2));
  }
};

export async function GET() {
  initializeDataFile();
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const appointments = JSON.parse(data);
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  initializeDataFile();
  try {
    const newAppointments = await request.json();
    // We expect the entire array of appointments or a single appointment. 
    // To keep it simple and match localstorage behavior, we can accept the full array for bulk updates,
    // or if it's a single object without an array, we append it.
    let dataToWrite;
    if (Array.isArray(newAppointments)) {
      dataToWrite = newAppointments;
    } else {
      const data = fs.readFileSync(dataFilePath, 'utf-8');
      const existing = JSON.parse(data);
      dataToWrite = [...existing, newAppointments];
    }
    
    fs.writeFileSync(dataFilePath, JSON.stringify(dataToWrite, null, 2));
    return NextResponse.json({ success: true, appointments: dataToWrite });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write appointments' }, { status: 500 });
  }
}
