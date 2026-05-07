import { useState, useEffect } from 'react';

export interface InventoryItem {
  id: number;
  category: string;
  categoryLabel?: string;
  name: string;
  description?: string;
  dosageForm?: string;
  expiryDate?: string;
  price: string;
  stock: number;
  badge?: string;
  icon?: string;
  image?: string;
}

const DEFAULT_ITEMS: InventoryItem[] = [
  { id: 1, category: 'food', categoryLabel: 'Dog Food', name: 'Premium Dog Food', description: 'High quality dog food', dosageForm: '', expiryDate: '2025-12-31', price: '45.99', stock: 45, icon: 'fa-dog' },
  { id: 2, category: 'food', categoryLabel: 'Cat Food', name: 'Gourmet Cat Food', description: 'Gourmet cat food', dosageForm: '', expiryDate: '2025-10-15', price: '38.99', stock: 32, badge: 'sale', icon: 'fa-cat' },
  { id: 3, category: 'medications', categoryLabel: 'Medication', name: 'Flea & Tick Treatment', description: 'Effective treatment', dosageForm: 'Drops', expiryDate: '2026-05-20', price: '24.99', stock: 8, icon: 'fa-pills' },
  { id: 4, category: 'grooming', categoryLabel: 'Grooming', name: 'Pet Grooming Kit', description: 'Complete kit', dosageForm: '', expiryDate: '', price: '67.99', stock: 23, icon: 'fa-cut' },
  { id: 5, category: 'accessories', categoryLabel: 'Accessories', name: 'Orthopedic Pet Bed', description: 'Comfortable bed', dosageForm: '', expiryDate: '', price: '89.99', stock: 15, badge: 'new', icon: 'fa-bed' },
  { id: 6, category: 'accessories', categoryLabel: 'Dental', name: 'Dental Care Kit', description: 'Dental kit', dosageForm: '', expiryDate: '', price: '29.99', stock: 42, icon: 'fa-tooth' },
  { id: 7, category: 'food', categoryLabel: 'Treats', name: 'Natural Dog Treats', description: 'Healthy treats', dosageForm: '', expiryDate: '2025-08-10', price: '15.99', stock: 78, icon: 'fa-bone' },
  { id: 8, category: 'medications', categoryLabel: 'Vaccines', name: 'Rabies Vaccine', description: 'Core vaccine', dosageForm: 'Injection', expiryDate: '2026-01-01', price: '18.99', stock: 6, icon: 'fa-syringe' },
  { id: 9, category: 'equipment', categoryLabel: 'Equipment', name: 'Surgical Table', description: 'Steel operating table', dosageForm: '', expiryDate: '', price: '450.00', stock: 2, icon: 'fa-stethoscope' }
];

export const SELLABLE_CATEGORIES = ['food', 'dog', 'cat', 'medications', 'vaccine', 'grooming', 'accessories', 'accessory', 'medicine', 'Food supplies'];

export function useSharedInventory() {
  const [items, setItemsState] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => setItemsState(data))
      .catch(err => setItemsState(DEFAULT_ITEMS));
  }, []);

  const setItems = (newItems: InventoryItem[]) => {
    setItemsState(newItems);
    fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItems)
    });
  };

  const addItem = (item: Omit<InventoryItem, 'id'>) => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const newItem = { ...item, id: newId };
    setItems([...items, newItem]);
  };

  const updateItem = (id: number, updates: Partial<InventoryItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const sellItem = (id: number, quantity: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, stock: Math.max(0, item.stock - quantity) };
      }
      return item;
    }));
  };

  const getSellableItems = () => {
    return items.filter(item => SELLABLE_CATEGORIES.includes(item.category.toLowerCase()));
  };

  return {
    items,
    setItems,
    addItem,
    updateItem,
    deleteItem,
    sellItem,
    getSellableItems
  };
}
