'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { fetcher } from '@/lib/api';

const RegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
});
type RegisterForm = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterForm>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      await fetcher('/auth/register', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      });
      setRegisteredEmail(data.email);
      setIsRegistered(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    }
  };

  if (isRegistered) {
    return (
      <main className="max-w-lg mx-auto p-6 text-center mt-20">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Registration Successful!</h1>
        <p className="text-gray-700">
          A verification link has been sent to <strong>{registeredEmail}</strong>.
        </p>
        <p className="text-gray-600 mt-2">
          Please check your inbox and click the link to activate your account.
        </p>
        <Link href="/login" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Back to Login
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6 mt-10">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('firstName')} placeholder="First name" className="w-full border p-2 rounded" />
        {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName.message}</p>}
        <input {...register('lastName')} placeholder="Last name" className="w-full border p-2 rounded" />
        {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName.message}</p>}
        <input {...register('email')} placeholder="Email" className="w-full border p-2 rounded" />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        <input type="password" {...register('password')} placeholder="Password" className="w-full border p-2 rounded" />
        {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        <button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded">
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <div className="mt-4 text-sm">
        <Link href="/login" className="underline">Already have an account? Sign in</Link>
      </div>
    </main>
  );
}