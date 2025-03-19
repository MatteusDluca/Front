// src/app/dashboard/produtos/validations.ts
import { z } from 'zod'
import { ProductStatus } from '@/types'

/**
 * Schema para validação de produto
 */
export const productSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  code: z.string().min(2, 'O código deve ter pelo menos 2 caracteres'),
  status: z.nativeEnum(ProductStatus, {
    errorMap: () => ({ message: 'Selecione um status válido' }),
  }),
  size: z.string().min(1, 'Tamanho é obrigatório'),
  quantity: z.coerce.number().int().min(0, 'A quantidade não pode ser negativa'),
  description: z.string().optional(),
  rentalValue: z.coerce.number().positive('O valor deve ser maior que zero'),
  categoryId: z.string().optional(),
})

/**
 * Tipo derivado do schema de produto
 */
export type ProductFormData = z.infer<typeof productSchema>