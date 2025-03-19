// src/lib/validations/location.ts
import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  zipCode: z.string()
    .optional()
    .refine(
      (val) => !val || /^\d{5}-\d{3}$/.test(val),
      { message: 'CEP inválido. Use o formato 12345-678' }
    ),
  city: z.string().optional(),
  state: z.string().optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;