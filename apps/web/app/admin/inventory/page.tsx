"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSharedInventory } from '../../../hooks/useInventory';
import { normalizeCategorySlug, normalizeCategoryName } from '../../../lib/categoryUtils';
import './inventory.css';

const ITEMS_PER_PAGE = 10;

export default function InventoryPage() {
  const router = useRouter();
  const { items, addItem, deleteItem, updateItem, archiveItem } = useSharedInventory();

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', category: '', description: '', dosageForm: '', expiryDate: '', stock: '', price: '' });
  const [selectedViewItem, setSelectedViewItem] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [itemToArchive, setItemToArchive] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const [availableCategories, setAvailableCategories] = useState<{ name: string; slug: string }[]>([
    { name: 'Pet Food', slug: 'food' },
    { name: 'Dog Supplies', slug: 'dog' },
    { name: 'Cat Supplies', slug: 'cat' },
    { name: 'Medications', slug: 'medications' },
    { name: 'Vaccine', slug: 'vaccine' },
    { name: 'Grooming', slug: 'grooming' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Equipment', slug: 'equipment' },
    { name: 'Supplies', slug: 'supplies' },
  ]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const defaults = [
            { name: 'Pet Food', slug: 'food' },
            { name: 'Dog Supplies', slug: 'dog' },
            { name: 'Cat Supplies', slug: 'cat' },
            { name: 'Medications', slug: 'medications' },
            { name: 'Vaccine', slug: 'vaccine' },
            { name: 'Grooming', slug: 'grooming' },
            { name: 'Accessories', slug: 'accessories' },
            { name: 'Equipment', slug: 'equipment' },
            { name: 'Supplies', slug: 'supplies' },
          ];
          const existingSlugs = new Set(defaults.map(d => normalizeCategorySlug(d.slug)));
          data.forEach(c => {
            const slug = normalizeCategorySlug(c.slug);
            if (!existingSlugs.has(slug) && slug !== 'other') {
              defaults.push({ name: c.name, slug: c.slug });
              existingSlugs.add(slug);
            }
          });
          setAvailableCategories(defaults);
        }
      })
      .catch(err => console.error('Failed to load categories in inventory:', err));
  }, []);

  const formatShortId = (id: any) => {
    if (!id) return '000000';
    const clean = String(id).replace(/[^a-zA-Z0-9]/g, '');
    if (clean.toLowerCase().startsWith('temp')) return clean.slice(-6).toUpperCase();
    if (clean.length >= 6) return clean.slice(0, 6).toUpperCase();
    return clean.padStart(6, '0').toUpperCase();
  };

  const formatCategoryDisplay = (cat: string) => normalizeCategoryName(cat);

  const getStockStatus = (stock: number) => {
    if (stock <= 50) return { label: 'Low Stock', class: 'inv-status-low' };
    if (stock <= 100) return { label: 'Medium', class: 'inv-status-medium' };
    return { label: 'In Stock', class: 'inv-status-high' };
  };

  const openItemModal = (itemToEdit?: any) => {
    if (itemToEdit && !itemToEdit.target) {
      setEditingId(itemToEdit.id);
      setNewItem({
        name: itemToEdit.name || '',
        category: itemToEdit.category || '',
        description: itemToEdit.description || '',
        dosageForm: itemToEdit.dosageForm || '',
        expiryDate: itemToEdit.expiryDate || itemToEdit.expirationDate || '',
        stock: itemToEdit.stock?.toString() || '',
        price: itemToEdit.price?.toString() || ''
      });
    } else {
      setEditingId(null);
      setNewItem({ name: '', category: '', description: '', dosageForm: '', expiryDate: '', stock: '', price: '' });
    }
    setValidationErrors({});
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setEditingId(null);
    setValidationErrors({});
    setNewItem({ name: '', category: '', description: '', dosageForm: '', expiryDate: '', stock: '', price: '' });
  };

  const saveItem = () => {
    const isMedOrVac = normalizeCategorySlug(newItem.category) === 'medications' || newItem.category === 'Vaccine';
    const errors: { [key: string]: string } = {};
    if (!newItem.name) errors.name = "Warning: Item Name is required";
    if (!newItem.category) errors.category = "Warning: Category is required";
    if (!newItem.description) errors.description = "Warning: Description is required";
    if (!newItem.stock) errors.stock = "Warning: Stock Quantity is required";
    if (!newItem.price) errors.price = "Warning: Unit Price is required";
    if (isMedOrVac) {
      if (!newItem.dosageForm) errors.dosageForm = "Warning: Dosage Form is required";
      if (!newItem.expiryDate) errors.expiryDate = "Warning: Expiration Date is required";
    }
    if (Object.keys(errors).length > 0) { setValidationErrors(errors); return; }
    setValidationErrors({});

    const isDuplicate = items.some(item => item.name.trim().toLowerCase() === newItem.name.trim().toLowerCase() && item.id !== editingId);
    if (isDuplicate) return setWarningMessage(`An item with the name "${newItem.name.trim()}" already exists in your inventory!`);

    if (editingId) {
      updateItem(editingId, {
        name: newItem.name, category: newItem.category,
        categoryLabel: normalizeCategoryName(newItem.category),
        description: newItem.description, dosageForm: newItem.dosageForm,
        expiryDate: newItem.expiryDate, stock: parseInt(newItem.stock) || 0, price: newItem.price
      });
      setWarningMessage('Item updated successfully!');
    } else {
      addItem({
        name: newItem.name, category: newItem.category,
        categoryLabel: normalizeCategoryName(newItem.category),
        description: newItem.description, dosageForm: newItem.dosageForm,
        expiryDate: newItem.expiryDate, stock: parseInt(newItem.stock) || 0, price: newItem.price
      });
      setWarningMessage('Item saved successfully!');
    }
    closeItemModal();
  };

  // Filtered items (search + category + stock)
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter(item => {
      const matchSearch = !q || item.name.toLowerCase().includes(q) || formatShortId(item.id).toLowerCase().includes(q);
      const matchCategory = categoryFilter === 'all' ||
        normalizeCategorySlug(item.category) === normalizeCategorySlug(categoryFilter) ||
        item.category.toLowerCase() === categoryFilter.toLowerCase();
      let matchStock = true;
      if (stockFilter === 'low') matchStock = item.stock <= 50;
      else if (stockFilter === 'medium') matchStock = item.stock > 50 && item.stock <= 100;
      else if (stockFilter === 'high') matchStock = item.stock > 100;
      else if (stockFilter === 'expiring') {
        if (!item.expiryDate) return false;
        const exp = new Date(item.expiryDate);
        const diffDays = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 90;
      }
      return matchSearch && matchCategory && matchStock;
    });
  }, [items, searchQuery, categoryFilter, stockFilter]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, categoryFilter, stockFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const pagedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Selection helpers
  const allPageSelected = pagedItems.length > 0 && pagedItems.every(i => selectedIds.has(i.id));
  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds(prev => { const n = new Set(prev); pagedItems.forEach(i => n.delete(i.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); pagedItems.forEach(i => n.add(i.id)); return n; });
    }
  };
  const toggleSelect = (id: any) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // Stats
  const totalItems = items.length;
  const lowStockCount = items.filter(i => i.stock <= 50).length;
  const expiringCount = items.filter(i => {
    if (!i.expiryDate) return false;
    const exp = new Date(i.expiryDate);
    const diffDays = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 90;
  }).length;
  const rawTotalValue = items.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (item.stock || 0)), 0);
  const totalValue = rawTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} id="mainContent">

      {/* ── STATS GRID (Matching Products Design) ── */}
      <div className="prod-stats-grid inv-stats-grid stats-grid">
        {/* Total Items */}
        <div className="prod-stat-card inv-stat-card stat-card">
          <div className="prod-stat-icon inv-stat-icon icon-products icon-items">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="prod-stat-info inv-stat-info stat-info">
            <h3>Total Items</h3>
            <div className="prod-stat-value-row inv-stat-value-row">
              <span className="prod-stat-value inv-stat-value">{totalItems}</span>
              <span className="prod-stat-badge inv-stat-badge badge-green">+2 this month</span>
            </div>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className={`prod-stat-card inv-stat-card stat-card ${lowStockCount > 0 ? 'stat-warning' : ''}`}>
          <div className="prod-stat-icon inv-stat-icon icon-warning">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="prod-stat-info inv-stat-info stat-info">
            <h3>Low Stock</h3>
            <div className="prod-stat-value-row inv-stat-value-row">
              <span className="prod-stat-value inv-stat-value">{lowStockCount}</span>
            </div>
            <button 
              className="prod-stat-link inv-stat-link link-amber"
              onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
            >
              {stockFilter === 'low' ? 'Show all items \u00D7' : 'View items \u2192'}
            </button>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className={`prod-stat-card inv-stat-card stat-card ${expiringCount > 0 ? 'stat-warning' : ''}`}>
          <div className={`prod-stat-icon inv-stat-icon ${expiringCount > 0 ? 'icon-warning' : 'icon-expiring'}`}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="prod-stat-info inv-stat-info stat-info">
            <h3>Expiring Soon</h3>
            <div className="prod-stat-value-row inv-stat-value-row">
              <span className="prod-stat-value inv-stat-value">{expiringCount}</span>
            </div>
            <button 
              className="prod-stat-link inv-stat-link link-amber"
              onClick={() => setStockFilter(stockFilter === 'expiring' ? 'all' : 'expiring')}
            >
              {stockFilter === 'expiring' ? 'Show all items \u00D7' : 'View items \u2192'}
            </button>
          </div>
        </div>

        {/* Total Value */}
        <div className="prod-stat-card inv-stat-card stat-card">
          <div className="prod-stat-icon inv-stat-icon icon-sales icon-value">
            <i className="fas fa-peso-sign"></i>
          </div>
          <div className="prod-stat-info inv-stat-info stat-info">
            <h3>Total Value</h3>
            <div className="prod-stat-value-row inv-stat-value-row">
              <span className="prod-stat-value inv-stat-value">₱{totalValue}</span>
              <span className="prod-stat-badge inv-stat-badge badge-neutral">{availableCategories.length} categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── REDESIGNED TOOLBAR ── */}
      <div className="inv-toolbar">
        {/* Add New Item button */}
        <button className="inv-add-btn" onClick={() => openItemModal()} id="addNewItemBtn">
          <i className="fas fa-plus"></i>
          Add New Item
        </button>

        {/* Search bar */}
        <div className="inv-search-wrap">
          <i className="fas fa-search inv-search-icon"></i>
          <input
            id="inventorySearchInput"
            type="text"
            className="inv-search-input"
            placeholder="Search item name or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="inv-search-clear" onClick={() => setSearchQuery('')} title="Clear search">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Category dropdown */}
        <select
          id="categoryFilter"
          className="inv-filter-select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {availableCategories.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Stock Status dropdown */}
        <select
          id="stockFilter"
          className="inv-filter-select"
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value)}
        >
          <option value="all">All Stock Status</option>
          <option value="low">Low Stock (≤ 50)</option>
          <option value="medium">Medium (51–100)</option>
          <option value="high">In Stock (&gt;100)</option>
          <option value="expiring">Expiring Soon (≤ 90 days)</option>
        </select>
      </div>

      {/* ── INVENTORY TABLE ── */}
      <div className="inv-table-card">
        {/* Table header row with result count */}
        <div className="inv-table-header">
          <span className="inv-result-count">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </span>
          {selectedIds.size > 0 && (
            <span className="inv-selected-label">
              <i className="fas fa-check-square" style={{ marginRight: '6px', color: '#2E5E3E' }}></i>
              {selectedIds.size} selected
            </span>
          )}
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: '3%' }}>
                  <input
                    type="checkbox"
                    className="inv-checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    title="Select all on page"
                  />
                </th>
                <th style={{ width: '9%' }}>ID</th>
                <th style={{ width: '26%' }}>Product Name</th>
                <th style={{ width: '12%' }}>Category</th>
                <th style={{ width: '13%' }}>Expiration Date</th>
                <th style={{ width: '12%' }}>Stock Qty</th>
                <th style={{ width: '10%' }}>Unit Price</th>
                <th style={{ width: '9%' }}>Status</th>
                <th style={{ width: '6%' }}>Actions</th>
              </tr>
            </thead>
            <tbody id="inventoryTableBody">
              {pagedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="inv-empty-row">
                    <div className="inv-empty-state">
                      <i className="fas fa-box-open"></i>
                      <p>No inventory items found</p>
                      <span>Try adjusting your search or filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedItems.map(item => {
                  const stockStatus = getStockStatus(item.stock);
                  return (
                    <tr
                      key={item.id}
                      className={selectedIds.has(item.id) ? 'inv-row-selected' : ''}
                      onClick={() => setSelectedViewItem(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="inv-checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td>
                        <span className="inv-id-badge">#{formatShortId(item.id)}</span>
                      </td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
                        <span style={{ fontWeight: 600, color: '#1a202c' }}>{item.name}</span>
                      </td>
                      <td>
                        <span className={`inv-cat-badge inv-cat-${normalizeCategorySlug(item.category)}`}>
                          {formatCategoryDisplay(item.category)}
                        </span>
                      </td>
                      <td style={{ color: item.expiryDate ? '#4a5568' : '#a0aec0' }}>
                        {item.expiryDate || '—'}
                      </td>
                      <td>
                        <span className={`inv-stock-badge ${item.stock <= 50 ? 'inv-stock-low' : 'inv-stock-ok'}`}>
                          {item.stock} <span style={{ opacity: 0.75, fontSize: '0.78rem' }}>units</span>
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#2E5E3E' }}>₱{item.price}</td>
                      <td>
                        <span className={`inv-status-badge ${stockStatus.class}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="inv-action-btns">
                          <button
                            className="inv-act-btn inv-act-edit"
                            title="Edit item"
                            onClick={() => openItemModal(item)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="inv-act-btn inv-act-archive"
                            title="Archive item"
                            onClick={() => setItemToArchive(item)}
                          >
                            <i className="fas fa-archive"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="inv-pagination" id="pagination">
            <span className="inv-page-info">
              Page {currentPage} of {totalPages} &nbsp;·&nbsp; {filteredItems.length} items
            </span>
            <div className="inv-page-btns">
              <button
                className="inv-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="First page"
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button
                className="inv-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                title="Previous page"
              >
                <i className="fas fa-angle-left"></i>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    className={`inv-page-btn ${currentPage === page ? 'inv-page-active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                className="inv-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                title="Next page"
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button
                className="inv-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Last page"
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ── ADD / EDIT ITEM MODAL (Redesigned) ── */}
    {isItemModalOpen && (
    <div className="inv-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeItemModal(); }}>
      <div className="inv-modal-container" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="inv-modal-header">
          <div className="inv-modal-title">
            <span className="inv-modal-title-icon">
              <i className={editingId ? "fas fa-edit" : "fas fa-plus"}></i>
            </span>
            <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
          </div>
          <button className="inv-modal-close" onClick={closeItemModal} title="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="inv-modal-divider"></div>

        {/* Body */}
        <form className="inv-modal-body" onSubmit={(e) => { e.preventDefault(); saveItem(); }}>

          {/* Row 1: Name + Category */}
          <div className="inv-form-grid">
            <div className="inv-field-group">
              <label className="inv-field-label">
                <i className="fas fa-tag"></i> Item Name <span className="inv-required">*</span>
              </label>
              <input
                id="fieldItemName"
                type="text"
                className={`inv-field-input${validationErrors.name ? ' inv-field-error' : ''}`}
                placeholder="e.g. Amoxicillin 500mg"
                value={newItem.name}
                onChange={e => { setNewItem({...newItem, name: e.target.value}); if (validationErrors.name) setValidationErrors({...validationErrors, name: ''}); }}
              />
              {validationErrors.name && <span className="inv-error-msg"><i className="fas fa-exclamation-circle"></i> {validationErrors.name.replace('Warning: ', '')}</span>}
            </div>

            <div className="inv-field-group">
              <label className="inv-field-label">
                <i className="fas fa-folder-open"></i> Category <span className="inv-required">*</span>
              </label>
              <select
                id="fieldCategory"
                className={`inv-field-select${validationErrors.category ? ' inv-field-error' : ''}`}
                value={newItem.category}
                onChange={e => { setNewItem({...newItem, category: e.target.value}); if (validationErrors.category) setValidationErrors({...validationErrors, category: ''}); }}
              >
                <option value="">Select category</option>
                <option value="Medicine">Medicine</option>
                <option value="Vaccine">Vaccine</option>
                <option value="Medications">Medications</option>
                <option value="Equipment">Equipment</option>
                <option value="Supplies">Supplies</option>
                <option value="Dog Supplies">Dog Supplies</option>
                <option value="Cat Supplies">Cat Supplies</option>
                <option value="Pet Food">Pet Food</option>
                <option value="Grooming">Grooming</option>
                <option value="Accessories">Accessories</option>
              </select>
              {validationErrors.category && <span className="inv-error-msg"><i className="fas fa-exclamation-circle"></i> {validationErrors.category.replace('Warning: ', '')}</span>}
            </div>
          </div>

          {/* Row 2: Description (full width) */}
          <div className="inv-field-group">
            <label className="inv-field-label">
              <i className="fas fa-align-left"></i> Description <span className="inv-required">*</span>
            </label>
            <textarea
              id="fieldDescription"
              className={`inv-field-textarea${validationErrors.description ? ' inv-field-error' : ''}`}
              rows={2}
              placeholder="Brief description of the item, usage, or notes..."
              value={newItem.description}
              onChange={e => { setNewItem({...newItem, description: e.target.value}); if (validationErrors.description) setValidationErrors({...validationErrors, description: ''}); }}
            />
            {validationErrors.description && <span className="inv-error-msg"><i className="fas fa-exclamation-circle"></i> {validationErrors.description.replace('Warning: ', '')}</span>}
          </div>

          {/* Conditional: Dosage Form (Med/Vaccine only) */}
          {(newItem.category === 'Medicine' || newItem.category === 'Vaccine' || newItem.category === 'Medications') && (
            <div className="inv-form-grid">
              <div className="inv-field-group">
                <label className="inv-field-label">
                  <i className="fas fa-capsules"></i> Dosage Form <span className="inv-required">*</span>
                </label>
                <input
                  id="fieldDosageForm"
                  type="text"
                  className={`inv-field-input${validationErrors.dosageForm ? ' inv-field-error' : ''}`}
                  placeholder="e.g. Tablet, Capsule, Syrup"
                  value={newItem.dosageForm}
                  onChange={e => { setNewItem({...newItem, dosageForm: e.target.value}); if (validationErrors.dosageForm) setValidationErrors({...validationErrors, dosageForm: ''}); }}
                />
                {validationErrors.dosageForm && <span className="inv-error-msg"><i className="fas fa-exclamation-circle"></i> {validationErrors.dosageForm.replace('Warning: ', '')}</span>}
              </div>

              <div className="inv-field-group">
                <label className="inv-field-label">
                  <i className="fas fa-calendar-alt"></i> Expiration Date <span className="inv-required">*</span>
                </label>
                <input
                  id="fieldExpiryDate"
                  type="date"
                  className={`inv-field-input${validationErrors.expiryDate ? ' inv-field-error' : ''}`}
                  value={newItem.expiryDate}
                  onChange={e => { setNewItem({...newItem, expiryDate: e.target.value}); if (validationErrors.expiryDate) setValidationErrors({...validationErrors, expiryDate: ''}); }}
                />
                {validationErrors.expiryDate && <span className="inv-error-msg"><i className="fas fa-exclamation-circle"></i> {validationErrors.expiryDate.replace('Warning: ', '')}</span>}
              </div>
            </div>
          )}

          {/* Row 3: Stock Qty (stepper) + Unit Price (₱ prefix) */}
          <div className="inv-form-grid">
            <div className="inv-field-group">
              <label className="inv-field-label">
                <i className="fas fa-layer-group"></i> Stock Quantity <span className="inv-required">*</span>
              </label>
              <div className={`inv-stepper-wrap${validationErrors.stock ? ' inv-field-error' : ''}`}>
                <button
                  type="button"
                  className="inv-stepper-btn"
                  onClick={() => {
                    const cur = parseInt(newItem.stock) || 0;
                    if (cur > 0) { setNewItem({...newItem, stock: String(cur - 1)}); if (validationErrors.stock) setValidationErrors({...validationErrors, stock: ''}); }
                  }}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <input
                  id="fieldStock"
                  type="number"
                  className="inv-stepper-input"
                  placeholder="0"
                  value={newItem.stock}
                  onChange={e => { setNewItem({...newItem, stock: e.target.value}); if (validationErrors.stock) setValidationErrors({...validationErrors, stock: ''}); }}
                />
                <button
                  type="button"
                  className="inv-stepper-btn"
                  onClick={() => {
                    const cur = parseInt(newItem.stock) || 0;
                    setNewItem({...newItem, stock: String(cur + 1)});
                    if (validationErrors.stock) setValidationErrors({...validationErrors, stock: ''});
                  }}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              {validationErrors.stock && <span className="inv-error-msg"><i className="fas fa-exclamation-circle"></i> {validationErrors.stock.replace('Warning: ', '')}</span>}
            </div>

            <div className="inv-field-group">
              <label className="inv-field-label">
                <i className="fas fa-peso-sign"></i> Unit Price <span className="inv-required">*</span>
              </label>
              <div className={`inv-price-wrap${validationErrors.price ? ' inv-field-error' : ''}`}>
                <span className="inv-price-prefix">₱</span>
                <input
                  id="fieldPrice"
                  type="number"
                  step="0.01"
                  className="inv-price-input"
                  placeholder="0.00"
                  value={newItem.price}
                  onChange={e => { setNewItem({...newItem, price: e.target.value}); if (validationErrors.price) setValidationErrors({...validationErrors, price: ''}); }}
                />
              </div>
              {validationErrors.price && <span className="inv-error-msg"><i className="fas fa-exclamation-circle"></i> {validationErrors.price.replace('Warning: ', '')}</span>}
            </div>
          </div>

          {/* Footer */}
          <div className="inv-modal-footer">
            <button type="button" className="inv-btn-cancel" onClick={closeItemModal}>Cancel</button>
            <button type="submit" className="inv-btn-save">
              <i className="fas fa-check"></i> Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
    )}

    {/* ── WARNING / SUCCESS MODAL ── */}
    {warningMessage && (
    <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setWarningMessage(null)}>
        <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0, justifyContent: 'center' }}>
                <h3 style={{ color: warningMessage.includes('successfully') ? '#2E5E3E' : '#E53E3E', width: '100%', fontSize: '1.5rem', marginTop: '10px' }}>
                    <i className={warningMessage.includes('successfully') ? "fas fa-check-circle" : "fas fa-exclamation-triangle"} style={{ marginRight: '10px' }}></i>
                    {warningMessage.includes('successfully') ? 'Success' : 'Notice'}
                </h3>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
                <p style={{ whiteSpace: 'pre-line', color: '#4a5568', fontSize: '1.05rem', lineHeight: '1.6' }}>{warningMessage}</p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0, marginBottom: '10px' }}>
                <button className="btn btn-primary" onClick={() => setWarningMessage(null)} style={{ width: '100%', maxWidth: '200px' }}>Okay</button>
            </div>
        </div>
    </div>
    )}

    {/* ── ITEM DETAIL VIEW MODAL ── */}
    {selectedViewItem && (
      <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedViewItem(null)}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '90%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: '24px', border: 'none', background: 'white' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
                      <i className="fas fa-info-circle" style={{ color: '#2E5E3E' }}></i>
                      Inventory Item Details
                  </h3>
                  <button className="modal-close" onClick={() => setSelectedViewItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#a0aec0', padding: '4px' }}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body" style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                          <span style={{ fontSize: '0.8rem', color: '#a0aec0', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Item ID</span>
                          <span style={{ fontSize: '1rem', color: '#4a5568', fontWeight: 600 }}>#{formatShortId(selectedViewItem.id)}</span>
                      </div>
                      <span className={`status-badge ${selectedViewItem.category.replace(' ', '-').toLowerCase()}`} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>{formatCategoryDisplay(selectedViewItem.category)}</span>
                  </div>
                  <div>
                      <span style={{ fontSize: '0.8rem', color: '#a0aec0', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '2px' }}>Item Name</span>
                      <h2 style={{ fontSize: '1.4rem', color: '#2d3748', margin: 0, fontWeight: 700 }}>{selectedViewItem.name}</h2>
                  </div>
                  <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#a0aec0', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '4px' }}>Description</span>
                      <p style={{ fontSize: '0.95rem', color: '#4a5568', margin: 0, lineHeight: 1.5 }}>{selectedViewItem.description || '-'}</p>
                  </div>
                  {['medicine', 'vaccine', 'medications'].includes(selectedViewItem.category.toLowerCase()) && selectedViewItem.dosageForm && (
                      <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#a0aec0', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '4px' }}>Dosage Form</span>
                          <span style={{ fontSize: '0.95rem', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                              <i className="fas fa-capsules" style={{ color: '#2E5E3E' }}></i>
                              {selectedViewItem.dosageForm}
                          </span>
                      </div>
                  )}
                  <div style={{ background: '#f7fafc', borderRadius: '16px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', border: '1px solid #edf2f7', marginTop: '8px' }}>
                      <div>
                          <span style={{ fontSize: '0.8rem', color: '#a0aec0', display: 'block', marginBottom: '4px' }}>Unit Price</span>
                          <span style={{ fontSize: '1.25rem', color: '#2E5E3E', fontWeight: 800 }}>₱{selectedViewItem.price}</span>
                      </div>
                      <div>
                          <span style={{ fontSize: '0.8rem', color: '#a0aec0', display: 'block', marginBottom: '4px' }}>Stock Quantity</span>
                          <span className={selectedViewItem.stock <= 50 ? 'status-badge low-stock' : 'status-badge in-stock'} style={{ display: 'inline-block', fontSize: '0.9rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                              {selectedViewItem.stock} units
                          </span>
                      </div>
                      {['medicine', 'vaccine', 'medications'].includes(selectedViewItem.category.toLowerCase()) && selectedViewItem.expiryDate && (
                          <div style={{ gridColumn: 'span 2' }}>
                              <span style={{ fontSize: '0.8rem', color: '#a0aec0', display: 'block', marginBottom: '4px' }}>Expiration Date</span>
                              <span style={{ fontSize: '0.95rem', color: '#e53e3e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <i className="fas fa-calendar-times"></i>
                                  {selectedViewItem.expiryDate}
                              </span>
                          </div>
                      )}
                  </div>
              </div>
              <div className="modal-actions" style={{ borderTop: '1px solid #edf2f7', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px', margin: 0 }}>
                  <button className="btn btn-secondary" onClick={() => setSelectedViewItem(null)} style={{ padding: '10px 20px', borderRadius: '12px' }}>Close</button>
                  <button className="btn btn-primary" onClick={() => { openItemModal(selectedViewItem); setSelectedViewItem(null); }} style={{ padding: '10px 20px', borderRadius: '12px', background: '#2E5E3E', borderColor: '#2E5E3E' }}><i className="fas fa-edit" style={{ marginRight: '8px' }}></i>Edit Item</button>
              </div>
          </div>
      </div>
    )}

    {/* ── ARCHIVE CONFIRM MODAL ── */}
    {itemToArchive && (
      <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setItemToArchive(null)}>
          <div className="modal-content" style={{ maxWidth: '400px', width: '90%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: '24px', border: 'none', background: 'white', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#C6F6D5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fas fa-archive" style={{ fontSize: '1.5rem', color: '#2E5E3E' }}></i>
                  </div>
                  <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#2d3748', fontWeight: 700 }}>Archive Inventory Item</h3>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#718096', lineHeight: 1.5 }}>
                          Are you sure you want to archive <strong>{itemToArchive.name}</strong>? It will be sent to the Archive module and can be restored anytime.
                      </p>
                  </div>
              </div>
              <div className="modal-actions" style={{ borderTop: 'none', marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px', padding: 0 }}>
                  <button className="btn btn-secondary" onClick={() => setItemToArchive(null)} style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#4a5568', cursor: 'pointer' }}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => {
                      archiveItem(itemToArchive.id);
                      setWarningMessage(`Item "${itemToArchive.name}" has been successfully archived.`);
                      setItemToArchive(null);
                  }} style={{ padding: '10px 20px', borderRadius: '12px', background: '#2E5E3E', borderColor: '#2E5E3E', color: 'white', cursor: 'pointer' }}>Archive</button>
              </div>
          </div>
      </div>
    )}

    <div id="toast"></div>
    </>
  );
}
