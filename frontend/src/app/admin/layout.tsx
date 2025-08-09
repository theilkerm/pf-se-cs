'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import Link from 'next/link'; // Import Link

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="text-center p-10">Checking permissions...</div>;
  }

  return (
    <div className="flex">
      {/* Admin Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <nav>
          <h2 className="font-bold text-lg mb-4">Admin Panel</h2>
          <ul>
            <li>
              <Link href="/admin" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/products" className="block py-2 px-4 rounded hover:bg-gray-700">Products</Link>
            </li>
            {/* Add more admin links here in the future */}
          </ul>
        </nav>
      </aside>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}