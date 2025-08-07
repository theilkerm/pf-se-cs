'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <div className="text-xl font-bold">
          <Link href="/" className="hover:text-gray-300">
            E-Commerce
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          <Link href="/" className="hover:text-gray-300"> 
            Products
          </Link>
          <Link href="/cart" className="hover:text-gray-300">
            Cart
          </Link>
          
          {loading ? null : (
            <>
              {user ? (
                <>
                  <span className="font-semibold">Welcome, {user.firstName}</span>
                  <button 
                    onClick={logout} 
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-gray-300">
                    Login
                  </Link>
                  <Link href="/register" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}