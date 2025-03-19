// src/lib/validations/event-category.ts
import { z } from 'zod';
import { EventCategoryStatus } from '@/types/event-category';

export const eventCategorySchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  status: z.nativeEnum(EventCategoryStatus),
});

export type EventCategoryFormData = z.infer<typeof eventCategorySchema>;