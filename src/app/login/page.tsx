'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '../../components/Input'
import { loginSchema } from '../../lib/validations'
import { authApi } from '../../lib/api'
import { FormErrors, LoginCredentials } from '../../types'

// CPF formatting function
const formatCPF = (value: string): string => {
  // Remove non-numeric characters
  const cpf = value.replace(/\D/g, '')
  
  // Apply CPF formatting (XXX.XXX.XXX-XX)
  if (cpf.length <= 3) return cpf
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`
}

export default function Login() {
  const router = useRouter()
  const [loginData, setLoginData] = useState<LoginCredentials>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors<LoginCredentials>>({})
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Verificar se já está autenticado
    if (typeof window !== 'undefined' && authApi.isAuthenticated()) {
      router.push('/')
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Apply CPF formatting for the password field (which is actually the CPF)
    if (name === 'password') {
      setLoginData(prev => ({ ...prev, [name]: formatCPF(value) }))
    } else {
      setLoginData(prev => ({ ...prev, [name]: value }))
    }
    
    // Limpar erro ao digitar
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof LoginCredentials]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validar dados com Zod
      const validatedData = loginSchema.parse(loginData)
      
      setLoading(true)
      
      // Fazer login
      await authApi.login(validatedData)
      
      // Redirecionar para o dashboard após login bem-sucedido
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error.errors) {
        // Erros de validação do Zod
        const formattedErrors: FormErrors<LoginCredentials> = {}
        
        error.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            formattedErrors[err.path[0] as keyof LoginCredentials] = err.message
          }
        })
        
        setErrors(formattedErrors)
      } else if (error.response) {
        // Erro da API
        const status = error.response.status
        
        if (status === 401) {
          setErrors({ 
            email: 'Email ou CPF inválidos',
            password: 'Email ou CPF inválidos'
          })
        } else {
          setErrors({ 
            email: 'Erro no servidor. Tente novamente mais tarde.' 
          })
        }
      } else {
        // Erro genérico
        setErrors({ 
          email: 'Ocorreu um erro. Verifique sua conexão e tente novamente.' 
        })
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Função para validação em tempo real
  const validateField = (name: keyof LoginCredentials, value: string) => {
    try {
      if (name === 'email') {
        loginSchema.shape.email.parse(value);
      } else if (name === 'password') {
        loginSchema.shape.password.parse(value);
      }
      return true;
    } catch (error: any) {
      if (error.errors && error.errors.length > 0) {
        setErrors(prev => ({
          ...prev,
          [name]: error.errors[0].message
        }));
      }
      return false;
    }
  }
  
  // Handler para validação ao perder o foco
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name as keyof LoginCredentials, value);
  }

  return (
    <div className='min-h-screen bg-white flex items-center justify-center p-4'>
      <div className='w-full max-w-6xl'>
        {/* Card principal com sombra - maior e mais quadrado */}
        <div 
          className='flex rounded-lg shadow-md overflow-hidden h-[600px]'
          style={{ border: '1px solid var(--color-peach-cream)' }}
        >
          {/* Lado esquerdo - Login */}
          <div className='w-1/2 bg-white p-16'>
            <h2 className='text-2xl font-clash mb-12 text-steel-gray'>Login</h2>
            
            <form onSubmit={handleSubmit}>
              <Input 
                label='Email'
                name='email'
                type='email'
                value={loginData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder='Digite seu email'
                className='font-clash text-steel-gray'
                error={errors.email}
                required
              />
              
              <Input 
                label='CPF'
                name='password'
                type='text'
                value={loginData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder='Digite seu CPF'
                className='font-clash'
                error={errors.password}
                maxLength={14}
                required
              />
              
              <button
                type='submit'
                disabled={loading}
                className='w-full mt-6 py-3 px-4 text-steel-gray font-clash rounded light-sweep-button'
                style={{ backgroundColor: '#dbd3c5' }} // soft-ivory mais escuro
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
          
          {/* Lado direito - Logo e nome */}
          <div className='w-1/2 bg-peach-cream p-16 flex flex-col items-center justify-center'>
            <div className='w-40 h-40 bg-white rounded-full flex items-center justify-center mb-8 shadow-md'>
              <span className='text-peach-cream font-formula text-3xl'>LOGO</span>
            </div>
            <h1 className='text-center font-boska text-4xl text-white'>
              Loja de Aluguel
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}