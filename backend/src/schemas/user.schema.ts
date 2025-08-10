import { z } from 'zod';

export const addressSchema = z.object({
  body: z.object({
    street: z.string({ required_error: 'Street is required' }).min(3),
    city: z.string({ required_error: 'City is required' }).min(2),
    state: z.string({ required_error: 'State is required' }).min(2),
    zipCode: z.string({ required_error: 'Zip code is required' }).min(3),
    country: z.string({ required_error: 'Country is required' }).min(2),
  }),
});