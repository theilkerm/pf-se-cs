'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';

interface ISubscriber {
    _id: string;
    email: string;
    createdAt: string;
}

export default function AdminNewsletterPage() {
    const [subscribers, setSubscribers] = useState<ISubscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const fetchSubscribers = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await fetcher('/newsletter', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubscribers(data.data.subscribers);
        } catch (error) {
            console.error("Failed to fetch subscribers:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    if (loading) {
        return <div className="text-center p-10">Loading subscribers...</div>;
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Newsletter Subscribers</h1>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subscribers.map(subscriber => (
                            <tr key={subscriber._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subscriber.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(subscriber.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}