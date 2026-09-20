import { useState, useEffect } from 'react';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  subtotal: number;
  product?: {
    id: string;
    productName: string;
    price: number;
    productImage?: string;
    icon?: string;
    color?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  deliveryAddress: string;
  items: OrderItem[];
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  payments?: any[];
}

export function useOrders(initialStatus?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (status?: string) => {
    setLoading(true);
    try {
      const url = status ? `/api/orders?status=${status}` : '/api/orders';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setOrders(data.items);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(initialStatus);
  }, [initialStatus]);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        // Update local state to reflect the new status
        setOrders(orders.map(order => order.id === id ? { ...order, status: data.order.status } : order));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus
  };
}
