'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useNotification } from '../../../../../contexts/NotificationContext';
import { clientsApi } from '../../../../../lib/clients-api';
import { Client, UpdateClientRequest } from '../../../../../types/client';
import ClientForm from '../../../../../components/ClientForm';

/**
 * Página para edição de um cliente existente
 */
export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const { showNotification } = useNotification();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega os dados do cliente ao montar o componente
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const data = await clientsApi.getById(clientId);
        setClient(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar cliente:', err);
        setError('Não foi possível carregar os dados do cliente.');
        showNotification('error', 'Erro ao carregar dados do cliente.');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClient();
    }
  }, [clientId, showNotification]);

  /**
   * Handler para submissão do formulário de edição
   */
  const handleSubmit = async (formData: UpdateClientRequest, imageFile: File | null) => {
    try {
      // Preparar dados para envio, removendo formatações
      const dataToSend = {
        ...formData,
        // Remove formatação do CPF/CNPJ se existir
        cpfCnpj: formData.cpfCnpj ? formData.cpfCnpj.replace(/\D/g, '') : undefined,
        // Remove formatação do telefone se existir
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : undefined,
        // Remove formatação do CEP se existir
        zipCode: formData.zipCode ? formData.zipCode.replace(/\D/g, '') : undefined
      };
      
      // Atualiza os dados do cliente
      await clientsApi.update(clientId, dataToSend);
      
      // Se tivermos um novo arquivo de imagem, fazer upload
      if (imageFile) {
        await clientsApi.uploadImage(clientId, imageFile);
      }
      
      showNotification('success', 'Cliente atualizado com sucesso!');
      router.push(`/clientes/${clientId}`);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      
      if (error instanceof Error) {
        showNotification('error', `Erro ao atualizar cliente: ${error.message}`);
      } else {
        showNotification('error', 'Erro ao atualizar cliente. Verifique os dados e tente novamente.');
      }
      
      throw error; // Re-throw para o componente form tratar
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-light-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        <p>Cliente não encontrado ou erro ao carregar dados.</p>
        <div className="mt-4">
          <button
            onClick={() => router.push('/clientes')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <ClientForm
      initialData={client}
      onSubmit={handleSubmit}
      isEditing={true}
      returnUrl={`/clientes/${clientId}`}
      title="Editar Cliente"
      subtitle={`Editando: ${client.name}`}
    />
  );
}