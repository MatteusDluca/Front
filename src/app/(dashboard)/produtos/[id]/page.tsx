// src/app/dashboard/produtos/visualizar/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import FormCard from '@/components/FormCard'
import { Product, ProductStatus } from '@/types'
import { productApi } from '@/services/index'
import { FileText, Edit, ArrowLeft } from 'lucide-react'

const ViewProductPage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productApi.getById(productId)
        setProduct(data)
      } catch (error) {
        console.error('Erro ao buscar produto:', error)
        alert('Erro ao carregar produto. Redirecionando para a lista.')
        setTimeout(() => router.push('/produtos'), 3000)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId, router])

  const translateStatus = (status: ProductStatus): string => {
    const statusMap = {
      [ProductStatus.AVAILABLE]: 'Disponível',
      [ProductStatus.RENTED]: 'Alugado',
      [ProductStatus.MAINTENANCE]: 'Em Conserto',
      [ProductStatus.DISABLED]: 'Desativado',
    }
    return statusMap[status] || status
  }

  const handleEdit = () => {
    router.push(`/produtos/editar/${productId}`)
  }

  const handleGeneratePdf = async () => {
    if (!product) return
    
    try {
      setLoading(true)
      const pdfUrl = await productApi.generateProductPdf(product.id)
      window.open(pdfUrl, '_blank')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Carregando produto...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        {product ? (
          <FormCard
            title="Detalhes do Produto"
            actions={
              <div className="flex justify-between">
                <button
                  onClick={() => router.push('/produtos')}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Voltar
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleGeneratePdf}
                    className="flex items-center px-4 py-2 border border-light-yellow text-light-yellow rounded-md hover:bg-light-yellow hover:bg-opacity-10"
                  >
                    <FileText size={16} className="mr-2" />
                    Gerar PDF
                  </button>
                  
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90 light-sweep-button"
                  >
                    <Edit size={16} className="mr-2" />
                    Editar
                  </button>
                </div>
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Imagem do produto */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg overflow-hidden shadow-md">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-80 object-contain p-4"
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">Sem imagem</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Detalhes do produto */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between">
                    <h1 className="text-2xl font-clash text-steel-gray">{product.name}</h1>
                    <div className="flex items-center">
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${product.status === ProductStatus.AVAILABLE ? 'bg-green-100 text-green-800' : ''}
                        ${product.status === ProductStatus.RENTED ? 'bg-blue-100 text-blue-800' : ''}
                        ${product.status === ProductStatus.MAINTENANCE ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${product.status === ProductStatus.DISABLED ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {translateStatus(product.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Código</p>
                      <p className="font-medium">{product.code}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Categoria</p>
                      <p className="font-medium">{product.category?.name || 'Não definida'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Tamanho</p>
                      <p className="font-medium">{product.size}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Quantidade</p>
                      <p className="font-medium">{product.quantity}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Valor para Aluguel</p>
                      <p className="font-medium text-light-yellow">R$ {product.rentalValue.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {product.description && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-500 mb-2">Descrição</p>
                      <p className="text-gray-700">{product.description}</p>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-500">
                      <p>Cadastrado em: {new Date(product.createdAt).toLocaleDateString('pt-BR')}</p>
                      <p>Última atualização: {new Date(product.updatedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FormCard>
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-red-500">Produto não encontrado.</p>
            <button
              onClick={() => router.push('/dashboard/produtos')}
              className="mt-4 px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90"
            >
              Voltar para Lista
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewProductPage