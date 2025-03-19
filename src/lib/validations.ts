import { z } from 'zod'
import { LoginCredentials } from '../types'

/**
 * Remove caracteres não numéricos de uma string
 * @param value - String com formatação
 * @returns String apenas com números
 */
const cleanMask = (value: string): string => {
  return value.replace(/\D/g, '')
}

/**
 * Schema para validação do CPF
 */
const cpfSchema = z.string().refine(
  (value) => {
    // Verifica se é um CPF válido (com ou sem formatação)
    const isCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value) || /^\d{11}$/.test(value)
    return isCPF
  },
  {
    message: 'Informe um CPF válido (formato: 123.456.789-01 ou 12345678901)',
  }
).transform((value) => {
  // Remove formatação do CPF
  return cleanMask(value)
})

/**
 * Schema para validação de email
 */
const emailSchema = z.string().email('Informe um e-mail válido')

/**
 * Schema para validação de login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: cpfSchema
})

/**
 * Tipo derivado do schema de login
 */
export type LoginFormData = LoginCredentials