// src/types/index.ts
// Adicione estas interfaces ao arquivo existente

// Enums para Status
export enum ProductStatus {
    AVAILABLE = 'AVAILABLE',
    RENTED = 'RENTED',
    MAINTENANCE = 'MAINTENANCE',
    DISABLED = 'DISABLED'
  }
  
  export enum CategoryStatus {
    ACTIVE = 'ACTIVE',
    DISABLED = 'DISABLED'
  }
  
  // Interface de Categoria
  export interface Category {
    id: string
    name: string
    status: CategoryStatus
    imageUrl?: string
    createdAt: string
    updatedAt: string
  }
  
  // Interface de Produto
  export interface Product {
    id: string
    name: string
    code: string
    status: ProductStatus
    size: string
    quantity: number
    description?: string
    imageUrl?: string
    rentalValue: number
    categoryId?: string
    category?: Category
    createdAt: string
    updatedAt: string
  }
  
  // DTOs para criação e atualização
  export interface CreateCategoryDto {
    name: string
    status?: CategoryStatus
    imageUrl?: string
  }
  
  export interface UpdateCategoryDto {
    name?: string
    status?: CategoryStatus
    imageUrl?: string
  }
  
  export interface CreateProductDto {
    name: string
    code: string
    status?: ProductStatus
    size: string
    quantity: number
    description?: string
    imageUrl?: string
    rentalValue: number
    categoryId?: string
  }
  
  export interface UpdateProductDto {
    name?: string
    code?: string
    status?: ProductStatus
    size?: string
    quantity?: number
    description?: string
    imageUrl?: string
    rentalValue?: number
    categoryId?: string
  }