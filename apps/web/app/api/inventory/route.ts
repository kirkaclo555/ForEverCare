import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataFilePath = path.join(process.cwd(), 'inventory.json');

const DEFAULT_ITEMS = [
  { id: 1, category: 'food', categoryLabel: 'Dog Food', name: 'Premium Dog Food', description: 'High quality dog food', dosageForm: '', expiryDate: '2025-12-31', price: '45.99', stock: 45, icon: 'fa-dog' },
  { id: 2, category: 'food', categoryLabel: 'Cat Food', name: 'Gourmet Cat Food', description: 'Gourmet cat food', dosageForm: '', expiryDate: '2025-10-15', price: '38.99', stock: 32, badge: 'sale', icon: 'fa-cat' },
  { id: 3, category: 'medications', categoryLabel: 'Medication', name: 'Flea & Tick Treatment', description: 'Effective treatment', dosageForm: 'Drops', expiryDate: '2026-05-20', price: '24.99', stock: 8, icon: 'fa-pills' },
  { id: 4, category: 'grooming', categoryLabel: 'Grooming', name: 'Pet Grooming Kit', description: 'Complete kit', dosageForm: '', expiryDate: '', price: '67.99', stock: 23, icon: 'fa-cut' },
  { id: 5, category: 'accessories', categoryLabel: 'Accessories', name: 'Orthopedic Pet Bed', description: 'Comfortable bed', dosageForm: '', expiryDate: '', price: '89.99', stock: 15, badge: 'new', icon: 'fa-bed' },
  { id: 6, category: 'accessories', categoryLabel: 'Dental', name: 'Dental Care Kit', description: 'Dental kit', dosageForm: '', expiryDate: '', price: '29.99', stock: 42, icon: 'fa-tooth' },
  { id: 7, category: 'food', categoryLabel: 'Treats', name: 'Natural Dog Treats', description: 'Healthy treats', dosageForm: '', expiryDate: '2025-08-10', price: '15.99', stock: 78, icon: 'fa-bone' },
  { id: 8, category: 'medications', categoryLabel: 'Vaccines', name: 'Rabies Vaccine', description: 'Core vaccine', dosageForm: 'Injection', expiryDate: '2026-01-01', price: '18.99', stock: 6, icon: 'fa-syringe' },
  { id: 9, category: 'equipment', categoryLabel: 'Equipment', name: 'Surgical Table', description: 'Steel operating table', dosageForm: '', expiryDate: '', price: '450.00', stock: 2, icon: 'fa-stethoscope' }
];

const initializeDataFile = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(DEFAULT_ITEMS, null, 2));
  }
};

export async function GET() {
  initializeDataFile();
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const items = JSON.parse(data);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  initializeDataFile();
  try {
    const newItems = await request.json();
    
    let dataToWrite;
    if (Array.isArray(newItems)) {
      dataToWrite = newItems; // Bulk overwrite
    } else {
      // Append single item (or modify logic if we want to update specific IDs here, but hooks currently send the whole array)
      const data = fs.readFileSync(dataFilePath, 'utf-8');
      const existing = JSON.parse(data);
      dataToWrite = [...existing, newItems];
    }
    
    fs.writeFileSync(dataFilePath, JSON.stringify(dataToWrite, null, 2));
    return NextResponse.json({ success: true, items: dataToWrite });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write inventory' }, { status: 500 });
  }
}
