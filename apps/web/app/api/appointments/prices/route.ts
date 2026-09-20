import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'appointment_prices.json');

const DEFAULT_PRICES = {
  inperson: 500,
  telemedicine: 800
};

const initializeDataFile = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(DEFAULT_PRICES, null, 2));
  }
};

export async function GET() {
  initializeDataFile();
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const prices = JSON.parse(data);
    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error reading appointment prices:', error);
    return NextResponse.json(DEFAULT_PRICES); // fallback
  }
}

export async function POST(request: Request) {
  initializeDataFile();
  try {
    const body = await request.json();
    const prices = {
      inperson: Number(body.inperson) || DEFAULT_PRICES.inperson,
      telemedicine: Number(body.telemedicine) || DEFAULT_PRICES.telemedicine
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(prices, null, 2));
    return NextResponse.json({ success: true, prices });
  } catch (error) {
    console.error('Error writing appointment prices:', error);
    return NextResponse.json({ error: 'Failed to write appointment prices' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
