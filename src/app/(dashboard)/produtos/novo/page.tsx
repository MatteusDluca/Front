// src/app/dashboard/produtos/novo/page.tsx
'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import ProductForm from '@/components/ProductForm'

const NewProductPage: React.FC = () => {
  return (
    <div>
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <ProductForm />
      </div>
    </div>
  )
}

export default NewProductPage