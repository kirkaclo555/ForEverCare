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
  status: 'paid' | 'pending' | 'refunded';
  source: 'manual' | 'product' | 'appointment' | 'telemedicine';
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch('/api/billing')
      .then(res => res.json())
      .then(data => setInvoices(data))
      .catch(err => setInvoices(DEFAULT_INVOICES));
  }, []);

  const saveInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvoices)
    });
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newId = `INV-${1000 + Math.floor(Math.random() * 9000)}`;
    const newInvoice = { ...invoiceData, id: newId };
    saveInvoices([newInvoice, ...invoices]);
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    saveInvoices(invoices.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  return {
    invoices,
    addInvoice,
    updateInvoiceStatus
  };
}
