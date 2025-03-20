// src/app/categorias/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/components/DataTable'
import Sidebar from '@/components/Sidebar'
import Notification from '@/components/Notification'
import { Category, CategoryStatus } from '@/types'
import { categoryApi } from '@/services'
import usePermissions from '@/hooks/usePermissions'

const CategoriesPage: React.FC = () => {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })
  const { canCreate, canEdit, canDelete } = usePermissions()

  // Carregar categorias ao iniciar a página
  useEffect(() => {
    fetchCategories()
  }, [])

  // Função para buscar categorias
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryApi.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      showNotification('error', 'Erro ao carregar categorias. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Função para exibir notificações
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ show: true, type, message })
  }

  // Função para fechar notificação
  const closeNotification = () => {
    setNotification({ ...notification, show: false })
  }

  // Função para traduzir o status
  const translateStatus = (status: CategoryStatus): string => {
    return status === CategoryStatus.ACTIVE ? 'Ativo' : 'Desativado'
  }

  // Função para renderizar o status com cores
  const renderStatus = (category: Category) => {
    const status = category.status
    const bgColor = status === CategoryStatus.ACTIVE 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {translateStatus(status)}
      </span>
    )
  }

  // Função para remover uma categoria
  const handleDelete = async (category: Category) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      try {
        await categoryApi.delete(category.id)
        showNotification('success', 'Categoria excluída com sucesso!')
        fetchCategories() // Recarregar a lista
      } catch (error) {
        console.error('Erro ao excluir categoria:', error)
        showNotification('error', 'Erro ao excluir categoria. Tente novamente.')
      }
    }
  }

  // Função para editar uma categoria
  const handleEdit = (category: Category) => {
    router.push(`/categorias/editar/${category.id}`)
  }

  // Função para visualizar uma categoria
  const handleView = (category: Category) => {
    router.push(`/categorias/${category.id}`)
  }

  // Função para adicionar uma nova categoria
  const handleAdd = () => {
    router.push('/categorias/nova')
  }

  // Definição das colunas da tabela
  const columns: Column<Category>[] = [
    {
      header: 'Imagem',
      accessor: (category) => (
        <div className="flex justify-center">
          {category.imageUrl ? (
            <img 
              src={category.imageUrl} 
              alt={category.name} 
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
      header: 'Nome',
      accessor: 'name',
    },
    {
      header: 'Status',
      accessor: (category) => renderStatus(category),
    },
    {
      header: 'Data de Criação',
      accessor: (category) => new Date(category.createdAt).toLocaleDateString('pt-BR'),
    },
  ]

  return (
    <div>
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <DataTable<Category>
          data={categories}
          columns={columns}
          title="Categorias"
          loading={loading}
          onAdd={handleAdd}
          addButtonLabel="Nova Categoria"
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

export default CategoriesPage