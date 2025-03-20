// src/app/dashboard/categorias/visualizar/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import FormCard from '@/components/FormCard'
import { Category, CategoryStatus, Product } from '@/types'
import { categoryApi, productApi } from '@/services/index'
import { Edit, ArrowLeft } from 'lucide-react'
import DataTable, { Column } from '@/components/DataTable'

const ViewCategoryPage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar categoria
        const categoryData = await categoryApi.getById(categoryId)
        setCategory(categoryData)
        
        // Carregar produtos da categoria
        const allProducts = await productApi.getAll()
        const filteredProducts = allProducts.filter(
          (product) => product.categoryId === categoryId
        )
        setProducts(filteredProducts)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        alert('Erro ao carregar categoria. Redirecionando para a lista.')
        setTimeout(() => router.push('/categorias'), 3000)
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchData()
    }
  }, [categoryId, router])

  const translateStatus = (status: CategoryStatus): string => {
    return status === CategoryStatus.ACTIVE ? 'Ativo' : 'Desativado'
  }

  const handleEdit = () => {
    router.push(`/categorias/editar/${categoryId}`)
  }

  // Colunas para a tabela de produtos relacionados
  const productColumns: Column<Product>[] = [
    {
      header: 'Código',
      accessor: 'code',
    },
    {
      header: 'Nome',
      accessor: 'name',
    },
    {
      header: 'Tamanho',
      accessor: 'size',
    },
    {
      header: 'Valor',
      accessor: (product) => `R$ ${product.rentalValue.toFixed(2)}`,
    },
  ]

  // Função para visualizar um produto
  const handleViewProduct = (product: Product) => {
    router.push(`/produtos/visualizar/${product.id}`)
  }

  if (loading) {
    return (
      <div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Carregando categoria...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        {category ? (
          <div className="space-y-6">
            <FormCard
              title="Detalhes da Categoria"
              actions={
                <div className="flex justify-between">
                  <button
                    onClick={() => router.push('/dashboard/categorias')}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Voltar
                  </button>
                  
                  <div className="flex space-x-3">
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
                {/* Imagem da categoria */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg overflow-hidden shadow-md">
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="w-full h-64 object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Detalhes da categoria */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between">
                      <h1 className="text-2xl font-clash text-steel-gray">{category.name}</h1>
                      <div className="flex items-center">
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${category.status === CategoryStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        `}>
                          {translateStatus(category.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm text-gray-500">
                        <p>Cadastrado em: {new Date(category.createdAt).toLocaleDateString('pt-BR')}</p>
                        <p>Última atualização: {new Date(category.updatedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <p className="text-lg font-medium">Total de produtos: {products.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </FormCard>
            
            {/* Lista de produtos da categoria */}
            {products.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-clash text-steel-gray">Produtos nesta Categoria</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-steel-gray text-white">
                      <tr>
                        {productColumns.map((column, index) => (
                          <th
                            key={index}
                            className="px-6 py-3 text-left text-xs font-clash uppercase tracking-wider"
                          >
                            {column.header}
                          </th>
                        ))}
                        <th className="px-6 py-3 text-right text-xs font-clash uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                          {productColumns.map((column, colIndex) => (
                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {typeof column.accessor === 'function' 
                                ? String(column.accessor(product)) 
                                : String(product[column.accessor])}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="text-blue-500 hover:text-blue-700 transition-colors duration-150"
                              title="Visualizar"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className="transition-transform duration-150 hover:scale-110"
                              >
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-red-500">Categoria não encontrada.</p>
            <button
              onClick={() => router.push('/dashboard/categorias')}
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

export default ViewCategoryPage