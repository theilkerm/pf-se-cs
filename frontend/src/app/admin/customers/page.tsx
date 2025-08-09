'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Import router and searchParams

interface ICustomer {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    orders: any[];
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    const fetchCustomers = useCallback(async (currentSearch: string) => {
        if (!token) return;
        try {
        setLoading(true);
        const searchQuery = currentSearch ? `?search=${encodeURIComponent(currentSearch)}` : '';
        const data = await fetcher(`/users${searchQuery}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(data.data.users);
        } catch (error) {
        console.error("Failed to fetch customers:", error);
        } finally {
        setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCustomers(searchParams.get('search') || '');
    }, [fetchCustomers, searchParams]);
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        params.set('search', searchTerm);
        router.push(`/admin/customers?${params.toString()}`);
    };

    if (loading) {
        return <div className="text-center p-10">Loading customers...</div>;
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Customer Management</h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full md:w-1/2 p-2 border rounded-md"
                />
            </form>
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map(customer => (
                        <tr key={customer._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.orders?.length || 0}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}