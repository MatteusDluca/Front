'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/contexts/NotificationContext';
import { contractApi } from '@/services/contract-api';
import ContractForm from '@/components/ContractForm';
import { CreateContractRequest, UpdateContractRequest } from '@/types';

/**
 * Página para criação de novo contrato
 */
export default function NewContractPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  /**
   * Handler para submissão do formulário
   */
  const handleSubmit = async (formData: CreateContractRequest | UpdateContractRequest) => {
    if ('clientId' in formData && formData.clientId === undefined) {
      throw new Error('clientId is required for CreateContractRequest');
    }
    try {
      if ('clientId' in formData) {
        await contractApi.create(formData as CreateContractRequest);
      } else {
        throw new Error('Invalid formData: Expected CreateContractRequest');
      }
      showNotification('success', 'Contrato criado com sucesso!');
      router.push('/contratos');
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      
      if (error instanceof Error) {
        showNotification('error', `Erro ao criar contrato: ${error.message}`);
      } else {
        showNotification('error', 'Erro ao criar contrato. Verifique os dados e tente novamente.');
      }
      
      throw error; // Re-throw para o componente form tratar
    }
  };

  return (
    <ContractForm
      onSubmit={handleSubmit}
      returnUrl="/contratos"
      title="Novo Contrato"
      subtitle="Preencha as informações para criar um novo contrato"
    />
  );
}