// src/lib/api/categoryApi.ts
import api from '@/lib/api'
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types'

/**
 * API de Categorias
 */
export const categoryApi = {
  /**
   * Busca todas as categorias
   */
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories')
    return response.data
  },

  /**
   * Busca uma categoria pelo ID
   */
  getById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`)
    return response.data
  },

  /**
   * Cria uma nova categoria
   */
  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post<Category>('/categories', data)
    return response.data
  },

  /**
   * Atualiza uma categoria existente
   */
  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await api.patch<Category>(`/categories/${id}`, data)
    return response.data
  },

  /**
   * Remove uma categoria
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },

  /**
   * Faz upload da imagem de uma categoria
   */
  uploadImage: async (id: string, imageFile: File): Promise<Category> => {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await api.post<Category>(
      `/categories/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },
}