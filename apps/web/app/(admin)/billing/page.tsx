"use client";

import React, { useState } from 'react';
import './billing.css';

export default function BillingPage() {
  return (
    <>
      <div className="main-content" id="mainContent">
        <div className="top-bar">
            <div style={{"display":"flex","alignItems":"center"}}>
                <button className="menu-toggle" onClick={() => {}}><i className="fas fa-bars"></i></button>
                <div className="page-title"><h1>Billing & Invoices</h1><span>Financial Management</span></div>
            </div>
            <div className="user-info">
                <div className="search-container"><i className="fas fa-search"></i><input type="text" id="searchInvoice" placeholder="Search invoices..." onKeyUp={() => {}} /></div>
                <div className="notifications" onClick={() => {}}><i className="far fa-bell"></i><span className="badge">0</span></div>
                <div className="notification-panel" id="notificationPanel">
                    <div className="notification-header"><h3>Notifications</h3><span className="mark-read" onClick={() => {}}>Mark all read</span></div>
                    <div className="notification-list"><div className="notification-item"><div className="notification-icon"><i className="fas fa-info-circle"></i></div><div>No new notifications</div></div></div>
                </div>
                <div className="settings-container">
                    <div className="settings-icon" onClick={() => {}}><i className="fas fa-cog"></i></div>
                    <div className="settings-dropdown" id="settingsDropdown">
                        <div className="settings-header">Settings</div>
                        <div className="settings-item" onClick={() => {}}><i className="fas fa-sliders-h"></i><span>General Settings</span></div>
                        <div className="settings-item"><div className="darkmode-toggle"><span><i className="fas fa-moon"></i> Darkmode</span><label className="switch"><input type="checkbox" id="darkmodeToggle" onClick={() => {}} /><span className="slider"></span></label></div></div>
                        <div className="settings-item logout" onClick={() => {}}><i className="fas fa-sign-out-alt"></i><span>Logout</span></div>
                    </div>
                </div>
                <div className="user-profile"><div className="avatar"><span>A</span></div><div><div style={{"fontWeight":"600"}}>Admin</div><div style={{"fontSize":"0.8rem"}}>admin@furcare.com</div></div></div>
            </div>
        </div>

        <div className="dashboard-title"><h1>Billing Dashboard</h1></div>

        <div className="stats-grid">
            <div className="stat-card" onClick={() => {}}><div className="stat-header"><i className="fas fa-file-invoice"></i><h3>Total Invoices</h3></div><div className="stat-value" id="totalInvoices">0</div></div>
            <div className="stat-card" onClick={() => {}}><div className="stat-header"><i className="fas fa-check-circle"></i><h3>Paid</h3></div><div className="stat-value" id="totalPaid">₱0</div></div>
            <div className="stat-card" onClick={() => {}}><div className="stat-header"><i className="fas fa-clock"></i><h3>Pending</h3></div><div className="stat-value" id="totalPending">₱0</div></div>
            <div className="stat-card" onClick={() => {}}><div className="stat-header"><i className="fas fa-undo-alt"></i><h3>Refunded</h3></div><div className="stat-value" id="totalRefunded">₱0</div></div>
        </div>

        <div className="billing-controls">
            <button className="btn-primary" onClick={() => {}}><i className="fas fa-plus"></i> Create New Invoice</button>
            <div className="filter-group">
                <select id="statusFilter" onChange={() => {}}><option value="all">All Status</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="refunded">Refunded</option></select>
                <button className="btn-secondary" onClick={() => {}}><i className="fas fa-download"></i> Export Report</button>
            </div>
        </div>

        <div className="billing-table-container">
            <table className="data-table">
                <thead><tr><th>Invoice #</th><th>Client</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="invoiceTableBody"></tbody>
            </table>
        </div>
    </div>

    
    <div className="modal" id="invoiceModal"><div className="modal-content"><div className="modal-header"><h3 id="modalTitle">New Invoice</h3><button className="modal-close" onClick={() => {}}><i className="fas fa-times"></i></button></div>
    <div className="modal-body"><form id="invoiceForm"><div className="form-group"><label>Client Name</label><input type="text" className="form-control" id="clientName" placeholder="Client name" required /></div>
    <div className="form-group"><label>Invoice Date</label><input type="date" className="form-control" id="invoiceDate" required /></div>
    <div className="form-group"><label>Items & Services</label><div id="itemsContainer" className="invoice-items-container"></div><button type="button" className="add-item-btn" onClick={() => {}}><i className="fas fa-plus"></i> Add Item/Service</button></div>
    <div className="total-amount">Total: ₱<span id="totalAmountDisplay">0.00</span></div></form></div>
    <div className="modal-actions"><button className="btn-secondary" onClick={() => {}}>Cancel</button><button className="btn-primary" onClick={() => {}}>Save Invoice</button></div></div></div>

    
    <div className="modal" id="viewInvoiceModal"><div className="modal-content" style={{"maxWidth":"600px"}}><div className="modal-header"><h3>Invoice Details</h3><button className="modal-close" onClick={() => {}}><i className="fas fa-times"></i></button></div>
    <div className="modal-body" id="viewInvoiceBody"></div><div className="modal-actions"><button className="btn-primary" onClick={() => {}}>Close</button></div></div></div>

    <div id="toast"></div>

    
    </>
  );
}