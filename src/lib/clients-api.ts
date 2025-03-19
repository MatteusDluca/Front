// lib/clients-api.ts
import axios from 'axios';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types/client';

// Base URL da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Cliente HTTP configurado com axios
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir token de autenticação
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * API para gerenciamento de clientes
 */
export const clientsApi = {
  /**
   * Busca todos os clientes
   * @returns Lista de clientes
   */
  async getAll(): Promise<Client[]> {
    try {
      const response = await apiClient.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  },

  /**
   * Busca um cliente pelo ID
   * @param id ID do cliente
   * @returns Dados do cliente
   */
  async getById(id: string): Promise<Client> {
    try {
      const response = await apiClient.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cria um novo cliente
   * @param data Dados do cliente
   * @returns Cliente criado
   */
  async create(data: CreateClientRequest): Promise<Client> {
    try {
      // Limpa valores undefined (para evitar erros de validação)
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      
      const response = await apiClient.post('/clients', cleanedData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  /**
   * Atualiza um cliente existente
   * @param id ID do cliente
   * @param data Dados a serem atualizados
   * @returns Cliente atualizado
   */
  async update(id: string, data: UpdateClientRequest): Promise<Client> {
    try {
      // Limpa valores undefined (para evitar erros de validação)
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      
      const response = await apiClient.patch(`/clients/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Exclui um cliente
   * @param id ID do cliente
   * @returns Mensagem de sucesso
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir cliente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Faz upload de uma imagem para o cliente
   * @param id ID do cliente
   * @param file Arquivo de imagem
   * @returns Cliente atualizado com URL da imagem
   */
  async uploadImage(id: string, file: File): Promise<Client> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post(`/clients/${id}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Erro ao fazer upload de imagem para cliente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Gera um PDF com dados do cliente
   * @param id ID do cliente
   * @returns URL permanente do PDF gerado
   */
  async generateClientPdf(id: string): Promise<string> {
    try {
      const response = await apiClient.get<{ url: string }>(`/clients/${id}/pdf`);
      return response.data.url;
    } catch (error) {
      console.error(`Erro ao gerar PDF para cliente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Formata um número de telefone para exibição
   * @param phone Número de telefone
   * @returns Telefone formatado
   */
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    
    return phone;
  },

  /**
   * Formata um CPF/CNPJ para exibição
   * @param cpfCnpj CPF ou CNPJ
   * @returns CPF/CNPJ formatado
   */
  formatCpfCnpj(cpfCnpj: string): string {
    const cleaned = cpfCnpj.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    
    if (cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
    }
    
    return cpfCnpj;
  },

  /**
   * Formata uma medida para exibição
   * @param value Valor da medida
   * @returns Medida formatada em centímetros
   */
  formatMeasurement(value?: number): string {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    return `${value} cm`;
  }
};