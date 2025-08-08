'use client';

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { fetcher } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>; // Added register function
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    router.push('/');
  };
  
  const login = async (loginData: any) => {
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

  const register = async (registerData: any) => {
    try {
      const data = await fetcher('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });
      // After successful registration, log the user in automatically
      handleAuthSuccess(data.token, data.data.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
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