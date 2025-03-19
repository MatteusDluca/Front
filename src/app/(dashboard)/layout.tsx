'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import { authApi } from '../../lib/api'
import { NotificationProvider } from '../../contexts/NotificationContext'


/**
 * Layout principal para páginas que requerem autenticação
 * Com gradiente de fundo aplicado a todas as páginas
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // This check prevents the effect from running during SSR
    if (typeof window !== 'undefined' && !initialized) {
      setInitialized(true)
      
      // Verificar autenticação
      console.log("Checking authentication status")
      
      const isAuth = authApi.isAuthenticated()
      if (!isAuth) {
        console.log("Not authenticated, redirecting to login")
        router.push('/login')
      } else {
        console.log("User is authenticated, loading dashboard")
        setLoading(false)
      }
    }
  }, [router, initialized])

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout triggered")
        setLoading(false)
        setError("Tempo limite de carregamento excedido. Verifique se o servidor está rodando.")
      }
    }, 5000) // 5 seconds timeout
    
    return () => clearTimeout(timer)
  }, [loading])

  // Handle error display
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-background p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-red-600 text-xl font-bold mb-4">Erro de Conexão</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">Possíveis soluções:</h3>
              <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                <li>Verifique se o servidor backend está rodando</li>
                <li>Verifique se a URL do backend está correta (http://localhost:3000)</li>
                <li>Verifique se há erros no console do servidor</li>
              </ul>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  window.location.reload()
                }}
                className="bg-light-yellow text-white py-2 px-4 rounded hover:bg-opacity-90 flex-1"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => {
                  authApi.logout()
                }}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 flex-1"
              >
                Voltar para Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-light-yellow border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white font-clash">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
      <NotificationProvider>
        <div className="flex h-screen gradient-background">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
          
          {/* Estilos globais para o gradiente */}
          <style jsx>{`
            .gradient-background {
              background: linear-gradient(135deg, #E8CBC0 0%, #a4a7c2 50%, #636FA4 100%);
              background-attachment: fixed;
            }
          `}</style>
        </div>
      </NotificationProvider>
    )  
}