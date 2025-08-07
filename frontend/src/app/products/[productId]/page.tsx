'use client'; // This component must be a Client Component to use hooks

// Import React hooks and the new useParams hook
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { fetcher } from '@/lib/api';
import { IProduct } from '@/types';
import Image from 'next/image';

// The component no longer accepts any props in its signature
export default function ProductDetailsPage() {
  
  // We get the params object by calling the useParams hook inside the component
  const params = useParams();
  const productId = params.productId as string; // Get the specific ID
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure productId is available before fetching
    if (!productId) return;

    const getProduct = async () => {
      try {
        setLoading(true);
        const productData = await fetcher(`/products/${productId}`);
        setProduct(productData.data.product);
      } catch (err) {
        setError('Failed to fetch product.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [productId]); // The effect depends on productId

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-center text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="container mx-auto p-8 text-center">Product not found!</div>;
  }

  return (
    // The JSX part remains the same as before
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative w-full h-96">
          <Image
            src={`https://placehold.jp/800x600.png?text=${product.name.replace(/\s/g, "+")}`}
            alt={product.name}
            fill
            className="object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-semibold text-gray-500 uppercase">
            {product.category.name}
          </span>
          <h1 className="text-4xl font-bold my-2">{product.name}</h1>
          <p className="text-3xl font-light text-gray-800 mb-4">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            {product.description}
          </p>
          <div className="flex items-center space-x-4 mb-6">
            <span className={`py-1 px-3 rounded-full text-white text-sm ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              {product.stock > 0 ? `${product.stock} in Stock` : 'Out of Stock'}
            </span>
          </div>
          <button 
            disabled={product.stock === 0}
            className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}