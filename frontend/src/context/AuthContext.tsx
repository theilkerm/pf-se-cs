'use client';

import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { fetcher } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { IProduct } from '@/types';

interface Address {
    _id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  addresses: Address[];
}

interface LoginPayload { email: string; password: string; }
interface RegisterPayload { firstName: string; lastName: string; email: string; password: string; }

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateUser: (newUser: User) => void;
  loading: boolean;
  wishlist: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchWishlist = useCallback(async (authToken: string) => {
    try {
      const data = await fetcher('/wishlist', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // The wishlist from backend contains full product objects, we only need the IDs
      setWishlist(data.data.wishlist.map((item: IProduct) => item._id));
    } catch (error) {
      console.error("Failed to fetch wishlist on load", error);
      setWishlist([]); // Ensure wishlist is empty on error
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      fetchWishlist(storedToken); // Fetch wishlist on initial app load
    }
    setLoading(false);
  }, [fetchWishlist]);
  
  const handleAuthSuccess = (apiToken: string, apiUser: User) => {
    setToken(apiToken);
    setUser(apiUser);
    localStorage.setItem('token', apiToken);
    localStorage.setItem('user', JSON.stringify(apiUser));
    fetchWishlist(apiToken); // Fetch wishlist after a successful login/registration
    router.push('/');
  };

  const login = async (loginData: LoginPayload) => {
    try {
      const data = await fetcher('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });
      handleAuthSuccess(data.token, data.data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (registerData: RegisterPayload) => {
    try {
      const data = await fetcher('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });
      handleAuthSuccess(data.token, data.data.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setWishlist([]); // Clear wishlist on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };
  
  const addToWishlist = async (productId: string) => {
    if (!token) return;
    try {
        await fetcher('/wishlist', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ productId })
        });
        setWishlist(prev => [...prev, productId]);
    } catch (error) {
        console.error("Failed to add to wishlist:", error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!token) return;
    try {
        await fetcher(`/wishlist/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setWishlist(prev => prev.filter(id => id !== productId));
    } catch (error) {
        console.error("Failed to remove from wishlist:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, loading, wishlist, addToWishlist, removeFromWishlist }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};