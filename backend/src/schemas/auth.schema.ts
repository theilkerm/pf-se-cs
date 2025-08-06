import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string({ required_error: 'First name is required' }),
    lastName: z.string({ required_error: 'Last name is required' }),
    email: z.string({ required_error: 'Email is required' }).email('Not a valid email'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters long'),
  }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email('Not a valid email'),
        password: z.string({ required_error: 'Password is required' }),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email('Not a valid email'),
    }),
});

export const resetPasswordSchema = z.object({
    params: z.object({
        token: z.string({ required_error: 'Token is required' }),
    }),
    body: z.object({
        password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters long'),
    })
});