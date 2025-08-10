'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Variant } from '@/types'; // Import Variant type

// Update the interface to include order items
interface IOrderSummary {
  _id: string;
  totalPrice: number;
  orderStatus: string;
  createdAt: string;
  orderItems: {
    name: string;
    quantity: number;
    price: number;
    product: string;
    variant?: Variant;
  }[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<IOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetcher('/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(data.data.orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchOrders();
    }
  }, [user, token, authLoading, router]);

  if (loading || authLoading) {
    return <div className="text-center p-10">Loading your orders...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-6">
          {/* Map over each order and display it as a card */}
          {orders.map(order => (
            <div key={order._id} className="bg-white shadow-md rounded-lg p-6 border">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID: #{order._id.substring(0, 8)}...</p>
                  <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-lg">{order.orderStatus}</p>
                </div>
              </div>
              
              {/* List of items within the order */}
              <div className="space-y-4">
                {order.orderItems.map(item => (
                  <div key={item.product} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      {/* Display the selected variant if it exists */}
                      {item.variant && (
                        <p className="text-sm text-gray-500">
                          {item.variant.type}: {item.variant.value}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-700">x {item.quantity}</p>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t pt-4 mt-4">
                <Link href={`/orders/${order._id}`} className="text-blue-600 hover:text-blue-900 font-semibold">
                  View Details
                </Link>
                <p className="font-bold text-xl">Total: ${order.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}