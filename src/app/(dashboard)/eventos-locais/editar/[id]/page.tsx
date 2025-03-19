// src/app/(dashboard)/eventos-locais/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { eventApi, locationApi, eventCategoryApi } from '@/services';
import EventForm from '@/components/EventForm';
import LocationForm from '@/components/LocationForm';
import EventCategoryForm from '@/components/EventCategoryForm';

const EditPage = () => {
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

  // Função para voltar à página de detalhes
  const handleBack = () => {
    router.push(`/eventos-locais/${id}`);
  };

  // Função para lidar com o sucesso na atualização
  const handleSuccess = () => {
    router.push(`/eventos-locais/${id}`);
  };

  // Renderizar o formulário apropriado
  const renderForm = () => {
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
          <EventForm
            event={item}
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        );
        
      case 'location':
        return (
          <LocationForm
            location={item}
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        );
        
      case 'category':
        return (
          <EventCategoryForm
            category={item}
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        );
        
      default:
        return <div>Tipo de item não reconhecido</div>;
    }
  };

  // Determinar o título da página
  const getTitle = () => {
    if (!item || !itemType) return 'Editar';
    
    switch(itemType) {
      case 'event':
        return `Editar Evento: ${item.name}`;
      case 'location':
        return `Editar Local: ${item.name}`;
      case 'category':
        return `Editar Categoria: ${item.name}`;
      default:
        return 'Editar';
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

      {renderForm()}
    </div>
  );
};

export default EditPage;