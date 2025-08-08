'use client'; 

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { IProduct } from '@/types';
import Image from 'next/image';

type ProductDetailsPageProps = {
  params: {
    productId: string;
  };
};

export default function ProductDetailsPage({ params: { productId } }: ProductDetailsPageProps) {
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [quantity, setQuantity] = useState(1); // State for the quantity input
  const [loading, setLoading] = useState(true);
  const { token } = useAuth(); 
  const router = useRouter(); 

  useEffect(() => {
    if (!productId) return;
    const getProduct = async () => {
      try {
        setLoading(true);
        const productData = await fetcher(`/products/${productId}`);
        setProduct(productData.data.product);
      } catch (err) {
        console.error("Fetch product error:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!token) {
      alert('Please log in to add items to your cart.');
      router.push('/login');
      return;
    }
    if (!product) return;

    try {
      await fetcher('/cart', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          productId: productId,
          quantity: quantity // Use the quantity from state
        })
      });
      alert(`${product.name} (x${quantity}) has been added to your cart!`);
    } catch (err: any) {
      console.error('Failed to add to cart:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }
  if (!product) {
    return <div className="container mx-auto p-8 text-center">Product not found!</div>;
  }

  return (
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
          <span className="text-sm font-semibold text-gray-500 uppercase">{product.category.name}</span>
          <h1 className="text-4xl font-bold my-2">{product.name}</h1>
          <p className="text-3xl font-light text-gray-800 mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          <div className="flex items-center space-x-4 mb-6">
            <span className={`py-1 px-3 rounded-full text-white text-sm ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              {product.stock > 0 ? `${product.stock} in Stock` : 'Out of Stock'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Quantity Selector */}
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              max={product.stock}
              className="w-20 border border-gray-300 rounded-md text-center py-2"
              disabled={product.stock === 0}
            />
            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-grow bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}