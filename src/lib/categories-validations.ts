// src/app/dashboard/categorias/validations.ts
import { z } from 'zod'
import { CategoryStatus } from '@/types'

/**
 * Schema para validação de categoria
 */
export const categorySchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  status: z.nativeEnum(CategoryStatus, {
    errorMap: () => ({ message: 'Selecione um status válido' }),
  }),
})

/**
 * Tipo derivado do schema de categoria
 */
export type CategoryFormData = z.infer<typeof categorySchema>