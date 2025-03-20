'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Filter } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';
import { useNotification } from '@/contexts/NotificationContext';
import { Contract, ContractStatus } from '@/types';
import { contractApi } from '@/services/contract-api';

/**
 * Página de listagem de contratos
 */
export default function ContractsPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  
  // Estados
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: [] as ContractStatus[],
    startDate: '',
    endDate: '',
  });

  // Carregar contratos ao inicializar a página
  useEffect(() => {
    fetchContracts();
  }, []);

  /**
   * Busca a lista de contratos na API
   */
  const fetchContracts = async () => {
    try {
      setLoading(true);
      
      // Aplicar filtros na busca
      const filterParams = {
        search: searchTerm,
        status: filters.status.length > 0 ? filters.status : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };
      
      const data = await contractApi.getAll(filterParams);
      setContracts(data);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      showNotification('error', 'Erro ao carregar a lista de contratos.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handler para resetar filtros
   */
  const handleResetFilters = () => {
    setFilters({
      status: [],
      startDate: '',
      endDate: '',
    });
    setSearchTerm('');
    fetchContracts();
  };

  /**
   * Handler para aplicar filtros
   */
  const handleApplyFilters = () => {
    fetchContracts();
    setFilterOpen(false);
  };
  /**
 * Gera um PDF com todos os contratos
 */
const handleGeneratePdf = async () => {
    try {
      const pdfUrl = await contractApi.generateAllContractsPdf();
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showNotification('error', 'Não foi possível gerar o PDF dos contratos.');
    }
  };
  
  /**
   * Gera um PDF para um contrato específico
   */
  const handleGenerateContractPdf = async (contract: Contract) => {
    try {
      const pdfUrl = await contractApi.generateContractPdf(contract.id);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Erro ao gerar PDF do contrato:', error);
      showNotification('error', 'Não foi possível gerar o PDF do contrato.');
    }
  };

  /**
   * Adiciona um novo contrato (navega para a página de cadastro)
   */
  const handleAddContract = () => {
    router.push('/contratos/novo');
  };

  /**
   * Visualiza detalhes de um contrato
   */
  const handleViewContract = (contract: Contract) => {
    router.push(`/contratos/${contract.id}`);
  };

  /**
   * Edita um contrato
   */
  const handleEditContract = (contract: Contract) => {
    router.push(`/contratos/editar/${contract.id}`);
  };

  /**
   * Exclui um contrato
   */
  const handleDeleteContract = async (contract: Contract) => {
    if (window.confirm(`Deseja realmente excluir o contrato do cliente ${contract.client.name}?`)) {
      try {
        await contractApi.delete(contract.id);
        showNotification('success', 'Contrato excluído com sucesso!');
        fetchContracts(); // Atualizar a lista
      } catch (error) {
        console.error('Erro ao excluir contrato:', error);
        showNotification('error', 'Erro ao excluir contrato.');
      }
    }
  };

  /**
   * Manipula a busca de contratos
   */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // A pesquisa é aplicada quando o usuário clica em aplicar filtros
  };

  /**
   * Define as colunas da tabela
   */
  const columns: Column<Contract>[] = [
    {
      header: 'Cliente',
      accessor: (contract) => (
        <div className="flex items-center">
          {contract.client.imageUrl ? (
            <img
              src={contract.client.imageUrl}
              alt={contract.client.name}
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-light-yellow flex items-center justify-center text-white mr-2">
              {contract.client.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span>{contract.client.name}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (contract) => {
        // Define cores diferentes para cada status
        const statusStyles = {
          ACTIVE: 'bg-green-100 text-green-800',
          CANCELED: 'bg-red-100 text-red-800',
          IN_PROGRESS: 'bg-blue-100 text-blue-800',
          COMPLETED: 'bg-purple-100 text-purple-800',
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[contract.status] || 'bg-gray-100'}`}>
            {contractApi.translateStatus(contract.status)}
          </span>
        );
      }
    },
    {
      header: 'Evento',
      accessor: (contract) => contract.event?.name || 'N/A',
    },
    {
      header: 'Valor Total',
      accessor: (contract) => {
        // Calcula o valor total a partir dos pagamentos
        const total = contractApi.calculateTotal(contract);
        return `R$ ${total.toFixed(2)}`;
      }
    },
    {
      header: 'Data Retirada',
      accessor: (contract) => new Date(contract.pickupDate).toLocaleDateString('pt-BR'),
    },
    {
      header: 'Data Devolução',
      accessor: (contract) => new Date(contract.returnDate).toLocaleDateString('pt-BR'),
    },
    {
      header: 'Cadastro',
      accessor: (contract) => new Date(contract.createdAt).toLocaleDateString('pt-BR'),
    },
  ];

  // Renderiza os filtros
  const renderFilters = () => {
    if (!filterOpen) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h3 className="text-lg font-clash mb-4 text-steel-gray">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Status</label>
            <div className="space-y-2">
              {Object.values(ContractStatus).map((status) => (
                <div key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`status-${status}`}
                    checked={filters.status.includes(status)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters({ ...filters, status: [...filters.status, status] });
                      } else {
                        setFilters({
                          ...filters,
                          status: filters.status.filter((s) => s !== status),
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`status-${status}`} className="text-sm">
                    {contractApi.translateStatus(status)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-2">Data Inicial</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-2">Data Final</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Limpar
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90"
          >
            Aplicar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FileText size={24} className="text-light-yellow" />
          <h1 className="text-2xl font-boska text-white">Contratos</h1>
        </div>
        
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center px-3 py-2 bg-soft-ivory text-steel-gray rounded-md hover:bg-opacity-90"
        >
          <Filter size={18} className="mr-2" />
          {filterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>
      </div>
      
      {renderFilters()}
      
      <DataTable<Contract>
        data={contracts}
        columns={columns}
        title="Lista de Contratos"
        actions={{
          view: {
            enabled: true,
            onClick: handleViewContract,
          },
          edit: {
            enabled: true,
            onClick: handleEditContract,
          },
          delete: {
            enabled: true,
            onClick: handleDeleteContract,
          },
        }}
        onGeneratePdf={handleGeneratePdf}
        onGenerateItemPdf={handleGenerateContractPdf}
        onAdd={handleAddContract}
        addButtonLabel="Novo Contrato"
        idField="id"
        searchable={true}
        onSearch={handleSearch}
        loading={loading}
      />
    </div>
  );
}