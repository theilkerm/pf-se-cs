'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { ICategory, Variant, ApiError } from '@/types';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [variants, setVariants] = useState<Variant[]>([]);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !productId) return;
      try {
        const [productData, catData] = await Promise.all([
          fetcher(`/products/${productId}`),
          fetcher('/categories')
        ]);
        
        const product = productData.data.product;
        setName(product.name);
        setDescription(product.description);
        setPrice(String(product.price));
        setCategory(product.category._id);
        setVariants(product.variants);
        setCategories(catData.data.categories);
      } catch {
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, productId]);
  
  const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    const variant = newVariants[index];
    if (variant && typeof variant === 'object') {
      if (field === 'type' && typeof value === 'string') {
        variant.type = value;
      } else if (field === 'value' && typeof value === 'string') {
        variant.value = value;
      } else if (field === 'stock' && typeof value === 'number') {
        variant.stock = value;
      }
      setVariants(newVariants);
    }
  };
  const addVariant = () => {
    const newVariant: Variant = { 
        type: 'Color', 
        value: '', 
        stock: 0
    };
    setVariants([...variants, newVariant]);
  };
  
  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError('');
    
    try {
      await fetcher(`/products/${productId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description, price: parseFloat(price), category, variants })
      });
      alert('Product updated successfully!');
      router.push('/admin/products');
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) { return <div className="text-center p-10">Loading product for editing...</div>; }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        <div className="space-y-4">
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" name="name" id="name" value={name} required onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" value={description} required onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
            <input type="number" name="price" id="price" value={price} required onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" step="0.01" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" id="category" value={category} required onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-2">Variants & Stock</h3>
            {variants.map((variant, index) => (
              <div key={variant._id || index} className="flex gap-2 items-center mb-2 p-2 border rounded">
                <input type="text" placeholder="Type" value={variant.type} onChange={(e) => handleVariantChange(index, 'type', e.target.value)} className="border p-2 rounded w-1/3" />
                <input type="text" placeholder="Value" value={variant.value} onChange={(e) => handleVariantChange(index, 'value', e.target.value)} className="border p-2 rounded w-1/3" />
                <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))} className="border p-2 rounded w-1/4" min="0" />
                <button type="button" onClick={() => removeVariant(index)} className="bg-red-500 text-white p-2 rounded font-bold">X</button>
              </div>
            ))}
            <button type="button" onClick={addVariant} className="mt-2 bg-gray-200 text-gray-700 p-2 rounded text-sm">Add Variant</button>
          </div>
        </div>
        <div className="mt-6">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? 'Saving...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}