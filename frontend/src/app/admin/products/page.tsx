'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { IProduct } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Fetch all products, not just the first page
      const data = await fetcher('/products?limit=100', { // Fetching up to 100 products
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(data.data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId: string) => {
    if (!token || !confirm("Are you sure you want to delete this product?")) return;

    try {
      await fetcher(`/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product deleted successfully.');
      // Refresh the product list after deletion
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert('Failed to delete product.');
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading products...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Link href="/admin/products/new" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Add New Product
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <Link href={`/admin/products/edit/${product._id}`} className="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}