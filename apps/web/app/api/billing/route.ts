import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'billing.json');

const DEFAULT_INVOICES = [
  {
    id: 'INV-1001',
    clientName: 'Juan Dela Cruz',
    date: new Date().toISOString().split('T')[0] || '',
    items: [{ id: '1', name: 'Premium Dog Food', quantity: 2, price: 45.99 }],
    totalAmount: 91.98,
    status: 'paid',
    source: 'product'
  },
  {
    id: 'INV-1002',
    clientName: 'Maria Santos',
    date: new Date().toISOString().split('T')[0] || '',
    items: [{ id: '2', name: 'Consultation Fee', quantity: 1, price: 500.00 }],
    totalAmount: 500.00,
    status: 'pending',
    source: 'appointment'
  }
];

const initializeDataFile = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(DEFAULT_INVOICES, null, 2));
  }
};

export async function GET() {
  initializeDataFile();
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const invoices = JSON.parse(data);
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read billing data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  initializeDataFile();
  try {
    const newInvoices = await request.json();
    
    let dataToWrite;
    if (Array.isArray(newInvoices)) {
      dataToWrite = newInvoices;
    } else {
      const data = fs.readFileSync(dataFilePath, 'utf-8');
      const existing = JSON.parse(data);
      dataToWrite = [newInvoices, ...existing]; // Assuming we prepend new invoices usually
    }
    
    fs.writeFileSync(dataFilePath, JSON.stringify(dataToWrite, null, 2));
    return NextResponse.json({ success: true, invoices: dataToWrite });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write billing data' }, { status: 500 });
  }
}
