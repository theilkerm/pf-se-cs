import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <div className="text-xl font-bold">
          <Link href="/" className="hover:text-gray-300">
            E-Commerce
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link href="/products" className="hover:text-gray-300">
            Products
          </Link>
          <Link href="/cart" className="hover:text-gray-300">
            Cart
          </Link>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}