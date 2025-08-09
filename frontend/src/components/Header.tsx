'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
        router.push('/');
    } else {
        router.push(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between p-4 gap-6">
        <div className="text-xl font-bold">
          <Link href="/" className="hover:text-gray-300">E-Commerce</Link>
        </div>

        <form onSubmit={handleSearch} className="flex-grow max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for products..."
            className="w-full px-4 py-2 rounded-md text-gray-900"
          />
        </form>

        <div className="flex items-center space-x-4 flex-shrink-0">
          {loading ? null : (
            <>
              {user ? (
                <>
                  <Link href="/wishlist" className="hover:text-gray-300">Wishlist</Link>
                  <Link href="/cart" className="hover:text-gray-300">Cart</Link>
                  <Link href="/my-orders" className="hover:text-gray-300">My Orders</Link>
                  <Link href="/account" className="hover:text-gray-300">My Account</Link>
                  <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-gray-300">Login</Link>
                  <Link href="/register" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">Register</Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
