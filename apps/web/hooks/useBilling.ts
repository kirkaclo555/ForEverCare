import { useState, useEffect } from 'react';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'paid' | 'pending' | 'refunded' | 'completed';
  source: 'manual' | 'product' | 'appointment' | 'telemedicine';
  isArchived?: boolean;
  userEmail?: string;       // Email of the user for receipt notification
  appointmentId?: string;  // Linked appointment ID for DB lookup fallback
}

const DEFAULT_INVOICES: Invoice[] = [
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

export function useBilling() {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch('/api/billing')
      .then(res => res.json())
      .then(data => setAllInvoices(Array.isArray(data) ? data : DEFAULT_INVOICES))
      .catch(() => setAllInvoices(DEFAULT_INVOICES));
  }, []);

  const saveInvoices = (newInvoices: Invoice[]) => {
    setAllInvoices(newInvoices);
    fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvoices)
    });
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newId = `INV-${1000 + Math.floor(Math.random() * 9000)}`;
    const newInvoice = { ...invoiceData, id: newId, isArchived: false };
    saveInvoices([newInvoice, ...allInvoices]);
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    saveInvoices(allInvoices.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const archiveInvoice = (id: string) => {
    saveInvoices(allInvoices.map(inv => inv.id === id ? { ...inv, isArchived: true } : inv));
  };

  const unarchiveInvoice = (id: string) => {
    saveInvoices(allInvoices.map(inv => inv.id === id ? { ...inv, isArchived: false } : inv));
  };

  // Active invoices = not archived
  const invoices = allInvoices.filter(inv => !inv.isArchived);
  // Archived invoices
  const archivedInvoices = allInvoices.filter(inv => inv.isArchived);

  return {
    invoices,
    archivedInvoices,
    addInvoice,
    updateInvoiceStatus,
    archiveInvoice,
    unarchiveInvoice,
  };
}
