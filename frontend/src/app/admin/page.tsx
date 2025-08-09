'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';

interface DashboardStats {
  totalSales: number;
  orderCount: number;
  customerCount: number;
  // Add other stats types as needed
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      const getStats = async () => {
        try {
          const response = await fetcher('/dashboard/stats', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStats(response.data.stats);
        } catch (error) {
          console.error("Failed to fetch dashboard stats:", error);
        } finally {
          setLoading(false);
        }
      };
      getStats();
    }
  }, [token]);

  if (loading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-center p-10">Could not load dashboard statistics.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stat Card: Total Sales */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase">Total Sales</h2>
          <p className="text-3xl font-bold mt-2">${stats.totalSales.toFixed(2)}</p>
        </div>
        {/* Stat Card: Total Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase">Total Orders</h2>
          <p className="text-3xl font-bold mt-2">{stats.orderCount}</p>
        </div>
        {/* Stat Card: Total Customers */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase">Total Customers</h2>
          <p className="text-3xl font-bold mt-2">{stats.customerCount}</p>
        </div>
      </div>
      {/* We can add recent orders and popular products sections here later */}
    </div>
  );
}