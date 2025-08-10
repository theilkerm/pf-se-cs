'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ICategory, Variant, ApiError } from '@/types';

export default function NewProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [tags, setTags] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetcher('/categories/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(data.data.categories);
      } catch (err: unknown) {
        const error = err as ApiError;
        setError(error.message || 'Failed to fetch categories.');
      }
    };
    if (token) {
      fetchCategories();
    }
  }, [token]);

  const handleVariantChange = (index: number, field: keyof Omit<Variant, '_id'>, value: string | number) => {
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
    setVariants([...variants, { type: 'Color', value: '', stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !images || images.length === 0) {
        setError('Please fill all required fields and upload at least one image.');
        return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('variants', JSON.stringify(variants.map(v => ({...v, stock: Number(v.stock)}))));
    formData.append('tags', tags);
    if (isFeatured) {
        formData.append('isFeatured', 'on');
    }
    
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create product.');
      }
      alert('Product created successfully!');
      router.push('/admin/products');
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" name="name" id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
            <input type="number" name="price" id="price" required value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" id="category" required value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input type="text" name="tags" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. electronics, laptop, gaming" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isFeatured" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">Mark as Featured Product</label>
          </div>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Variants</h3>
            {variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 items-center mb-2">
                <input type="text" placeholder="Type (e.g., Color)" value={variant.type} onChange={(e) => handleVariantChange(index, 'type', e.target.value)} className="border border-gray-300 rounded-md shadow-sm p-2" />
                <input type="text" placeholder="Value (e.g., Red)" value={variant.value} onChange={(e) => handleVariantChange(index, 'value', e.target.value)} className="border border-gray-300 rounded-md shadow-sm p-2" />
                <div className="flex items-center gap-2">
                    <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    <button type="button" onClick={() => removeVariant(index)} className="bg-red-500 text-white p-2 rounded-md">X</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addVariant} className="mt-2 text-sm bg-gray-200 py-1 px-3 rounded-md">Add Variant</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Images</label>
            <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
        </div>
        <div className="mt-6">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}