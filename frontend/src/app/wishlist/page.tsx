'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { IProduct } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token, wishlist, removeFromWishlist, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Fetch full product details for the IDs in the wishlist
    const fetchWishlistProducts = async () => {
      if (!token || wishlist.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetcher('/products/by-ids', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ids: wishlist })
        });
        setWishlistProducts(data.data.products);
      } catch (error) {
        console.error("Failed to fetch wishlist products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [user, token, authLoading, router, wishlist]);

  if (loading || authLoading) {
    return <div className="text-center p-10">Loading your wishlist...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      {wishlistProducts.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-xl text-gray-500">Your wishlist is empty.</p>
          <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProducts.map(product => (
            <div key={product._id} className="border rounded-lg overflow-hidden shadow-lg h-full flex flex-col">
              <Link href={`/products/${product._id}`} className="group">
                <div className="relative w-full h-64 bg-gray-200">
                  <Image
                    src={product.images?.[0] ? `${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`.replace('/api/v1', '') : `https://placehold.jp/600x400.png?text=${encodeURIComponent(product.name)}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-lg font-semibold truncate group-hover:text-blue-600 flex-grow">
                    {product.name}
                  </h2>
                  <p className="text-gray-700 mt-2 font-bold">${product.price.toFixed(2)}</p>
                </div>
              </Link>
              <div className="p-4 border-t">
                <button 
                  onClick={() => removeFromWishlist(product._id)} 
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
