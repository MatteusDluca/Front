// src/app/dashboard/produtos/editar/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ProductForm from '@/components/ProductForm'
import { Product } from '@/types'
import { productApi } from '@/services/index'
import Notification from '@/components/Notification'

const EditProductPage: React.FC = () => {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
    message: ''
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productApi.getById(productId)
        setProduct(data)
      } catch (error) {
        console.error('Erro ao buscar produto:', error)
        showNotification('error', 'Erro ao carregar produto. Tente novamente.')
        setTimeout(() => router.push('/produtos'), 3000)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId, router])

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ show: true, type, message })
  }

  const closeNotification = () => {
    setNotification({ ...notification, show: false })
  }

  const handleSuccess = (updatedProduct: Product) => {
    showNotification('success', 'Produto atualizado com sucesso!')
    setTimeout(() => router.push('/produtos'), 2000)
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        {product ? (
          <ProductForm 
            product={product} 
            onSuccess={handleSuccess}
          />
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

export default EditProductPage