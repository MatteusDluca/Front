'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Edit, UserX, Phone, Mail, MapPin, Instagram, Ruler } from 'lucide-react';
import { useNotification } from '../../../../contexts/NotificationContext';
import { clientsApi } from '../../../../lib/clients-api';
import { Client } from '../../../../types/client';

/**
 * Página de detalhes do cliente
 */
export default function ClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const data = await clientsApi.getById(clientId);
        setClient(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar cliente:', err);
        setError('Não foi possível carregar os detalhes do cliente.');
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
   * Gera PDF do cliente
   */
  const handleGeneratePdf = async () => {
    if (!client) return;
    
    try {
      const pdfUrl = await clientsApi.generateClientPdf(client.id);
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('Erro ao gerar PDF do cliente:', err);
      showNotification('error', 'Não foi possível gerar o PDF do cliente.');
    }
  };

  /**
   * Exclui o cliente
   */
  const handleDeleteClient = async () => {
    if (!client) return;
    
    if (window.confirm(`Deseja realmente excluir o cliente ${client.name}?`)) {
      try {
        await clientsApi.delete(client.id);
        showNotification('success', 'Cliente excluído com sucesso!');
        router.push('/clientes');
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        showNotification('error', 'Não foi possível excluir o cliente.');
      }
    }
  };

  /**
   * Renderiza um campo de medida
   */
  const renderMeasurementField = (label: string, value?: number) => {
    if (value === undefined || value === null) return null;
    
    return (
      <div className="flex justify-between text-sm py-2 border-b border-gray-100">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value} cm</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-light-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-100">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        <p>{error}</p>
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

  if (!client) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        <p>Cliente não encontrado.</p>
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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/clientes')}
            className="p-2 bg-soft-ivory text-steel-gray rounded-md hover:bg-opacity-90"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-boska text-white">Detalhes do Cliente</h1>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleGeneratePdf}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FileText size={18} className="mr-2" />
            Exportar PDF
          </button>
          
          <button
            onClick={() => router.push(`/clientes/editar/${client.id}`)}
            className="flex items-center px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
          >
            <Edit size={18} className="mr-2" />
            Editar
          </button>
          
          <button
            onClick={handleDeleteClient}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <UserX size={18} className="mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Informações principais e foto */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header with client photo/avatar */}
            <div className="bg-light-yellow bg-opacity-10 p-6 flex flex-col items-center">
              {client.imageUrl ? (
                <div className="w-24 h-24 rounded-full bg-white shadow-md overflow-hidden mb-4">
                  <img 
                    src={client.imageUrl} 
                    alt={`Foto de ${client.name}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-light-yellow flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              )}
              
              <h2 className="text-xl font-boska text-steel-gray text-center">{client.name}</h2>
              <p className="text-gray-500 text-sm">{client.email}</p>
            </div>
            
            {/* Contact information */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-clash text-steel-gray mb-4">Contato</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone size={18} className="text-gray-400 mr-3" />
                  <span>{clientsApi.formatPhone(client.phone)}</span>
                </div>
                
                <div className="flex items-center">
                  <Mail size={18} className="text-gray-400 mr-3" />
                  <span>{client.email}</span>
                </div>
                
                {client.instagram && (
                  <div className="flex items-center">
                    <Instagram size={18} className="text-gray-400 mr-3" />
                    <span>{client.instagram}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Client identification information */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-clash text-steel-gray mb-4">Identificação</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">CPF/CNPJ:</span>
                  <span className="font-medium">{clientsApi.formatCpfCnpj(client.cpfCnpj)}</span>
                </div>
              </div>
            </div>
            
            {/* System information */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h3 className="text-sm font-clash text-gray-500 mb-2">Informações do Sistema</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cadastrado em:</span>
                  <span className="text-gray-700">{new Date(client.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Última atualização:</span>
                  <span className="text-gray-700">{new Date(client.updatedAt).toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ID:</span>
                  <span className="text-gray-700 text-xs truncate max-w-[150px]" title={client.id}>
                    {client.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Coluna 2-3: Detalhes, endereço e medidas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Endereço */}
            {client.address && (
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <MapPin size={20} className="text-light-yellow mr-2" />
                  <h3 className="text-lg font-clash text-steel-gray">Endereço</h3>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Rua</p>
                      <p className="font-medium">{client.address.street.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Número</p>
                      <p className="font-medium">{client.address.number}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Complemento</p>
                      <p className="font-medium">{client.address.complement || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">CEP</p>
                      <p className="font-medium">{client.address.zipCode}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Cidade</p>
                      <p className="font-medium">{client.address.city.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <p className="font-medium">{client.address.city.state.name} ({client.address.city.state.uf})</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Medidas */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Ruler size={20} className="text-light-yellow mr-2" />
                <h3 className="text-lg font-clash text-steel-gray">Medidas</h3>
              </div>
              
              {client.measurements ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div>
                      {renderMeasurementField("Ombro", client.measurements.shoulder)}
                      {renderMeasurementField("Busto", client.measurements.bust)}
                      {renderMeasurementField("Ombro até cintura", client.measurements.shoulderToWaistLength)}
                      {renderMeasurementField("Ombro até cos", client.measurements.shoulderToCosLength)}
                      {renderMeasurementField("Comprimento T.Q.C.", client.measurements.tqcLength)}
                      {renderMeasurementField("Cintura", client.measurements.waist)}
                      {renderMeasurementField("Cos", client.measurements.cos)}
                      {renderMeasurementField("Quadril", client.measurements.hip)}
                      {renderMeasurementField("Saia curta", client.measurements.shortSkirtLength)}
                    </div>
                    
                    <div>
                      {renderMeasurementField("Saia longa", client.measurements.longSkirtLength)}
                      {renderMeasurementField("Short", client.measurements.shortLength)}
                      {renderMeasurementField("Calça", client.measurements.pantsLength)}
                      {renderMeasurementField("Vestido", client.measurements.dressLength)}
                      {renderMeasurementField("Manga", client.measurements.sleeveLength)}
                      {renderMeasurementField("Punho", client.measurements.wrist)}
                      {renderMeasurementField("Frente", client.measurements.frontMeasure)}
                      {renderMeasurementField("Ombro a ombro", client.measurements.shoulderToShoulderWidth)}
                    </div>
                  </div>
                  
                  {/* Se não houver medidas cadastradas */}
                  {Object.values(client.measurements).filter(v => 
                    v !== null && v !== undefined && typeof v === 'number').length === 0 && (
                    <p className="text-center text-gray-500 py-4">Nenhuma medida cadastrada</p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-center text-gray-500">Nenhuma medida cadastrada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}