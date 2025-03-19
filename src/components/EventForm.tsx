// src/app/dashboard/eventos-locais/components/EventForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormCard from '@/components/FormCard';
import Input from '@/components/Input';
import { eventSchema } from '@/lib';
import { Event } from '@/types/event';
import { EventCategory } from '@/types/event-category';
import { eventApi } from '@/services/event-api';
import { eventCategoryApi } from '@/services/event-category-api';

interface EventFormProps {
  event?: Event;
  onSuccess?: (event: Event) => void;
  onCancel?: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  event,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const isEditing = !!event;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      date: '',
      time: '',
      eventCategoryId: '',
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await eventCategoryApi.getAll();
        setCategories(data.filter((c) => c.status === 'ACTIVE'));
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (event) {
      reset({
        name: event.name,
        date: event.date || '',
        time: event.time || '',
        eventCategoryId: event.eventCategoryId || '',
      });
    }
  }, [event, reset]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      let savedEvent: Event;

      if (isEditing && event) {
        savedEvent = await eventApi.update(event.id, data);
      } else {
        savedEvent = await eventApi.create(data);
      }

      if (onSuccess) {
        onSuccess(savedEvent);
      } else {
        router.push('/dashboard/eventos-locais');
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Formatar a data para o formato brasileiro (DD/MM/YYYY)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      if (value.length <= 2) {
        // Apenas o dia
      } else if (value.length <= 4) {
        // Dia e mês
        value = value.replace(/^(\d{2})(\d)/, '$1/$2');
      } else {
        // Dia, mês e ano
        value = value.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
      }
    }
    
    e.target.value = value;
  };

  // Formatar o horário (HH:MM)
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      if (value.length <= 2) {
        // Apenas horas
      } else {
        // Horas e minutos
        value = value.replace(/^(\d{2})(\d{0,2})/, '$1:$2');
      }
    }
    
    e.target.value = value;
  };

  return (
    <FormCard
      title={isEditing ? 'Editar Evento' : 'Novo Evento'}
      subtitle={
        isEditing
          ? 'Atualize os dados do evento'
          : 'Preencha os dados para criar um novo evento'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="Nome do Evento"
            {...register('name')}
            error={errors.name?.message}
            required
          />
          
          <Input
            label="Data do Evento"
            placeholder="DD/MM/AAAA"
            {...register('date')}
            onInput={handleDateChange}
            error={errors.date?.message}
          />
          
          <Input
            label="Horário do Evento"
            placeholder="HH:MM"
            {...register('time')}
            onInput={handleTimeChange}
            error={errors.time?.message}
          />
        </div>
        
        <div className="space-y-4">
          <div className="mb-4 font-clash">
            <div className="label-container">
              <label className="text-steel-gray font-medium">Categoria do Evento</label>
            </div>
            <select
              {...register('eventCategoryId')}
              className="w-full py-2 px-3 border-b-2 border-gray-300 focus:outline-none focus:border-light-yellow bg-transparent"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.eventCategoryId?.message && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.eventCategoryId.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </FormCard>
  );
};

export default EventForm;