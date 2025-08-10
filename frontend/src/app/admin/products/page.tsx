'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { IProduct } from '@/types';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Use the new admin-specific endpoint
      const data = await fetcher('/products/admin', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(data.data.products);
      setSelectedProducts([]);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.checked) {
      setSelectedProducts(prev => [...prev, id]);
    } else {
      setSelectedProducts(prev => prev.filter(pId => pId !== id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (!token || selectedProducts.length === 0 || !action) return;
    if (!confirm(`Are you sure you want to '${action}' ${selectedProducts.length} products?`)) return;

    try {
      await fetcher('/products/bulk-update', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productIds: selectedProducts, action })
      });
      alert('Bulk action successful.');
      fetchProducts();
    } catch {
      console.error("Bulk action failed");
      alert('Bulk action failed.');
    }
  };
  
  const handleDelete = async (productId: string) => {
    if (!token || !confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetcher(`/products/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      alert('Product deleted successfully.');
      fetchProducts();
    } catch {
      alert('Failed to delete product.');
    }
  };

  if (loading) return <div className="text-center p-10">Loading products...</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Link href="/admin/products/new" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Add New Product</Link>
      </div>
      
      {selectedProducts.length > 0 && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4 flex items-center gap-4">
          <span className="font-semibold">{selectedProducts.length} items selected</span>
          <select onChange={(e) => { 
            if (e.target.value) {
              handleBulkAction(e.target.value);
              e.target.value = '';
            }
          }} className="border p-2 rounded">
            <option value="">Select Bulk Action...</option>
            <option value="activate">Activate Selected</option>
            <option value="deactivate">Deactivate Selected</option>
          </select>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input type="checkbox" onChange={handleSelectAll} checked={products.length > 0 && selectedProducts.length === products.length} />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product._id} className={!product.isActive ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4">
                  <input type="checkbox" checked={selectedProducts.includes(product._id)} onChange={(e) => handleSelectOne(e, product._id)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.variants.reduce((acc, v) => acc + v.stock, 0)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <Link href={`/admin/products/edit/${product._id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                  <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}