'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import Image from 'next/image';
import { Variant } from '@/types'; // Import Variant type

// Update the interfaces to include variant information
interface IOrderItem {
    name: string;
    quantity: number;
    price: number;
    image: string;
    product: string; // Just the ID is enough here
    variant?: Variant;
}
interface IOrder {
    _id: string;
    orderItems: IOrderItem[];
    shippingAddress: { street: string; city: string; state: string; zipCode: string; country: string; };
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const { token } = useAuth();
    const [order, setOrder] = useState<IOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && orderId) {
            const getOrderDetails = async () => {
                try {
                    const response = await fetcher(`/orders/${orderId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setOrder(response.data.order);
                } catch (error) {
                    console.error("Failed to fetch order details:", error);
                } finally {
                    setLoading(false);
                }
            };
            getOrderDetails();
        }
    }, [orderId, token]);

    if (loading) return <div className="text-center p-10">Loading order details...</div>;
    if (!order) return <div className="text-center p-10">Order not found or you are not authorized to view it.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-2">Order Details</h1>
            <p className="text-lg text-gray-600 mb-6">Thank you for your purchase!</p>

            <div className="bg-white p-6 shadow-md rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6 mb-6">
                    <div>
                        <h3 className="font-bold text-gray-800 mb-2">Shipping Address</h3>
                        <p className="text-gray-600">{order.shippingAddress.street}</p>
                        <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p className="text-gray-600">{order.shippingAddress.country}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-2">Order Summary</h3>
                        <p className="text-gray-600">Status: <span className="font-medium text-black">{order.orderStatus}</span></p>
                        <p className="text-gray-600">Date: <span className="font-medium text-black">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                    </div>
                     <div className="text-left md:text-right">
                        <h3 className="font-bold text-gray-800 mb-2">Order ID</h3>
                        <p className="text-sm text-gray-500">#{order._id}</p>
                    </div>
                </div>
                
                <h3 className="font-bold text-xl mb-4">Items in this order</h3>
                <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                        <div key={index} className="flex items-center py-2 border-b last:border-b-0">
                           <Image src={`https://placehold.jp/150x150.png?text=${item.name.replace(/\s/g, "+")}`} width={60} height={60} alt={item.name} className="rounded" />
                            <div className="flex-grow ml-4">
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                {/* Display variant information if it exists */}
                                {item.variant && (
                                    <p className="text-sm text-gray-500">
                                        {item.variant.type}: {item.variant.value}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-end font-bold text-2xl mt-6 pt-4 border-t">
                    <span>Total:</span>
                    <span className="ml-4">${order.totalPrice.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}