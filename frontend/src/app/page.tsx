'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { fetcher } from "@/lib/api";
import { IProduct, ICategory } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/context/AuthContext';

const ProductCard = ({ product, viewMode }: { product: IProduct, viewMode: 'grid' | 'list' }) => {
  const { user, wishlist, addToWishlist, removeFromWishlist } = useAuth();
  const isWishlisted = wishlist.includes(product._id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { alert("Please log in to use the wishlist."); return; }
    isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product._id);
  };

  const imageUrl = product.images && product.images.length > 0
    ? `${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`.replace('/api/v1', '')
    : `https://placehold.jp/600x400.png?text=${encodeURIComponent(product.name)}`;

  const [imageSrc, setImageSrc] = useState(imageUrl);
  const placeholderUrl = `https://placehold.jp/600x400.png?text=${encodeURIComponent(product.name)}`;

  if (viewMode === 'list') {
    return (
      <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full flex relative group mb-4 bg-white">
        {user && (
            <button onClick={handleWishlistToggle} className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className={`w-6 h-6 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.318a4.5 4.5 0 010-6.364z" /></svg>
            </button>
        )}
        <Link href={`/products/${product._id}`} className="flex w-full">
          <div className="relative w-48 h-48 flex-shrink-0 bg-gray-200">
            <Image src={imageSrc} alt={product.name} fill className="object-cover" onError={() => setImageSrc(placeholderUrl)} />
          </div>
          <div className="p-4 flex flex-col">
            <h2 className="text-lg font-semibold group-hover:text-blue-600">{product.name}</h2>
            <p className="text-sm text-gray-600 mt-2 flex-grow">{product.description.substring(0, 100)}...</p>
            <p className="text-gray-800 mt-2 font-bold text-xl">${product.price.toFixed(2)}</p>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col relative group bg-white">
      {user && (
          <button onClick={handleWishlistToggle} className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className={`w-6 h-6 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.318a4.5 4.5 0 010-6.364z" /></svg>
          </button>
      )}
      <Link href={`/products/${product._id}`}>
        <div className="relative w-full h-64 bg-gray-200">
          <Image src={imageSrc} alt={product.name} fill className="object-cover" onError={() => setImageSrc(placeholderUrl)} />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h2 className="text-lg font-semibold truncate group-hover:text-blue-600 flex-grow">{product.name}</h2>
          <p className="text-gray-700 mt-2 font-bold">${product.price.toFixed(2)}</p>
        </div>
      </Link>
    </div>
  );
};

// --- NEWSLETTER COMPONENT DEFINITION ---
const NewsletterSignup = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            // This is a placeholder for a real API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage(`Thank you for subscribing, ${email}!`);
            setEmail('');
        } catch (error: any) {
            setMessage(error.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gray-100 rounded-lg p-8 my-8">
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
                <p className="text-gray-600 mb-6">
                    Subscribe to our newsletter to get the latest updates on new products, special offers, and more.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="flex-grow p-3 border rounded-md"
                    />
                    <button type="submit" disabled={loading} className="bg-gray-800 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-700 disabled:bg-gray-500">
                        {loading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </form>
                {message && <p className="mt-4 text-green-600">{message}</p>}
            </div>
        </section>
    );
};


export default function HomePage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search');

  useEffect(() => {
    const getCategories = async () => {
      try {
        const catData = await fetcher('/categories');
        setCategories(catData.data.categories);
      } catch (error) { console.error("Failed to fetch categories:", error); }
    };
    getCategories();
  }, []);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        const productsData = await fetcher(`/products?${params.toString()}`);
        setProducts(productsData.data.products);
        setPagination({
          page: productsData.data.page,
          totalPages: productsData.data.totalPages,
        });
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, [searchParams]);

  const handleUrlUpdate = (params: URLSearchParams) => {
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const handleFilterChange = (key: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    if (!value) { current.delete(key); } 
    else { current.set(key, value); }
    handleUrlUpdate(current);
  };

  const handlePriceFilter = () => {
    const current = new URLSearchParams(searchParams.toString());
    if (priceRange.min) { current.set('price[gte]', priceRange.min); } 
    else { current.delete('price[gte]'); }
    if (priceRange.max) { current.set('price[lte]', priceRange.max); } 
    else { current.delete('price[lte]'); }
    handleUrlUpdate(current);
  };
  
  return (
    <main className="container mx-auto p-4">
      {!searchTerm && (
        <>
          <section className="bg-gray-900 text-white rounded-lg p-12 mb-8 text-center">
            <h1 className="text-5xl font-bold mb-4">Discover Your Next Favorite Thing</h1>
            <p className="text-lg text-gray-300 mb-6">Browse our curated collection.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map(cat => (
                <div key={cat._id} onClick={() => handleFilterChange('category', cat._id)} className="flex flex-col items-center p-4 border rounded-lg hover:shadow-lg hover:bg-gray-50 transition-all cursor-pointer">
                  <span className="text-4xl">🛍️</span>
                  <span className="mt-2 text-sm font-semibold text-center">{cat.name}</span>
                </div>
              ))}
            </div>
          </section>
          <hr className="my-8" />
        </>
      )}
      
      <section id="products">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <h3 className="font-bold text-xl mb-4">Filters</h3>
            <div className="space-y-6">
              <div>
                <label className="font-semibold block mb-2">Category</label>
                <select onChange={(e) => handleFilterChange('category', e.target.value)} value={searchParams.get('category') || ''} className="border p-2 rounded w-full">
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange(p => ({...p, min: e.target.value}))} className="border p-2 rounded w-full" />
                  <span>-</span>
                  <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange(p => ({...p, max: e.target.value}))} className="border p-2 rounded w-full" />
                </div>
                <button onClick={handlePriceFilter} className="w-full mt-2 bg-gray-800 text-white p-2 rounded hover:bg-gray-700">Apply Price</button>
              </div>
            </div>
          </aside>

          {/* Products Display */}
          <div className="w-full md:w-3/4 lg:w-4/5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{searchTerm ? `Search Results for "${searchTerm}"` : 'Products'}</h2>
              <div className="flex items-center gap-4">
                <select onChange={(e) => handleFilterChange('sort', e.target.value)} value={searchParams.get('sort') || ''} className="border p-2 rounded">
                  <option value="">Sort by (Newest)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">By Rating</option>
                </select>
                <div className="flex border rounded-md">
                  <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200' : ''}`}>Grid</button>
                  <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-gray-200' : ''}`}>List</button>
                </div>
              </div>
            </div>
            {loading ? (
              <p className="text-center">Loading products...</p>
            ) : products.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col"}>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} viewMode={viewMode} />
                  ))}
                </div>
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button onClick={() => handleFilterChange('page', String(pagination.page - 1))} disabled={pagination.page <= 1} className="p-2 border rounded disabled:opacity-50">Previous</button>
                  <span>Page {pagination.page} of {pagination.totalPages}</span>
                  <button onClick={() => handleFilterChange('page', String(pagination.page + 1))} disabled={pagination.page >= pagination.totalPages} className="p-2 border rounded disabled:opacity-50">Next</button>
                </div>
              </>
            ) : (
              <p className="text-center">No products found.</p>
            )}
          </div>
        </div>
      </section>

      {!searchTerm && <NewsletterSignup />}
    </main>
  );
}
