// src/lib/api/productApi.ts
import api from '@/lib/api'
import { CreateProductDto, Product, UpdateProductDto } from '@/types'

/**
 * API de Produtos
 */
export const productApi = {
  /**
   * Busca todos os produtos
   */
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/products');
      console.log('API response data:', response.data); // Log para debug
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return []; // Retorna array vazio em caso de erro
    }
  },

  /**
   * Busca um produto pelo ID
   */
  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`)
    return response.data
  },

  /**
   * Cria um novo produto
   */
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post<Product>('/products', data)
    return response.data
  },

  /**
   * Atualiza um produto existente
   */
  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await api.patch<Product>(`/products/${id}`, data)
    return response.data
  },

  /**
   * Remove um produto
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },

  /**
   * Faz upload da imagem de um produto
   */
  uploadImage: async (id: string, imageFile: File): Promise<Product> => {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await api.post<Product>(
      `/products/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Gera um PDF com todos os produtos
   */
  generateAllProductsPdf: async (): Promise<string> => {
    const response = await api.get<{ url: string }>('/products/pdf/all')
    return response.data.url
  },

  /**
   * Gera um PDF com os detalhes de um produto específico
   */
  generateProductPdf: async (id: string): Promise<string> => {
    const response = await api.get<{ url: string }>(`/products/${id}/pdf`)
    return response.data.url
  },
}


