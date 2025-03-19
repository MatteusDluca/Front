// src/lib/validations/event.ts
import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  date: z.string().optional(),
  time: z.string().optional(),
  eventCategoryId: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;