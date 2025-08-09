'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authedFetcher } from '@/lib/api';

interface Review {
  _id: string;
  product: { _id: string; name: string };
  user: { _id: string; email: string };
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetcher(token, '/reviews/admin');
      setReviews(res?.data?.reviews || res?.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token]);

  const approveReview = async (id: string) => {
    if (!token) return;
    await authedFetcher(token, `/reviews/${id}/approve`, { method: 'PATCH' });
  };

  const onDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Delete this review?')) return;
    await authedFetcher(token, `/reviews/${id}`, { method: 'DELETE' });
    load();
  };

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Product</th>
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Rating</th>
              <th className="text-left p-2">Comment</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-2">{r.product?.name || r.product?._id}</td>
                <td className="p-2">{r.user?.email || r.user?._id}</td>
                <td className="p-2">{r.rating}</td>
                <td className="p-2 max-w-md">{r.comment || '-'}</td>
                <td className="p-2">{r.isApproved ? 'Approved' : 'Pending'}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {/* if pending show approve button */}
                    {!r.isApproved && (
                      <button onClick={() => approveReview(r._id)} className="px-2 py-1 border rounded">
                        Approve
                      </button>
                    )}

                    <button onClick={() => onDelete(r._id)} className="px-2 py-1 border rounded text-red-700">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No reviews.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
