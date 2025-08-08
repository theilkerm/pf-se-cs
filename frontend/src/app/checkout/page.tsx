'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { IProduct } from '@/types';
import { useRouter } from 'next/navigation';

interface CartItem {
    product: IProduct;
    quantity: number;
    price: number;
    _id: string;
}

export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, token, loading: authLoading } = useAuth();
    const router = useRouter();

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        const getCart = async () => {
            if (!token) return;
            try {
                const data = await fetcher('/cart', { headers: { Authorization: `Bearer ${token}` } });
                if (data.data.cart.length === 0) {
                    alert("Your cart is empty. Redirecting to homepage.");
                    router.push('/');
                }
                setCartItems(data.data.cart);
            } catch (error) {
                console.error("Failed to fetch cart:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            getCart();
        }
    }, [user, token, authLoading, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            alert("Please log in to place an order.");
            return router.push('/login');
        }
        // Simple validation for address
        if (Object.values(address).some(field => field === '')) {
            return alert("Please fill in all shipping address fields.");
        }

        try {
            const response = await fetcher('/orders', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ shippingAddress: address })
            });

            const newOrder = response.data.order;
            alert('Order placed successfully!');

            // Redirect to the new order's confirmation page
            router.push(`/orders/${newOrder._id}`);

        } catch (error) {
            console.error("Failed to place order:", error);
            alert("There was an error placing your order. Please try again.");
        }
    };


    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (loading || authLoading) {
        return <div className="text-center p-10">Loading Checkout...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Shipping Details Form - REORDERED */}
                <div className="lg:col-span-2 bg-white p-6 shadow-md rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Country */}
                        <div className="md:col-span-2">
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                            <input type="text" name="country" id="country" required value={address.country} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>

                        {/* State / Province */}
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                            <input type="text" name="state" id="state" required value={address.state} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>

                        {/* City */}
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" name="city" id="city" required value={address.city} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>

                        {/* Street Address */}
                        <div className="md:col-span-2">
                            <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                            <input type="text" name="street" id="street" required value={address.street} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>

                        {/* ZIP / Postal Code */}
                        <div className="md:col-span-2">
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                            <input type="text" name="zipCode" id="zipCode" required value={address.zipCode} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>

                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow-md rounded-lg p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-4">Your Order</h2>
                        {cartItems.map(item => (
                            <div key={item.product._id} className="flex justify-between items-center text-sm py-2 border-b">
                                <span>{item.product.name} <span className="text-gray-500">x {item.quantity}</span></span>
                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                            <span>Total</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <button type="submit" className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
                            Place Order
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}