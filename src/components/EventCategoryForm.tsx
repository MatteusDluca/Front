// src/app/dashboard/eventos-locais/components/EventCategoryForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormCard from '@/components/FormCard';
import Input from '@/components/Input';
import { eventCategorySchema } from '@/lib';
import { EventCategory, EventCategoryStatus } from '@/types/event-category';
import { eventCategoryApi } from '@/services/event-category-api';

interface EventCategoryFormProps {
  category?: EventCategory;
  onSuccess?: (category: EventCategory) => void;
  onCancel?: () => void;
}

const EventCategoryForm: React.FC<EventCategoryFormProps> = ({
  category,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(eventCategorySchema),
    defaultValues: {
      name: '',
      status: EventCategoryStatus.ACTIVE,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        status: category.status,
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      let savedCategory: EventCategory;

      if (isEditing && category) {
        savedCategory = await eventCategoryApi.update(category.id, data);
      } else {
        savedCategory = await eventCategoryApi.create(data);
      }

      if (onSuccess) {
        onSuccess(savedCategory);
      } else {
        router.push('/dashboard/eventos-locais');
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard
      title={isEditing ? 'Editar Categoria de Evento' : 'Nova Categoria de Evento'}
      subtitle={
        isEditing
          ? 'Atualize os dados da categoria'
          : 'Preencha os dados para criar uma nova categoria de evento'
      }
      actions={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel || (() => router.push('/dashboard/eventos-locais'))}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90 light-sweep-button"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Salvando...</span>
              </div>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Nome da Categoria"
          {...register('name')}
          error={errors.name?.message}
          required
        />

        <div className="mb-4 font-clash">
          <div className="label-container">
            <label className="text-steel-gray font-medium">Status</label>
            <span className="text-red-500 ml-1">*</span>
          </div>
          <select
            {...register('status')}
            className="w-full py-2 px-3 border-b-2 border-gray-300 focus:outline-none focus:border-light-yellow bg-transparent"
          >
            <option value={EventCategoryStatus.ACTIVE}>Ativo</option>
            <option value={EventCategoryStatus.DISABLED}>Desativado</option>
          </select>
          {errors.status?.message && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.status.message}
            </span>
          )}
        </div>
      </div>
    </FormCard>
  );
};

export default EventCategoryForm;