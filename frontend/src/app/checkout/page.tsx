'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { IProduct } from '@/types';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressSchema, AddressForm } from '@/schemas/checkout.schema';

interface CartItem {
  product: IProduct;
  quantity: number;
  price: number;
  _id: string;
}

interface Address extends AddressForm {
    _id: string;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const { 
    register, 
    handleSubmit, 
    reset,
    setValue,
    formState: { errors, isSubmitting } 
  } = useForm<AddressForm>({
    resolver: zodResolver(AddressSchema)
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
    
    // Set default address if available
    if (user?.addresses && user.addresses.length > 0) {
        const defaultAddress = user.addresses[0];
        setSelectedAddress(defaultAddress);
        reset(defaultAddress);
    }

  }, [user, token, authLoading, router, reset]);

  const handlePlaceOrder = async (data: AddressForm) => {
    if (!token) {
      alert("Please log in to place an order.");
      return router.push('/login');
    }
    
    try {
      const response = await fetcher('/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shippingAddress: data })
      });
      
      const newOrder = response.data.order;
      alert('Order placed successfully!');
      router.push(`/orders/${newOrder._id}`);
      
    } catch (error: unknown) {
      console.error("Failed to place order:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`There was an error placing your order: ${errorMessage}`);
    }
  };

  const handleAddressSelection = (address: Address) => {
    setSelectedAddress(address);
    // Populate form fields with selected address
    setValue('street', address.street);
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('zipCode', address.zipCode);
    setValue('country', address.country);
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (loading || authLoading) {
    return <div className="text-center p-10">Loading Checkout...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit(handlePlaceOrder)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>
          
          {user?.addresses && user.addresses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Select a saved address:</h3>
              <div className="flex flex-wrap gap-4">
                {user.addresses.map(addr => (
                  <div 
                    key={addr._id}
                    onClick={() => handleAddressSelection(addr)}
                    className={`p-4 border rounded-lg cursor-pointer ${selectedAddress?._id === addr._id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}
                  >
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                  </div>
                ))}
              </div>
               <p className="text-center my-4 text-gray-500">OR enter a new one below</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
              <input type="text" id="country" {...register('country')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
              <input type="text" id="state" {...register('state')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" id="city" {...register('city')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
              <input type="text" id="street" {...register('street')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
              <input type="text" id="zipCode" {...register('zipCode')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
            </div>
          </div>
        </div>

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
            <button type="submit" disabled={isSubmitting} className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400">
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}