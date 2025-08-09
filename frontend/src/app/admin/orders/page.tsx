'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import Link from 'next/link';
import { IOrder } from '@/types'; // Assuming you have IOrder in types

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    // State to track pending changes for order statuses
    const [pendingStatusChanges, setPendingStatusChanges] = useState<{ [key: string]: string }>({});

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        try {
        setLoading(true);
        const data = await fetcher('/orders', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(data.data.orders);
        } catch (error) {
        console.error("Failed to fetch orders:", error);
        } finally {
        setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // This function only updates the local state, it does not call the API
    const handleLocalStatusChange = (orderId: string, newStatus: string) => {
        setPendingStatusChanges(prev => ({
            ...prev,
            [orderId]: newStatus
        }));
    };

    // This function is called when the "Update" button is clicked
    const handleStatusUpdate = async (orderId: string) => {
        if (!token) return;
        const newStatus = pendingStatusChanges[orderId];
        if (!newStatus) return;

        try {
            await fetcher(`/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            // On success, remove the pending change and refresh the main list
            setPendingStatusChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[orderId];
                return newChanges;
            });
            fetchOrders(); // Re-fetch to confirm and get latest data
        } catch (error) {
            alert('Failed to update status.');
        }
    };

    if (loading) {
        return <div className="text-center p-10">Loading all orders...</div>;
    }

    return (
        <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Order Management</h1>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                        <Link href={`/orders/${order._id}`}>#{order._id.substring(0, 8)}...</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(order.user as any)?.firstName} {(order.user as any)?.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select 
                            value={pendingStatusChanges[order._id] || order.orderStatus} 
                            onChange={(e) => handleLocalStatusChange(order._id, e.target.value)}
                            className="border p-1 rounded-md bg-gray-50"
                        >
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                        </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Show update button only if there is a pending change for this order */}
                        {pendingStatusChanges[order._id] && (
                             <button onClick={() => handleStatusUpdate(order._id)} className="text-green-600 hover:text-green-900">
                                Update
                            </button>
                        )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    );
}