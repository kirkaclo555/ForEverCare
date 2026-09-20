"use client";

import React, { useState, useEffect } from 'react';
import { useBilling } from '../../../hooks/useBilling';
import './archive.css';

export default function ArchivePage() {
  const { archivedInvoices, unarchiveInvoice } = useBilling();

  // Tab state
  const [activeTab, setActiveTab] = useState<'appointments' | 'billing' | 'pets' | 'inventory'>('appointments');

  // === APPOINTMENTS TAB STATE ===
  const [archivedAppointments, setArchivedAppointments] = useState<any[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');

  // === BILLING TAB STATE ===
  const [billingSearch, setBillingSearch] = useState('');
  const [billingStatusFilter, setBillingStatusFilter] = useState('all');

  // === PETS TAB STATE ===
  const [archivedPets, setArchivedPets] = useState<any[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [petsSearch, setPetsSearch] = useState('');
  const [petsVaccineFilter, setPetsVaccineFilter] = useState('all');

  // === INVENTORY TAB STATE ===
  const [archivedInventory, setArchivedInventory] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');

  // ---- Fetch Appointments ----
  const fetchArchivedAppointments = async () => {
    try {
      setApptLoading(true);
      const res = await fetch('/api/appointments?archived=true');
      const data = await res.json();
      if (data && Array.isArray(data)) setArchivedAppointments(data);
    } catch (err) {
      console.error('Failed to fetch archived appointments:', err);
    } finally {
      setApptLoading(false);
    }
  };

  // ---- Fetch Pets ----
  const fetchArchivedPets = async () => {
    try {
      setPetsLoading(true);
      const res = await fetch('/api/records?archived=true');
      const data = await res.json();
      if (data && Array.isArray(data)) setArchivedPets(data);
    } catch (err) {
      console.error('Failed to fetch archived pets:', err);
    } finally {
      setPetsLoading(false);
    }
  };

  // ---- Fetch Inventory ----
  const fetchArchivedInventory = async () => {
    try {
      setInventoryLoading(true);
      const res = await fetch('/api/inventory?archived=true');
      const data = await res.json();
      if (data && Array.isArray(data)) setArchivedInventory(data);
    } catch (err) {
      console.error('Failed to fetch archived inventory:', err);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedAppointments();
    fetchArchivedPets();
    fetchArchivedInventory();
  }, []);

  const handleUnarchiveAppointment = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: false })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Appointment for ${name} has been successfully restored.`);
        fetchArchivedAppointments();
      } else {
        alert('Error: ' + (data.error || 'Failed to restore appointment'));
      }
    } catch (err) {
      alert('Failed to restore appointment.');
    }
  };

  const handleUnarchivePet = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: false })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Pet ${name} has been successfully restored to active records.`);
        fetchArchivedPets();
      } else {
        alert('Error: ' + (data.error || 'Failed to restore pet'));
      }
    } catch (err) {
      alert('Failed to restore pet.');
    }
  };

  const handleRestoreInventory = async (id: string | number, name: string) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isArchived: false })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Item "${name}" has been successfully restored to active inventory.`);
        fetchArchivedInventory();
      } else {
        alert('Error: ' + (data.error || 'Failed to restore item'));
      }
    } catch (err) {
      alert('Failed to restore item.');
    }
  };

  // ---- Appointment Filters ----
  const filteredAppointments = archivedAppointments.filter(app => {
    const matchesSearch =
      app.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase();
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(app.date).getTime()) / (1000 * 60 * 60 * 24));
      if (dateFilter === 'today') matchesDate = diffDays <= 1;
      else if (dateFilter === 'week') matchesDate = diffDays <= 7;
      else if (dateFilter === 'month') matchesDate = diffDays <= 30;
      else if (dateFilter === 'older') matchesDate = diffDays > 30;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // ---- Billing Filters ----
  const filteredBilling = archivedInvoices.filter(inv => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(billingSearch.toLowerCase()) ||
      inv.id.toLowerCase().includes(billingSearch.toLowerCase());
    const matchesStatus = billingStatusFilter === 'all' || inv.status === billingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // ---- Pet Filters ----
  const filteredPets = archivedPets.filter(pet => {
    const matchesSearch =
      pet.petName.toLowerCase().includes(petsSearch.toLowerCase()) ||
      pet.ownerName.toLowerCase().includes(petsSearch.toLowerCase()) ||
      pet.breed.toLowerCase().includes(petsSearch.toLowerCase()) ||
      pet.species.toLowerCase().includes(petsSearch.toLowerCase());
    const matchesVaccine = petsVaccineFilter === 'all' || pet.vaccine.toLowerCase() === petsVaccineFilter.toLowerCase();
    return matchesSearch && matchesVaccine;
  });

  // ---- Inventory Filters ----
  const filteredInventory = archivedInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(inventorySearch.toLowerCase()));
    const matchesCategory = inventoryCategoryFilter === 'all' || item.category.toLowerCase() === inventoryCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // ---- Status badge helper ----
  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      paid: { bg: '#C6F6D5', color: '#22543D' },
      completed: { bg: '#BEE3F8', color: '#2A4365' },
      pending: { bg: '#FEFCBF', color: '#744210' },
      cancelled: { bg: '#FED7D7', color: '#822727' },
      declined: { bg: '#FEEBC8', color: '#7B341E' },
      refunded: { bg: '#FED7D7', color: '#822727' },
    };
    const s = styles[status] || { bg: '#E2E8F0', color: '#4A5568' };
    return (
      <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
        {status}
      </span>
    );
  };

  // ---- Stats ----
  const totalArchived = archivedAppointments.length;
  const paidCount = archivedAppointments.filter(a => a.status === 'paid').length;
  const completedCount = archivedAppointments.filter(a => a.status === 'completed').length;
  const otherCount = totalArchived - paidCount - completedCount;

  // ---- Pet Stats ----
  const totalArchivedPets = archivedPets.length;
  const dogCount = archivedPets.filter(p => p.species?.toLowerCase() === 'dog').length;
  const catCount = archivedPets.filter(p => p.species?.toLowerCase() === 'cat').length;
  const otherPetsCount = totalArchivedPets - dogCount - catCount;

  return (
    <>
      <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }}>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '24px', borderBottom: '2px solid #edf2f7' }}>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '12px 28px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
              background: 'none', borderBottom: activeTab === 'appointments' ? '3px solid #2E5E3E' : '3px solid transparent',
              color: activeTab === 'appointments' ? '#2E5E3E' : '#718096', transition: 'all 0.2s'
            }}>
            <i className="fas fa-calendar-alt" style={{ marginRight: '8px' }}></i>
            Appointments
            <span style={{ marginLeft: '8px', background: activeTab === 'appointments' ? '#C6F6D5' : '#edf2f7', color: activeTab === 'appointments' ? '#22543D' : '#718096', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
              {archivedAppointments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            style={{
              padding: '12px 28px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
              background: 'none', borderBottom: activeTab === 'billing' ? '3px solid #2E5E3E' : '3px solid transparent',
              color: activeTab === 'billing' ? '#2E5E3E' : '#718096', transition: 'all 0.2s'
            }}>
            <i className="fas fa-file-invoice" style={{ marginRight: '8px' }}></i>
            Billing / Invoices
            <span style={{ marginLeft: '8px', background: activeTab === 'billing' ? '#C6F6D5' : '#edf2f7', color: activeTab === 'billing' ? '#22543D' : '#718096', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
              {archivedInvoices.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pets')}
            style={{
              padding: '12px 28px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
              background: 'none', borderBottom: activeTab === 'pets' ? '3px solid #2E5E3E' : '3px solid transparent',
              color: activeTab === 'pets' ? '#2E5E3E' : '#718096', transition: 'all 0.2s'
            }}>
            <i className="fas fa-paw" style={{ marginRight: '8px' }}></i>
            Pet Records
            <span style={{ marginLeft: '8px', background: activeTab === 'pets' ? '#C6F6D5' : '#edf2f7', color: activeTab === 'pets' ? '#22543D' : '#718096', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
              {archivedPets.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '12px 28px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
              background: 'none', borderBottom: activeTab === 'inventory' ? '3px solid #2E5E3E' : '3px solid transparent',
              color: activeTab === 'inventory' ? '#2E5E3E' : '#718096', transition: 'all 0.2s'
            }}>
            <i className="fas fa-boxes" style={{ marginRight: '8px' }}></i>
            Inventory
            <span style={{ marginLeft: '8px', background: activeTab === 'inventory' ? '#C6F6D5' : '#edf2f7', color: activeTab === 'inventory' ? '#22543D' : '#718096', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
              {archivedInventory.length}
            </span>
          </button>
        </div>

        {/* ===== APPOINTMENTS TAB ===== */}
        {activeTab === 'appointments' && (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2E5E3E' }}><i className="fas fa-archive"></i></div>
                <div className="stat-info"><h3>Total Archived</h3><p>{totalArchived}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2f855a' }}><i className="fas fa-check-circle"></i></div>
                <div className="stat-info"><h3>Paid</h3><p>{paidCount}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#3182ce' }}><i className="fas fa-clipboard-check"></i></div>
                <div className="stat-info"><h3>Completed</h3><p>{completedCount}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2E5E3E' }}><i className="fas fa-folder-open"></i></div>
                <div className="stat-info"><h3>Other Status</h3><p>{otherCount}</p></div>
              </div>
            </div>

            {/* Appointment Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <span className="filter-label"><i className="fas fa-search" style={{ marginRight: '5px' }}></i>Search:</span>
                <input type="text" className="filter-select" style={{ minWidth: '220px' }} placeholder="Search owner, pet, contact..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="filter-group">
                <span className="filter-label"><i className="fas fa-flag" style={{ marginRight: '5px' }}></i>Status:</span>
                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div className="filter-group">
                <span className="filter-label"><i className="fas fa-calendar" style={{ marginRight: '5px' }}></i>Appt Date:</span>
                <select className="filter-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="older">30+ Days</option>
                </select>
              </div>
              <button className="clear-filters-btn" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setDateFilter('all'); }}>
                <i className="fas fa-times"></i> Clear Filters
              </button>
            </div>

            {/* Appointments Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Owner</th><th>Pet</th><th>Contact</th><th>Date</th><th>Time</th><th>Type</th><th>Purpose</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apptLoading ? (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                      <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '10px' }}></i>
                      <p>Loading archived appointments...</p>
                    </td></tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                      <i className="fas fa-archive" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', opacity: 0.5 }}></i>
                      <p>{archivedAppointments.length === 0 ? 'No archived appointments yet.' : 'No appointments match the current filters.'}</p>
                    </td></tr>
                  ) : filteredAppointments.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small" style={{ background: '#FEFCBF', color: '#B7791F' }}>{app.owner.substring(0, 2).toUpperCase()}</div>
                          <div className="user-info-small"><span className="user-name">{app.owner}</span></div>
                        </div>
                      </td>
                      <td><span>{app.pet}</span><br /><span style={{ fontSize: '0.8rem', color: '#718096' }}>{app.species} - {app.breed}</span></td>
                      <td>{app.contact}</td>
                      <td>{app.date}</td>
                      <td>{app.time}</td>
                      <td>
                        {app.type === 'telemedicine'
                          ? <span style={{ background: '#EBF8FF', color: '#2B6CB0', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>Telemedicine</span>
                          : <span style={{ background: '#F0FFF4', color: '#2F855A', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>In-Person</span>}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{app.purpose}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <button className="unarchive-btn" onClick={() => handleUnarchiveAppointment(app.id, app.owner)}>
                          <i className="fas fa-undo-alt"></i> Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== BILLING TAB ===== */}
        {activeTab === 'billing' && (
          <>
            {/* Billing Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2E5E3E' }}><i className="fas fa-archive"></i></div>
                <div className="stat-info"><h3>Total Archived Invoices</h3><p>{archivedInvoices.length}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2f855a' }}><i className="fas fa-check-circle"></i></div>
                <div className="stat-info"><h3>Paid</h3><p>{archivedInvoices.filter(i => i.status === 'paid').length}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2E5E3E' }}><i className="fas fa-clock"></i></div>
                <div className="stat-info"><h3>Pending</h3><p>{archivedInvoices.filter(i => i.status === 'pending').length}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#e53e3e' }}><i className="fas fa-undo-alt"></i></div>
                <div className="stat-info"><h3>Refunded</h3><p>{archivedInvoices.filter(i => i.status === 'refunded').length}</p></div>
              </div>
            </div>

            {/* Billing Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <span className="filter-label"><i className="fas fa-search" style={{ marginRight: '5px' }}></i>Search:</span>
                <input type="text" className="filter-select" style={{ minWidth: '220px' }} placeholder="Search client or invoice ID..." value={billingSearch} onChange={(e) => setBillingSearch(e.target.value)} />
              </div>
              <div className="filter-group">
                <span className="filter-label"><i className="fas fa-flag" style={{ marginRight: '5px' }}></i>Status:</span>
                <select className="filter-select" value={billingStatusFilter} onChange={(e) => setBillingStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <button className="clear-filters-btn" onClick={() => { setBillingSearch(''); setBillingStatusFilter('all'); }}>
                <i className="fas fa-times"></i> Clear Filters
              </button>
            </div>

            {/* Billing Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Invoice #</th>
                    <th style={{ textAlign: 'left' }}>Client</th>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Source</th>
                    <th style={{ textAlign: 'left' }}>Amount</th>
                    <th style={{ textAlign: 'left' }}>Status</th>
                    <th style={{ textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBilling.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                      <i className="fas fa-file-invoice" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', opacity: 0.5 }}></i>
                      <p>{archivedInvoices.length === 0 ? 'No archived invoices yet.' : 'No invoices match the current filters.'}</p>
                    </td></tr>
                  ) : filteredBilling.map((inv) => (
                    <tr key={inv.id}>
                      <td><strong>{inv.id}</strong></td>
                      <td>{inv.clientName}</td>
                      <td>{inv.date}</td>
                      <td>
                        <span style={{ background: '#EBF8FF', color: '#2B6CB0', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize' }}>
                          {inv.source}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#2E5E3E' }}>₱{inv.totalAmount.toFixed(2)}</td>
                      <td>{getStatusBadge(inv.status)}</td>
                      <td>
                        <button
                          className="unarchive-btn"
                          onClick={() => {
                            unarchiveInvoice(inv.id);
                            setSuccessMessage(`Invoice ${inv.id} has been restored to active billing.`);
                          }}>
                          <i className="fas fa-undo-alt"></i> Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== PETS TAB ===== */}
        {activeTab === 'pets' && (
          <>
            {/* Pet Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2E5E3E' }}><i className="fas fa-archive"></i></div>
                <div className="stat-info"><h3>Total Archived Pets</h3><p>{totalArchivedPets}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2f855a' }}><i className="fas fa-dog"></i></div>
                <div className="stat-info"><h3>Dogs</h3><p>{dogCount}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#3182ce' }}><i className="fas fa-cat"></i></div>
                <div className="stat-info"><h3>Cats</h3><p>{catCount}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2E5E3E' }}><i className="fas fa-paw"></i></div>
                <div className="stat-info"><h3>Others</h3><p>{otherPetsCount}</p></div>
              </div>
            </div>

            {/* Pet Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <span className="filter-label"><i className="fas fa-search" style={{ marginRight: '5px' }}></i>Search:</span>
                <input type="text" className="filter-select" style={{ minWidth: '220px' }} placeholder="Search name, owner, breed..." value={petsSearch} onChange={(e) => setPetsSearch(e.target.value)} />
              </div>
              <div className="filter-group">
                <span className="filter-label"><i className="fas fa-syringe" style={{ marginRight: '5px' }}></i>Vaccine:</span>
                <select className="filter-select" value={petsVaccineFilter} onChange={(e) => setPetsVaccineFilter(e.target.value)}>
                  <option value="all">All Vaccines</option>
                  <option value="up to date">Up to Date</option>
                  <option value="overdue">Overdue</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <button className="clear-filters-btn" onClick={() => { setPetsSearch(''); setPetsVaccineFilter('all'); }}>
                <i className="fas fa-times"></i> Clear Filters
              </button>
            </div>

            {/* Pets Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>No.</th>
                    <th style={{ textAlign: 'left' }}>Owner Name</th>
                    <th style={{ textAlign: 'left' }}>Pet Name</th>
                    <th style={{ textAlign: 'left' }}>Species / Breed</th>
                    <th style={{ textAlign: 'left' }}>Contact</th>
                    <th style={{ textAlign: 'left' }}>Vaccine</th>
                    <th style={{ textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                      <i className="fas fa-paw" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', opacity: 0.5 }}></i>
                      <p>{archivedPets.length === 0 ? 'No archived pets yet.' : 'No pets match the current filters.'}</p>
                    </td></tr>
                  ) : filteredPets.map((pet, index) => (
                    <tr key={pet.id}>
                      <td><strong>{index + 1}</strong></td>
                      <td>{pet.ownerName}</td>
                      <td style={{ fontWeight: 600 }}>{pet.petName}</td>
                      <td>{pet.species} ({pet.breed})</td>
                      <td>{pet.contact}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: pet.vaccine === 'Up to Date' ? '#c6f6d5' : pet.vaccine === 'Overdue' ? '#fed7d7' : '#feebc8',
                          color: pet.vaccine === 'Up to Date' ? '#22543d' : pet.vaccine === 'Overdue' ? '#9b2c2c' : '#7b341e'
                        }}>
                          {pet.vaccine}
                        </span>
                      </td>
                      <td>
                        <button
                          className="unarchive-btn"
                          onClick={() => handleUnarchivePet(pet.id, pet.petName)}>
                          <i className="fas fa-undo-alt"></i> Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== INVENTORY TAB ===== */}
        {activeTab === 'inventory' && (
          <>
            {/* Inventory Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2E5E3E' }}><i className="fas fa-archive"></i></div>
                <div className="stat-info"><h3>Total Archived Items</h3><p>{archivedInventory.length}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2f855a' }}><i className="fas fa-pills"></i></div>
                <div className="stat-info"><h3>Medicines / Vaccines</h3><p>{archivedInventory.filter(i => ['medicine', 'vaccine', 'medications'].includes(i.category.toLowerCase())).length}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#3182ce' }}><i className="fas fa-shopping-basket"></i></div>
                <div className="stat-info"><h3>Supplies</h3><p>{archivedInventory.filter(i => i.category.toLowerCase().includes('supplies')).length}</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#2E5E3E' }}><i className="fas fa-boxes"></i></div>
                <div className="stat-info"><h3>Others</h3><p>{archivedInventory.filter(i => !['medicine', 'vaccine', 'medications'].includes(i.category.toLowerCase()) && !i.category.toLowerCase().includes('supplies')).length}</p></div>
              </div>
            </div>

            {/* Inventory Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <span className="filter-label"><i className="fas fa-search" style={{ marginRight: '5px' }}></i>Search:</span>
                <input type="text" className="filter-select" style={{ minWidth: '220px' }} placeholder="Search item name or desc..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} />
              </div>
              <div className="filter-group">
                <span className="filter-label"><i className="fas fa-flag" style={{ marginRight: '5px' }}></i>Category:</span>
                <select className="filter-select" value={inventoryCategoryFilter} onChange={(e) => setInventoryCategoryFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Vaccine">Vaccine</option>
                  <option value="Medications">Medications</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Pet Food">Pet Food</option>
                </select>
              </div>
              <button className="clear-filters-btn" onClick={() => { setInventorySearch(''); setInventoryCategoryFilter('all'); }}>
                <i className="fas fa-times"></i> Clear Filters
              </button>
            </div>

            {/* Inventory Table */}
            <div className="table-container" style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>ID</th>
                    <th style={{ width: '30%' }}>Item Name</th>
                    <th style={{ width: '20%' }}>Category</th>
                    <th style={{ width: '15%' }}>Price</th>
                    <th style={{ width: '10%' }}>Stock</th>
                    <th style={{ width: '10%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryLoading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                      <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '10px' }}></i>
                      <p>Loading archived inventory...</p>
                    </td></tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                      <i className="fas fa-boxes" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', opacity: 0.5 }}></i>
                      <p>{archivedInventory.length === 0 ? 'No archived inventory items yet.' : 'No items match the current filters.'}</p>
                    </td></tr>
                  ) : filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>#{item.id.toString().slice(0, 8).toUpperCase()}</td>
                      <td style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>{item.name}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          background: '#e2e8f0',
                          color: '#4a5568'
                        }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#2E5E3E' }}>₱{parseFloat(item.price).toFixed(2)}</td>
                      <td>{item.stock} units</td>
                      <td>
                        <button
                          className="unarchive-btn"
                          onClick={() => handleRestoreInventory(item.id, item.name)}>
                          <i className="fas fa-undo-alt"></i> Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>

      {/* Success Modal */}
      {successMessage && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 10000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#C6F6D5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <i className="fas fa-check" style={{ color: '#2E5E3E', fontSize: '2rem' }}></i>
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: '1.4rem' }}>Success!</h3>
            <p style={{ color: '#718096', marginBottom: '25px', lineHeight: '1.5' }}>{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} style={{ padding: '10px 30px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', width: '100%' }}>OK</button>
          </div>
        </div>
      )}
    </>
  );
}
