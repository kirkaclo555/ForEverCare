"use client";

import React, { useState } from 'react';
import './store.css';

export default function StorePage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)' }}>
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p>156</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' }}>
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="stat-info">
            <h3>Orders Today</h3>
            <p>24</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)' }}>
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-info">
            <h3>Revenue Today</h3>
            <p>$1,450</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dd6b20 0%, #c05621 100%)' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>Low Stock Items</h3>
            <p>8</p>
          </div>
        </div>
      </div>

      <div className="store-layout">
        {/* Left Column: Categories Sidebar */}
        <div className="categories-sidebar">
          <div className="categories-header">
            <h3>Categories</h3>
            <span onClick={() => setShowAddModal(true)}>+ Add Product</span>
          </div>
          
          <div className="category-list">
            <div className="category-item active">
              <div className="category-info">
                <i className="fas fa-th-large"></i>
                <span className="category-name">All Products</span>
              </div>
              <span className="category-count">156</span>
            </div>
            <div className="category-item">
              <div className="category-info">
                <i className="fas fa-bone"></i>
                <span className="category-name">Pet Food</span>
              </div>
              <span className="category-count">48</span>
            </div>
            <div className="category-item">
              <div className="category-info">
                <i className="fas fa-play"></i>
                <span className="category-name">Toys</span>
              </div>
              <span className="category-count">32</span>
            </div>
            <div className="category-item">
              <div className="category-info">
                <i className="fas fa-pump-medical"></i>
                <span className="category-name">Grooming</span>
              </div>
              <span className="category-count">24</span>
            </div>
            <div className="category-item">
              <div className="category-info">
                <i className="fas fa-band-aid"></i>
                <span className="category-name">Accessories</span>
              </div>
              <span className="category-count">52</span>
            </div>
          </div>
        </div>

        {/* Center Column: Products Grid */}
        <div className="products-grid">
          <div className="products-header">
            <h3>Products</h3>
            <select className="sort-select">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>

          <div className="product-cards">
            {/* Product Card 1 */}
            <div className="product-card">
              <span className="product-badge sale">Sale</span>
              <div className="product-image">
                <i className="fas fa-bone"></i>
              </div>
              <div className="product-category">Pet Food</div>
              <h4 className="product-title">Premium Dog Food, 5kg</h4>
              <div className="product-price">$35.00</div>
              <div className="product-stock"><i className="fas fa-check-circle"></i> In Stock (45)</div>
              <div className="product-actions">
                <button className="edit-btn"><i className="fas fa-edit"></i> Edit</button>
                <button className="delete-btn"><i className="fas fa-trash"></i></button>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="product-card">
              <div className="product-image">
                <i className="fas fa-cat"></i>
              </div>
              <div className="product-category">Toys</div>
              <h4 className="product-title">Interactive Cat Wand</h4>
              <div className="product-price">$12.50</div>
              <div className="product-stock"><i className="fas fa-check-circle"></i> In Stock (20)</div>
              <div className="product-actions">
                <button className="edit-btn"><i className="fas fa-edit"></i> Edit</button>
                <button className="delete-btn"><i className="fas fa-trash"></i></button>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="product-card">
              <div className="product-image">
                <i className="fas fa-pump-medical"></i>
              </div>
              <div className="product-category">Grooming</div>
              <h4 className="product-title">Oatmeal Pet Shampoo</h4>
              <div className="product-price">$18.00</div>
              <div className="product-stock" style={{ color: '#dd6b20' }}>
                <i className="fas fa-exclamation-circle" style={{ color: '#dd6b20' }}></i> Low Stock (5)
              </div>
              <div className="product-actions">
                <button className="edit-btn"><i className="fas fa-edit"></i> Edit</button>
                <button className="delete-btn"><i className="fas fa-trash"></i></button>
              </div>
            </div>
            
            {/* Product Card 4 */}
            <div className="product-card">
               <div className="product-image">
                 <i className="fas fa-dog"></i>
               </div>
               <div className="product-category">Accessories</div>
               <h4 className="product-title">Adjustable Dog Harness</h4>
               <div className="product-price">$25.00</div>
               <div className="product-stock"><i className="fas fa-check-circle"></i> In Stock (15)</div>
               <div className="product-actions">
                 <button className="edit-btn"><i className="fas fa-edit"></i> Edit</button>
                 <button className="delete-btn"><i className="fas fa-trash"></i></button>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Cart Sidebar */}
        <div className="cart-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#2d3748', fontSize: '1.2rem', fontWeight: 600 }}>Current Order</h3>
            <span style={{ background: '#2E5E3E', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>2 Items</span>
          </div>

          <div className="cart-items" style={{ marginBottom: '20px', minHeight: '200px' }}>
            <div className="cart-item" style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid #edf2f7' }}>
              <div style={{ width: '50px', height: '50px', background: '#edf2f7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-bone"></i>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9rem', color: '#2d3748' }}>Premium Dog Food</h4>
                <div style={{ color: '#a0aec0', fontSize: '0.8rem' }}>1 x $35.00</div>
              </div>
              <i className="fas fa-times" style={{ color: '#fc8181', cursor: 'pointer', fontSize: '0.9rem' }}></i>
            </div>
            
            <div className="cart-item" style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid #edf2f7' }}>
              <div style={{ width: '50px', height: '50px', background: '#edf2f7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-pump-medical"></i>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9rem', color: '#2d3748' }}>Oatmeal Shampoo</h4>
                <div style={{ color: '#a0aec0', fontSize: '0.8rem' }}>2 x $18.00</div>
              </div>
              <i className="fas fa-times" style={{ color: '#fc8181', cursor: 'pointer', fontSize: '0.9rem' }}></i>
            </div>
          </div>

          <div className="cart-summary" style={{ background: '#f7fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#4a5568' }}>
              <span>Subtotal</span>
              <span>$71.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#4a5568' }}>
              <span>Tax (8%)</span>
              <span>$5.68</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e0', fontWeight: 700, color: '#2d3748', fontSize: '1.2rem' }}>
              <span>Total</span>
              <span style={{ color: '#2E5E3E' }}>$76.68</span>
            </div>
          </div>

          <button style={{ width: '100%', background: 'linear-gradient(135deg, #2E5E3E 0%, #2E5E3E 100%)', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
            Process Checkout
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Product Name</label>
                  <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Premium Dog Food" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
                    <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option>Pet Food</option>
                      <option>Toys</option>
                      <option>Grooming</option>
                      <option>Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Price</label>
                    <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="0.00" />
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Initial Stock</label>
                  <input type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="10" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2E5E3E', color: 'white', cursor: 'pointer' }}>Add Product</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
