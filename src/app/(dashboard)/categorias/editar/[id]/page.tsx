// src/app/dashboard/categorias/editar/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import CategoryForm from '@/components/CategoryForm'
import { Category } from '@/types'
import { categoryApi } from '@/services/index'
import Notification from '@/components/Notification'

const EditCategoryPage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await categoryApi.getById(categoryId)
        setCategory(data)
      } catch (error) {
        console.error('Erro ao buscar categoria:', error)
        showNotification('error', 'Erro ao carregar categoria. Tente novamente.')
        setTimeout(() => router.push('/categorias'), 3000)
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId, router])

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ show: true, type, message })
  }

  const closeNotification = () => {
    setNotification({ ...notification, show: false })
  }

  const handleSuccess = (updatedCategory: Category) => {
    showNotification('success', 'Categoria atualizada com sucesso!')
    setTimeout(() => router.push('/categorias'), 2000)
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
          <CategoryForm 
            category={category} 
            onSuccess={handleSuccess}
          />
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-red-500">Categoria não encontrada.</p>
            <button
              onClick={() => router.push('/categorias')}
              className="mt-4 px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90"
            >
              Voltar para Lista
            </button>
          </div>
        )}
        
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

export default EditCategoryPage