'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { fetcher } from '@/lib/api';

const ResetSchema = z.object({
  password: z.string().min(6, 'Minimum 6 characters'),
  passwordConfirm: z.string().min(6, 'Minimum 6 characters'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});
type ResetForm = z.infer<typeof ResetSchema>;

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ResetForm>({ resolver: zodResolver(ResetSchema) });

  const onSubmit = async (data: ResetForm) => {
    await fetcher(`/auth/reset-password/${token}`, {
      method: 'PATCH',
      body: JSON.stringify({ password: data.password, passwordConfirm: data.passwordConfirm }),
    });
    alert('Your password has been updated. You can sign in now.');
    router.push('/login');
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Set a new password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="password" {...register('password')} placeholder="New password" className="w-full border p-2 rounded" />
        {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        <input type="password" {...register('passwordConfirm')} placeholder="Confirm new password" className="w-full border p-2 rounded" />
        {errors.passwordConfirm && <p className="text-red-600 text-sm">{errors.passwordConfirm.message}</p>}
        <button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded">
          {isSubmitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
      <div className="mt-4 text-sm">
        <Link href="/login" className="underline">Back to sign in</Link>
      </div>
    </main>
  );
}
