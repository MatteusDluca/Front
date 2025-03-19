// src/app/produtos/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/components/DataTable'
import Sidebar from '@/components/Sidebar'
import Notification from '@/components/Notification'
import { Product, ProductStatus } from '@/types'
import { productApi } from '@/services'
import usePermissions from '@/hooks/usePermissions'

const ProductsPage: React.FC = () => {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })
  const { canCreate, canEdit, canDelete } = usePermissions()

  // Carregar produtos ao iniciar a página
  useEffect(() => {
    fetchProducts()
  }, [])

  // Função para buscar produtos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      console.log('Produtos carregados:', data); // Debug para verificar os dados recebidos
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      showNotification('error', 'Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para exibir notificações
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ show: true, type, message })
  }

  // Função para fechar notificação
  const closeNotification = () => {
    setNotification({ ...notification, show: false })
  }

  // Função para traduzir o status
  const translateStatus = (status: ProductStatus): string => {
    const statusMap = {
      [ProductStatus.AVAILABLE]: 'Disponível',
      [ProductStatus.RENTED]: 'Alugado',
      [ProductStatus.MAINTENANCE]: 'Em Conserto',
      [ProductStatus.DISABLED]: 'Desativado',
    }
    return statusMap[status] || status
  }

  // Função para renderizar o status com cores
  const renderStatus = (product: Product) => {
    const status = product.status
    let bgColor = ''
    
    switch (status) {
      case ProductStatus.AVAILABLE:
        bgColor = 'bg-green-100 text-green-800'
        break
      case ProductStatus.RENTED:
        bgColor = 'bg-blue-100 text-blue-800'
        break
      case ProductStatus.MAINTENANCE:
        bgColor = 'bg-yellow-100 text-yellow-800'
        break
      case ProductStatus.DISABLED:
        bgColor = 'bg-red-100 text-red-800'
        break
      default:
        bgColor = 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {translateStatus(status)}
      </span>
    )
  }

  // Função para remover um produto
  const handleDelete = async (product: Product) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      try {
        await productApi.delete(product.id)
        showNotification('success', 'Produto excluído com sucesso!')
        fetchProducts() // Recarregar a lista
      } catch (error) {
        console.error('Erro ao excluir produto:', error)
        showNotification('error', 'Erro ao excluir produto. Tente novamente.')
      }
    }
  }

  // Função para editar um produto
  const handleEdit = (product: Product) => {
    router.push(`/produtos/editar/${product.id}`)
  }

  // Função para visualizar um produto
  const handleView = (product: Product) => {
    router.push(`/produtos/${product.id}`)
  }

  // Função para adicionar um novo produto
  const handleAdd = () => {
    router.push('/produtos/novo')
  }

  // Função para gerar PDF de todos os produtos
  const handleGeneratePdf = async () => {
    try {
      setLoading(true)
      const pdfUrl = await productApi.generateAllProductsPdf()
      window.open(pdfUrl, '_blank')
      showNotification('success', 'PDF gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      showNotification('error', 'Erro ao gerar PDF. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Função para gerar PDF de um produto específico
  const handleGenerateItemPdf = async (product: Product) => {
    try {
      setLoading(true)
      const pdfUrl = await productApi.generateProductPdf(product.id)
      window.open(pdfUrl, '_blank')
      showNotification('success', 'PDF gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      showNotification('error', 'Erro ao gerar PDF. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Definição das colunas da tabela
  const columns: Column<Product>[] = [
    {
      header: 'Imagem',
      accessor: (product) => (
        <div className="flex justify-center">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xs">Sem imagem</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Código',
      accessor: 'code',
    },
    {
      header: 'Nome',
      accessor: 'name',
    },
    {
      header: 'Status',
      accessor: (product) => renderStatus(product),
    },
    {
      header: 'Tamanho',
      accessor: 'size',
    },
    {
      header: 'Quantidade',
      accessor: 'quantity',
    },
    {
      header: 'Valor',
      accessor: (product) => `R$ ${product.rentalValue.toFixed(2)}`,
    },
    {
      header: 'Categoria',
      accessor: (product) => product.category?.name || 'Não definida',
    },
  ]

  return (
    <div>
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <DataTable<Product>
          data={products}
          columns={columns}
          title="Produtos"
          loading={loading}
          onAdd={handleAdd}
          addButtonLabel="Novo Produto"
          onGeneratePdf={handleGeneratePdf}
          onGenerateItemPdf={handleGenerateItemPdf}
          actions={{
            edit: {
              enabled: true,
              onClick: handleEdit,
            },
            delete: {
              enabled: true,
              onClick: handleDelete,
            },
            view: {
              enabled: true,
              onClick: handleView,
            },
          }}
        />
        
        <Notification
          type={notification.type}
          message={notification.message}
          show={notification.show}
          onClose={closeNotification}
        />
      </div>
    </div>
  )
}

export default ProductsPage