// src/services/contract-api.ts
import api from '../lib/api';
import { Contract, ContractFilters, CreateContractRequest, UpdateContractRequest } from '@/types';

export const contractApi = {
  /**
   * Busca todos os contratos
   * @param filters - Filtros opcionais para a busca
   * @returns Lista de contratos
   */
  async getAll(filters?: ContractFilters): Promise<Contract[]> {
    try {
      // Construir query params a partir dos filtros
      let queryParams = '';
      if (filters) {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.clientId) params.append('clientId', filters.clientId);
        if (filters.eventId) params.append('eventId', filters.eventId);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        if (filters.status && filters.status.length > 0) {
          filters.status.forEach(status => params.append('status', status));
        }
        
        queryParams = params.toString();
      }
      
      const url = `/contracts${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get<Contract[]>(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw error;
    }
  },

  /**
   * Busca um contrato pelo ID
   * @param id - ID do contrato
   * @returns Contrato
   */
  async getById(id: string): Promise<Contract> {
    try {
      const response = await api.get<Contract>(`/contracts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar contrato ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cria um novo contrato
   * @param data - Dados do contrato
   * @returns Contrato criado
   */
  async create(data: CreateContractRequest): Promise<Contract> {
    try {
      const response = await api.post<Contract>('/contracts', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      throw error;
    }
  },

  /**
   * Atualiza um contrato existente
   * @param id - ID do contrato
   * @param data - Dados para atualização
   * @returns Contrato atualizado
   */
  async update(id: string, data: UpdateContractRequest): Promise<Contract> {
    try {
      const response = await api.put<Contract>(`/contracts/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar contrato ${id}:`, error);
      throw error;
    }
  },

  /**
   * Remove um contrato
   * @param id - ID do contrato
   * @returns Mensagem de sucesso
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/contracts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir contrato ${id}:`, error);
      throw error;
    }
  },

  /**
   * Gera PDF de todos os contratos
   * @returns URL do PDF gerado
   */
  async generateAllContractsPdf(): Promise<string> {
    try {
      const response = await api.get<string>('/contracts/pdf');
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar PDF de contratos:', error);
      throw error;
    }
  },

  /**
   * Gera PDF de um contrato específico
   * @param id - ID do contrato
   * @returns URL do PDF gerado
   */
  async generateContractPdf(id: string): Promise<string> {
    try {
      const response = await api.get<string>(`/contracts/${id}/pdf`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao gerar PDF do contrato ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Traduz o status do contrato para português
   * @param status - Status do contrato
   * @returns Status traduzido
   */
  translateStatus(status: string): string {
    const statusMap = {
      ACTIVE: 'Ativo',
      CANCELED: 'Cancelado',
      IN_PROGRESS: 'Em Andamento',
      COMPLETED: 'Concluído'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  },
  
  /**
   * Traduz o método de pagamento para português
   * @param method - Método de pagamento
   * @returns Método traduzido
   */
  translatePaymentMethod(method: string): string {
    const methodMap = {
      PIX: 'PIX',
      CREDIT_CARD: 'Cartão de Crédito',
      DEBIT_CARD: 'Cartão de Débito',
      CASH: 'Dinheiro'
    };
    return methodMap[method as keyof typeof methodMap] || method;
  },
  
  /**
   * Calcula o valor total do contrato
   * @param contract - Contrato
   * @returns Valor total
   */
  calculateTotal(contract: Contract): number {
    return contract.payments.reduce((total, payment) => total + payment.finalValue, 0);
  }
};

// Exporta a API
export default contractApi;