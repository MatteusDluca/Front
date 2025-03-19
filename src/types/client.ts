import { Address } from './employee'

/**
 * Interface que representa as medidas dos clientes
 */
export interface Measurements {
  id: string
  shoulder?: number // Ombro
  bust?: number // Busto
  shoulderToWaistLength?: number // Comprimento do corpo do ombro até a cintura
  shoulderToCosLength?: number // Comprimento do corpo do ombro até cos
  tqcLength?: number // Comprimento do corpo t.q.c.
  waist?: number // Cintura
  cos?: number // Cos
  hip?: number // Quadril
  shortSkirtLength?: number // Comprimento da saia curta
  longSkirtLength?: number // Comprimento da saia longa
  shortLength?: number // Comprimento do short
  pantsLength?: number // Comprimento da calça
  dressLength?: number // Comprimento do vestido
  sleeveLength?: number // Comprimento da manga
  wrist?: number // Punho
  frontMeasure?: number // Medida frente
  shoulderToShoulderWidth?: number // Medida Ombro a ombro
  createdAt: string
  updatedAt: string
}

/**
 * Interface que representa um cliente no sistema
 */
export interface Client {
  id: string
  name: string
  email: string
  phone: string
  cpfCnpj: string
  instagram?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  address?: Address
  measurements?: Measurements
}

/**
 * Interface para criação de um novo cliente
 */
export interface CreateClientRequest {
  name: string
  email: string
  phone: string
  cpfCnpj: string
  instagram?: string
  imageUrl?: string
  // Endereço
  street: string
  number: string
  complement?: string
  zipCode: string
  city: string
  state: string
  // Medidas
  shoulder?: number
  bust?: number
  shoulderToWaistLength?: number
  shoulderToCosLength?: number
  tqcLength?: number
  waist?: number
  cos?: number
  hip?: number
  shortSkirtLength?: number
  longSkirtLength?: number
  shortLength?: number
  pantsLength?: number
  dressLength?: number
  sleeveLength?: number
  wrist?: number
  frontMeasure?: number
  shoulderToShoulderWidth?: number
}

/**
 * Interface para atualização de um cliente existente
 */
export interface UpdateClientRequest extends Partial<CreateClientRequest> {}