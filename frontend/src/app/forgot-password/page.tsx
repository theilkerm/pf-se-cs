'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { fetcher } from '@/lib/api';

const ForgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
});
type ForgotForm = z.infer<typeof ForgotSchema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ForgotForm>({ resolver: zodResolver(ForgotSchema) });

  const onSubmit = async (data: ForgotForm) => {
    await fetcher('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    alert('If an account exists for that email, a reset link has been sent.');
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Reset your password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email')} placeholder="Email" className="w-full border p-2 rounded" />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        <button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded">
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <div className="mt-4 text-sm">
        <Link href="/login" className="underline">Back to sign in</Link>
      </div>
    </main>
  );
}
