'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import Image from 'next/image';

// We need a more detailed Order type for this page
interface IOrderItem {
    name: string;
    quantity: number;
    price: number;
    image: string;
    product: { _id: string; name: string, images: string[] };
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
            <h1 className="text-3xl font-bold mb-4">Order Confirmation</h1>
            <p className="text-lg text-green-600 mb-6">Thank you for your purchase!</p>

            <div className="bg-white p-6 shadow-md rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Order #{order._id}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold mb-2">Shipping Address</h3>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">Order Summary</h3>
                        <p>Status: <span className="font-medium">{order.orderStatus}</span></p>
                        <p>Date: <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                        <p>Total: <span className="font-bold text-lg">${order.totalPrice.toFixed(2)}</span></p>
                    </div>
                </div>
                <hr className="my-6" />
                <h3 className="font-bold mb-4">Items in this order</h3>
                {order.orderItems.map(item => (
                    <div key={item.product._id} className="flex items-center py-2 border-b last:border-b-0">
                       <Image src={`https://placehold.jp/150x150.png?text=${item.name}`} width={60} height={60} alt={item.name} className="rounded" />
                        <div className="flex-grow ml-4">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}