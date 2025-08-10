'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { ICategory } from '@/types';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await fetcher('/categories/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(data.data.categories);
    } catch {
      console.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (categoryId: string) => {
    if (!token || !confirm("Are you sure you want to deactivate this category?")) return;
    try {
      await fetcher(`/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Category deactivated successfully.');
      fetchCategories();
    } catch {
      alert('Failed to deactivate category.');
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading categories...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <Link href="/admin/categories/new" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Add New Category
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map(category => (
              <tr key={category._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <Link href={`/admin/categories/edit/${category._id}`} className="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </Link>
                  {category.isActive && (
                    <button onClick={() => handleDelete(category._id)} className="text-red-600 hover:text-red-900">
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
