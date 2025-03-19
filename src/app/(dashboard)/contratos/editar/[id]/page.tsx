'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useNotification } from '@/contexts/NotificationContext';
import { Contract, UpdateContractRequest } from '@/types';
import { contractApi } from '@/services/contract-api';
import ContractForm from '@/components/ContractForm';

/**
 * Página para edição de um contrato existente
 */
export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  
  const { showNotification } = useNotification();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega os dados do contrato ao montar o componente
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const data = await contractApi.getById(contractId);
        setContract(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar contrato:', err);
        setError('Não foi possível carregar os dados do contrato.');
        showNotification('error', 'Erro ao carregar dados do contrato.');
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContract();
    }
  }, [contractId, showNotification]);

  /**
   * Handler para submissão do formulário de edição
   */
  const handleSubmit = async (formData: UpdateContractRequest) => {
    try {
      await contractApi.update(contractId, formData);
      showNotification('success', 'Contrato atualizado com sucesso!');
      router.push(`/contratos/${contractId}`);
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      
      if (error instanceof Error) {
        showNotification('error', `Erro ao atualizar contrato: ${error.message}`);
      } else {
        showNotification('error', 'Erro ao atualizar contrato. Verifique os dados e tente novamente.');
      }
      
      throw error; // Re-throw para o componente form tratar
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-light-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">Carregando dados do contrato...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        <p>Contrato não encontrado ou erro ao carregar dados.</p>
        <div className="mt-4">
          <button
            onClick={() => router.push('/contratos')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <ContractForm
      initialData={contract}
      onSubmit={handleSubmit}
      isEditing={true}
      returnUrl={`/contratos/${contractId}`}
      title="Editar Contrato"
      subtitle={`Editando contrato do cliente: ${contract.client.name}`}
    />
  );
}