"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBilling } from '../../../hooks/useBilling';
import './billing.css';

export default function BillingPage() {
  const router = useRouter();
  const { invoices, addInvoice, updateInvoiceStatus, archiveInvoice } = useBilling();

  const [filterStatus, setFilterStatus] = useState('all');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [invoiceToArchive, setInvoiceToArchive] = useState<any>(null);
  const [invoiceToMarkPaid, setInvoiceToMarkPaid] = useState<any>(null);

  // New Invoice State
  const [newInvoiceClient, setNewInvoiceClient] = useState('');
  const [newInvoiceDate, setNewInvoiceDate] = useState(new Date().toISOString().split('T')[0] || '');
  const [newInvoiceItems, setNewInvoiceItems] = useState([{ id: Date.now().toString(), name: '', quantity: 1, price: 0 }]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.action-dropdown-container')) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddItem = () => {
    setNewInvoiceItems([...newInvoiceItems, { id: Date.now().toString(), name: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setNewInvoiceItems(newInvoiceItems.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    setNewInvoiceItems(newInvoiceItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateTotal = () => {
    return newInvoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: { [key: string]: string } = {};

    if (!newInvoiceClient || !newInvoiceClient.trim()) errors.client = "Client Name is required";
    if (!newInvoiceDate) errors.date = "Invoice Date is required";

    newInvoiceItems.forEach((item) => {
        if (!item.name || !item.name.trim()) errors[`itemName_${item.id}`] = "Required";
        if ((item.quantity as any) === '' || Number.isNaN(item.quantity as any) || item.quantity <= 0) errors[`itemQty_${item.id}`] = "Invalid";
        if ((item.price as any) === '' || Number.isNaN(item.price as any) || item.price < 0) errors[`itemPrice_${item.id}`] = "Invalid";
    });

    if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
    }
    
    setValidationErrors({});

    addInvoice({
      clientName: newInvoiceClient,
      date: newInvoiceDate,
      items: newInvoiceItems,
      totalAmount: calculateTotal(),
      status: 'pending',
      source: 'manual'
    });

    setIsInvoiceModalOpen(false);
    setNewInvoiceClient('');
    setNewInvoiceDate(new Date().toISOString().split('T')[0] || '');
    setNewInvoiceItems([{ id: Date.now().toString(), name: '', quantity: 1, price: 0 }]);
    setValidationErrors({});
  };

  const exportCSV = () => {
    const headers = ['Invoice ID', 'Client Name', 'Date', 'Total Amount', 'Status', 'Source'];
    const rows = invoices.map(inv => [
      inv.id,
      inv.clientName,
      inv.date,
      inv.totalAmount.toFixed(2),
      inv.status,
      inv.source
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `billing_report_${new Date().toISOString().split('T')[0] || ''}.csv`;
    link.click();
  };

  const handleArchiveInvoice = (id: string, clientName: string) => {
    setInvoiceToArchive({ id, clientName });
  };

  const printInvoice = () => {
    if (!viewInvoice) return;
    
    // Create a temporary iframe to print just the invoice
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('Please allow popups to print');

    const content = `
      <html>
        <head>
          <title>Invoice ${viewInvoice.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #2d3748; }
            h1 { color: #2E5E3E; margin-bottom: 5px; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
            .details { margin-bottom: 30px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f7fafc; color: #4a5568; }
            .total { font-size: 20px; font-weight: bold; text-align: right; color: #2E5E3E; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 14px; font-weight: 600; text-transform: capitalize; }
            .status.paid { background: #C6F6D5; color: #22543D; }
            .status.pending { background: #FEEBC8; color: #7B341E; }
            .status.refunded { background: #FED7D7; color: #822727; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FurEver Paw Care Veterinary Clinic</h1>
            <p>123 Paws Avenue, Pet City</p>
          </div>
          <div class="details">
            <div>
              <strong>Billed To:</strong><br/>
              ${viewInvoice.clientName}
            </div>
            <div style="text-align: right;">
              <strong>Invoice #:</strong> ${viewInvoice.id}<br/>
              <strong>Date:</strong> ${viewInvoice.date}<br/>
              <span class="status ${viewInvoice.status}">${viewInvoice.status}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${viewInvoice.items.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₱${item.price.toFixed(2)}</td>
                  <td>₱${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total Amount: ₱${viewInvoice.totalAmount.toFixed(2)}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredInvoices = invoices.filter(inv => filterStatus === 'all' || inv.status === filterStatus);

  const totalInvoices = invoices.length;
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalRefunded = invoices.filter(i => i.status === 'refunded').reduce((sum, i) => sum + i.totalAmount, 0);


  return (
    <>
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} >
        <div className="stats-grid">
            <div className={`stat-card ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')} style={{cursor:'pointer'}}>
                <div className="stat-header"><i className="fas fa-file-invoice"></i><h3>Total Invoices</h3></div>
                <div className="stat-value">{totalInvoices}</div>
            </div>
            <div className={`stat-card ${filterStatus === 'paid' ? 'active' : ''}`} onClick={() => setFilterStatus('paid')} style={{cursor:'pointer'}}>
                <div className="stat-header"><i className="fas fa-check-circle" style={{color: '#48bb78'}}></i><h3>Paid</h3></div>
                <div className="stat-value">₱{totalPaid.toFixed(2)}</div>
            </div>
            <div className={`stat-card ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')} style={{cursor:'pointer'}}>
                <div className="stat-header"><i className="fas fa-clock" style={{color: '#ecc94b'}}></i><h3>Pending</h3></div>
                <div className="stat-value">₱{totalPending.toFixed(2)}</div>
            </div>

            <div className={`stat-card ${filterStatus === 'refunded' ? 'active' : ''}`} onClick={() => setFilterStatus('refunded')} style={{cursor:'pointer'}}>
                <div className="stat-header"><i className="fas fa-undo-alt" style={{color: '#e53e3e'}}></i><h3>Refunded</h3></div>
                <div className="stat-value">₱{totalRefunded.toFixed(2)}</div>
            </div>
        </div>

        <div className="billing-controls">
            <button className="btn-primary" onClick={() => setIsInvoiceModalOpen(true)}><i className="fas fa-plus"></i> Create New Invoice</button>
            <div className="filter-group">
                <select id="statusFilter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>

                    <option value="refunded">Refunded</option>
                </select>
                <button className="btn-secondary" onClick={exportCSV}><i className="fas fa-download"></i> Export Report</button>
            </div>
        </div>

        <div className="billing-table-container" style={{ minHeight: '350px', paddingBottom: '120px' }}>
            <table className="data-table">
                <thead><tr><th>Invoice #</th><th>Client</th><th>Date</th><th>Amount</th><th>Status</th><th style={{ textAlign: 'center' }}>Actions</th></tr></thead>
                <tbody>
                    {filteredInvoices.map(inv => (
                        <tr key={inv.id} onClick={() => setViewInvoice(inv)} className="clickable-row">
                            <td><strong>{inv.id}</strong></td>
                            <td>{inv.clientName}</td>
                            <td>{inv.date}</td>
                            <td>₱{inv.totalAmount.toFixed(2)}</td>
                            <td>
                                <span className={`status-badge ${inv.status}`} style={{
                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600,
                                    backgroundColor: inv.status === 'paid' ? '#C6F6D5' : inv.status === 'pending' ? '#FEEBC8' : '#FED7D7',
                                    color: inv.status === 'paid' ? '#22543D' : inv.status === 'pending' ? '#7B341E' : '#822727'
                                }}>
                                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                </span>
                            </td>
                            <td style={{ textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                                <div className="action-dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
                                    <button className="btn-secondary" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4a5568', margin: '0 auto' }} onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === inv.id ? null : inv.id); }} title="Actions">
                                        <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                    {openActionMenuId === inv.id && (
                                        <div style={{ position: 'absolute', right: '50%', transform: 'translateX(50%)', top: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', zIndex: 100, display: 'flex', flexDirection: 'column', minWidth: '160px', overflow: 'hidden', marginTop: '5px' }}>
                                            {inv.status === 'pending' && (
                                                <button style={{ padding: '10px 15px', textAlign: 'left', border: 'none', background: 'white', cursor: 'pointer', color: '#2E5E3E', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', transition: 'background 0.2s', fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.background = '#e6fffa'} onMouseLeave={e => e.currentTarget.style.background = 'white'} onClick={(e) => { e.stopPropagation(); setInvoiceToMarkPaid(inv); setOpenActionMenuId(null); }}>
                                                    <i className="fas fa-check" style={{color: '#2E5E3E', width: '16px'}}></i> Mark as Paid
                                                </button>
                                            )}
                                            {inv.status === 'paid' && (
                                                <button style={{ padding: '10px 15px', textAlign: 'left', border: 'none', background: 'white', cursor: 'pointer', color: '#2E5E3E', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', transition: 'background 0.2s', fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.background = '#e6fffa'} onMouseLeave={e => e.currentTarget.style.background = 'white'} onClick={(e) => { e.stopPropagation(); updateInvoiceStatus(inv.id, 'completed'); setOpenActionMenuId(null); }}>
                                                    <i className="fas fa-check-double" style={{color: '#2E5E3E', width: '16px'}}></i> Completed
                                                </button>
                                            )}
                                            <button style={{ padding: '10px 15px', textAlign: 'left', border: 'none', background: 'white', cursor: 'pointer', color: '#2E5E3E', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', transition: 'background 0.2s', fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.background = '#e6fffa'} onMouseLeave={e => e.currentTarget.style.background = 'white'} onClick={(e) => { e.stopPropagation(); handleArchiveInvoice(inv.id, inv.clientName); setOpenActionMenuId(null); }}>
                                                <i className="fas fa-archive" style={{color: '#2E5E3E', width: '16px'}}></i> Archive
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredInvoices.length === 0 && (
                        <tr><td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>No invoices found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>

    {isInvoiceModalOpen && (
        <div className="modal" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="modal-content" style={{maxHeight: '90vh', overflowY: 'auto'}}>
                <div className="modal-header">
                    <h3>New Invoice</h3>
                    <button className="modal-close" onClick={() => { setIsInvoiceModalOpen(false); setValidationErrors({}); }}><i className="fas fa-times"></i></button>
                </div>
                <div className="modal-body">
                    <form noValidate onSubmit={handleSaveInvoice}>
                        <div className="form-group">
                            <label>Client Name *</label>
                            <input type="text" className="form-control" value={newInvoiceClient} onChange={e => { setNewInvoiceClient(e.target.value); if (validationErrors.client) setValidationErrors({...validationErrors, client: ''}); }} placeholder="Client name" style={validationErrors.client ? {borderColor: '#e53e3e'} : {}} />
                            {validationErrors.client && <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>{validationErrors.client}</span>}
                        </div>
                        <div className="form-group">
                            <label>Invoice Date *</label>
                            <input type="date" className="form-control" value={newInvoiceDate} onChange={e => { setNewInvoiceDate(e.target.value); if (validationErrors.date) setValidationErrors({...validationErrors, date: ''}); }} style={validationErrors.date ? {borderColor: '#e53e3e'} : {}} />
                            {validationErrors.date && <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>{validationErrors.date}</span>}
                        </div>
                        <div className="form-group">
                            <label>Items & Services</label>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
                                <div style={{ flex: 2 }}>Item Name *</div>
                                <div style={{ flex: 1 }}>Quantity *</div>
                                <div style={{ flex: 1 }}>Price *</div>
                                {newInvoiceItems.length > 1 && <div style={{ width: '40px' }}></div>}
                            </div>
                            <div className="invoice-items-container" style={{marginBottom: '10px'}}>
                                {newInvoiceItems.map((item, idx) => (
                                    <div key={item.id} style={{display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start'}}>
                                        <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                                            <input type="text" className="form-control" placeholder="Item Name" value={item.name} onChange={e => { handleItemChange(item.id, 'name', e.target.value); if (validationErrors[`itemName_${item.id}`]) setValidationErrors({...validationErrors, [`itemName_${item.id}`]: ''}); }} style={{ width: '100%', borderColor: validationErrors[`itemName_${item.id}`] ? '#e53e3e' : undefined }} />
                                            {validationErrors[`itemName_${item.id}`] && <span style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '2px' }}>{validationErrors[`itemName_${item.id}`]}</span>}
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <input type="number" className="form-control" placeholder="Qty" min="1" value={Number.isNaN(item.quantity) ? '' : item.quantity} onChange={e => { handleItemChange(item.id, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value)); if (validationErrors[`itemQty_${item.id}`]) setValidationErrors({...validationErrors, [`itemQty_${item.id}`]: ''}); }} style={{ width: '100%', borderColor: validationErrors[`itemQty_${item.id}`] ? '#e53e3e' : undefined }} />
                                            {validationErrors[`itemQty_${item.id}`] && <span style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '2px' }}>{validationErrors[`itemQty_${item.id}`]}</span>}
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <input type="number" className="form-control" placeholder="Price" min="0" step="0.01" value={Number.isNaN(item.price) ? '' : item.price} onChange={e => { handleItemChange(item.id, 'price', e.target.value === '' ? '' : parseFloat(e.target.value)); if (validationErrors[`itemPrice_${item.id}`]) setValidationErrors({...validationErrors, [`itemPrice_${item.id}`]: ''}); }} style={{ width: '100%', borderColor: validationErrors[`itemPrice_${item.id}`] ? '#e53e3e' : undefined }} />
                                            {validationErrors[`itemPrice_${item.id}`] && <span style={{ color: '#e53e3e', fontSize: '0.75rem', marginTop: '2px' }}>{validationErrors[`itemPrice_${item.id}`]}</span>}
                                        </div>
                                        {newInvoiceItems.length > 1 && (
                                            <button type="button" className="btn-secondary" style={{padding: '0 10px', color: '#e53e3e', marginTop: '2px', height: '38px'}} onClick={() => handleRemoveItem(item.id)}><i className="fas fa-trash"></i></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="btn-secondary" onClick={handleAddItem}><i className="fas fa-plus"></i> Add Item/Service</button>
                        </div>
                        <div className="total-amount" style={{fontSize: '1.2rem', fontWeight: 'bold', marginTop: '15px', textAlign: 'right', color: '#2E5E3E'}}>
                            Total: ₱<span>{calculateTotal().toFixed(2)}</span>
                        </div>
                    </form>
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => { setIsInvoiceModalOpen(false); setValidationErrors({}); }}>Cancel</button>
                    <button type="button" className="btn-primary" onClick={handleSaveInvoice}>Save Invoice</button>
                </div>
            </div>
        </div>
    )}

    {viewInvoice && (
        <div className="modal" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div className="modal-content" style={{maxWidth: '600px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                <div className="modal-header">
                    <h3>Invoice Details</h3>
                    <button className="modal-close" onClick={() => setViewInvoice(null)}><i className="fas fa-times"></i></button>
                </div>
                <div className="modal-body" style={{ overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', flex: 1 }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0'}}>
                        <div style={{maxWidth: '50%'}}>
                            <p style={{color: '#718096', fontSize: '0.85rem', marginBottom: '5px'}}>Billed To</p>
                            <h4 style={{margin: 0, color: '#2d3748', wordBreak: 'break-word'}}>{viewInvoice.clientName}</h4>
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <p style={{color: '#718096', fontSize: '0.85rem', marginBottom: '5px'}}>Invoice #</p>
                            <h4 style={{margin: 0, color: '#2d3748'}}>{viewInvoice.id}</h4>
                            <p style={{color: '#718096', fontSize: '0.85rem', margin: '5px 0 0 0'}}>{viewInvoice.date}</p>
                        </div>
                    </div>
                    
                    <div style={{ overflowX: 'auto', scrollbarWidth: 'none', width: '100%' }}>
                        <table className="data-table" style={{marginBottom: '20px', width: '100%'}}>
                            <thead>
                                <tr>
                                    <th style={{width: '40%'}}>Item Description</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewInvoice.items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td style={{wordBreak: 'break-word'}}>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>₱{item.price.toFixed(2)}</td>
                                        <td>₱{(item.quantity * item.price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '20px'}}>
                        <h3 style={{color: '#2E5E3E', margin: 0}}>Total: ₱{viewInvoice.totalAmount.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="modal-actions" style={{ flexWrap: 'wrap', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    <button className="btn-secondary" style={{marginRight: 'auto'}} onClick={printInvoice}><i className="fas fa-print"></i> Print</button>
                    {viewInvoice.status === 'pending' && (
                        <button className="btn-primary" onClick={() => { setInvoiceToMarkPaid(viewInvoice); }}><i className="fas fa-check"></i> Mark as Paid</button>
                    )}
                    {viewInvoice.status === 'paid' && (
                        <button className="btn-primary" style={{backgroundColor: '#2E5E3E', borderColor: '#2E5E3E'}} onClick={() => { updateInvoiceStatus(viewInvoice.id, 'completed'); setViewInvoice({...viewInvoice, status: 'completed'}); }}><i className="fas fa-check-double"></i> Completed</button>
                    )}
                    <button className="btn-secondary" style={{backgroundColor: '#2E5E3E', color: 'white', border: 'none'}} onClick={() => { handleArchiveInvoice(viewInvoice.id, viewInvoice.clientName); setViewInvoice(null); }}><i className="fas fa-archive"></i> Archive</button>
                    <button className="btn-secondary" onClick={() => setViewInvoice(null)}>Close</button>
                </div>
            </div>
        </div>
    )}

    {invoiceToArchive && (
        <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', borderRadius: '16px', padding: '30px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#C6F6D5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <i className="fas fa-archive" style={{ fontSize: '24px', color: '#2E5E3E' }}></i>
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#1a202c', marginBottom: '10px', fontWeight: 600 }}>Archive Invoice</h3>
                <p style={{ color: '#4a5568', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '25px' }}>
                    Archive invoice <strong style={{ color: '#1a202c' }}>{invoiceToArchive.id}</strong> for <strong>{invoiceToArchive.clientName}</strong>? It will be moved to the Archive section and can be restored anytime.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: 600 }} onClick={() => setInvoiceToArchive(null)}>Cancel</button>
                    <button className="btn-primary" style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: '#2E5E3E', borderColor: '#2E5E3E', color: 'white' }} onClick={() => {
                        archiveInvoice(invoiceToArchive.id);
                        setInvoiceToArchive(null);
                        const toast = document.getElementById('toast');
                        if (toast) {
                            toast.innerText = 'Invoice archived successfully.';
                            toast.className = 'show';
                            setTimeout(() => { toast.className = ''; }, 3000);
                        }
                    }}>Archive</button>
                </div>
            </div>
        </div>
    )}

    {invoiceToMarkPaid && (
        <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', borderRadius: '16px', padding: '30px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#C6F6D5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '24px', color: '#2E5E3E' }}></i>
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#1a202c', marginBottom: '10px', fontWeight: 600 }}>Confirm Payment</h3>
                <p style={{ color: '#4a5568', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '25px' }}>
                    Are you sure you want to mark invoice <strong style={{ color: '#1a202c' }}>{invoiceToMarkPaid.id}</strong> for <strong>{invoiceToMarkPaid.clientName}</strong> as <strong style={{ color: '#2E5E3E' }}>PAID</strong>?
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: 600 }} onClick={() => setInvoiceToMarkPaid(null)}>Cancel</button>
                    <button className="btn-primary" style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: '#2E5E3E', borderColor: '#2E5E3E', color: 'white' }} onClick={() => {
                        updateInvoiceStatus(invoiceToMarkPaid.id, 'paid');
                        if (viewInvoice && viewInvoice.id === invoiceToMarkPaid.id) {
                            setViewInvoice({ ...viewInvoice, status: 'paid' });
                        }
                        setInvoiceToMarkPaid(null);
                        const toast = document.getElementById('toast');
                        if (toast) {
                            toast.innerText = 'Invoice marked as paid successfully.';
                            toast.className = 'show';
                            setTimeout(() => { toast.className = ''; }, 3000);
                        }
                    }}>Confirm</button>
                </div>
            </div>
        </div>
    )}

    <div id="toast"></div>

    </>
  );
}
