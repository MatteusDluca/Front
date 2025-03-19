// src/app/(dashboard)/eventos-locais/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import FormCard from '@/components/FormCard';
import { eventApi, locationApi, eventCategoryApi } from '@/services';

const DetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [item, setItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'event' | 'location' | 'category' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        // Tentamos buscar o item em cada API para determinar o tipo
        try {
          const event = await eventApi.getById(id);
          if (event && event.id) {
            setItem(event);
            setItemType('event');
            return;
          }
        } catch (e) {
          // Ignora erro e tenta próxima API
        }

        try {
          const location = await locationApi.getById(id);
          if (location && location.id) {
            setItem(location);
            setItemType('location');
            return;
          }
        } catch (e) {
          // Ignora erro e tenta próxima API
        }

        try {
          const category = await eventCategoryApi.getById(id);
          if (category && category.id) {
            setItem(category);
            setItemType('category');
            return;
          }
        } catch (e) {
          // Ignora erro e tenta última verificação
        }

        // Se chegou aqui, não encontrou o item em nenhuma API
        setError('Item não encontrado');
      } catch (err) {
        console.error('Erro ao buscar item:', err);
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  // Função para navegar para a página de edição
  const handleEdit = () => {
    router.push(`/eventos-locais/editar/${id}`);
  };

  // Função para voltar à página de listagem
  const handleBack = () => {
    router.push('/eventos-locais');
  };

  // Renderizar conteúdo baseado no tipo
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-yellow"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-300 rounded-md p-4 text-red-700">
          {error}
        </div>
      );
    }

    if (!item || !itemType) {
      return (
        <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4 text-yellow-700">
          Item não encontrado
        </div>
      );
    }

    switch(itemType) {
      case 'event':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Nome do Evento</h3>
                <p className="text-gray-600">{item.name}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Data</h3>
                <p className="text-gray-600">{item.date || 'Não informada'}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Horário</h3>
                <p className="text-gray-600">{item.time || 'Não informado'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Categoria</h3>
                <p className="text-gray-600">{item.eventCategory?.name || 'Sem categoria'}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Data de Criação</h3>
                <p className="text-gray-600">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        );
        
      case 'location':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Nome do Local</h3>
                <p className="text-gray-600">{item.name}</p>
              </div>
              
              {item.address && (
                <>
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-700">Endereço</h3>
                    <p className="text-gray-600">
                      {`${item.address.street.name}, ${item.address.number}${
                        item.address.complement ? `, ${item.address.complement}` : ''
                      }`}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-700">CEP</h3>
                    <p className="text-gray-600">{item.address.zipCode || 'Não informado'}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-4">
              {item.address && (
                <>
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-700">Cidade/Estado</h3>
                    <p className="text-gray-600">
                      {`${item.address.city.name}/${item.address.city.state.name} (${item.address.city.state.uf})`}
                    </p>
                  </div>
                </>
              )}
              
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Data de Criação</h3>
                <p className="text-gray-600">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        );
        
      case 'category':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Nome da Categoria</h3>
                <p className="text-gray-600">{item.name}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Status</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.status === 'ACTIVE' ? 'Ativo' : 'Desativado'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Data de Criação</h3>
                <p className="text-gray-600">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Tipo de item não reconhecido</div>;
    }
  };

  // Determinar o título da página
  const getTitle = () => {
    if (!item || !itemType) return 'Detalhes';
    
    switch(itemType) {
      case 'event':
        return `Evento: ${item.name}`;
      case 'location':
        return `Local: ${item.name}`;
      case 'category':
        return `Categoria: ${item.name}`;
      default:
        return 'Detalhes';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="p-2 bg-soft-ivory text-steel-gray rounded-md hover:bg-opacity-90 mr-3"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-boska text-white">{getTitle()}</h1>
      </div>

      <FormCard
        title="Detalhes"
        actions={
          <div className="flex justify-end">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90 light-sweep-button flex items-center"
            >
              <Edit size={16} className="mr-2" />
              Editar
            </button>
          </div>
        }
      >
        {renderContent()}
      </FormCard>
    </div>
  );
};

export default DetailPage;