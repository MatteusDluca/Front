'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, UserPlus, Instagram } from 'lucide-react';
import DataTable, { Column, ActionConfig } from '../../../components/DataTable';
import { useNotification } from '../../../contexts/NotificationContext';
import { clientsApi } from '../../../lib/clients-api';
import { Client } from '../../../types/client';

/**
 * Página principal de listagem de clientes
 */
export default function ClientsPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  
  // Estados
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar clientes ao inicializar a página
  useEffect(() => {
    fetchClients();
  }, []);

  /**
   * Busca a lista de clientes na API
   */
  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showNotification('error', 'Erro ao carregar a lista de clientes.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gera um PDF com todos os clientes
   */
  const handleGeneratePdf = () => {
    showNotification('info', 'Funcionalidade em desenvolvimento.');
  };

  /**
   * Gera um PDF para um cliente específico
   */
  const handleGenerateClientPdf = async (client: Client) => {
    try {
      const pdfUrl = await clientsApi.generateClientPdf(client.id);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showNotification('error', 'Não foi possível gerar o PDF do cliente.');
    }
  };

  /**
   * Adiciona um novo cliente (navega para a página de cadastro)
   */
  const handleAddClient = () => {
    router.push('/clientes/novo');
  };

  /**
   * Visualiza detalhes de um cliente
   */
  const handleViewClient = (client: Client) => {
    router.push(`/clientes/${client.id}`);
  };

  /**
   * Edita um cliente
   */
  const handleEditClient = (client: Client) => {
    router.push(`/clientes/editar/${client.id}`);
  };

  /**
   * Exclui um cliente
   */
  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`Deseja realmente excluir o cliente ${client.name}?`)) {
      try {
        await clientsApi.delete(client.id);
        showNotification('success', 'Cliente excluído com sucesso!');
        // Atualiza a lista após excluir
        fetchClients();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        showNotification('error', 'Erro ao excluir cliente.');
      }
    }
  };

  /**
   * Define as colunas da tabela
   */
  const columns: Column<Client>[] = [
    {
      header: 'Cliente',
      accessor: 'name',
      cell: (client) => (
        <div className="flex items-start py-2">
          <div className="flex-shrink-0">
            {client.imageUrl ? (
              <img
                src={client.imageUrl}
                alt={client.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-light-yellow"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-light-yellow flex items-center justify-center text-white font-bold">
                {client.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-3 flex flex-col">
            <span className="font-boska text-lg text-steel-gray">{client.name}</span>
            
            {/* Email card */}
            <div className="mt-1 px-2 py-1 bg-soft-ivory rounded-md text-xs">
              {client.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Instagram',
      accessor: 'instagram',
      cell: (client) => (
        client.instagram ? (
          <div 
            className="px-3 py-2 rounded-md text-white flex items-center"
            style={{ 
              background: 'linear-gradient(45deg, #833AB4, #FD1D1D, #FCAF45)',
              width: 'fit-content'
            }}
          >
            <Instagram size={14} className="mr-2" />
            <span>{client.instagram}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      header: 'Telefone',
      accessor: 'phone',
      cell: (client) => clientsApi.formatPhone(client.phone),
    },
    {
      header: 'CPF/CNPJ',
      accessor: 'cpfCnpj',
      cell: (client) => clientsApi.formatCpfCnpj(client.cpfCnpj),
    },
    {
      header: 'Cidade/UF',
      accessor: (client) => {
        if (!client.address?.city) return 'N/A';
        return `${client.address.city.name}/${client.address.city.state.uf}`;
      },
    },
    {
      header: 'Cadastro',
      accessor: 'createdAt',
      cell: (client) => new Date(client.createdAt).toLocaleDateString('pt-BR'),
    },
  ];

  /**
   * Define as ações disponíveis para cada cliente
   */
  const actions: ActionConfig<Client> = {
    view: {
      enabled: true,
      onClick: handleViewClient,
    },
    edit: {
      enabled: true,
      onClick: handleEditClient,
    },
    delete: {
      enabled: true,
      onClick: handleDeleteClient,
    },
  };

  /**
   * Manipula a busca de clientes
   */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <UserCircle size={24} className="text-light-yellow" />
          <h1 className="text-2xl font-boska text-white">Clientes</h1>
        </div>
      </div>

      <DataTable<Client>
        data={clients}
        columns={columns}
        title="Lista de Clientes"
        actions={actions}
        onGeneratePdf={handleGeneratePdf}
        onGenerateItemPdf={handleGenerateClientPdf}
        onAdd={handleAddClient}
        addButtonLabel="Novo Cliente"
        idField="id"
        searchable={true}
        onSearch={handleSearch}
        loading={loading}
      />
    </div>
  );
}