"use client";

import React, { useState } from 'react';
import './inventory.css';

export default function InventoryPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)' }}>
            <i className="fas fa-boxes"></i>
          </div>
          <div className="stat-info">
            <h3>Total Items</h3>
            <p>1,248</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dd6b20 0%, #c05621 100%)' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>Low Stock</h3>
            <p className="stock-low">15</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' }}>
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-info">
            <h3>Out of Stock</h3>
            <p className="stock-low">3</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)' }}>
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div className="stat-info">
            <h3>Expiring Soon</h3>
            <p className="expiry-soon">8</p>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="filter-btn">
            <i className="fas fa-filter"></i> Category
          </button>
          <button className="filter-btn">
            <i className="fas fa-sort"></i> Stock Level
          </button>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i> Add New Item
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock Level</th>
              <th>Unit</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 500 }}>#MED-001</td>
              <td>Amoxicillin 250mg</td>
              <td><span className="category-badge medicine">Medicine</span></td>
              <td><span className="stock-medium">45</span></td>
              <td>Tablets</td>
              <td><span className="expiry-soon">Dec 15, 2024</span></td>
              <td><i className="fas fa-circle" style={{ color: '#dd6b20', fontSize: '0.6rem', marginRight: '5px' }}></i> Low Stock</td>
              <td>
                <div className="action-buttons">
                  <button className="edit-btn"><i className="fas fa-edit"></i></button>
                  <button className="delete-btn"><i className="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>#VAC-042</td>
              <td>Rabies Vaccine</td>
              <td><span className="category-badge vaccine">Vaccine</span></td>
              <td><span className="stock-high">120</span></td>
              <td>Vials</td>
              <td>Oct 20, 2025</td>
              <td><i className="fas fa-circle" style={{ color: '#48bb78', fontSize: '0.6rem', marginRight: '5px' }}></i> In Stock</td>
              <td>
                <div className="action-buttons">
                  <button className="edit-btn"><i className="fas fa-edit"></i></button>
                  <button className="delete-btn"><i className="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>#SUP-112</td>
              <td>Surgical Masks</td>
              <td><span className="category-badge supplies">Supplies</span></td>
              <td><span className="stock-low">0</span></td>
              <td>Boxes</td>
              <td>N/A</td>
              <td><i className="fas fa-circle" style={{ color: '#e53e3e', fontSize: '0.6rem', marginRight: '5px' }}></i> Out of Stock</td>
              <td>
                <div className="action-buttons">
                  <button className="edit-btn"><i className="fas fa-edit"></i></button>
                  <button className="delete-btn"><i className="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>#EQU-008</td>
              <td>Stethoscope</td>
              <td><span className="category-badge equipment">Equipment</span></td>
              <td><span className="stock-high">12</span></td>
              <td>Units</td>
              <td>N/A</td>
              <td><i className="fas fa-circle" style={{ color: '#48bb78', fontSize: '0.6rem', marginRight: '5px' }}></i> Good Condition</td>
              <td>
                <div className="action-buttons">
                  <button className="edit-btn"><i className="fas fa-edit"></i></button>
                  <button className="delete-btn"><i className="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="pagination">
          <button className="page-btn"><i className="fas fa-chevron-left"></i></button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn"><i className="fas fa-chevron-right"></i></button>
        </div>
      </div>

      {showAddModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Item Name</label>
                  <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="e.g. Amoxicillin 250mg" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
                    <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option>Medicine</option>
                      <option>Vaccine</option>
                      <option>Supplies</option>
                      <option>Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Quantity</label>
                    <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="0" />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2E5E3E', color: 'white', cursor: 'pointer' }}>Save Item</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
