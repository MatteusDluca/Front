import api from '../lib/api'
import {
  Employee,
  EmployeeResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeFilters
} from '../types/employee'

/**
 * Serviço para gerenciamento de funcionários
 */
export const employeeService = {
  /**
   * Busca todos os funcionários
   * @param filters - Filtros opcionais
   * @returns Lista de funcionários
   */
  getAll: async (filters?: EmployeeFilters): Promise<EmployeeResponse[]> => {
    const params = new URLSearchParams()
    
    if (filters?.search) {
      params.append('search', filters.search)
    }
    
    if (filters?.page) {
      params.append('page', filters.page.toString())
    }
    
    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }
    
    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await api.get<EmployeeResponse[]>(`/employees${query}`)
    return response.data
  },
  
  /**
   * Busca um funcionário pelo ID
   * @param id - ID do funcionário
   * @returns Dados do funcionário
   */
  getById: async (id: string): Promise<EmployeeResponse> => {
    const response = await api.get<EmployeeResponse>(`/employees/${id}`)
    return response.data
  },
  
  /**
   * Cria um novo funcionário
   * @param data - Dados do funcionário
   * @returns Funcionário criado
   */
  create: async (data: CreateEmployeeRequest): Promise<EmployeeResponse> => {
    const response = await api.post<EmployeeResponse>('/employees', data)
    return response.data
  },
  
  /**
   * Atualiza um funcionário
   * @param id - ID do funcionário
   * @param data - Dados a serem atualizados
   * @returns Funcionário atualizado
   */
  update: async (id: string, data: UpdateEmployeeRequest): Promise<EmployeeResponse> => {
    const response = await api.patch<EmployeeResponse>(`/employees/${id}`, data)
    return response.data
  },
  
  /**
   * Remove um funcionário
   * @param id - ID do funcionário
   */
  remove: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`)
  },
  
  /**
   * Faz upload da imagem de perfil do funcionário
   * @param id - ID do funcionário
   * @param imageFile - Arquivo de imagem
   * @returns URL da imagem
   */
  uploadImage: async (id: string, imageFile: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const response = await api.post<{ imageUrl: string }>(
      `/employees/${id}/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    
    return response.data.imageUrl
  },
  
  /**
   * Gera PDF com todos os funcionários
   * @returns URL do PDF gerado
   */
  generatePdf: async (): Promise<string> => {
    const response = await api.get('/employees/pdf', { responseType: 'blob' })
    return URL.createObjectURL(response.data)
  },
  
  /**
   * Gera PDF de um funcionário específico
   * @param id - ID do funcionário
   * @returns URL do PDF gerado
   */
  generateEmployeePdf: async (id: string): Promise<string> => {
    const response = await api.get(`/employees/${id}/pdf`, { responseType: 'blob' })
    return URL.createObjectURL(response.data)
  }
}