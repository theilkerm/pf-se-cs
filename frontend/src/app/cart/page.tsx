'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { IProduct, Variant } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CartItem {
  product: IProduct;
  quantity: number;
  price: number;
  variant?: Variant; // Variant is optional
  _id: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const getCart = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetcher('/cart', { headers: { Authorization: `Bearer ${token}` } });
      setCartItems(data.data.cart);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); }
    if (user && token) { getCart(); }
  }, [user, token, authLoading, router, getCart]);

  const handleRemoveItem = async (productId: string) => { /* ... (önceki cevaptaki gibi) ... */ };
  const handleClearCart = async () => { /* ... (önceki cevaptaki gibi) ... */ };
  const handleUpdateQuantity = (productId: string, newQuantityStr: string) => { /* ... (önceki cevaptaki gibi) ... */ };
  
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (loading || authLoading) {
    return <div className="text-center p-10">Loading your cart...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Shopping Cart</h1>
        {cartItems.length > 0 && <button onClick={handleClearCart} className="...">Clear Entire Cart</button>}
      </div>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p>Your cart is empty.</p>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg">
              {cartItems.map(item => (
                <div key={item._id} className="flex items-center p-4 border-b last:border-b-0">
                  <Image src={`https://placehold.jp/150x150.png?text=${item.product.name.replace(/\s/g, "+")}`} width={100} height={100} alt={item.product.name} className="rounded" />
                  <div className="flex-grow ml-4">
                    <Link href={`/products/${item.product._id}`} className="font-semibold hover:text-blue-600">{item.product.name}</Link>
                    {item.variant && (
                      <p className="text-sm text-gray-500">{item.variant.type}: {item.variant.value}</p>
                    )}
                    <div className="flex items-center mt-2">
                      <label htmlFor={`quantity-${item.product._id}`} className="text-sm mr-2">Qty:</label>
                      <input type="number" id={`quantity-${item.product._id}`} value={item.quantity} onChange={(e) => handleUpdateQuantity(item.product._id, e.target.value)} min="1" max={item.product.stock} className="w-16 border rounded text-center" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => handleRemoveItem(item.product._id)} className="text-red-500 hover:text-red-700 text-sm mt-1">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between mb-4"><span>Shipping</span><span className="text-gray-500">Calculated at checkout</span></div>
              <hr className="my-4" />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
              <Link href="/checkout" className="mt-6 block w-full bg-green-600 text-white text-center py-3 rounded-lg font-bold hover:bg-green-700">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}