'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import Notification, { NotificationType } from '../components/Notification'

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void
}

// Criação do contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Hook para usar o contexto
export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

// Provedor do contexto
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<{
    type: NotificationType
    message: string
    show: boolean
    duration: number
    id: number
  }>({
    type: 'info',
    message: '',
    show: false,
    duration: 5000,
    id: 0,
  })

  // Função para mostrar uma notificação
  const showNotification = (type: NotificationType, message: string, duration = 5000) => {
    setNotification({
      type,
      message,
      show: true,
      duration,
      id: Date.now(), // ID único para garantir re-render quando mostrar a mesma mensagem consecutivamente
    })
  }

  // Função para fechar a notificação
  const handleClose = () => {
    setNotification((prev) => ({ ...prev, show: false }))
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification
        type={notification.type}
        message={notification.message}
        duration={notification.duration}
        onClose={handleClose}
        show={notification.show}
        key={notification.id}
      />
    </NotificationContext.Provider>
  )
}