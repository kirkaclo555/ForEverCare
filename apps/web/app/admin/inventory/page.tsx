"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSharedInventory } from '../../../hooks/useInventory';
import './inventory.css';

export default function InventoryPage() {
  const router = useRouter();
  const { items, addItem, deleteItem, updateItem } = useSharedInventory();

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', category: '', description: '', dosageForm: '', expiryDate: '', stock: '', price: '' });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  const openItemModal = (itemToEdit?: any) => {
      if (itemToEdit && !itemToEdit.target) {
          setEditingId(itemToEdit.id);
          setNewItem({
              name: itemToEdit.name || '',
              category: itemToEdit.category || '',
              description: itemToEdit.description || '',
              dosageForm: itemToEdit.dosageForm || '',
              expiryDate: itemToEdit.expiryDate || '',
              stock: itemToEdit.stock?.toString() || '',
              price: itemToEdit.price?.toString() || ''
          });
      } else {
          setEditingId(null);
          setNewItem({ name: '', category: '', description: '', dosageForm: '', expiryDate: '', stock: '', price: '' });
      }
      setIsItemModalOpen(true);
  };
  const closeItemModal = () => {
      setIsItemModalOpen(false);
      setEditingId(null);
      setNewItem({ name: '', category: '', description: '', dosageForm: '', expiryDate: '', stock: '', price: '' });
  };

  const saveItem = () => {
    const isMedOrVac = newItem.category === 'medicine' || newItem.category === 'vaccine';
    
    const missingFields = [];
    if (!newItem.name) missingFields.push("Item Name");
    if (!newItem.category) missingFields.push("Category");
    if (!newItem.description) missingFields.push("Description");
    if (!newItem.stock) missingFields.push("Stock Quantity");
    if (!newItem.price) missingFields.push("Unit Price");
    
    if (isMedOrVac) {
        if (!newItem.dosageForm) missingFields.push("Dosage Form");
        if (!newItem.expiryDate) missingFields.push("Expiration Date");
    }

    if (missingFields.length > 0) {
        return setWarningMessage(`Please fill in the following missing fields:\n- ${missingFields.join('\n- ')}`);
    }
    
    const isDuplicate = items.some(item => item.name.trim().toLowerCase() === newItem.name.trim().toLowerCase() && item.id !== editingId);
    if (isDuplicate) {
        return setWarningMessage(`An item with the name "${newItem.name.trim()}" already exists in your inventory!`);
    }
    
    if (editingId) {
        updateItem(editingId, {
            name: newItem.name,
            category: newItem.category,
            description: newItem.description,
            dosageForm: newItem.dosageForm,
            expiryDate: newItem.expiryDate,
            stock: parseInt(newItem.stock) || 0,
            price: newItem.price
        });
        setWarningMessage('Item updated successfully!');
    } else {
        addItem({
            name: newItem.name,
            category: newItem.category,
            description: newItem.description,
            dosageForm: newItem.dosageForm,
            expiryDate: newItem.expiryDate,
            stock: parseInt(newItem.stock) || 0,
            price: newItem.price
        });
        setWarningMessage('Item saved successfully!');
    }
    closeItemModal();
  };

  const filteredItems = items.filter(item => {
      const matchCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
      let matchStock = true;
      if (stockFilter === 'low') matchStock = item.stock <= 50;
      else if (stockFilter === 'medium') matchStock = item.stock > 50 && item.stock <= 100;
      else if (stockFilter === 'high') matchStock = item.stock > 100;
      return matchCategory && matchStock;
  });

  const totalItems = filteredItems.length;
  const lowStockCount = filteredItems.filter(i => i.stock <= 50).length;
  const expiringCount = filteredItems.filter(i => {
    if (!i.expiryDate) return false;
    const exp = new Date(i.expiryDate);
    const now = new Date();
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays >= 0 && diffDays <= 90;
  }).length;
  const rawTotalValue = filteredItems.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (item.stock || 0)), 0);
  const totalValue = rawTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      
    
    
    <div className="module-content" style={{ width: "100%", padding: 0, margin: 0 }} id="mainContent">
        
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-pills"></i></div>
                <div className="stat-info">
                    <h3>Total Items</h3>
                    <p id="totalItems">{totalItems}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-exclamation-triangle"></i></div>
                <div className="stat-info">
                    <h3>Low Stock</h3>
                    <p id="lowStockCount">{lowStockCount}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-clock"></i></div>
                <div className="stat-info">
                    <h3>Expiring Soon</h3>
                    <p id="expiringCount">{expiringCount}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon"><i className="fas fa-peso-sign"></i></div>
                <div className="stat-info">
                    <h3>Total Value</h3>
                    <p id="totalValue">₱{totalValue}</p>
                </div>
            </div>
        </div>

        <div className="action-bar">
            <button className="add-btn" onClick={() => openItemModal()} style={{ position: 'relative', zIndex: 10, cursor: 'pointer' }}>
                <i className="fas fa-plus"></i>
                Add New Item
            </button>
            <div style={{"position":"relative"}}>
                <button className="filter-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                    <i className="fas fa-filter"></i>
                    Filter
                </button>
                {isFilterOpen && (
                <div className="filter-dropdown" id="filterDropdown" style={{ display: 'block', position: 'absolute', top: '100%', right: 0, zIndex: 10, background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', minWidth: '200px' }}>
                    <select id="categoryFilter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}>
                        <option value="all">All Categories</option>
                        <option value="medicine">Medicine</option>
                        <option value="vaccine">Vaccine</option>
                        <option value="equipment">Equipment</option>
                        <option value="supplies">Supplies</option>
                        <option value="accessory">Accessory</option>
                        <option value="Food supplies">Food Supplies</option>
                    </select>
                    <select id="stockFilter" value={stockFilter} onChange={e => setStockFilter(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}>
                        <option value="all">All Stock Levels</option>
                        <option value="low">Low Stock (≤ 50)</option>
                        <option value="medium">Medium Stock (51-100)</option>
                        <option value="high">High Stock (&gt;100)</option>
                    </select>
                    <button onClick={() => setIsFilterOpen(false)} style={{ width: '100%', padding: '8px', background: '#2E5E3E', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Apply Filter</button>
                </div>
                )}
            </div>
        </div>

        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Dosage Form</th>
                        <th>Expiration Date</th>
                        <th>Stock Quantity</th>
                        <th>Unit Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="inventoryTableBody">
                    {filteredItems.map(item => (
                        <tr key={item.id}>
                            <td>#{item.id}</td>
                            <td>{item.name}</td>
                            <td><span className={`status-badge ${item.category.replace(' ', '-').toLowerCase()}`}>{item.category}</span></td>
                            <td>{item.description || '-'}</td>
                            <td>{item.dosageForm || '-'}</td>
                            <td>{item.expiryDate || '-'}</td>
                            <td>
                                <span className={item.stock <= 50 ? 'status-badge low-stock' : 'status-badge in-stock'} style={item.stock <= 50 ? {backgroundColor: '#FED7D7', color: '#C53030', padding: '4px 8px', borderRadius: '4px'} : {backgroundColor: '#C6F6D5', color: '#2F855A', padding: '4px 8px', borderRadius: '4px'}}>
                                    {item.stock} units
                                </span>
                            </td>
                            <td>₱{item.price}</td>
                            <td>
                                <div className="action-buttons" style={{display: 'flex', gap: '5px'}}>
                                    <button className="action-btn edit" title="Edit" onClick={() => openItemModal(item)} style={{background: 'none', border: 'none', color: '#2E5E3E', cursor: 'pointer'}}>
                                        <i className="fas fa-edit"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="pagination" id="pagination">
            
        </div>
    </div>

    {isItemModalOpen && (
    <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) closeItemModal(); }}>
        <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
                <h3 id="modalTitle"><i className={editingId ? "fas fa-edit" : "fas fa-plus"} style={{"marginRight":"10px","color":"#2E5E3E"}}></i> {editingId ? 'Edit Item' : 'Add New Item'}</h3>
                <button type="button" className="modal-close" onClick={closeItemModal}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="itemForm" onSubmit={(e) => { e.preventDefault(); saveItem(); }}>
                    <input type="hidden" id="itemId" />
                    <div className="form-group">
                        <label><i className="fas fa-tag"></i> Item Name *</label>
                        <input type="text" className="form-control" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-folder"></i> Category *</label>
                        <select className="form-select" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} required>
                            <option value="">Select Category</option>
                            <option value="medicine">Medicine</option>
                            <option value="vaccine">Vaccine</option>
                            <option value="equipment">Equipment</option>
                            <option value="supplies">Supplies</option>
                            <option value="accessory">Accessory</option>
                            <option value="Food supplies">Food Supplies</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-align-left"></i> Description *</label>
                        <input type="text" className="form-control" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} required />
                    </div>
                    {(newItem.category === 'medicine' || newItem.category === 'vaccine') && (
                        <div className="form-group">
                            <label><i className="fas fa-capsules"></i> Dosage Form *</label>
                            <input type="text" className="form-control" value={newItem.dosageForm} onChange={e => setNewItem({...newItem, dosageForm: e.target.value})} required />
                        </div>
                    )}
                    <div className="form-row">
                        {(newItem.category === 'medicine' || newItem.category === 'vaccine') && (
                            <div className="form-group">
                                <label><i className="fas fa-calendar"></i> Expiration Date *</label>
                                <input type="date" className="form-control" value={newItem.expiryDate} onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} required />
                            </div>
                        )}
                        <div className="form-group" style={{ width: (newItem.category === 'medicine' || newItem.category === 'vaccine') ? undefined : '100%' }}>
                            <label><i className="fas fa-boxes"></i> Stock Quantity *</label>
                            <input type="number" className="form-control" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-money-bill"></i> Unit Price (₱) *</label>
                        <input type="number" step="0.01" className="form-control" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeItemModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Item</button>
                    </div>
                </form>
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

    
    <div className="modal" id="generalSettingsModal" onClick={() => console.log('if(event.target === this) closeGeneralSettings()')}>
        <div className="modal-content">
            <div className="modal-header">
                <h3><i className="fas fa-clinic-medical" style={{"marginRight":"10px","color":"#2E5E3E"}}></i> Clinic Information</h3>
                <button className="modal-close" onClick={() => console.log('closeGeneralSettings()')}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
                <form id="clinicSettingsForm">
                    <div className="form-group">
                        <label><i className="fas fa-clinic-medical"></i> Clinic name</label>
                        <input type="text" className="form-control" id="clinicName" defaultValue="FurEverCare Veterinary Clinic" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-map-marker-alt"></i> Address</label>
                        <input type="text" className="form-control" id="clinicAddress" defaultValue="123 Paws Avenue, Pet City, PC 12345" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-phone-alt"></i> Phone number</label>
                        <input type="tel" className="form-control" id="clinicPhone" defaultValue="+1 (555) 123-4567" />
                    </div>
                    <div className="form-group">
                        <label><i className="far fa-clock"></i> Opening hours</label>
                        <input type="text" className="form-control" id="clinicHours" defaultValue="Mon-Fri 9am-6pm, Sat 9am-2pm, Sun Closed" />
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
                <form id="securityForm">
                    <div className="form-group">
                        <label><i className="fas fa-lock"></i> Current password</label>
                        <input type="password" className="form-control" id="currentPassword" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-key"></i> New password</label>
                        <input type="password" className="form-control" id="newPassword" />
                    </div>
                    <div className="form-group">
                        <label><i className="fas fa-check-circle"></i> Confirm new password</label>
                        <input type="password" className="form-control" id="confirmPassword" />
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
                        <div className="language-flag"><i className="fas fa-flag-usa"></i></div>
                        <div className="language-info"><h4>English</h4><div className="language-description">US English</div></div>
                        <div className="language-check" id="checkEnglish"><i className="fas fa-check"></i></div>
                    </div>
                    <div className="language-option" id="langFilipino" onClick={() => console.log(`selectLanguage('fil')`)}>
                        <div className="language-flag"><i className="fas fa-flag"></i></div>
                        <div className="language-info"><h4>Filipino</h4><div className="language-description">Wikang Filipino</div></div>
                        <div className="language-check" id="checkFilipino"><i className="fas fa-check"></i></div>
                    </div>
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
                            <li><i className="fas fa-check-circle"></i> Use teleconsultation properly.</li>
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
                            <li><i className="fas fa-times-circle"></i> Do not misuse teleconsultation.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => console.log('closeCommunityRules()')}>Got it</button>
            </div>
        </div>
    </div>

    <div id="toast"></div>

    </>
  );
}
