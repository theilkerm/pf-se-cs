import { fetcher } from "@/lib/api";
import { IProduct } from "@/types";
import Image from "next/image";
import Link from "next/link";

// In the Next.js App Router, page components can be async.
// This allows us to fetch data directly inside the component on the server.
export default async function HomePage() {
  
  // Fetch products from our backend API
  const productsData = await fetcher('/products');
  const products: IProduct[] = productsData.data.products;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Featured Products</h1>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link href={`/products/${product._id}`} key={product._id} className="group">
            <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-64 bg-gray-200">
                {/* We use a placeholder image for now */}
                <Image
                  src={`https://placehold.co/600x400?text=${product.name.replace(/\s/g, "+")}`}
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold truncate group-hover:text-blue-600">
                  {product.name}
                </h2>
                <p className="text-gray-700 mt-2 font-bold">${product.price.toFixed(2)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}