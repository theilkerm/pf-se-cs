"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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

          {loading ? null : (
            <>
              {user ? (
                // If user is logged in
                <>
                  <Link href="/cart" className="hover:text-gray-300">
                    Cart
                  </Link>
                  <Link href="/my-orders" className="hover:text-gray-300">
                    My Orders
                  </Link>
                  <Link href="/account" className="hover:text-gray-300">
                    My Account
                  </Link>{" "}
                  <span className="font-semibold">
                    Welcome, {user.firstName}
                  </span>
                  <button onClick={logout} className="...">
                    Logout
                  </button>
                </>
              ) : (
                // If user is not logged in
                <>
                  <Link href="/login" className="hover:text-gray-300">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
                  >
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
