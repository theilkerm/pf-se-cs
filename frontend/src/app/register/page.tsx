'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      return setError('Passwords do not match.');
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      // The register function will redirect on success
    } catch (err: any) {
        // Zod validation errors can be handled here in the future
        setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</p>}
          
          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">First Name</label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3" id="firstName" name="firstName" type="text" required onChange={handleInputChange} />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">Last Name</label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3" id="lastName" name="lastName" type="text" required onChange={handleInputChange} />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3" id="email" name="email" type="email" required onChange={handleInputChange} />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3" id="password" name="password" type="password" required onChange={handleInputChange} />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="passwordConfirm">Confirm Password</label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3" id="passwordConfirm" name="passwordConfirm" type="password" required onChange={handleInputChange} />
          </div>
          
          <div className="flex items-center justify-between">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
              Register
            </button>
            <Link href="/login" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}