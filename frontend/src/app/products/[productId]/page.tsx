'use client'; 

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetcher } from '@/lib/api';
import { IProduct, Variant, IReview } from '@/types';
import Image from 'next/image';
import Link from "next/link";
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';

// A reusable component for product carousels/grids
const ProductGrid = ({ title, products }: { title: string, products: IProduct[] }) => {
    if (products.length === 0) return null;
    
    const ProductMiniCard = ({ product }: { product: IProduct }) => {
        const imageUrl = product.images?.[0] 
            ? `${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`.replace('/api/v1', '') 
            : `https://placehold.jp/400x400.png?text=${encodeURIComponent(product.name)}`;
        
        const [imageSrc, setImageSrc] = useState(imageUrl);
        const placeholderUrl = `https://placehold.jp/400x400.png?text=${encodeURIComponent(product.name)}`;

        return (
            <Link href={`/products/${product._id}`} className="group">
                <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                    <div className="relative w-full h-48 bg-gray-200">
                        <Image
                            src={imageSrc}
                            alt={product.name}
                            fill
                            className="object-cover"
                            onError={() => setImageSrc(placeholderUrl)}
                        />
                    </div>
                    <div className="p-3">
                        <h3 className="text-md font-semibold truncate">{product.name}</h3>
                        <p className="text-gray-800 mt-1 font-bold">${product.price.toFixed(2)}</p>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map(product => <ProductMiniCard key={product._id} product={product} />)}
            </div>
        </div>
    );
};

export default function ProductDetailsPage() {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [imageSrc, setImageSrc] = useState('');
  const [reviews, setReviews] = useState<IReview[]>([]);
  const { user, token } = useAuth(); 
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;

  useEffect(() => {
    const getProductDetails = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const [productData, relatedData, reviewsData] = await Promise.all([
            fetcher(`/products/${productId}`),
            fetcher(`/products/${productId}/related`),
            fetcher(`/products/${productId}/reviews`)
        ]);
        const fetchedProduct = productData.data.product;
        setProduct(fetchedProduct);
        setRelatedProducts(relatedData.data.products);
        setReviews(reviewsData.data.reviews || []);

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
    getProductDetails();
  }, [productId]);
  
  useEffect(() => {
    if (productId) {
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updatedViewed = viewed.filter((id: string) => id !== productId);
        updatedViewed.unshift(productId);
        const finalViewed = updatedViewed.slice(0, 5);
        localStorage.setItem('recentlyViewed', JSON.stringify(finalViewed));

        const fetchRecentlyViewed = async () => {
            const idsToShow = finalViewed.filter((id: string) => id !== productId);
            if (idsToShow.length > 0) {
                try {
                    const recentData = await fetcher('/products/by-ids', {
                        method: 'POST',
                        body: JSON.stringify({ ids: idsToShow })
                    });
                    setRecentlyViewed(recentData.data.products);
                } catch (error) {
                    console.error("Failed to fetch recently viewed:", error);
                }
            } else {
                setRecentlyViewed([]);
            }
        };
        fetchRecentlyViewed();
    }
  }, [productId]);
  
  const handleAddToCart = async () => {
    if (!token) { alert('Please log in to add items to your cart.'); router.push('/login'); return; }
    if (!product) return;
    if (product.variants.length > 0 && !selectedVariant) { return alert("Please select a variant."); }
    try {
      await fetcher('/cart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity, variant: selectedVariant })
      });
      alert(`${product.name} has been added to your cart!`);
    } catch (err: unknown) { 
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Error: ${errorMessage}`); 
    }
  };

  if (loading) { return <div className="text-center p-10">Loading...</div>; }
  if (!product) { return <div className="text-center p-10">Product not found!</div>; }
  
  const currentStock = selectedVariant ? selectedVariant.stock : (product.variants[0]?.stock || 0);
  const placeholderUrl = `https://placehold.jp/800x600.png?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative w-full h-96">
          <Image src={imageSrc} alt={product.name} fill className="object-cover rounded-lg shadow-lg" onError={() => setImageSrc(placeholderUrl)} />
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
                  <button key={variant._id} onClick={() => setSelectedVariant(variant)} className={`px-4 py-2 border rounded-md transition-colors ${ selectedVariant?.value === variant.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>
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
            <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" max={currentStock} className="w-20 border border-gray-300 rounded-md text-center py-2" disabled={currentStock === 0} />
            <button onClick={handleAddToCart} disabled={currentStock === 0} className="flex-grow bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <hr className="my-12" />
      <div>
        {user && <ReviewForm productId={productId} />}
        <ReviewList reviews={reviews} />
      </div>

      <ProductGrid title="Related Products" products={relatedProducts} />
      <ProductGrid title="Recently Viewed" products={recentlyViewed} />
    </div>
  );
}
