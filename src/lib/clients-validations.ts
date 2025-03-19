import { z } from 'zod'
import { Client, CreateClientRequest, UpdateClientRequest } from '../types/client'

/**
 * Função para limpar máscaras (remove caracteres não numéricos)
 */
const cleanMask = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

/**
 * Validação de CPF
 */
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/
const validateCpf = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanedCpf = cleanMask(cpf)
  
  // Verifica se tem 11 dígitos
  if (cleanedCpf.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1+$/.test(cleanedCpf)) return false
  
  // Validação do algoritmo do CPF
  let sum = 0
  let remainder
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanedCpf.substring(i - 1, i)) * (11 - i)
  }
  
  remainder = (sum * 10) % 11
  if ((remainder === 10) || (remainder === 11)) remainder = 0
  if (remainder !== parseInt(cleanedCpf.substring(9, 10))) return false
  
  // Segundo dígito verificador
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanedCpf.substring(i - 1, i)) * (12 - i)
  }
  
  remainder = (sum * 10) % 11
  if ((remainder === 10) || (remainder === 11)) remainder = 0
  if (remainder !== parseInt(cleanedCpf.substring(10, 11))) return false
  
  return true
}

/**
 * Validação de CNPJ
 */
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/
const validateCnpj = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanedCnpj = cleanMask(cnpj)
  
  // Verifica se tem 14 dígitos
  if (cleanedCnpj.length !== 14) return false
  
  // Verifica se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1+$/.test(cleanedCnpj)) return false
  
  // Validação do algoritmo do CNPJ
  let size = cleanedCnpj.length - 2
  let numbers = cleanedCnpj.substring(0, size)
  const digits = cleanedCnpj.substring(size)
  let sum = 0
  let pos = size - 7
  
  // Primeiro dígito verificador
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11
  if (result !== parseInt(digits.charAt(0))) return false
  
  // Segundo dígito verificador
  size = size + 1
  numbers = cleanedCnpj.substring(0, size)
  sum = 0
  pos = size - 7
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

/**
 * Validação para CPF ou CNPJ
 */
const cpfCnpjSchema = z.string()
  .refine(value => {
    // Se vazio, é inválido (campo obrigatório)
    if (!value) return false
    
    const cleaned = cleanMask(value)
    
    // Verifica se é um CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (cleaned.length === 11) {
      return validateCpf(cleaned)
    } else if (cleaned.length === 14) {
      return validateCnpj(cleaned)
    }
    
    return false
  }, {
    message: 'CPF/CNPJ inválido. Formato aceito: 123.456.789-01 ou 12.345.678/0001-90',
  })
  .transform(cleanMask)

/**
 * Validação de telefone
 */
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$|^\d{10,11}$/
const phoneSchema = z.string()
  .refine(value => {
    if (!value) return false
    
    const cleaned = cleanMask(value)
    
    // Telefone fixo (10 dígitos) ou celular (11 dígitos)
    return cleaned.length === 10 || cleaned.length === 11
  }, {
    message: 'Telefone inválido. Use o formato (99) 99999-9999 ou 9999999999',
  })
  .transform(cleanMask)

/**
 * Validação de CEP
 */
const cepRegex = /^\d{5}-\d{3}$|^\d{8}$/
const cepSchema = z.string()
  .refine(value => {
    if (!value) return false
    
    const cleaned = cleanMask(value)
    return cleaned.length === 8
  }, {
    message: 'CEP inválido. Use o formato 12345-678 ou 12345678',
  })
  .transform(cleanMask)

/**
 * Validação de e-mail
 */
const emailSchema = z.string().email('E-mail inválido')

/**
 * Validação de Instagram (opcional)
 */
const instagramSchema = z.string().optional()
  .refine(value => {
    if (!value) return true
    return /^@?[a-zA-Z0-9._]+$/.test(value)
  }, {
    message: 'Nome de usuário do Instagram inválido',
  })
  .transform(value => {
    if (!value) return value
    return value.startsWith('@') ? value : `@${value}`
  })

/**
 * Validação de medidas (número opcional)
 */
const measurementSchema = z.number().positive('O valor deve ser positivo').optional()
  .or(z.string().refine(
    value => value === '' || !isNaN(Number(value)),
    {
      message: 'Digite um valor numérico válido',
    }
  ).transform(value => value === '' ? undefined : Number(value)))

/**
 * Schema para validação de clientes
 */
export const clientSchema = z.object({
  // Informações básicas
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: emailSchema,
  phone: phoneSchema,
  cpfCnpj: cpfCnpjSchema,
  instagram: instagramSchema,
  
  // Endereço
  street: z.string().min(3, 'Informe a rua'),
  number: z.string().min(1, 'Informe o número'),
  complement: z.string().optional(),
  zipCode: cepSchema,
  city: z.string().min(2, 'Informe a cidade'),
  state: z.string().min(2, 'Informe o estado'),
  
  // Medidas
  shoulder: measurementSchema,
  bust: measurementSchema,
  shoulderToWaistLength: measurementSchema,
  shoulderToCosLength: measurementSchema,
  tqcLength: measurementSchema,
  waist: measurementSchema,
  cos: measurementSchema,
  hip: measurementSchema,
  shortSkirtLength: measurementSchema,
  longSkirtLength: measurementSchema,
  shortLength: measurementSchema,
  pantsLength: measurementSchema,
  dressLength: measurementSchema,
  sleeveLength: measurementSchema,
  wrist: measurementSchema,
  frontMeasure: measurementSchema,
  shoulderToShoulderWidth: measurementSchema,
})

/**
 * Tipo derivado do schema para o formulário de cliente
 */
export type ClientFormData = CreateClientRequest

/**
 * Schema para validação de atualização de clientes (todos os campos são opcionais)
 */
export const updateClientSchema = clientSchema.partial()

/**
 * Tipo derivado do schema para o formulário de atualização de cliente
 */
export type UpdateClientFormData = UpdateClientRequest