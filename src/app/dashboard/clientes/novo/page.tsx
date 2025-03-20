'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '../../../../contexts/NotificationContext';
import { clientsApi } from '../../../../lib/clients-api';
import { CreateClientRequest, UpdateClientRequest } from '../../../../types/client';
import ClientForm from '../../../../components/ClientForm';

/**
 * Página para criação de novo cliente
 */
export default function NewClientPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  /**
   * Handler para submissão do formulário
   */
  const handleSubmit = async (formData: CreateClientRequest, imageFile: File | null) => {
    try {
      // Criar objeto para envio, removendo formatações
      const dataToSend = {
        ...formData,
        // Remove formatação do CPF/CNPJ
        cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
        // Remove formatação do telefone
        phone: formData.phone.replace(/\D/g, ''),
        // Remove formatação do CEP
        zipCode: formData.zipCode.replace(/\D/g, '')
      };
      
      // Salvar cliente
      const savedClient = await clientsApi.create(dataToSend);
      
      // Fazer upload da imagem se houver
      if (imageFile) {
        await clientsApi.uploadImage(savedClient.id, imageFile);
      }
      
      showNotification('success', 'Cliente cadastrado com sucesso!');
      router.push('/clientes');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      
      if (error instanceof Error) {
        showNotification('error', `Erro ao cadastrar cliente: ${error.message}`);
      } else {
        showNotification('error', 'Erro ao cadastrar cliente. Verifique os dados e tente novamente.');
      }
      
      throw error; // Re-throw para o componente form tratar
    }
  };

  return (
    <ClientForm
      onSubmit={handleSubmit as (formData: CreateClientRequest | UpdateClientRequest, imageFile: File | null) => Promise<void>}
      returnUrl="/clientes"
      title="Novo Cliente"
    />
  );
}