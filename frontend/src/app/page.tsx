'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { fetcher } from "@/lib/api";
import { IProduct, ICategory } from "@/types";
import Image from "next/image";
import Link from "next/link";

const ProductCard = ({ product }: { product: IProduct }) => (
  <Link href={`/products/${product._id}`} className="group">
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <div className="relative w-full h-64 bg-gray-200">
        <Image
          src={`https://placehold.jp/600x400.png?text=${product.name.replace(/\s/g, "+")}`}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold truncate group-hover:text-blue-600 flex-grow">
          {product.name}
        </h2>
        <p className="text-gray-700 mt-2 font-bold">${product.price.toFixed(2)}</p>
      </div>
    </div>
  </Link>
);

export default function HomePage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  }, [searchParams]); // This hook re-runs whenever the URL search parameters change

  const handleFilterChange = (key: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set(key, value);
    if (key !== 'page') {
      current.set('page', '1');
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    // Using router.push will update the URL, which triggers the useEffect above
    router.push(`${pathname}${query}`);
  };
  
  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <select onChange={(e) => handleFilterChange('category', e.target.value)} value={searchParams.get('category') || ''} className="border p-2 rounded w-full md:w-auto">
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>
        <select onChange={(e) => handleFilterChange('sort', e.target.value)} value={searchParams.get('sort') || ''} className="border p-2 rounded w-full md:w-auto">
          <option value="">Sort by (Newest)</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button onClick={() => handleFilterChange('page', String(pagination.page - 1))} disabled={pagination.page <= 1} className="p-2 border rounded disabled:opacity-50">Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button onClick={() => handleFilterChange('page', String(pagination.page + 1))} disabled={pagination.page >= pagination.totalPages} className="p-2 border rounded disabled:opacity-50">Next</button>
          </div>
        </>
      ) : (
        <p className="text-center">No products found for the selected criteria.</p>
      )}
    </main>
  );
}