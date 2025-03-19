// src/app/dashboard/eventos-locais/components/LocationForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormCard from '@/components/FormCard';
import Input from '@/components/Input';
import { locationSchema } from '@/lib';
import { Location } from '@/types/location';
import { locationApi } from '@/services/location-api';

interface LocationFormProps {
  location?: Location;
  onSuccess?: (location: Location) => void;
  onCancel?: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({
  location,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!location;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      street: '',
      number: '',
      complement: '',
      zipCode: '',
      city: '',
      state: '',
    },
  });

  useEffect(() => {
    if (location) {
      reset({
        name: location.name,
        street: location.address?.street?.name || '',
        number: location.address?.number || '',
        complement: location.address?.complement || '',
        zipCode: location.address?.zipCode || '',
        city: location.address?.city?.name || '',
        state: location.address?.city?.state?.name || '',
      });
    }
  }, [location, reset]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      let savedLocation: Location;

      if (isEditing && location) {
        savedLocation = await locationApi.update(location.id, data);
      } else {
        savedLocation = await locationApi.create(data);
      }

      if (onSuccess) {
        onSuccess(savedLocation);
      } else {
        router.push('/dashboard/eventos-locais');
      }
    } catch (error) {
      console.error('Erro ao salvar local:', error);
      alert('Erro ao salvar local. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Formatar o CEP (12345-678)
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    }
    
    e.target.value = value;
  };

  return (
    <FormCard
      title={isEditing ? 'Editar Local' : 'Novo Local'}
      subtitle={
        isEditing
          ? 'Atualize os dados do local'
          : 'Preencha os dados para criar um novo local'
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
            label="Nome do Local"
            {...register('name')}
            error={errors.name?.message}
            required
          />
          
          <Input
            label="Rua"
            {...register('street')}
            error={errors.street?.message}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Número"
              {...register('number')}
              error={errors.number?.message}
            />
            
            <Input
              label="Complemento"
              {...register('complement')}
              error={errors.complement?.message}
            />
          </div>
          
          <Input
            label="CEP"
            placeholder="12345-678"
            {...register('zipCode')}
            onInput={handleZipCodeChange}
            error={errors.zipCode?.message}
          />
        </div>
        
        <div className="space-y-4">
          <Input
            label="Cidade"
            {...register('city')}
            error={errors.city?.message}
          />
          
          <Input
            label="Estado"
            {...register('state')}
            error={errors.state?.message}
          />
        </div>
      </div>
    </FormCard>
  );
};

export default LocationForm;