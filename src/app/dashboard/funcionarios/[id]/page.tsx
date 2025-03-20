'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, FileText, Edit, UserX, Phone, Mail, Calendar, Clock, CreditCard, MapPin, Award } from 'lucide-react'
import { employeeService } from '../../../../services/employeeService'
import { EmployeeResponse } from '../../../../types/employee'

/**
 * Página de detalhes do funcionário
 */
export default function EmployeeDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  
  const [employee, setEmployee] = useState<EmployeeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true)
        const data = await employeeService.getById(employeeId)
        setEmployee(data)
        setError(null)
      } catch (err) {
        console.error('Erro ao carregar funcionário:', err)
        setError('Não foi possível carregar os detalhes do funcionário.')
      } finally {
        setLoading(false)
      }
    }

    if (employeeId) {
      fetchEmployee()
    }
  }, [employeeId])

  /**
   * Gera PDF do funcionário
   */
  const handleGeneratePdf = async () => {
    if (!employee) return
    
    try {
      const pdfUrl = await employeeService.generateEmployeePdf(employee.id)
      window.open(pdfUrl, '_blank')
    } catch (err) {
      console.error('Erro ao gerar PDF do funcionário:', err)
      alert('Não foi possível gerar o PDF do funcionário.')
    }
  }

  /**
   * Exclui o funcionário
   */
  const handleDeleteEmployee = async () => {
    if (!employee) return
    
    if (window.confirm(`Deseja realmente excluir o funcionário ${employee.name}?`)) {
      try {
        await employeeService.remove(employee.id)
        router.push('/funcionarios')
      } catch (err) {
        console.error('Erro ao excluir funcionário:', err)
        alert('Não foi possível excluir o funcionário.')
      }
    }
  }

  /**
   * Formata CPF para exibição
   */
  const formatCpf = (cpf: string) => {
    if (cpf.length === 11) {
      return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`
    }
    return cpf
  }

  /**
   * Formata valor monetário
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  /**
   * Formata data para exibição
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado'
    
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  /**
   * Formata telefone para exibição
   */
  const formatPhone = (phone: string) => {
    // Se o telefone estiver no formato 11999999999
    if (phone.length === 11) {
      return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`
    }
    // Se o telefone estiver no formato 9999999999
    else if (phone.length === 10) {
      return `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6)}`
    }
    return phone
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do funcionário...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        <p>{error}</p>
        <div className="mt-4">
          <button
            onClick={() => router.push('/funcionarios')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        <p>Funcionário não encontrado.</p>
        <div className="mt-4">
          <button
            onClick={() => router.push('/funcionarios')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/funcionarios')}
            className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-boska text-steel-gray">Detalhes do Funcionário</h1>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleGeneratePdf}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FileText size={18} className="mr-2" />
            Exportar PDF
          </button>
          
          <button
            onClick={() => router.push(`/funcionarios/editar/${employee.id}`)}
            className="flex items-center px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
          >
            <Edit size={18} className="mr-2" />
            Editar
          </button>
          
          <button
            onClick={handleDeleteEmployee}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <UserX size={18} className="mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Informações principais e foto */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header with employee photo/avatar */}
            <div className="bg-emerald bg-opacity-10 p-6 flex flex-col items-center">
              {employee.imageUrl ? (
                <div className="w-24 h-24 rounded-full bg-white shadow-md overflow-hidden mb-4">
                  <img 
                    src={employee.imageUrl} 
                    alt={`Foto de ${employee.name}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              )}
              
              <h2 className="text-xl font-boska text-steel-gray text-center">{employee.name}</h2>
              
              <div className="mt-2 mb-1">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  employee.role === 'ADMIN' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {employee.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                </span>
              </div>
              
              <p className="text-gray-500 text-sm">{employee.email}</p>
            </div>
            
            {/* Contact information */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-clash text-steel-gray mb-4">Contato</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone size={18} className="text-gray-400 mr-3" />
                  <span>{formatPhone(employee.phone)}</span>
                </div>
                
                <div className="flex items-center">
                  <Mail size={18} className="text-gray-400 mr-3" />
                  <span>{employee.email}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar size={18} className="text-gray-400 mr-3" />
                  <span>
                    {employee.birthday 
                      ? `Nascimento: ${formatDate(employee.birthday)}` 
                      : 'Data de nascimento não informada'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Professional information */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-clash text-steel-gray mb-4">Informações Profissionais</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock size={18} className="text-gray-400 mr-3" />
                  <span>{employee.workHours}</span>
                </div>
                
                <div className="flex items-center">
                  <CreditCard size={18} className="text-gray-400 mr-3" />
                  <span>{formatCurrency(employee.salary)}</span>
                </div>
                
                <div className="flex items-center">
                  <Award size={18} className="text-gray-400 mr-3" />
                  <span>CPF: {formatCpf(employee.cpf)}</span>
                </div>
              </div>
            </div>
            
            {/* System information */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h3 className="text-sm font-clash text-gray-500 mb-2">Informações do Sistema</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cadastrado em:</span>
                  <span className="text-gray-700">{formatDate(employee.createdAt)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Última atualização:</span>
                  <span className="text-gray-700">{formatDate(employee.updatedAt)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ID:</span>
                  <span className="text-gray-700 text-xs truncate max-w-[150px]" title={employee.id}>
                    {employee.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Coluna 2-3: Detalhes e endereço */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Informações detalhadas */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-clash text-steel-gray mb-4">Detalhes Completos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Nome Completo</p>
                  <p className="font-medium">{employee.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">CPF</p>
                  <p className="font-medium">{formatCpf(employee.cpf)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{formatPhone(employee.phone)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Data de Nascimento</p>
                  <p className="font-medium">{employee.birthday ? formatDate(employee.birthday) : 'Não informado'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Horário de Trabalho</p>
                  <p className="font-medium">{employee.workHours}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Salário</p>
                  <p className="font-medium">{formatCurrency(employee.salary)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Função</p>
                  <p className="font-medium flex items-center mt-1">
                    {employee.role === 'ADMIN' ? (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Administrador
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Usuário
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Endereço */}
            {employee.address && (
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <MapPin size={20} className="text-emerald mr-2" />
                  <h3 className="text-lg font-clash text-steel-gray">Endereço</h3>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Rua</p>
                      <p className="font-medium">{employee.address.street.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Número</p>
                      <p className="font-medium">{employee.address.number}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Complemento</p>
                      <p className="font-medium">{employee.address.complement || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">CEP</p>
                      <p className="font-medium">{employee.address.zipCode}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Cidade</p>
                      <p className="font-medium">{employee.address.city.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <p className="font-medium">{employee.address.city.state.name} ({employee.address.city.state.uf})</p>
                    </div>
                  </div>
                </div>
                
                {/* Mapa simulado */}
                <div className="mt-6 bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                  <div className="text-gray-500 flex items-center">
                    <MapPin size={24} className="mr-2" />
                    <span>Mapa do endereço seria exibido aqui</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}