"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return <div className="text-center p-10">Checking permissions...</div>;
  }

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <nav>
          <h2 className="font-bold text-lg mb-4">Admin Panel</h2>
          <ul>
            <li>
              <Link
                href="/admin"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/admin/categories"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Categories
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                href="/admin/customers"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Customers
              </Link>
            </li>
            <li>
              <Link
                href="/admin/reviews"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Reviews
              </Link>
            </li>
            <li>
              <Link
                href="/admin/newsletter"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Newsletter
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
