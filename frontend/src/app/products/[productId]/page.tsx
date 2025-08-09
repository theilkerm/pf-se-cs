'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { IProduct, Variant } from '@/types';
import Image from 'next/image';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(''); // State to manage the image source for fallback

  const { user, token } = useAuth(); 
  const router = useRouter(); 

  useEffect(() => {
    if (!productId) return;
    const getProduct = async () => {
      try {
        setLoading(true);
        const productData = await fetcher(`/products/${productId}`);
        const fetchedProduct = productData.data.product;
        setProduct(fetchedProduct);
        
        // Set initial image and variant
        if (fetchedProduct) {
          const initialImg = fetchedProduct.images?.[0]
            ? `${process.env.NEXT_PUBLIC_API_URL}${fetchedProduct.images[0]}`.replace('/api/v1', '')
            : `https://placehold.jp/800x600.png?text=${encodeURIComponent(fetchedProduct.name)}`;
          setImageSrc(initialImg);

          if (fetchedProduct.variants?.length > 0) {
            setSelectedVariant(fetchedProduct.variants[0]);
          }
        }
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
    if (product.variants.length > 0 && !selectedVariant) {
        return alert("Please select a variant (e.g., color or size).");
    }

    try {
      await fetcher('/cart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: productId,
          quantity: quantity,
          variant: selectedVariant 
        })
      });
      alert(`${product.name} has been added to your cart!`);
    } catch (err: any) {
      console.error('Failed to add to cart:', err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Loading product...</div>;
  }
  if (!product) {
    return <div className="container mx-auto p-8 text-center">Product not found!</div>;
  }
  
  const currentStock = selectedVariant ? selectedVariant.stock : (product.variants[0]?.stock || 0);
  const placeholderUrl = `https://placehold.jp/800x600.png?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative w-full h-96">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover rounded-lg shadow-lg"
            onError={() => setImageSrc(placeholderUrl)}
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-semibold text-gray-500 uppercase">{product.category.name}</span>
          <h1 className="text-4xl font-bold my-2">{product.name}</h1>
          <p className="text-3xl font-light text-gray-800 mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          
          {product.variants && product.variants.length > 0 && product.variants.some(v => v.type !== 'Default') && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">{product.variants[0].type}</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 border rounded-md transition-colors ${ selectedVariant?.value === variant.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                  >
                    {variant.value}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4 mb-6">
            <span className={`py-1 px-3 rounded-full text-white text-sm ${ currentStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              {currentStock > 0 ? `${currentStock} in Stock` : 'Out of Stock'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              max={currentStock}
              className="w-20 border border-gray-300 rounded-md text-center py-2"
              disabled={currentStock === 0}
            />
            <button 
              onClick={handleAddToCart}
              disabled={currentStock === 0}
              className="flex-grow bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <hr className="my-12" />
      <div>
        {user && <ReviewForm productId={productId} />}
        <ReviewList reviews={(product as any)?.reviews || []} />
      </div>
    </div>
  );
}