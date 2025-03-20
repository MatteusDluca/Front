'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '../../../components/DataTable'
import { employeeService } from '../../../services/employeeService'
import { Employee, EmployeeResponse, EmployeeFilters } from '../../../types/employee'

/**
 * Página de listagem de funcionários
 */
export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filters, setFilters] = useState<EmployeeFilters>({})

  /**
   * Carrega a lista de funcionários
   */
  const loadEmployees = async (filters?: EmployeeFilters) => {
    try {
      setLoading(true)
      const data = await employeeService.getAll(filters)
      setEmployees(data)
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err)
      setError('Não foi possível carregar a lista de funcionários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees(filters)
  }, [filters])

  /**
   * Lida com a mudança na busca
   */
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters(prev => ({
      ...prev,
      search: term || undefined
    }))
  }

  /**
   * Redireciona para a página de detalhes do funcionário
   */
  const handleViewEmployee = (employee: Employee) => {
    router.push(`/funcionarios/${employee.id}`)
  }

  /**
   * Redireciona para a página de edição do funcionário
   */
  const handleEditEmployee = (employee: Employee) => {
    router.push(`/funcionarios/editar/${employee.id}`)
  }

  /**
   * Redireciona para a página de criação de funcionário
   */
  const handleAddEmployee = () => {
    router.push('/funcionarios/novo')
  }

  /**
   * Exclui um funcionário
   */
  const handleDeleteEmployee = async (employee: Employee) => {
    if (window.confirm(`Deseja realmente excluir o funcionário ${employee.name}?`)) {
      try {
        await employeeService.remove(employee.id)
        loadEmployees(filters) // Recarrega a lista após excluir
      } catch (err) {
        console.error('Erro ao excluir funcionário:', err)
        alert('Não foi possível excluir o funcionário.')
      }
    }
  }

  /**
   * Gera PDF com todos os funcionários
   */
  const handleGeneratePdf = async () => {
    try {
      const pdfUrl = await employeeService.generatePdf()
      window.open(pdfUrl, '_blank')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Não foi possível gerar o PDF.')
    }
  }

  /**
   * Gera PDF de um funcionário específico
   */
  const handleGenerateEmployeePdf = async (employee: Employee) => {
    try {
      const pdfUrl = await employeeService.generateEmployeePdf(employee.id)
      window.open(pdfUrl, '_blank')
    } catch (err) {
      console.error('Erro ao gerar PDF do funcionário:', err)
      alert('Não foi possível gerar o PDF do funcionário.')
    }
  }

  /**
   * Definição das colunas da tabela
   */
  const columns: Column<EmployeeResponse>[] = [
    {
      header: 'Nome',
      accessor: 'name',
      cell: (employee) => (
        <div className="flex items-center space-x-3">
          {employee.imageUrl ? (
            <img 
              src={employee.imageUrl} 
              alt={employee.name} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald text-white flex items-center justify-center text-xs">
              {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
          )}
          <span>{employee.name}</span>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'CPF',
      accessor: 'cpf',
      cell: (employee) => {
        // Formata o CPF (000.000.000-00)
        const cpf = employee.cpf
        if (cpf.length === 11) {
          return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`
        }
        return cpf
      }
    },
    {
      header: 'Salário',
      accessor: 'salary',
      cell: (employee) => {
        // Formata o salário como moeda
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(employee.salary)
      }
    },
    {
      header: 'Telefone',
      accessor: 'phone'
    },
    {
      header: 'Função',
      accessor: 'role',
      cell: (employee) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          employee.role === 'ADMIN' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {employee.role === 'ADMIN' ? 'Admin' : 'Usuário'}
        </span>
      )
    }
  ]

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        <p>{error}</p>
        <button 
          onClick={() => loadEmployees(filters)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DataTable
        data={employees}
        columns={columns}
        title="Lista de Funcionários"
        loading={loading}
        onGeneratePdf={handleGeneratePdf}
        onGenerateItemPdf={handleGenerateEmployeePdf}
        onAdd={handleAddEmployee}
        onSearch={handleSearch}
        addButtonLabel="Novo Funcionário"
        actions={{
          view: {
            enabled: true,
            onClick: handleViewEmployee
          },
          edit: {
            enabled: true,
            onClick: handleEditEmployee
          },
          delete: {
            enabled: true,
            onClick: handleDeleteEmployee
          }
        }}
      />
    </div>
  )
}