"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSharedInventory } from '../../../hooks/useInventory';
import { useBilling } from '../../../hooks/useBilling';
import './products.css';

export default function ProductsPage() {
  const router = useRouter();

  const { addItem, updateItem, sellItem, getSellableItems } = useSharedInventory();
  const { invoices, addInvoice } = useBilling();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const allProducts = getSellableItems();

  const totalProductsCount = allProducts.length;
  const uniqueCategoriesCount = new Set(allProducts.map(p => p.category)).size;

  const todayStr = new Date().toISOString().split('T')[0] || '';
  const todaysProductOrders = invoices.filter(inv => inv.source === 'product' && inv.date === todayStr);
  const todayOrdersCount = todaysProductOrders.length;
  const todayRevenueValue = todaysProductOrders
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const products = activeCategory === 'all' ? allProducts : allProducts.filter(p => p.category.toLowerCase() === activeCategory);

  const countAll = allProducts.length;
  const countDog = allProducts.filter(p => p.category.toLowerCase() === 'dog').length;
  const countCat = allProducts.filter(p => p.category.toLowerCase() === 'cat').length;
  const countMedications = allProducts.filter(p => p.category.toLowerCase() === 'medications').length;
  const countGrooming = allProducts.filter(p => p.category.toLowerCase() === 'grooming').length;
  const countFood = allProducts.filter(p => p.category.toLowerCase() === 'food').length;
  const countAccessories = allProducts.filter(p => p.category.toLowerCase() === 'accessories').length;

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'food', stock: '', badge: '', image: '' });
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const [sellModalProduct, setSellModalProduct] = useState<any>(null);
  const [sellQuantity, setSellQuantity] = useState('1');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const handleEditClick = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      badge: product.badge || '',
      image: product.image || ''
    });
    setIsProductModalOpen(true);
  };

  const handleSellClick = (product: any) => {
    setSellModalProduct(product);
    setSellQuantity('1');
  };

  const proceedToPayment = () => {
    const qty = parseInt(sellQuantity);
    if (!qty || qty <= 0) return alert('Please enter a valid quantity');
    if (qty > sellModalProduct.stock) return alert('Not enough stock available');
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
    alert('Payment successful! Order processed and Invoice generated.');
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
    
    let categoryLabel = 'Products';
    let icon = 'fa-box';
    switch (newProduct.category) {
      case 'food': categoryLabel = 'Pet Food'; icon = 'fa-utensils'; break;
      case 'dog': categoryLabel = 'Dog Supplies'; icon = 'fa-dog'; break;
      case 'cat': categoryLabel = 'Cat Supplies'; icon = 'fa-cat'; break;
      case 'medications': categoryLabel = 'Medications'; icon = 'fa-pills'; break;
      case 'grooming': categoryLabel = 'Grooming'; icon = 'fa-cut'; break;
      case 'accessories': categoryLabel = 'Accessories'; icon = 'fa-bed'; break;
    }

    if (editingProductId !== null) {
      updateItem(editingProductId, { ...newProduct, stock: parseInt(newProduct.stock), categoryLabel, icon, image: newProduct.image });
      setWarningMessage('Product updated successfully!');
    } else {
      addItem({ ...newProduct, stock: parseInt(newProduct.stock), categoryLabel, icon, image: newProduct.image });
      setWarningMessage('Product saved successfully!');
    }
    setIsProductModalOpen(false);
    setEditingProductId(null);
    setValidationErrors({});
    setNewProduct({ name: '', price: '', category: 'food', stock: '', badge: '', image: '' });
  };

  return (
    <>
      
    
    

    
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} id="mainContent">
        
        

        
        

        
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-boxes"></i>
                </div>
                <div className="stat-info">
                    <h3>Total Products</h3>
                    <p id="totalProducts">{totalProductsCount}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-tags"></i>
                </div>
                <div className="stat-info">
                    <h3>Categories</h3>
                    <p>{uniqueCategoriesCount}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="stat-info">
                    <h3>Today's Orders</h3>
                    <p id="todayOrders">{todayOrdersCount}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-peso-sign"></i>
                </div>
                <div className="stat-info">
                    <h3>Today's Revenue</h3>
                    <p id="todayRevenue">₱{todayRevenueValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>
        </div>

        
        <div className="add-product-container">
            <button className="add-product-btn" onClick={() => {
                setEditingProductId(null);
                setNewProduct({ name: '', price: '', category: 'food', stock: '', badge: '', image: '' });
                setIsProductModalOpen(true);
            }}>
                <i className="fas fa-plus-circle"></i>
                Add New Product
            </button>
        </div>

        <div className="store-layout">
            
            <div className="categories-sidebar">
                <div className="categories-header">
                    <h3>Categories</h3>
                    <span onClick={() => setActiveCategory('all')} style={{cursor: 'pointer', color: '#2E5E3E'}}>View All</span>
                </div>
                
                <div className={`category-item ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
                    <div className="category-info">
                        <i className="fas fa-paw"></i>
                        <span className="category-name">All Products</span>
                    </div>
                    <span className="category-count">{countAll}</span>
                </div>
                
                <div className={`category-item ${activeCategory === 'dog' ? 'active' : ''}`} onClick={() => setActiveCategory('dog')}>
                    <div className="category-info">
                        <i className="fas fa-dog"></i>
                        <span className="category-name">Dog Supplies</span>
                    </div>
                    <span className="category-count">{countDog}</span>
                </div>
                
                <div className={`category-item ${activeCategory === 'cat' ? 'active' : ''}`} onClick={() => setActiveCategory('cat')}>
                    <div className="category-info">
                        <i className="fas fa-cat"></i>
                        <span className="category-name">Cat Supplies</span>
                    </div>
                    <span className="category-count">{countCat}</span>
                </div>
                
                <div className={`category-item ${activeCategory === 'medications' ? 'active' : ''}`} onClick={() => setActiveCategory('medications')}>
                    <div className="category-info">
                        <i className="fas fa-pills"></i>
                        <span className="category-name">Medications</span>
                    </div>
                    <span className="category-count">{countMedications}</span>
                </div>
                
                <div className={`category-item ${activeCategory === 'grooming' ? 'active' : ''}`} onClick={() => setActiveCategory('grooming')}>
                    <div className="category-info">
                        <i className="fas fa-cut"></i>
                        <span className="category-name">Grooming</span>
                    </div>
                    <span className="category-count">{countGrooming}</span>
                </div>
                
                <div className={`category-item ${activeCategory === 'food' ? 'active' : ''}`} onClick={() => setActiveCategory('food')}>
                    <div className="category-info">
                        <i className="fas fa-utensils"></i>
                        <span className="category-name">Pet Food</span>
                    </div>
                    <span className="category-count">{countFood}</span>
                </div>
                
                <div className={`category-item ${activeCategory === 'accessories' ? 'active' : ''}`} onClick={() => setActiveCategory('accessories')}>
                    <div className="category-info">
                        <i className="fas fa-bed"></i>
                        <span className="category-name">Accessories</span>
                    </div>
                    <span className="category-count">{countAccessories}</span>
                </div>
            </div>

            <div className="products-grid">
                <div className="products-header">
                    <h3 id="category-title">Featured Products</h3>
                    <select className="sort-select" onChange={() => console.log('sortProducts(this.value)')}>
                        <option value="popular">Popular</option>
                        <option value="low-high">Price: Low to High</option>
                        <option value="high-low">Price: High to Low</option>
                        <option value="newest">Newest</option>
                    </select>
                </div>
                
                <div className="product-cards" id="product-container">
                    {products.map(product => (
                        <div className="product-card" data-category={product.category} data-price={product.price} data-id={product.id} key={product.id}>
                            {product.badge === 'sale' && <div className="product-badge sale">SALE</div>}
                            {product.badge === 'new' && <div className="product-badge" style={{background: '#48bb78'}}>NEW</div>}
                            <div className="product-image" style={{ overflow: 'hidden' }}>
                                {product.image ? (
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <i className={`fas ${product.icon || 'fa-box'}`}></i>
                                )}
                            </div>
                            <div className="product-category">{product.categoryLabel}</div>
                            <div className="product-title">{product.name}</div>
                            <div className="product-price">₱{product.price}</div>
                            <div className="product-stock">
                                {product.stock > 10 ? (
                                    <><i className="fas fa-check-circle"></i> In Stock ({product.stock})</>
                                ) : (
                                    <><i className="fas fa-exclamation-circle" style={{color: '#e53e3e'}}></i> Low Stock ({product.stock})</>
                                )}
                            </div>
                            <div className="product-actions">
                                <button className="edit-btn" onClick={() => handleEditClick(product)}><i className="fas fa-edit"></i> Edit</button>
                                <button className="sell-btn" onClick={() => handleSellClick(product)}><i className="fas fa-shopping-cart"></i> Sell</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="cart-sidebar">
                <div className="cart-header">
                    <h3>
                        <i className="fas fa-clock"></i>
                        Pending Orders
                    </h3>
                    <span id="pending-count">8</span>
                    <div className="clear-cart" onClick={() => console.log('refreshPendingOrders()')}>
                        <i className="fas fa-sync-alt"></i>
                    </div>
                </div>
                
                <div className="cart-items" id="pending-orders-container">
                    
                </div>

                <div className="cart-total">
                    <span>Total Pending</span>
                    <span id="pending-total">₱584.92</span>
                </div>

                <button className="checkout-btn" onClick={() => console.log('processOrders()')}>
                    <i className="fas fa-check-circle"></i>
                    Process Selected
                </button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="generalSettingsModal" onClick={() => console.log('if(event.target === this) closeGeneralSettings()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-clinic-medical" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Clinic Information
                </h3>
                <button className="modal-close" onClick={() => console.log('closeGeneralSettings()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="clinicSettingsForm">
                    <div className="form-group">
                        <label><i className="fas fa-clinic-medical"></i> Clinic name</label>
                        <input type="text" className="form-control" id="clinicName"
                            placeholder="e.g., FurEverCare Veterinary" defaultValue="FurEverCare Veterinary Clinic" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-map-marker-alt"></i> Address</label>
                        <input type="text" className="form-control" id="clinicAddress" placeholder="Street, City, ZIP"
                            defaultValue="123 Paws Avenue, Pet City, PC 12345" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-phone-alt"></i> Phone number</label>
                        <input type="tel" className="form-control" id="clinicPhone" placeholder="+1 (555) 123-4567"
                            defaultValue="+1 (555) 123-4567" />
                    </div>
                    <div className="form-group">
                        <label><i className="far fa-clock"></i> Opening hours</label>
                        <input type="text" className="form-control" id="clinicHours"
                            placeholder="e.g., Mon-Fri 9am-6pm, Sat 9am-2pm"
                            defaultValue="Mon-Fri 9am-6pm, Sat 9am-2pm, Sun Closed" />
                    </div>
                </form>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => console.log('closeGeneralSettings()')}>Cancel</button>
                <button className="btn btn-primary" onClick={() => console.log('saveClinicSettings()')}>Save Changes</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="accountSecurityModal" onClick={() => console.log('if(event.target === this) closeAccountSecurity()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-shield-alt" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Account Security</h3>
                <button className="modal-close" onClick={() => console.log('closeAccountSecurity()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="securityForm" onSubmit={() => console.log('event.preventDefault(); updatePassword();')}>
                    <div className="form-group">
                        <label><i className="fas fa-lock"></i> Current password</label>
                        <input type="password" className="form-control" id="currentPassword"
                            placeholder="Enter current password" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-key"></i> New password</label>
                        <input type="password" className="form-control" id="newPassword" placeholder="Enter new password"
                            onKeyUp={() => console.log('validatePassword()')} />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-check-circle"></i> Confirm new password</label>
                        <input type="password" className="form-control" id="confirmPassword"
                            placeholder="Confirm new password" onKeyUp={() => console.log('validatePassword()')} />
                    </div>

                    <div className="password-requirements">
                        <p><i className="fas fa-shield-alt" style={{"marginRight":"8px"}}></i>Password requirements:</p>
                        <div className="requirement-item" id="req-length">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">At least 8 characters</span>
                        </div>
                        <div className="requirement-item" id="req-uppercase">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">One uppercase letter</span>
                        </div>
                        <div className="requirement-item" id="req-number">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">One number</span>
                        </div>
                        <div className="requirement-item" id="req-match">
                            <i className="fas fa-circle" style={{"fontSize":"0.5rem"}}></i>
                            <span className="requirement-text">Passwords match</span>
                        </div>
                    </div>
                </form>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => console.log('closeAccountSecurity()')}>Cancel</button>
                <button className="btn btn-primary" onClick={() => console.log('updatePassword()')}>Update Password</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="languageModal" onClick={() => console.log('if(event.target === this) closeLanguageSettings()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-globe" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Language Settings</h3>
                <button className="modal-close" onClick={() => console.log('closeLanguageSettings()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <p style={{"color":"#718096","marginBottom":"20px"}}>Select your preferred language</p>

                <div className="language-options">
                    
                    <div className="language-option" id="langEnglish" onClick={() => console.log(`selectLanguage('en')`)}>
                        <div className="language-flag">
                            <i className="fas fa-flag-usa"></i>
                        </div>
                        <div className="language-info">
                            <h4>English</h4>
                            <div className="language-description">US English</div>
                        </div>
                        <div className="language-check" id="checkEnglish">
                            <i className="fas fa-check"></i>
                        </div>
                    </div>

                    
                    <div className="language-option" id="langFilipino" onClick={() => console.log(`selectLanguage('fil')`)}>
                        <div className="language-flag">
                            <i className="fas fa-flag"></i>
                        </div>
                        <div className="language-info">
                            <h4>Filipino</h4>
                            <div className="language-description">Wikang Filipino</div>
                        </div>
                        <div className="language-check" id="checkFilipino">
                            <i className="fas fa-check"></i>
                        </div>
                    </div>
                </div>

                <div style={{"marginTop":"20px","padding":"15px","background":"#f7fafc","borderRadius":"16px"}}>
                    <p style={{"color":"#4a5568","fontSize":"0.9rem"}}>
                        <i className="fas fa-info-circle" style={{"color":"#2E5E3E","marginRight":"8px"}}></i>
                        <span id="languagePreview">Current language: English</span>
                    </p>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => console.log('closeLanguageSettings()')}>Cancel</button>
                <button className="btn btn-primary" onClick={() => console.log('saveLanguageSettings()')}>Apply Changes</button>
            </div>
        </div>
    </div>

    
    <div className="modal" id="communityRulesModal" onClick={() => console.log('if(event.target === this) closeCommunityRules()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-gavel" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Community Rules</h3>
                <button className="modal-close" onClick={() => console.log('closeCommunityRules()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <div className="rules-container">
                    
                    <div className="rules-section dos">
                        <h4><i className="fas fa-check-circle"></i> Do's</h4>
                        <ul className="rules-list dos">
                            <li><i className="fas fa-check-circle"></i> Provide accurate pet information.</li>
                            <li><i className="fas fa-check-circle"></i> Arrive on time for appointments.</li>
                            <li><i className="fas fa-check-circle"></i> Use telemedicine properly.</li>
                            <li><i className="fas fa-check-circle"></i> Follow veterinarian instructions.</li>
                            <li><i className="fas fa-check-circle"></i> Communicate respectfully.</li>
                            <li><i className="fas fa-check-circle"></i> Provide accurate pet information.</li>
                            <li><i className="fas fa-check-circle"></i> Arrive on time for appointments.</li>
                            <li><i className="fas fa-check-circle"></i> Use telemedicine properly.</li>
                            <li><i className="fas fa-check-circle"></i> Follow veterinarian instructions.</li>
                            <li><i className="fas fa-check-circle"></i> Communicate respectfully.</li>
                        </ul>
                    </div>

                    
                    <div className="rules-section donts">
                        <h4><i className="fas fa-times-circle"></i> Don'ts</h4>
                        <ul className="rules-list donts">
                            <li><i className="fas fa-times-circle"></i> Do not provide false information.</li>
                            <li><i className="fas fa-times-circle"></i> Do not use abusive language.</li>
                            <li><i className="fas fa-times-circle"></i> Do not share your account.</li>
                            <li><i className="fas fa-times-circle"></i> Do not book fake appointments.</li>
                            <li><i className="fas fa-times-circle"></i> Do not misuse telemedicine.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => console.log('closeCommunityRules()')}>Got it</button>
            </div>
        </div>
    </div>

    
    
    {isProductModalOpen && (
      <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                  <h3><i className="fas fa-box" style={{marginRight: "10px", color: "#2E5E3E"}}></i> {editingProductId !== null ? 'Edit Product' : 'Add New Product'}</h3>
                  <button className="modal-close" onClick={() => { setIsProductModalOpen(false); setValidationErrors({}); }}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                  <form noValidate onSubmit={(e) => { e.preventDefault(); handleSaveProduct(); }}>
                      <div className="form-group">
                          <label><i className="fas fa-tag"></i> Product Name *</label>
                          <input type="text" className="form-control" placeholder="Enter product name" 
                              value={newProduct.name} onChange={e => { setNewProduct({...newProduct, name: e.target.value}); if (validationErrors.name) setValidationErrors({...validationErrors, name: ''}); }} 
                              style={validationErrors.name ? {borderColor: '#e53e3e'} : {}} />
                          {validationErrors.name && <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>{validationErrors.name}</span>}
                      </div>
                      <div className="form-group">
                          <label><i className="fas fa-peso-sign"></i> Price *</label>
                          <input type="number" step="0.01" className="form-control" placeholder="0.00" 
                              value={newProduct.price} onChange={e => { setNewProduct({...newProduct, price: e.target.value}); if (validationErrors.price) setValidationErrors({...validationErrors, price: ''}); }} 
                              style={validationErrors.price ? {borderColor: '#e53e3e'} : {}} />
                          {validationErrors.price && <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>{validationErrors.price}</span>}
                      </div>
                      <div className="form-group">
                          <label><i className="fas fa-list"></i> Category</label>
                          <select className="form-control" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                              <option value="food">Pet Food</option>
                              <option value="dog">Dog Supplies</option>
                              <option value="cat">Cat Supplies</option>
                              <option value="medications">Medications</option>
                              <option value="grooming">Grooming</option>
                              <option value="accessories">Accessories</option>
                          </select>
                      </div>
                      <div className="form-group">
                          <label><i className="fas fa-cubes"></i> Stock *</label>
                          <input type="number" className="form-control" placeholder="Quantity" 
                              value={newProduct.stock} onChange={e => { setNewProduct({...newProduct, stock: e.target.value}); if (validationErrors.stock) setValidationErrors({...validationErrors, stock: ''}); }} 
                              style={validationErrors.stock ? {borderColor: '#e53e3e'} : {}} />
                          {validationErrors.stock && <span style={{ color: '#e53e3e', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>{validationErrors.stock}</span>}
                      </div>
                      <div className="form-group">
                          <label><i className="fas fa-tag"></i> Badge (Optional)</label>
                          <select className="form-control" value={newProduct.badge} onChange={e => setNewProduct({...newProduct, badge: e.target.value})}>
                              <option value="">None</option>
                              <option value="sale">Sale</option>
                              <option value="new">New</option>
                          </select>
                      </div>
                      <div className="form-group">
                          <label><i className="fas fa-image"></i> Product Image</label>
                          <input type="file" accept="image/*" className="form-control" onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                      setNewProduct({...newProduct, image: reader.result as string});
                                  };
                                  reader.readAsDataURL(file);
                              }
                          }} />
                          {newProduct.image && (
                              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                  <img src={newProduct.image} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                                  <button type="button" onClick={() => setNewProduct({...newProduct, image: ''})} style={{ display: 'block', margin: '5px auto 0', background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: '12px' }}>Remove Image</button>
                              </div>
                          )}
                      </div>
                  </form>
              </div>
              <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => { setIsProductModalOpen(false); setValidationErrors({}); }}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={handleSaveProduct}>{editingProductId !== null ? 'Save Changes' : 'Add Product'}</button>
              </div>
          </div>
      </div>
    )}

    {sellModalProduct && !isPaymentModalOpen && (
      <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                  <h3><i className="fas fa-shopping-cart" style={{marginRight: "10px", color: "#2E5E3E"}}></i> Sell Product</h3>
                  <button className="modal-close" onClick={() => setSellModalProduct(null)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                  <p style={{marginBottom: '15px', color: '#2d3748', fontWeight: 600}}>Product: {sellModalProduct.name}</p>
                  <p style={{marginBottom: '15px', color: '#718096'}}>Available Stock: {sellModalProduct.stock}</p>
                  <div className="form-group">
                      <label><i className="fas fa-cubes"></i> Quantity</label>
                      <input type="number" className="form-control" min="1" max={sellModalProduct.stock}
                          value={sellQuantity} onChange={e => setSellQuantity(e.target.value)} required />
                  </div>
              </div>
              <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setSellModalProduct(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={proceedToPayment}>Proceed to Payment</button>
              </div>
          </div>
      </div>
    )}

    {isPaymentModalOpen && (
      <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                  <h3><i className="fas fa-credit-card" style={{marginRight: "10px", color: "#2E5E3E"}}></i> Payment</h3>
                  <button className="modal-close" onClick={() => setIsPaymentModalOpen(false)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                  <p style={{marginBottom: '15px', color: '#2d3748', fontWeight: 600}}>Total Amount: ₱{paymentAmount.toFixed(2)}</p>
                  <div className="form-group">
                      <label><i className="fas fa-money-bill"></i> Payment Method</label>
                      <select className="form-control">
                          <option value="cash">Cash</option>
                          <option value="card">Credit/Debit Card</option>
                          <option value="gcash">GCash</option>
                      </select>
                  </div>
                  <div className="form-group">
                      <label><i className="fas fa-receipt"></i> Amount Received (Optional)</label>
                      <input type="number" className="form-control" placeholder="Enter amount" />
                  </div>
              </div>
              <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={completePayment}>Complete Payment</button>
              </div>
          </div>
      </div>
    )}

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

    <div id="toast"></div>

    

    </>
  );
}
