// src/app/dashboard/produtos/components/ProductForm.tsx
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Input from '@/components/Input'
import FormCard from '@/components/FormCard'
import ImageUpload from '@/components/ImageUpload'
import { productSchema, ProductFormData } from '@/lib/index'
import { Category, Product, ProductStatus } from '@/types'
import { categoryApi, productApi } from '@/services/index'

interface ProductFormProps {
  product?: Product
  onSuccess?: (product: Product) => void
  onCancel?: () => void
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const isEditing = !!product

  // Configurar o formulário com validação Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      code: '',
      status: ProductStatus.AVAILABLE,
      size: '',
      quantity: 1,
      description: '',
      rentalValue: 0,
      categoryId: '',
    },
  })

  // Carregar categorias ao iniciar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll()
        setCategories(data.filter((c: { status: string }) => c.status === 'ACTIVE'))
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }

    fetchCategories()
  }, [])

  // Preencher o formulário com os dados do produto se estiver editando
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        code: product.code,
        status: product.status,
        size: product.size,
        quantity: product.quantity,
        description: product.description || '',
        rentalValue: product.rentalValue,
        categoryId: product.categoryId || '',
      })
    }
  }, [product, reset])

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true)

      let savedProduct: Product

      if (isEditing && product) {
        // Atualizar produto existente
        savedProduct = await productApi.update(product.id, data)
      } else {
        // Criar novo produto
        savedProduct = await productApi.create(data)
      }

      // Upload de imagem se existir
      if (imageFile) {
        savedProduct = await productApi.uploadImage(savedProduct.id, imageFile)
      }

      if (onSuccess) {
        onSuccess(savedProduct)
      } else {
        // Redirecionar para a página de produtos
        router.push('/produtos')
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Função para lidar com a alteração da imagem
  const handleImageChange = (file: File | null) => {
    setImageFile(file)
  }

  // Renderizar opções de status
  const renderStatusOptions = () => {
    return Object.values(ProductStatus).map((status) => {
      const label = {
        [ProductStatus.AVAILABLE]: 'Disponível',
        [ProductStatus.RENTED]: 'Alugado',
        [ProductStatus.MAINTENANCE]: 'Em Conserto',
        [ProductStatus.DISABLED]: 'Desativado',
      }[status]

      return (
        <option key={status} value={status}>
          {label}
        </option>
      )
    })
  }

  return (
    <FormCard
      title={isEditing ? 'Editar Produto' : 'Novo Produto'}
      subtitle={isEditing ? 'Atualize os dados do produto' : 'Preencha os dados para criar um novo produto'}
      actions={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel || (() => router.push('/produtos'))}
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
            label="Nome do Produto"
            {...register('name')}
            error={errors.name?.message}
            required
          />
          
          <Input
            label="Código"
            {...register('code')}
            error={errors.code?.message}
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
              {renderStatusOptions()}
            </select>
            {errors.status?.message && (
              <span className='text-red-500 text-sm mt-1 block'>
                {errors.status.message}
              </span>
            )}
          </div>
          
          <Input
            label="Tamanho"
            {...register('size')}
            error={errors.size?.message}
            required
          />
          
          <Input
            label="Quantidade"
            type="number"
            {...register('quantity')}
            error={errors.quantity?.message}
            required
          />
        </div>
        
        <div className="space-y-4">
          <Input
            label="Valor de Aluguel (R$)"
            type="number"
            step="0.01"
            {...register('rentalValue')}
            error={errors.rentalValue?.message}
            required
          />
          
          <div className="mb-4 font-clash">
            <div className="label-container">
              <label className='text-steel-gray font-medium'>Categoria</label>
            </div>
            <select
              {...register('categoryId')}
              className="w-full py-2 px-3 border-b-2 border-gray-300 focus:outline-none focus:border-light-yellow bg-transparent"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId?.message && (
              <span className='text-red-500 text-sm mt-1 block'>
                {errors.categoryId.message}
              </span>
            )}
          </div>
          
          <div className="mb-4 font-clash">
            <div className="label-container">
              <label className='text-steel-gray font-medium'>Descrição</label>
            </div>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full py-2 px-3 border-b-2 border-gray-300 focus:outline-none focus:border-light-yellow bg-transparent resize-none"
            />
            {errors.description?.message && (
              <span className='text-red-500 text-sm mt-1 block'>
                {errors.description.message}
              </span>
            )}
          </div>
          
          <div className="mt-6">
            <div className="label-container">
              <label className='text-steel-gray font-medium'>Imagem do Produto</label>
            </div>
            <ImageUpload
              initialImage={product?.imageUrl}
              onImageChange={handleImageChange}
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </FormCard>
  )
}

export default ProductForm