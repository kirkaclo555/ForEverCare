const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update CSS import
    content = content.replace(/import '\.\/store\.css';/g, "import './products.css';");
    content = content.replace(/export default function StorePage/g, "export default function ProductsPage");

    // 2. Add React state and types right after function declaration
    const stateLogic = `
  const [products, setProducts] = useState([
    { id: 1, category: 'food', categoryLabel: 'Dog Food', name: 'Premium Dog Food', price: '45.99', stock: 45, icon: 'fa-dog' },
    { id: 2, category: 'food', categoryLabel: 'Cat Food', name: 'Gourmet Cat Food', price: '38.99', stock: 32, badge: 'sale', icon: 'fa-cat' },
    { id: 3, category: 'medications', categoryLabel: 'Medication', name: 'Flea & Tick Treatment', price: '24.99', stock: 8, icon: 'fa-pills' },
    { id: 4, category: 'grooming', categoryLabel: 'Grooming', name: 'Pet Grooming Kit', price: '67.99', stock: 23, icon: 'fa-cut' },
    { id: 5, category: 'accessories', categoryLabel: 'Accessories', name: 'Orthopedic Pet Bed', price: '89.99', stock: 15, badge: 'new', icon: 'fa-bed' },
    { id: 6, category: 'accessories', categoryLabel: 'Dental', name: 'Dental Care Kit', price: '29.99', stock: 42, icon: 'fa-tooth' },
    { id: 7, category: 'food', categoryLabel: 'Treats', name: 'Natural Dog Treats', price: '15.99', stock: 78, icon: 'fa-bone' },
    { id: 8, category: 'medications', categoryLabel: 'Vaccines', name: 'Rabies Vaccine', price: '18.99', stock: 6, icon: 'fa-syringe' }
  ]);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'food', stock: '', badge: '' });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return alert('Please fill all required fields');
    
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

    const newId = Math.max(0, ...products.map(p => p.id)) + 1;
    setProducts([...products, { ...newProduct, id: newId, stock: parseInt(newProduct.stock), categoryLabel, icon }]);
    setIsProductModalOpen(false);
    setNewProduct({ name: '', price: '', category: 'food', stock: '', badge: '' });
  };
`;
    // Insert after "const router = useRouter();"
    content = content.replace(/(const router = useRouter\(\);\s*return \(\s*<>)/, `const router = useRouter();\n${stateLogic}\n  return (\n    <>`);

    // 3. Update the Add New Product button
    content = content.replace(
        /onClick=\{\(\) => console\.log\('openAddProductModal\(\)'\)\}/g,
        "onClick={() => setIsProductModalOpen(true)}"
    );

    // 4. Replace the product-cards container with dynamic loop
    const productCardsStart = '<div className="product-cards" id="product-container">';
    const cartSidebarIndex = content.indexOf('<div className="cart-sidebar">');
    
    if (content.includes(productCardsStart) && cartSidebarIndex !== -1) {
        const startIndex = content.indexOf(productCardsStart);
        // The product-cards block ends right before cart-sidebar
        // Let's find the closing div of products-grid which is before cart-sidebar
        // Actually, replacing everything between productCardsStart and cartSidebar is risky.
        // Let's just use regex to replace everything inside product-cards.
        const dynamicList = `${productCardsStart}
                    {products.map(product => (
                        <div className="product-card" data-category={product.category} data-price={product.price} data-id={product.id} key={product.id}>
                            {product.badge === 'sale' && <div className="product-badge sale">SALE</div>}
                            {product.badge === 'new' && <div className="product-badge" style={{background: '#48bb78'}}>NEW</div>}
                            <div className="product-image">
                                <i className={\`fas \${product.icon}\`}></i>
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
                                <button className="edit-btn"><i className="fas fa-edit"></i> Edit</button>
                                <button className="delete-btn" onClick={() => setProducts(products.filter(p => p.id !== product.id))}><i className="fas fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>`;
        
        // Find end of product-container
        const endOfContainer = content.indexOf('</div>', content.indexOf('Delete', content.lastIndexOf('deleteProduct(8')) + 20) + 6;
        const part1 = content.substring(0, startIndex);
        
        // Let's use a smarter replacement. The product-cards ends before closing products-grid.
        // I will just use regex to replace from `<div className="product-cards"` up to the exact string before `cart-sidebar`.
        // Actually, the original file has `<div className="product-cards" id="product-container">` ... 8 products ... `</div>` `</div>` `<!-- Cart Sidebar -->`
        
        content = content.replace(/<div className="product-cards" id="product-container">[\s\S]*?<\/div>\s*<\/div>\s*<div className="cart-sidebar">/, dynamicList + '\n            </div>\n\n            <div className="cart-sidebar">');
    }

    // 5. Replace productModal with dynamic form
    const dynamicModal = `
    {isProductModalOpen && (
      <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                  <h3><i className="fas fa-box" style={{marginRight: "10px", color: "#2E5E3E"}}></i> Add New Product</h3>
                  <button className="modal-close" onClick={() => setIsProductModalOpen(false)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                  <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }}>
                      <div className="form-group">
                          <label><i className="fas fa-tag"></i> Product Name</label>
                          <input type="text" className="form-control" placeholder="Enter product name" 
                              value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                      </div>
                      <div className="form-group">
                          <label><i className="fas fa-peso-sign"></i> Price</label>
                          <input type="number" step="0.01" className="form-control" placeholder="0.00" 
                              value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
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
                          <label><i className="fas fa-cubes"></i> Stock</label>
                          <input type="number" className="form-control" placeholder="Quantity" 
                              value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} required />
                      </div>
                      <div className="form-group">
                          <label><i className="fas fa-tag"></i> Badge (Optional)</label>
                          <select className="form-control" value={newProduct.badge} onChange={e => setNewProduct({...newProduct, badge: e.target.value})}>
                              <option value="">None</option>
                              <option value="sale">Sale</option>
                              <option value="new">New</option>
                          </select>
                      </div>
                  </form>
              </div>
              <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setIsProductModalOpen(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleAddProduct}>Add Product</button>
              </div>
          </div>
      </div>
    )}
    <div id="toast">`;
    
    content = content.replace(/<div className="modal" id="productModal"[\s\S]*?<div id="toast">/, dynamicModal);

    fs.writeFileSync(filePath, content, 'utf8');
}

processFile(path.join(__dirname, 'app', 'admin', 'products', 'page.tsx'));
processFile(path.join(__dirname, 'app', 'superadmin', 'products', 'page.tsx'));
console.log('Update complete.');
