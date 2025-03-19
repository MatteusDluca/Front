// src/app/dashboard/categorias/nova/page.tsx
'use client'

import React from 'react'
import Sidebar from '@/components/Sidebar'
import CategoryForm from '@/components/CategoryForm'

const NewCategoryPage: React.FC = () => {
  return (
    <div>
      
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <CategoryForm />
      </div>
    </div>
  )
}

export default NewCategoryPage