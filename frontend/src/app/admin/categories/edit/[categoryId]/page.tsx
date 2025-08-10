'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

export default function EditCategoryPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as string;

  useEffect(() => {
    const getCategory = async () => {
      if (!token || !categoryId) return;
      try {
        const response = await fetcher(`/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const category = response.data.category;
        setName(category.name);
        setDescription(category.description);
        setIsActive(category.isActive);
      } catch {
        setError('Failed to load category data.');
      } finally {
        setLoading(false);
      }
    };
    getCategory();
  }, [token, categoryId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      await fetcher(`/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description, isActive })
      });
      alert('Category updated successfully!');
      router.push('/admin/categories');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) { return <div className="text-center p-10">Loading category...</div>; }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Category</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
            <input type="text" name="name" id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Is Active</label>
          </div>
        </div>
        <div className="mt-6">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? 'Saving...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  );
}
