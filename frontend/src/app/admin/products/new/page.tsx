'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { ICategory, Variant } from '@/types';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [variants, setVariants] = useState<Omit<Variant, '_id'>[]>([{ type: 'Color', value: '', stock: 0 }]);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const getCategories = async () => {
      try {
        const catData = await fetcher('/categories');
        setCategories(catData.data.categories);
      } catch (err) { console.error("Failed to fetch categories", err); }
    };
    getCategories();
  }, []);
  
  const handleVariantChange = (index: number, field: keyof Omit<Variant, '_id'>, value: string | number) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => setVariants([...variants, { type: 'Color', value: '', stock: 0 }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!images || images.length === 0) { return setError('Please upload at least one product image.'); }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('variants', JSON.stringify(variants.map(v => ({...v, stock: Number(v.stock)}))));
    
    for (let i = 0; i < images.length; i++) { formData.append('images', images[i]); }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.message); }
      alert('Product created successfully!');
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        <div className="space-y-4">
          
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
            <input type="number" name="price" id="price" required value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" step="0.01" />
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
          
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-2">Variants & Stock</h3>
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-2 items-center mb-2 p-2 border rounded">
                <input type="text" placeholder="Type (e.g., Color)" value={variant.type} onChange={(e) => handleVariantChange(index, 'type', e.target.value)} className="border p-2 rounded w-1/3" />
                <input type="text" placeholder="Value (e.g., Red)" value={variant.value} onChange={(e) => handleVariantChange(index, 'value', e.target.value)} className="border p-2 rounded w-1/3" />
                <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))} className="border p-2 rounded w-1/4" min="0" />
                <button type="button" onClick={() => removeVariant(index)} className="bg-red-500 text-white p-2 rounded font-bold">X</button>
              </div>
            ))}
            <button type="button" onClick={addVariant} className="mt-2 bg-gray-200 text-gray-700 p-2 rounded text-sm">Add Variant</button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Images</label>
            <input type="file" required multiple onChange={(e) => setImages(e.target.files)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
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