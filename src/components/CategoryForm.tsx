// src/app/dashboard/categorias/components/CategoryForm.tsx
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Input from '@/components/Input'
import FormCard from '@/components/FormCard'
import ImageUpload from '@/components/ImageUpload'
import { categorySchema, CategoryFormData } from '@/lib/index'
import { Category, CategoryStatus } from '@/types'
import { categoryApi } from '@/services/index'

interface CategoryFormProps {
  category?: Category
  onSuccess?: (category: Category) => void
  onCancel?: () => void
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const isEditing = !!category

  // Configurar o formulário com validação Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      status: CategoryStatus.ACTIVE,
    },
  })

  // Preencher o formulário com os dados da categoria se estiver editando
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        status: category.status,
      })
    }
  }, [category, reset])

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: CategoryFormData) => {
    try {
      setLoading(true)

      let savedCategory: Category

      if (isEditing && category) {
        // Atualizar categoria existente
        savedCategory = await categoryApi.update(category.id, data)
      } else {
        // Criar nova categoria
        savedCategory = await categoryApi.create(data)
      }

      // Upload de imagem se existir
      if (imageFile) {
        savedCategory = await categoryApi.uploadImage(savedCategory.id, imageFile)
      }

      if (onSuccess) {
        onSuccess(savedCategory)
      } else {
        // Redirecionar para a página de categorias
        router.push('/categorias')
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      alert('Erro ao salvar categoria. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Função para lidar com a alteração da imagem
  const handleImageChange = (file: File | null) => {
    setImageFile(file)
  }

  return (
    <FormCard
      title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}
      subtitle={isEditing ? 'Atualize os dados da categoria' : 'Preencha os dados para criar uma nova categoria'}
      actions={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel || (() => router.push('/categorias'))}
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
            label="Nome da Categoria"
            {...register('name')}
            error={errors.name?.message}
            required
          />
          
          <div className="mb-4 font-clash">
            <div className="label-container">
              <label className='text-steel-gray font-medium'>Status</label>
              <span className="text-red-500 ml-1">*</span>
            </div>
            <select
              {...register('status')}
              className="w-full py-2 px-3 border-b-2 border-gray-300 focus:outline-none focus:border-light-yellow bg-transparent"
            >
              <option value={CategoryStatus.ACTIVE}>Ativo</option>
              <option value={CategoryStatus.DISABLED}>Desativado</option>
            </select>
            {errors.status?.message && (
              <span className='text-red-500 text-sm mt-1 block'>
                {errors.status.message}
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="mt-6">
            <div className="label-container">
              <label className='text-steel-gray font-medium'>Imagem da Categoria</label>
            </div>
            <ImageUpload
              initialImage={category?.imageUrl}
              onImageChange={handleImageChange}
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </FormCard>
  )
}

export default CategoryForm