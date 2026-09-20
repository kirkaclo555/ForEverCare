import { useState, useEffect, useCallback } from 'react';
import { isSellableCategory } from '../lib/categoryUtils';

export interface InventoryItem {
  id: string | number;
  category: string;
  categoryLabel?: string;
  name: string;
  description?: string;
  dosageForm?: string;
  expiryDate?: string;
  price: string;
  costPrice?: string;
  stock: number;
  badge?: string;
  icon?: string;
  image?: string;
  status?: string;
  isArchived?: boolean;
}

const DEFAULT_ITEMS: InventoryItem[] = [];

export const SELLABLE_CATEGORIES = [
  'food',
  'dog',
  'cat',
  'medications',
  'vaccine',
  'grooming',
  'accessories',
  'accessory',
  'medicine',
  'Food supplies',
  'Pet Food',
  'Dog Supplies',
  'Cat Supplies',
];

export function useSharedInventory() {
  const [items, setItemsState] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInventory = useCallback(async (retryCount = 0): Promise<InventoryItem[]> => {
    try {
      const res = await fetch('/api/inventory');
      if (!res.ok) {
        // Try to extract the real error from the response body for better diagnostics
        let serverError = '';
        try {
          const errBody = await res.json();
          serverError = errBody?.details || errBody?.error || JSON.stringify(errBody);
        } catch {
          serverError = await res.text().catch(() => '');
        }
        throw new Error(`HTTP ${res.status}: ${serverError || res.statusText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setItemsState(data);
        setLoading(false);
        return data;
      } else if (data && typeof data === 'object' && Array.isArray((data as any).items)) {
        setItemsState((data as any).items);
        setLoading(false);
        return (data as any).items;
      }
    } catch (err) {
      // Retry once after 1.5 s — handles Next.js dev cold-start latency
      if (retryCount === 0) {
        console.warn('[Inventory] Fetch failed, retrying in 1.5s…', err);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return fetchInventory(1);
      }
      console.error('[Inventory] Failed to fetch inventory after retry:', err);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const setItems = (newItems: InventoryItem[]) => {
    setItemsState(newItems);
    const persistItems = newItems.filter(
      item => !(typeof item.id === 'string' && item.id.startsWith('temp-'))
    );
    if (persistItems.length > 0) {
      fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persistItems),
      }).catch(err => console.error('Error bulk syncing inventory:', err));
    }
  };

  const addItem = async (item: Omit<InventoryItem, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const tempItem = { ...item, id: tempId } as InventoryItem;
    setItemsState(prev => [...(Array.isArray(prev) ? prev : []), tempItem]);

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.item) {
        setItemsState(prev =>
          prev.map(i => (i.id === tempId ? (data.item as InventoryItem) : i))
        );
      }
      await fetchInventory();
    } catch (err) {
      console.error('Error adding item to inventory:', err);
    }
  };

  const updateItem = async (id: string | number, updates: Partial<InventoryItem>) => {
    setItemsState(prev =>
      (Array.isArray(prev) ? prev : []).map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );

    try {
      await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      await fetchInventory();
    } catch (err) {
      console.error('Error updating item in DB:', err);
    }
  };

  const deleteItem = async (id: string | number) => {
    setItemsState(prev => (Array.isArray(prev) ? prev : []).filter(item => item.id !== id));

    try {
      await fetch(`/api/inventory?id=${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete item from DB:', err);
    }
  };

  const archiveItem = async (id: string | number) => {
    setItemsState(prev => (Array.isArray(prev) ? prev : []).filter(item => item.id !== id));

    try {
      await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isArchived: true }),
      });
    } catch (err) {
      console.error('Failed to archive item:', err);
    }
  };

  const sellItem = async (id: string | number, quantity: number) => {
    let newStock = 0;
    setItemsState(prev =>
      (Array.isArray(prev) ? prev : []).map(item => {
        if (item.id === id) {
          newStock = Math.max(0, item.stock - quantity);
          return { ...item, stock: newStock };
        }
        return item;
      })
    );

    try {
      await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock: newStock }),
      });
    } catch (err) {
      console.error('Failed to update stock after selling item:', err);
    }
  };

  const getSellableItems = () => {
    const currentItems = Array.isArray(items) ? items : [];
    return currentItems.filter(item => {
      if (!item || !item.category) return false;
      return isSellableCategory(item.category);
    });
  };

  return {
    items: Array.isArray(items) ? items : [],
    loading,
    setItems,
    fetchInventory,
    addItem,
    updateItem,
    deleteItem,
    archiveItem,
    sellItem,
    getSellableItems,
  };
}
