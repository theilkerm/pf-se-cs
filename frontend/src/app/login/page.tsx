"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { fetcher } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});
type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginForm) => {
    await login(data); // just pass the form data
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("email")}
            placeholder="Email"
            className="w-full border p-2 rounded"
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Password"
            className="w-full border p-2 rounded"
          />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button
          disabled={isSubmitting}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-4 text-sm flex items-center justify-between">
        <Link href="/register" className="underline">
          Create account
        </Link>
        <Link href="/forgot-password" className="underline">
          Forgot password?
        </Link>
      </div>
    </main>
  );
}
