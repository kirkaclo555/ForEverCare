"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSharedInventory } from '../../../hooks/useInventory';
import { useBilling } from '../../../hooks/useBilling';
import { useOrders } from '../../../hooks/useOrders';
import { normalizeCategorySlug, normalizeCategoryName } from '../../../lib/categoryUtils';
import './products.css';

export default function ProductsPage() {
  const router = useRouter();

  // Inventory & Orders Hooks
  const { addItem, updateItem, sellItem, getSellableItems, fetchInventory, deleteItem } = useSharedInventory();
  const { invoices, addInvoice } = useBilling();
  const { orders, fetchOrders, updateOrderStatus } = useOrders('PENDING');
  const { orders: allOrders, fetchOrders: fetchAllOrders } = useOrders();

  // Primary Filter & View States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'name_asc' | 'stock_asc'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // UI Dropdown States
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | number | null>(null);

  // Modals & Active Selections
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', costPrice: '', category: 'food', stock: '', badge: '', image: '', description: '' });
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const [sellModalProduct, setSellModalProduct] = useState<any>(null);
  const [sellQuantity, setSellQuantity] = useState('1');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [selectedViewProduct, setSelectedViewProduct] = useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('fa-tag');

  const [isViewOrdersModalOpen, setIsViewOrdersModalOpen] = useState(false);
  const [selectedViewOrder, setSelectedViewOrder] = useState<any>(null);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<any>(null);
  const [isHistoryOrderDetailsModalOpen, setIsHistoryOrderDetailsModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);

  // Confirmation & Feedback States
  const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [showProcessConfirmModal, setShowProcessConfirmModal] = useState<boolean>(false);
  const [orderToProcess, setOrderToProcess] = useState<any>(null);
  const [showDeliverConfirmModal, setShowDeliverConfirmModal] = useState<boolean>(false);
  const [orderToDeliver, setOrderToDeliver] = useState<any>(null);
  const [showPickedUpConfirmModal, setShowPickedUpConfirmModal] = useState<boolean>(false);
  const [orderToPickUp, setOrderToPickUp] = useState<any>(null);
  const [showCompleteConfirmModal, setShowCompleteConfirmModal] = useState<boolean>(false);
  const [orderToComplete, setOrderToComplete] = useState<any>(null);

  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [processSuccessMessage, setProcessSuccessMessage] = useState<string | null>(null);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories Setup
  const [customCategories, setCustomCategories] = useState<{ name: string; slug: string; icon: string }[]>([
    { name: 'Medications', slug: 'medications', icon: 'fa-pills' },
    { name: 'Grooming', slug: 'grooming', icon: 'fa-cut' },
    { name: 'Pet Food', slug: 'food', icon: 'fa-utensils' },
    { name: 'Accessories', slug: 'accessories', icon: 'fa-bed' },
    { name: 'Dog Supplies', slug: 'dog', icon: 'fa-dog' },
    { name: 'Cat Supplies', slug: 'cat', icon: 'fa-cat' }
  ]);

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomCategories(data);
        }
      })
      .catch(err => console.error('Failed to load categories', err));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Close card menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.prod-card-more-wrap') && !target.closest('.prod-dropdown-wrapper')) {
        setActiveCardMenuId(null);
        setIsFilterDropdownOpen(false);
        setIsOverflowMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch all orders when view orders modal opens
  useEffect(() => {
    if (isViewOrdersModalOpen) {
      fetchAllOrders();
    }
  }, [isViewOrdersModalOpen, fetchAllOrders]);

  // Handle URL highlight for pending order
  const [highlightOrder, setHighlightOrder] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const highlight = params.get('highlightOrder');
      if (highlight) {
        setHighlightOrder(highlight.toUpperCase());
      }
    }
  }, []);

  useEffect(() => {
    if (highlightOrder && orders.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`pending-order-${highlightOrder}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [highlightOrder, orders]);

  // Auto-sync categories from products if any newly discovered
  const allProducts = getSellableItems();

  useEffect(() => {
    if (allProducts.length > 0) {
      const existingSlugs = new Set(customCategories.map(c => normalizeCategorySlug(c.slug)));
      ['dog', 'cat', 'medications', 'grooming', 'food', 'accessories'].forEach(s => existingSlugs.add(s));

      allProducts.forEach(p => {
        const slug = normalizeCategorySlug(p.category);
        if (slug && !existingSlugs.has(slug) && slug !== 'other') {
          const newCat = {
            name: p.categoryLabel || normalizeCategoryName(p.category),
            slug: slug,
            icon: p.icon || 'fa-box'
          };
          fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCat)
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) fetchCategories();
          })
          .catch(err => console.error('Error auto-syncing category', err));

          existingSlugs.add(slug);
        }
      });
    }
  }, [allProducts, customCategories]);

  // Summary Metrics
  const totalProductsCount = allProducts.length;
  const categoriesCount = customCategories.length;
  const todayStr = new Date().toISOString().split('T')[0] || '';
  const todaysProductOrders = invoices.filter(inv => inv.source === 'product' && inv.date === todayStr);
  const todayOrdersCount = todaysProductOrders.length;
  const todayRevenueValue = todaysProductOrders
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const lowStockCount = allProducts.filter(p => p.stock <= 10).length;

  const formatCategoryDisplay = (cat: string) => normalizeCategoryName(cat);

  // Category Tabs List
  const categoryTabs = useMemo(() => {
    return [
      { name: 'All', slug: 'all', icon: 'fa-paw', count: allProducts.length },
      ...customCategories.map(cat => ({
        ...cat,
        count: allProducts.filter(p => normalizeCategorySlug(p.category) === normalizeCategorySlug(cat.slug)).length
      }))
    ];
  }, [allProducts, customCategories]);

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Category Filter
    if (activeCategory !== 'all') {
      list = list.filter(p => normalizeCategorySlug(p.category) === normalizeCategorySlug(activeCategory));
    }

    // Live Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Stock Filter
    if (stockFilter === 'in_stock') {
      list = list.filter(p => p.stock > 10);
    } else if (stockFilter === 'low_stock') {
      list = list.filter(p => p.stock <= 10 && p.stock > 0);
    } else if (stockFilter === 'out_of_stock') {
      list = list.filter(p => p.stock <= 0);
    }

    // Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'stock_asc') {
      list.sort((a, b) => a.stock - b.stock);
    }

    return list;
  }, [allProducts, activeCategory, searchQuery, stockFilter, sortBy]);

  // Product Actions
  const handleEditClick = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      costPrice: product.costPrice ? product.costPrice.toString() : '',
      category: normalizeCategorySlug(product.category),
      stock: product.stock.toString(),
      badge: product.badge || '',
      image: product.image || '',
      description: product.description || ''
    });
    setActiveCardMenuId(null);
    setIsProductModalOpen(true);
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    setActiveCardMenuId(null);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      deleteItem(productToDelete.id);
      setWarningMessage('Product removed successfully!');
      setShowDeleteConfirmModal(false);
      setProductToDelete(null);
    }
  };

  const handleSellClick = (product: any) => {
    setSellModalProduct(product);
    setSellQuantity('1');
    setActiveCardMenuId(null);
  };

  const proceedToPayment = () => {
    const qty = parseInt(sellQuantity);
    if (!qty || qty <= 0) return setWarningMessage('Please enter a valid quantity');
    if (qty > sellModalProduct.stock) return setWarningMessage('Not enough stock available');
    setPaymentAmount(qty * parseFloat(sellModalProduct.price));
    setIsPaymentModalOpen(true);
  };

  const completePayment = () => {
    const qty = parseInt(sellQuantity);
    sellItem(sellModalProduct.id, qty);
    
    addInvoice({
      clientName: "Walk-in Customer",
      date: new Date().toISOString().split('T')[0] || '',
      items: [{
        id: sellModalProduct.id.toString(),
        name: sellModalProduct.name,
        quantity: qty,
        price: parseFloat(sellModalProduct.price)
      }],
      totalAmount: paymentAmount,
      status: 'paid',
      source: 'product'
    });

    setIsPaymentModalOpen(false);
    setSellModalProduct(null);
    setSellQuantity('1');
    setWarningMessage('Payment successful! Order processed and Invoice generated.');
  };

  const handleSaveProduct = () => {
    const errors: { [key: string]: string } = {};
    if (!newProduct.name || !newProduct.name.trim()) errors.name = "Product Name is required";
    if (!newProduct.price) errors.price = "Price is required";
    if (!newProduct.stock) errors.stock = "Stock quantity is required";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const isDuplicate = allProducts.some(p => p.name.trim().toLowerCase() === newProduct.name.trim().toLowerCase() && p.id !== editingProductId);
    if (isDuplicate) {
      return setWarningMessage(`A product with the name "${newProduct.name.trim()}" already exists!`);
    }
    
    setValidationErrors({});
    
    const matchedCat = customCategories.find(c => normalizeCategorySlug(c.slug) === normalizeCategorySlug(newProduct.category));
    let categoryLabel = matchedCat ? matchedCat.name : normalizeCategoryName(newProduct.category);
    let icon = matchedCat ? matchedCat.icon : 'fa-box';

    if (editingProductId !== null) {
      updateItem(editingProductId, { ...newProduct, stock: parseInt(newProduct.stock), categoryLabel, icon, image: newProduct.image, description: newProduct.description });
      setWarningMessage('Product updated successfully!');
    } else {
      addItem({ ...newProduct, stock: parseInt(newProduct.stock), categoryLabel, icon, image: newProduct.image, description: newProduct.description });
      setWarningMessage('Product saved successfully!');
    }
    setIsProductModalOpen(false);
    setEditingProductId(null);
    setValidationErrors({});
    setNewProduct({ name: '', price: '', costPrice: '', category: 'food', stock: '', badge: '', image: '', description: '' });
  };

  // Category CRUD
  const handleAddCategory = () => {
    if (!newCategoryName || !newCategoryName.trim()) return setWarningMessage('Category Name is required');
    const slug = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-');
    
    const isDuplicate = customCategories.some(c => c.slug === slug);
    if (isDuplicate) return setWarningMessage('Category already exists');

    const newCat = {
      name: newCategoryName.trim(),
      slug: slug,
      icon: newCategoryIcon
    };

    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCustomCategories(prev => [...prev, data.category]);
        setNewCategoryName('');
        setNewCategoryIcon('fa-tag');
        setWarningMessage('Category added successfully! It is now selectable inside your inventory.');
      } else {
        setWarningMessage('Failed to add category: ' + data.error);
      }
    })
    .catch(err => setWarningMessage('Error saving category: ' + err.message));
  };

  const handleDeleteCategory = (slugToDelete: string) => {
    if (['dog', 'cat', 'medications', 'grooming', 'food', 'accessories'].includes(slugToDelete)) {
      return setWarningMessage('Default system categories cannot be deleted.');
    }
    setIsCategoryModalOpen(false);
    setCategoryToDelete(slugToDelete);
    setShowCategoryDeleteModal(true);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    fetch(`/api/categories?slug=${categoryToDelete}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCustomCategories(prev => prev.filter(c => c.slug !== categoryToDelete));
          setWarningMessage('Category deleted successfully!');
        } else {
          setWarningMessage('Failed to delete category: ' + data.error);
        }
      })
      .catch(err => setWarningMessage('Error deleting category: ' + err.message))
      .finally(() => {
        setShowCategoryDeleteModal(false);
        setCategoryToDelete(null);
      });
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Product ID', 'Name', 'Category', 'Price (PHP)', 'Cost Price (PHP)', 'Stock Units', 'Badge', 'Description'];
    const rows = allProducts.map(p => [
      `"${p.id}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.categoryLabel || p.category || '').replace(/"/g, '""')}"`,
      p.price,
      p.costPrice || '0',
      p.stock,
      `"${p.badge || ''}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `furevercare_products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Invoice Window
  const handlePrintInvoice = () => {
    if (!invoiceOrder) return;
    const printContent = document.getElementById('printable-invoice-content');
    if (!printContent) return;
    const printWindow = window.open('about:blank', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${invoiceOrder.id}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #2d3748; }
              .invoice-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #edf2f7; padding-bottom: 20px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { background: #f7fafc; text-align: left; padding: 12px; font-size: 0.85rem; font-weight: bold; color: #718096; border-bottom: 1px solid #edf2f7; }
              td { padding: 12px; font-size: 0.95rem; color: #2d3748; border-bottom: 1px dashed #edf2f7; }
              .total-row { display: flex; justify-content: flex-end; font-size: 1.1rem; font-weight: bold; padding-top: 15px; border-top: 2px solid #edf2f7; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            \${printContent.innerHTML}
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  return (
    <div className="module-content" id="mainContent">

      {/* ==========================================================================
          1. Compact Summary Statistics Cards
          ========================================================================== */}
      <div className="prod-stats-grid">
        {/* Total Products */}
        <div className="prod-stat-card">
          <div className="prod-stat-icon icon-products">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="prod-stat-info">
            <h3>Total Products</h3>
            <div className="prod-stat-value-row">
              <span className="prod-stat-value">{totalProductsCount}</span>
              <span className="prod-stat-badge badge-green">+2 this month</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="prod-stat-card">
          <div className="prod-stat-icon icon-categories">
            <i className="fas fa-tags"></i>
          </div>
          <div className="prod-stat-info">
            <h3>Categories</h3>
            <div className="prod-stat-value-row">
              <span className="prod-stat-value">{categoriesCount}</span>
            </div>
            <button 
              className="prod-stat-link link-blue"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              View categories &rarr;
            </button>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="prod-stat-card">
          <div className="prod-stat-icon icon-sales">
            <i className="fas fa-peso-sign"></i>
          </div>
          <div className="prod-stat-info">
            <h3>Today's Sales</h3>
            <div className="prod-stat-value-row">
              <span className="prod-stat-value">₱{todayRevenueValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="prod-stat-badge badge-neutral">{todayOrdersCount} orders</span>
            </div>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className={`prod-stat-card ${lowStockCount > 0 ? 'stat-warning' : ''}`}>
          <div className="prod-stat-icon icon-warning">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="prod-stat-info">
            <h3>Low Stock</h3>
            <div className="prod-stat-value-row">
              <span className="prod-stat-value">{lowStockCount}</span>
            </div>
            <button 
              className="prod-stat-link link-amber"
              onClick={() => setStockFilter(stockFilter === 'low_stock' ? 'all' : 'low_stock')}
            >
              {stockFilter === 'low_stock' ? 'Show all items \u00D7' : 'View items \u2192'}
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================================================
          2. Product Action Toolbar
          ========================================================================== */}
      <div className="prod-toolbar">
        {/* Left: Large Search Input */}
        <div className="prod-toolbar-left">
          <div className="prod-search-box">
            <i className="fas fa-search prod-search-icon"></i>
            <input 
              type="text" 
              className="prod-search-input"
              placeholder="Search products, SKU, category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="prod-search-clear" onClick={() => setSearchQuery('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Right: Filter, Sort, View Toggle, Add Product, Import/Export, Overflow */}
        <div className="prod-toolbar-right">
          {/* Stock Filter Dropdown */}
          <div className="prod-dropdown-wrapper">
            <button 
              className={`prod-btn prod-btn-outline ${stockFilter !== 'all' ? 'active' : ''}`}
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            >
              <i className="fas fa-filter"></i>
              <span>Filter</span>
              {stockFilter !== 'all' && (
                <span style={{ background: '#2E5E3E', color: 'white', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '999px' }}>
                  {stockFilter.replace('_', ' ')}
                </span>
              )}
            </button>
            {isFilterDropdownOpen && (
              <div className="prod-dropdown-menu">
                <button 
                  className={`prod-dropdown-item ${stockFilter === 'all' ? 'active' : ''}`}
                  onClick={() => { setStockFilter('all'); setIsFilterDropdownOpen(false); }}
                >
                  <i className="fas fa-boxes"></i> All Stock Levels
                </button>
                <button 
                  className={`prod-dropdown-item ${stockFilter === 'in_stock' ? 'active' : ''}`}
                  onClick={() => { setStockFilter('in_stock'); setIsFilterDropdownOpen(false); }}
                >
                  <i className="fas fa-check-circle" style={{ color: '#166534' }}></i> In Stock ({'>'}10)
                </button>
                <button 
                  className={`prod-dropdown-item ${stockFilter === 'low_stock' ? 'active' : ''}`}
                  onClick={() => { setStockFilter('low_stock'); setIsFilterDropdownOpen(false); }}
                >
                  <i className="fas fa-exclamation-circle" style={{ color: '#D97706' }}></i> Low Stock (&le;10)
                </button>
                <button 
                  className={`prod-dropdown-item ${stockFilter === 'out_of_stock' ? 'active' : ''}`}
                  onClick={() => { setStockFilter('out_of_stock'); setIsFilterDropdownOpen(false); }}
                >
                  <i className="fas fa-times-circle" style={{ color: '#DC2626' }}></i> Out of Stock (0)
                </button>
              </div>
            )}
          </div>

          {/* Sort Selector */}
          <select 
            className="prod-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
          >
            <option value="recent">Recently Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="stock_asc">Stock: Low to High</option>
          </select>

          {/* Grid / List View Toggle */}
          <div className="prod-view-toggle">
            <button 
              className={`prod-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button 
              className={`prod-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>

          {/* Secondary Actions: Export / Import */}
          <button 
            className="prod-btn prod-btn-outline"
            onClick={handleExportCSV}
            title="Export products to CSV"
          >
            <i className="fas fa-file-export"></i>
            <span>Export</span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".csv" 
            style={{ display: 'none' }} 
            onChange={() => setWarningMessage("CSV Import feature ready: Standard columns accepted are Name, Category, Price, Cost Price, Stock.")}
          />
          <button 
            className="prod-btn prod-btn-outline"
            onClick={() => fileInputRef.current?.click()}
            title="Import products from CSV"
          >
            <i className="fas fa-file-import"></i>
            <span>Import</span>
          </button>

          {/* Primary Action: Add Product */}
          <button 
            className="prod-btn prod-btn-primary"
            onClick={() => {
              setEditingProductId(null);
              setNewProduct({ name: '', price: '', costPrice: '', category: 'food', stock: '', badge: '', image: '', description: '' });
              setIsProductModalOpen(true);
            }}
          >
            <i className="fas fa-plus"></i>
            <span>Add Product</span>
          </button>

          {/* Overflow Three-Dot Menu */}
          <div className="prod-dropdown-wrapper">
            <button 
              className="prod-btn prod-btn-outline"
              style={{ padding: '0 12px' }}
              onClick={() => setIsOverflowMenuOpen(!isOverflowMenuOpen)}
              title="More actions"
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            {isOverflowMenuOpen && (
              <div className="prod-dropdown-menu">
                <button 
                  className="prod-dropdown-item"
                  onClick={() => {
                    setIsCategoryModalOpen(true);
                    setIsOverflowMenuOpen(false);
                  }}
                >
                  <i className="fas fa-tags" style={{ color: '#2E5E3E' }}></i>
                  <span>Manage Categories</span>
                </button>
                <button 
                  className="prod-dropdown-item"
                  onClick={() => {
                    fetchInventory();
                    fetchOrders('PENDING');
                    setWarningMessage("Inventory refreshed successfully!");
                    setIsOverflowMenuOpen(false);
                  }}
                >
                  <i className="fas fa-sync-alt" style={{ color: '#0284C7' }}></i>
                  <span>Refresh Data</span>
                </button>
                <button 
                  className="prod-dropdown-item"
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                    setStockFilter('all');
                    setSortBy('recent');
                    setIsOverflowMenuOpen(false);
                  }}
                >
                  <i className="fas fa-undo" style={{ color: '#64748B' }}></i>
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================================================
          3. Horizontal Category Tabs
          ========================================================================== */}
      <div className="prod-category-tabs">
        {categoryTabs.map(cat => (
          <button
            key={cat.slug}
            className={`prod-cat-pill ${activeCategory === cat.slug ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.slug)}
          >
            <i className={`fas ${cat.icon || 'fa-tag'}`}></i>
            <span>{formatCategoryDisplay(cat.name)}</span>
            <span className="prod-cat-pill-count">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* ==========================================================================
          4. Main Content Layout: Product Inventory + Pending Orders Sidebar
          ========================================================================== */}
      <div className="prod-main-layout">
        
        {/* Left Area: Product Inventory */}
        <div className="prod-inventory-section">
          <div className="prod-section-header">
            <div className="prod-section-title">
              <h2>Product Inventory</h2>
              <span className="prod-section-count">({filteredProducts.length} items found)</span>
            </div>
            
            <div className="prod-section-controls">
              {activeCategory !== 'all' && (
                <span style={{ fontSize: '0.85rem', color: '#2E5E3E', fontWeight: 600 }}>
                  Showing {formatCategoryDisplay(activeCategory)}
                </span>
              )}
            </div>
          </div>

          {/* Grid View Mode */}
          {viewMode === 'grid' && (
            <div className="prod-grid">
              {filteredProducts.map(product => {
                const isLowStock = product.stock <= 10 && product.stock > 0;
                const isOutStock = product.stock <= 0;
                const stockRatio = Math.min(100, Math.max(0, (product.stock / 50) * 100));

                return (
                  <div 
                    key={product.id}
                    className="prod-card"
                    onClick={() => setSelectedViewProduct(product)}
                  >
                    {/* 1:1 Aspect Ratio Image Container */}
                    <div className="prod-card-image-wrap">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="prod-card-image" />
                      ) : (
                        <i className={`fas ${product.icon || 'fa-box'} prod-card-image-fallback`}></i>
                      )}

                      {/* Overlaid Badges */}
                      <span className="prod-badge-cat">
                        {formatCategoryDisplay(product.categoryLabel || product.category)}
                      </span>

                      {product.badge === 'sale' && (
                        <span className="prod-badge-state sale">SALE</span>
                      )}
                      {product.badge === 'new' && (
                        <span className="prod-badge-state new">NEW</span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="prod-card-body">
                      <h4 className="prod-card-name" title={product.name}>
                        {product.name}
                      </h4>

                      {/* Price & Cost */}
                      <div className="prod-card-price-row">
                        <span className="prod-card-price">₱{parseFloat(product.price).toFixed(2)}</span>
                        {product.costPrice && (
                          <span className="prod-card-cost">Cost: ₱{parseFloat(product.costPrice).toFixed(2)}</span>
                        )}
                      </div>

                      {/* Stock Level & Pill */}
                      <div className="prod-card-stock-row">
                        {isOutStock ? (
                          <span className="prod-stock-badge out-stock">
                            <i className="fas fa-times-circle"></i> Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="prod-stock-badge low-stock">
                            <i className="fas fa-exclamation-circle"></i> Low Stock
                          </span>
                        ) : (
                          <span className="prod-stock-badge in-stock">
                            <i className="fas fa-check-circle"></i> In Stock
                          </span>
                        )}
                        <span className="prod-card-units">{product.stock} units</span>
                      </div>

                      {/* Visual Stock Progress Bar */}
                      <div className="prod-stock-bar">
                        <div 
                          className={`prod-stock-fill ${isOutStock ? 'fill-empty' : isLowStock ? 'fill-low' : 'fill-high'}`}
                          style={{ width: `${isOutStock ? 100 : Math.max(8, stockRatio)}%` }}
                        ></div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="prod-card-actions" onClick={e => e.stopPropagation()}>
                        <button 
                          className="prod-btn-card-edit"
                          onClick={() => handleEditClick(product)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>

                        <button 
                          className="prod-btn-card-sell"
                          onClick={() => handleSellClick(product)}
                          disabled={product.stock <= 0}
                          style={{ opacity: product.stock <= 0 ? 0.5 : 1 }}
                        >
                          <i className="fas fa-shopping-cart"></i> Sell
                        </button>

                        {/* 3-Dot More Menu */}
                        <div className="prod-card-more-wrap">
                          <button 
                            className="prod-btn-card-more"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCardMenuId(activeCardMenuId === product.id ? null : product.id);
                            }}
                            title="More options"
                          >
                            <i className="fas fa-ellipsis-v"></i>
                          </button>

                          {activeCardMenuId === product.id && (
                            <div className="prod-card-menu-popover">
                              <button 
                                className="prod-dropdown-item"
                                onClick={() => {
                                  setSelectedViewProduct(product);
                                  setActiveCardMenuId(null);
                                }}
                              >
                                <i className="fas fa-eye" style={{ color: '#0284C7' }}></i>
                                <span>View Details</span>
                              </button>
                              <button 
                                className="prod-dropdown-item"
                                onClick={() => handleEditClick(product)}
                              >
                                <i className="fas fa-cubes" style={{ color: '#D97706' }}></i>
                                <span>Adjust Stock</span>
                              </button>
                              <button 
                                className="prod-dropdown-item danger"
                                onClick={() => handleDeleteClick(product)}
                              >
                                <i className="fas fa-trash-alt"></i>
                                <span>Remove</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty Search / Filter State */}
              {filteredProducts.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <i className="fas fa-search" style={{ fontSize: '2.5rem', color: '#94A3B8', marginBottom: '14px' }}></i>
                  <h3 style={{ color: '#1E293B', marginBottom: '8px' }}>No products found</h3>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Try adjusting your search terms or clearing current category & stock filters.
                  </p>
                  <button 
                    className="prod-btn prod-btn-primary"
                    onClick={() => { setSearchQuery(''); setActiveCategory('all'); setStockFilter('all'); }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* List / Table View Mode */}
          {viewMode === 'list' && (
            <div className="prod-list-container">
              <table className="prod-list-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Item</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Selling Price</th>
                    <th>Cost Price</th>
                    <th>Stock Level</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const isLowStock = product.stock <= 10 && product.stock > 0;
                    const isOutStock = product.stock <= 0;
                    return (
                      <tr key={product.id} onClick={() => setSelectedViewProduct(product)} style={{ cursor: 'pointer' }}>
                        <td>
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="prod-list-img" />
                          ) : (
                            <div className="prod-list-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                              <i className={`fas ${product.icon || 'fa-box'}`}></i>
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#1E293B' }}>{product.name}</div>
                          {product.badge && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: product.badge === 'sale' ? '#EF4444' : '#10B981' }}>
                              {product.badge}
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                            {formatCategoryDisplay(product.categoryLabel || product.category)}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: '#2E5E3E' }}>₱{parseFloat(product.price).toFixed(2)}</td>
                        <td style={{ color: '#64748B' }}>{product.costPrice ? `₱${parseFloat(product.costPrice).toFixed(2)}` : '—'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700 }}>{product.stock} units</span>
                            <div style={{ width: '60px', height: '5px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%`, height: '100%', background: isOutStock ? '#DC2626' : isLowStock ? '#D97706' : '#2E5E3E' }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {isOutStock ? (
                            <span className="prod-stock-badge out-stock">Out of Stock</span>
                          ) : isLowStock ? (
                            <span className="prod-stock-badge low-stock">Low Stock</span>
                          ) : (
                            <span className="prod-stock-badge in-stock">In Stock</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button 
                              className="prod-btn-card-edit"
                              style={{ width: '32px', height: '32px', padding: 0 }}
                              onClick={() => handleEditClick(product)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="prod-btn-card-sell"
                              style={{ width: '32px', height: '32px', padding: 0 }}
                              onClick={() => handleSellClick(product)}
                              disabled={product.stock <= 0}
                              title="Sell"
                            >
                              <i className="fas fa-shopping-cart"></i>
                            </button>
                            <button 
                              className="prod-btn-card-more"
                              style={{ width: '32px', height: '32px', padding: 0, color: '#EF4444' }}
                              onClick={() => handleDeleteClick(product)}
                              title="Remove"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Area: Compact Pending Orders Panel */}
        <div className="prod-pending-panel">
          <div className="prod-pending-header">
            <h3 className="prod-pending-title">
              <i className="fas fa-clock" style={{ color: '#2E5E3E' }}></i>
              Pending Orders
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="prod-pending-count-badge">{orders.length}</span>
              <button 
                className="prod-pending-refresh"
                onClick={() => fetchOrders('PENDING')}
                title="Refresh pending orders"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          {/* Orders List or Empty State */}
          {orders.length > 0 ? (
            <>
              <div className="prod-pending-list">
                {orders.map(order => {
                  const method = order.paymentMethod?.toLowerCase() || 'cash';
                  const methodClass = method.includes('gcash') ? 'gcash' : method.includes('maya') ? 'maya' : 'cash';
                  const isHighlighted = highlightOrder === order.id.slice(0, 8).toUpperCase();

                  return (
                    <div 
                      key={order.id}
                      id={`pending-order-${order.id.slice(0, 8).toUpperCase()}`}
                      className="prod-pending-card"
                      style={isHighlighted ? { borderColor: '#2E5E3E', boxShadow: '0 0 0 2px #2E5E3E' } : {}}
                      onClick={() => {
                        setSelectedViewOrder(order);
                        setIsOrderDetailsModalOpen(true);
                      }}
                      title="Click to view details"
                    >
                      <div className="prod-pending-card-top">
                        <span className="prod-pending-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`prod-pending-method ${methodClass}`}>{order.paymentMethod}</span>
                      </div>
                      <div className="prod-pending-cust">
                        <i className="fas fa-user" style={{ fontSize: '0.75rem' }}></i>
                        <span>{order.user?.fullName || 'Walk-in Customer'}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
                        {new Date(order.orderDate).toLocaleString()}
                      </div>
                      <div className="prod-pending-card-bottom">
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>View details</span>
                        <span className="prod-pending-amount">₱{order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', fontWeight: 700 }}>
                <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Total Pending</span>
                <span style={{ color: '#2E5E3E', fontSize: '1.05rem' }}>
                  ₱{orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
                </span>
              </div>

              <div className="prod-pending-actions">
                <button 
                  className="prod-btn prod-btn-outline"
                  style={{ flex: 1, height: '36px', fontSize: '0.8rem' }}
                  onClick={() => setIsViewOrdersModalOpen(true)}
                >
                  <i className="fas fa-history"></i> Orders History
                </button>
                <button 
                  className="prod-btn prod-btn-primary"
                  style={{ flex: 1, height: '36px', fontSize: '0.8rem' }}
                  onClick={async () => {
                    let processed = 0;
                    for (const order of orders) {
                      const res = await updateOrderStatus(order.id, 'PROCESSING');
                      if (res.success) processed++;
                    }
                    if (processed > 0) {
                      setProcessSuccessMessage(`${processed} order(s) successfully processed! Stock updated.`);
                      fetchOrders('PENDING');
                      fetchAllOrders();
                      fetchInventory();
                    }
                  }}
                >
                  <i className="fas fa-check-circle"></i> Process All
                </button>
              </div>
            </>
          ) : (
            /* Lightweight Empty State when 0 Pending Orders */
            <div className="prod-pending-empty">
              <div className="prod-pending-empty-icon">
                <i className="fas fa-box-open"></i>
              </div>
              <div className="prod-pending-empty-text">No orders waiting</div>
              <button 
                className="prod-btn prod-btn-outline"
                style={{ width: '100%', height: '38px', fontSize: '0.85rem' }}
                onClick={() => setIsViewOrdersModalOpen(true)}
              >
                <span>View Orders &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================================================
          MODALS SECTION (Preserved & Enhanced)
          ========================================================================== */}

      {/* 1. Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="prod-modal-overlay" onClick={() => { setIsProductModalOpen(false); setValidationErrors({}); }}>
          <div className="prod-modal-container" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="prod-modal-header">
              <div className="prod-modal-title">
                <div className="prod-modal-title-icon">
                  <i className={editingProductId !== null ? "fas fa-edit" : "fas fa-plus"}></i>
                </div>
                <h2>{editingProductId !== null ? 'Edit Product' : 'Add New Product'}</h2>
              </div>
              <button 
                type="button"
                className="prod-modal-close" 
                onClick={() => { setIsProductModalOpen(false); setValidationErrors({}); }} 
                title="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="prod-modal-divider"></div>

            {/* Form */}
            <form onSubmit={e => { e.preventDefault(); handleSaveProduct(); }}>
              <div className="prod-modal-body">
                {/* Row 1: Product Name (2 cols) + Category */}
                <div className="prod-form-grid">
                  <div className="prod-field-group">
                    <label className="prod-field-label">
                      <i className="fas fa-tag"></i>
                      Product Name <span className="prod-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`prod-field-input ${validationErrors.name ? 'prod-field-error' : ''}`}
                      placeholder="e.g., Royal Canin Adult Dog Food"
                      value={newProduct.name}
                      onChange={e => {
                        setNewProduct({ ...newProduct, name: e.target.value });
                        if (validationErrors.name) setValidationErrors({ ...validationErrors, name: '' });
                      }}
                    />
                    {validationErrors.name && (
                      <span className="prod-error-msg">
                        <i className="fas fa-exclamation-circle"></i> {validationErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="prod-field-group">
                    <label className="prod-field-label">
                      <i className="fas fa-folder"></i>
                      Category <span className="prod-required">*</span>
                    </label>
                    <select
                      className="prod-field-select"
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      {customCategories.map(cat => (
                        <option key={cat.slug} value={cat.slug}>
                          {formatCategoryDisplay(cat.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Description (Full Width) */}
                <div className="prod-field-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="prod-field-label">
                      <i className="fas fa-align-left"></i>
                      Description
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
                      {(newProduct.description || '').length}/500
                    </span>
                  </div>
                  <textarea
                    className="prod-field-textarea"
                    rows={2}
                    placeholder="Enter product description..."
                    value={newProduct.description}
                    maxLength={500}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>

                {/* Row 3: Selling Price (₱) + Stock Units (2 cols) */}
                <div className="prod-form-grid">
                  <div className="prod-field-group">
                    <label className="prod-field-label">
                      <i className="fas fa-peso-sign"></i>
                      Selling Price <span className="prod-required">*</span>
                    </label>
                    <div className={`prod-price-wrap ${validationErrors.price ? 'prod-field-error' : ''}`}>
                      <span className="prod-price-prefix">₱</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="prod-price-input"
                        placeholder="0.00"
                        value={newProduct.price}
                        onChange={e => {
                          setNewProduct({ ...newProduct, price: e.target.value });
                          if (validationErrors.price) setValidationErrors({ ...validationErrors, price: '' });
                        }}
                      />
                    </div>
                    {validationErrors.price && (
                      <span className="prod-error-msg">
                        <i className="fas fa-exclamation-circle"></i> {validationErrors.price}
                      </span>
                    )}
                  </div>

                  <div className="prod-field-group">
                    <label className="prod-field-label">
                      <i className="fas fa-layer-group"></i>
                      Stock Units <span className="prod-required">*</span>
                    </label>
                    <div className={`prod-stepper-wrap ${validationErrors.stock ? 'prod-field-error' : ''}`}>
                      <button
                        type="button"
                        className="prod-stepper-btn"
                        onClick={() => {
                          const val = Math.max(0, (parseInt(newProduct.stock) || 0) - 1);
                          setNewProduct({ ...newProduct, stock: String(val) });
                          if (validationErrors.stock) setValidationErrors({ ...validationErrors, stock: '' });
                        }}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="prod-stepper-input"
                        placeholder="0"
                        value={newProduct.stock}
                        onChange={e => {
                          setNewProduct({ ...newProduct, stock: e.target.value });
                          if (validationErrors.stock) setValidationErrors({ ...validationErrors, stock: '' });
                        }}
                      />
                      <button
                        type="button"
                        className="prod-stepper-btn"
                        onClick={() => {
                          const val = (parseInt(newProduct.stock) || 0) + 1;
                          setNewProduct({ ...newProduct, stock: String(val) });
                          if (validationErrors.stock) setValidationErrors({ ...validationErrors, stock: '' });
                        }}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    {validationErrors.stock && (
                      <span className="prod-error-msg">
                        <i className="fas fa-exclamation-circle"></i> {validationErrors.stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 4: Cost Price (Optional) + Badge (Optional) */}
                <div className="prod-form-grid">
                  <div className="prod-field-group">
                    <label className="prod-field-label">
                      <i className="fas fa-receipt"></i>
                      Cost Price (Optional)
                    </label>
                    <div className="prod-price-wrap">
                      <span className="prod-price-prefix">₱</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="prod-price-input"
                        placeholder="0.00"
                        value={newProduct.costPrice}
                        onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="prod-field-group">
                    <label className="prod-field-label">
                      <i className="fas fa-certificate"></i>
                      Badge (Optional)
                    </label>
                    <select
                      className="prod-field-select"
                      value={newProduct.badge}
                      onChange={e => setNewProduct({ ...newProduct, badge: e.target.value })}
                    >
                      <option value="">None</option>
                      <option value="sale">Sale</option>
                      <option value="new">New</option>
                      <option value="featured">Featured</option>
                      <option value="best_seller">Best Seller</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Product Image (Compact Dropzone / Preview) */}
                <div className="prod-field-group">
                  <label className="prod-field-label">
                    <i className="fas fa-image"></i>
                    Product Image (Optional)
                  </label>
                  <div className="prod-img-upload-box">
                    {!newProduct.image ? (
                      <div 
                        className="prod-img-dropzone"
                        onClick={() => document.getElementById('productModalImageInput')?.click()}
                      >
                        <i className="fas fa-cloud-upload-alt prod-img-drop-icon"></i>
                        <div className="prod-img-drop-text">
                          <span>Click to upload image</span> &bull; <small>PNG, JPG up to 5MB</small>
                        </div>
                      </div>
                    ) : (
                      <div className="prod-img-preview-bar">
                        <img src={newProduct.image} alt="Preview" className="prod-img-preview-thumb" />
                        <div className="prod-img-preview-info">
                          <span className="prod-img-preview-title">Product Image Selected</span>
                          <span className="prod-img-preview-sub">Ready to save</span>
                        </div>
                        <div className="prod-img-preview-btns">
                          <button 
                            type="button" 
                            className="prod-img-btn-change"
                            onClick={() => document.getElementById('productModalImageInput')?.click()}
                          >
                            Change
                          </button>
                          <button 
                            type="button" 
                            className="prod-img-btn-remove"
                            onClick={() => setNewProduct({ ...newProduct, image: '' })}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                    <input 
                      id="productModalImageInput"
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewProduct({ ...newProduct, image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="prod-modal-footer-btns">
                  <button
                    type="button"
                    className="prod-btn-cancel"
                    onClick={() => { setIsProductModalOpen(false); setValidationErrors({}); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="prod-btn-save">
                    <i className={editingProductId !== null ? "fas fa-save" : "fas fa-plus"}></i>
                    {editingProductId !== null ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Walk-in Sell Product Modal */}
      {sellModalProduct && !isPaymentModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-shopping-cart" style={{ color: '#2E5E3E' }}></i>
                Quick Sell (POS)
              </h3>
              <button className="modal-close" onClick={() => setSellModalProduct(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>{sellModalProduct.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Available Stock: <strong>{sellModalProduct.stock} units</strong></div>
                <div style={{ fontSize: '0.95rem', color: '#2E5E3E', fontWeight: 800, marginTop: '4px' }}>₱{parseFloat(sellModalProduct.price).toFixed(2)} each</div>
              </div>

              <div className="form-group">
                <label>Quantity to Sell</label>
                <input 
                  type="number" 
                  min="1" 
                  max={sellModalProduct.stock}
                  className="form-control"
                  value={sellQuantity}
                  onChange={e => setSellQuantity(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed #E2E8F0', fontWeight: 700 }}>
                <span style={{ color: '#64748B' }}>Subtotal:</span>
                <span style={{ color: '#2E5E3E', fontSize: '1.2rem' }}>
                  ₱{((parseInt(sellQuantity) || 0) * parseFloat(sellModalProduct.price)).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="prod-btn prod-btn-outline" onClick={() => setSellModalProduct(null)}>Cancel</button>
              <button className="prod-btn prod-btn-primary" onClick={proceedToPayment}>
                Proceed to Payment &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Walk-in Payment Modal */}
      {isPaymentModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-cash-register" style={{ color: '#2E5E3E' }}></i>
                Complete Payment
              </h3>
              <button className="modal-close" onClick={() => setIsPaymentModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '16px', background: '#EAF3DE', borderRadius: '12px', marginBottom: '18px' }}>
                <span style={{ fontSize: '0.85rem', color: '#2E5E3E', fontWeight: 600 }}>Total Amount Due</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2E5E3E' }}>₱{paymentAmount.toFixed(2)}</div>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select className="form-control">
                  <option value="cash">Cash</option>
                  <option value="gcash">GCash</option>
                  <option value="maya">Maya</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount Received (Optional)</label>
                <input type="number" className="form-control" placeholder="Enter tendered amount" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="prod-btn prod-btn-outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
              <button className="prod-btn prod-btn-primary" onClick={completePayment}>
                <i className="fas fa-check"></i> Complete & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Product Details Quick View Modal */}
      {selectedViewProduct && (
        <div className="modal" onClick={() => setSelectedViewProduct(null)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-info-circle" style={{ color: '#2E5E3E' }}></i>
                Product Details
              </h3>
              <button className="modal-close" onClick={() => setSelectedViewProduct(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div style={{ width: '130px', height: '130px', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selectedViewProduct.image ? (
                    <img src={selectedViewProduct.image} alt={selectedViewProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className={`fas ${selectedViewProduct.icon || 'fa-box'}`} style={{ fontSize: '2.5rem', color: '#94A3B8' }}></i>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2E5E3E', textTransform: 'uppercase' }}>
                    {formatCategoryDisplay(selectedViewProduct.categoryLabel || selectedViewProduct.category)}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: '4px 0 8px' }}>
                    {selectedViewProduct.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {selectedViewProduct.badge && (
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, background: selectedViewProduct.badge === 'sale' ? '#FEE2E2' : '#DCFCE7', color: selectedViewProduct.badge === 'sale' ? '#DC2626' : '#166534', textTransform: 'uppercase' }}>
                        {selectedViewProduct.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Selling Price</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2E5E3E' }}>₱{selectedViewProduct.price}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Cost Price</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569' }}>
                    {selectedViewProduct.costPrice ? `₱${parseFloat(selectedViewProduct.costPrice).toFixed(2)}` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Stock Status</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: selectedViewProduct.stock > 10 ? '#166534' : '#D97706' }}>
                    {selectedViewProduct.stock} units
                  </div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Description</div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                  {selectedViewProduct.description || 'No description provided for this product.'}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="prod-btn prod-btn-outline" onClick={() => setSelectedViewProduct(null)}>Close</button>
              <button 
                className="prod-btn prod-btn-primary" 
                onClick={() => {
                  handleEditClick(selectedViewProduct);
                  setSelectedViewProduct(null);
                }}
              >
                <i className="fas fa-edit"></i> Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-tags" style={{ color: '#2E5E3E' }}></i>
                Manage Categories
              </h3>
              <button className="modal-close" onClick={() => setIsCategoryModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-plus-circle" style={{ color: '#2E5E3E' }}></i> Add New Category
                </h4>
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label>Category Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g., Supplements" 
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label>Icon</label>
                  <select 
                    className="form-control"
                    value={newCategoryIcon}
                    onChange={e => setNewCategoryIcon(e.target.value)}
                  >
                    <option value="fa-tag">🏷️ Tag</option>
                    <option value="fa-pills">💊 Medications / Pills</option>
                    <option value="fa-cut">✂️ Grooming</option>
                    <option value="fa-utensils">🍲 Pet Food</option>
                    <option value="fa-bed">🛏️ Accessories / Beds</option>
                    <option value="fa-dog">🐕 Dog Supplies</option>
                    <option value="fa-cat">🐈 Cat Supplies</option>
                    <option value="fa-medkit">🏥 Medical Kit</option>
                    <option value="fa-box">📦 General Box</option>
                  </select>
                </div>
                <button 
                  className="prod-btn prod-btn-primary" 
                  style={{ width: '100%', height: '38px' }}
                  onClick={handleAddCategory}
                >
                  Save Category
                </button>
              </div>

              <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#475569', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                Active Categories
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {customCategories.map(cat => {
                  const isDefault = ['dog', 'cat', 'medications', 'grooming', 'food', 'accessories'].includes(cat.slug);
                  const count = allProducts.filter(p => normalizeCategorySlug(p.category) === normalizeCategorySlug(cat.slug)).length;
                  return (
                    <div 
                      key={cat.slug}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#EAF3DE', color: '#2E5E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                          <i className={`fas ${cat.icon || 'fa-tag'}`}></i>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E293B' }}>{formatCategoryDisplay(cat.name)}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '6px' }}>({count} items)</span>
                        </div>
                      </div>
                      {!isDefault ? (
                        <button 
                          onClick={() => handleDeleteCategory(cat.slug)}
                          style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>System Default</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-actions">
              <button className="prod-btn prod-btn-outline" onClick={() => setIsCategoryModalOpen(false)} style={{ width: '100%' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. All Orders History Modal */}
      {isViewOrdersModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-history" style={{ color: '#2E5E3E' }}></i>
                All Orders History
              </h3>
              <button className="modal-close" onClick={() => setIsViewOrdersModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ background: '#F8FAFC', maxHeight: '65vh', overflowY: 'auto' }}>
              {allOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>No orders found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {allOrders.map(order => (
                    <div 
                      key={order.id}
                      onClick={() => {
                        setSelectedHistoryOrder(order);
                        setIsHistoryOrderDetailsModalOpen(true);
                      }}
                      style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Order #{order.id.slice(0, 8).toUpperCase()}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                          <i className="fas fa-user" style={{ marginRight: '6px' }}></i>{order.user?.fullName || 'Walk-in Customer'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          <i className="fas fa-calendar" style={{ marginRight: '6px' }}></i>{new Date(order.orderDate).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#2E5E3E', fontSize: '1.05rem', marginBottom: '4px' }}>
                          ₱{order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: order.status === 'COMPLETED' ? '#DCFCE7' : '#FEF3C7', color: order.status === 'COMPLETED' ? '#166534' : '#B45309', textTransform: 'uppercase' }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="prod-btn prod-btn-outline" onClick={() => setIsViewOrdersModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Pending Order Details Modal */}
      {isOrderDetailsModalOpen && selectedViewOrder && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-receipt" style={{ color: '#2E5E3E' }}></i>
                Order Details (#{selectedViewOrder.id.slice(0, 8).toUpperCase()})
              </h3>
              <button className="modal-close" onClick={() => { setIsOrderDetailsModalOpen(false); setSelectedViewOrder(null); }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748B' }}>Customer:</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{selectedViewOrder.user?.fullName || 'Walk-in Customer'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748B' }}>Payment Method:</span>
                  <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{selectedViewOrder.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748B' }}>Status:</span>
                  <span style={{ fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>{selectedViewOrder.status}</span>
                </div>
              </div>

              <h4 style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '10px' }}>Ordered Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {selectedViewOrder.items?.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed #E2E8F0' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.88rem' }}>{item.product?.productName || 'Unknown Item'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.quantity} × ₱{(item.product?.price || (item.subtotal / item.quantity)).toFixed(2)}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#2E5E3E' }}>₱{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #E2E8F0', fontWeight: 800 }}>
                <span>Total Amount:</span>
                <span style={{ color: '#2E5E3E', fontSize: '1.2rem' }}>₱{selectedViewOrder.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="prod-btn prod-btn-outline" onClick={() => { setIsOrderDetailsModalOpen(false); setSelectedViewOrder(null); }}>Close</button>
              {selectedViewOrder.status === 'PENDING' && (
                <button 
                  className="prod-btn prod-btn-primary"
                  onClick={() => {
                    setOrderToProcess(selectedViewOrder);
                    setShowProcessConfirmModal(true);
                  }}
                >
                  Process Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. History Order Details Modal */}
      {isHistoryOrderDetailsModalOpen && selectedHistoryOrder && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-receipt" style={{ color: '#2E5E3E' }}></i>
                Order Details (#{selectedHistoryOrder.id.slice(0, 8).toUpperCase()})
              </h3>
              <button className="modal-close" onClick={() => { setIsHistoryOrderDetailsModalOpen(false); setSelectedHistoryOrder(null); }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748B' }}>Customer:</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>{selectedHistoryOrder.user?.fullName || 'Walk-in Customer'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748B' }}>Status:</span>
                  <span style={{ fontWeight: 700, color: selectedHistoryOrder.status === 'COMPLETED' ? '#166534' : '#0284C7', textTransform: 'uppercase' }}>
                    {selectedHistoryOrder.status}
                  </span>
                </div>
              </div>

              <h4 style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '10px' }}>Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {selectedHistoryOrder.items?.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed #E2E8F0' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.88rem' }}>{item.product?.productName || 'Unknown Item'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.quantity} × ₱{(item.product?.price || (item.subtotal / item.quantity)).toFixed(2)}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#2E5E3E' }}>₱{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #E2E8F0', fontWeight: 800 }}>
                <span>Total Amount:</span>
                <span style={{ color: '#2E5E3E', fontSize: '1.2rem' }}>₱{selectedHistoryOrder.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="prod-btn prod-btn-outline" 
                onClick={() => setInvoiceOrder(selectedHistoryOrder)}
                style={{ marginRight: 'auto' }}
              >
                <i className="fas fa-file-invoice"></i> View Invoice
              </button>
              <button className="prod-btn prod-btn-outline" onClick={() => { setIsHistoryOrderDetailsModalOpen(false); setSelectedHistoryOrder(null); }}>
                Close
              </button>
              {selectedHistoryOrder.status === 'PROCESSING' && (
                <button 
                  className="prod-btn prod-btn-primary"
                  onClick={() => {
                    setOrderToDeliver(selectedHistoryOrder);
                    setShowDeliverConfirmModal(true);
                  }}
                  style={{ background: '#D97706' }}
                >
                  Ready for Pick Up
                </button>
              )}
              {selectedHistoryOrder.status === 'DELIVERED' && (
                <button 
                  className="prod-btn prod-btn-primary"
                  onClick={() => {
                    setOrderToPickUp(selectedHistoryOrder);
                    setShowPickedUpConfirmModal(true);
                  }}
                >
                  Confirm Picked Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. Printable Invoice Modal */}
      {invoiceOrder && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '650px', padding: 0 }}>
            <div style={{ background: '#2E5E3E', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-file-invoice-dollar"></i> Order Invoice
              </h3>
              <button className="modal-close" onClick={() => setInvoiceOrder(null)} style={{ color: 'white' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div id="printable-invoice-content" style={{ padding: '24px 30px', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#2E5E3E', fontSize: '1.3rem', fontWeight: 800 }}>FurEver Paw Care</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                    123 Paws Avenue, Pet City<br/>
                    Support: fureverpawcare@gmail.com
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1E293B' }}>INVOICE</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>#INV-{invoiceOrder.id.substring(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>{new Date(invoiceOrder.orderDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Billed To:</span>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>{invoiceOrder.user?.fullName || 'Walk-in Customer'}</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748B' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Product</th>
                    <th style={{ textAlign: 'center', padding: '8px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceOrder.items?.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: '1px dashed #E2E8F0', fontSize: '0.88rem' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{item.product?.productName || 'Unknown Product'}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₱{(item.product?.price || (item.subtotal / item.quantity)).toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>₱{item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Subtotal:</span>
                    <span style={{ fontWeight: 700 }}>₱{invoiceOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, borderTop: '2px solid #E2E8F0', paddingTop: '8px' }}>
                    <span>Grand Total:</span>
                    <span style={{ color: '#2E5E3E' }}>₱{invoiceOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ padding: '16px 24px', background: '#F8FAFC' }}>
              <button className="prod-btn prod-btn-outline" onClick={handlePrintInvoice}>
                <i className="fas fa-print"></i> Print Invoice
              </button>
              <button className="prod-btn prod-btn-primary" onClick={() => setInvoiceOrder(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Confirmation & Notice Dialogs */}
      {showDeleteConfirmModal && productToDelete && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#1E293B' }}>Remove Product?</h3>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.9rem' }}>
              Are you sure you want to remove <strong>"{productToDelete.name}"</strong> from inventory?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="prod-btn prod-btn-outline" style={{ flex: 1 }} onClick={() => { setShowDeleteConfirmModal(false); setProductToDelete(null); }}>Cancel</button>
              <button className="prod-btn" style={{ flex: 1, background: '#DC2626', color: 'white' }} onClick={confirmDeleteProduct}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {showCategoryDeleteModal && categoryToDelete && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
              <i className="fas fa-folder-minus"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#1E293B' }}>Delete Category?</h3>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.9rem' }}>
              Delete category <strong>"{customCategories.find(c => c.slug === categoryToDelete)?.name || categoryToDelete}"</strong>?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="prod-btn prod-btn-outline" style={{ flex: 1 }} onClick={() => { setShowCategoryDeleteModal(false); setCategoryToDelete(null); setIsCategoryModalOpen(true); }}>Cancel</button>
              <button className="prod-btn" style={{ flex: 1, background: '#DC2626', color: 'white' }} onClick={confirmDeleteCategory}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {showProcessConfirmModal && orderToProcess && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#EAF3DE', color: '#2E5E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#1E293B' }}>Process Order?</h3>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.9rem' }}>
              Process Order <strong>#{orderToProcess.id.slice(0, 8).toUpperCase()}</strong> and deduct items from inventory?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="prod-btn prod-btn-outline" style={{ flex: 1 }} onClick={() => { setShowProcessConfirmModal(false); setOrderToProcess(null); }}>Cancel</button>
              <button 
                className="prod-btn prod-btn-primary" 
                style={{ flex: 1 }}
                onClick={async () => {
                  const res = await updateOrderStatus(orderToProcess.id, 'PROCESSING');
                  if (res.success) {
                    setProcessSuccessMessage('Order processed successfully!');
                    setIsOrderDetailsModalOpen(false);
                    setSelectedViewOrder(null);
                    fetchOrders('PENDING');
                    fetchAllOrders();
                    fetchInventory();
                    setInvoiceOrder({ ...orderToProcess, status: 'PROCESSING' });
                  } else {
                    setWarningMessage('Failed to process order: ' + res.error);
                  }
                  setShowProcessConfirmModal(false);
                  setOrderToProcess(null);
                }}
              >
                Yes, Process
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeliverConfirmModal && orderToDeliver && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
              <i className="fas fa-box-open"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#1E293B' }}>Ready for Pick Up?</h3>
            <p style={{ margin: '0 0 12px', color: '#64748B', fontSize: '0.9rem' }}>
              Mark Order <strong>#{orderToDeliver.id.slice(0, 8).toUpperCase()}</strong> as Ready for Pick Up?
            </p>
            <p style={{ margin: '0 0 20px', color: '#059669', fontSize: '0.82rem', background: '#ECFDF5', padding: '8px 12px', borderRadius: '6px' }}>
              <i className="fas fa-envelope" style={{ marginRight: '6px' }}></i> An email with pick-up instructions will be sent to the customer.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="prod-btn prod-btn-outline" style={{ flex: 1 }} onClick={() => { setShowDeliverConfirmModal(false); setOrderToDeliver(null); }}>Cancel</button>
              <button 
                className="prod-btn" 
                style={{ flex: 1, background: '#D97706', color: 'white' }}
                onClick={async () => {
                  const res = await updateOrderStatus(orderToDeliver.id, 'DELIVERED');
                  if (res.success) {
                    setProcessSuccessMessage('Order marked as Ready for Pick Up! Customer notified via email.');
                    setIsHistoryOrderDetailsModalOpen(false);
                    fetchOrders('PENDING');
                    fetchAllOrders();
                  } else {
                    setWarningMessage('Failed to update order: ' + (res.error || 'Unknown error'));
                  }
                  setShowDeliverConfirmModal(false);
                  setOrderToDeliver(null);
                }}
              >
                Yes, Ready
              </button>
            </div>
          </div>
        </div>
      )}

      {showPickedUpConfirmModal && orderToPickUp && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#EAF3DE', color: '#2E5E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>
              <i className="fas fa-check-double"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#1E293B' }}>Confirm Order Picked Up?</h3>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.9rem' }}>
              Mark Order <strong>#{orderToPickUp.id.slice(0, 8).toUpperCase()}</strong> as completed?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="prod-btn prod-btn-outline" style={{ flex: 1 }} onClick={() => { setShowPickedUpConfirmModal(false); setOrderToPickUp(null); }}>Cancel</button>
              <button 
                className="prod-btn prod-btn-primary" 
                style={{ flex: 1 }}
                onClick={async () => {
                  const res = await updateOrderStatus(orderToPickUp.id, 'COMPLETED');
                  if (res.success) {
                    setProcessSuccessMessage('Order marked as Completed!');
                    setIsHistoryOrderDetailsModalOpen(false);
                    fetchOrders('PENDING');
                    fetchAllOrders();
                  }
                  setShowPickedUpConfirmModal(false);
                  setOrderToPickUp(null);
                }}
              >
                Yes, Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Dialog */}
      {processSuccessMessage && (
        <div className="modal" onClick={() => setProcessSuccessMessage(null)}>
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center', padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#EAF3DE', color: '#2E5E3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 14px' }}>
              <i className="fas fa-check"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#1E293B' }}>Success</h3>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.9rem' }}>{processSuccessMessage}</p>
            <button className="prod-btn prod-btn-primary" style={{ width: '100%' }} onClick={() => setProcessSuccessMessage(null)}>
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Warning/Notice Dialog */}
      {warningMessage && (
        <div className="modal" onClick={() => setWarningMessage(null)}>
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center', padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: warningMessage.toLowerCase().includes('successfully') ? '#EAF3DE' : '#FEF3C7', color: warningMessage.toLowerCase().includes('successfully') ? '#2E5E3E' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 14px' }}>
              <i className={`fas ${warningMessage.toLowerCase().includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#1E293B' }}>
              {warningMessage.toLowerCase().includes('successfully') ? 'Success' : 'Notice'}
            </h3>
            <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.9rem' }}>{warningMessage}</p>
            <button className="prod-btn prod-btn-primary" style={{ width: '100%' }} onClick={() => setWarningMessage(null)}>
              Okay
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
