'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import FormCard from '../../../../../components/FormCard'
import Input from '../../../../../components/Input'
import ImageUpload from '../../../../../components/ImageUpload'
import { employeeService } from '../../../../../services/employeeService'
import { EmployeeResponse, UpdateEmployeeRequest, Role } from '../../../../../types/employee'
import { z } from 'zod'

// Schema de validação do formulário
const employeeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  salary: z.number().min(1, 'Salário é obrigatório'),
  workHours: z.string().min(1, 'Horário de trabalho é obrigatório'),
  birthday: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  zipCode: z.string().min(8, 'CEP é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
})

// Componente principal
const EditEmployeePage = () => {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  
  const [employee, setEmployee] = useState<EmployeeResponse | null>(null)
  const [formData, setFormData] = useState<UpdateEmployeeRequest>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Estado para o arquivo de imagem
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Carrega os dados do funcionário
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true)
        const data = await employeeService.getById(employeeId)
        setEmployee(data)
        
        // Preenche o formulário com os dados existentes
        setFormData({
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          phone: data.phone,
          salary: data.salary,
          workHours: data.workHours,
          birthday: data.birthday || '',
          role: data.role as Role,
          street: data.address?.street.name || '',
          number: data.address?.number || '',
          complement: data.address?.complement || '',
          zipCode: data.address?.zipCode || '',
          city: data.address?.city.name || '',
          state: data.address?.city.state.name || '',
        })
      } catch (error) {
        console.error('Erro ao carregar funcionário:', error)
        alert('Não foi possível carregar os dados do funcionário.')
        router.push('/funcionarios')
      } finally {
        setLoading(false)
      }
    }

    if (employeeId) {
      fetchEmployee()
    }
  }, [employeeId, router])

  // Manipuladores de eventos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    
    // Lida com campos numéricos
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
    
    // Limpa o erro ao editar o campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      })
    }
  }

  // Validação do formulário
  const validateForm = (): boolean => {
    try {
      employeeSchema.parse(formData)
      setFormErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[String(err.path[0])] = err.message
          }
        })
        setFormErrors(errors)
      }
      return false
    }
  }

  // Envia o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSaving(true)
    
    try {
      // Atualiza os dados do funcionário
      await employeeService.update(employeeId, formData)
      
      // Se tivermos um novo arquivo de imagem, fazer upload
      if (imageFile) {
        await employeeService.uploadImage(employeeId, imageFile)
      }
      
      router.push(`/funcionarios/${employeeId}`)
    } catch (error: any) {
      // Trata os erros da API
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      } else {
        alert('Erro ao atualizar funcionário')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-light-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">Carregando dados do funcionário...</p>
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

  // Renderiza os botões de ação
  const renderActionButtons = () => {
    return (
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push(`/funcionarios/${employeeId}`)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={saving}
          className="flex items-center px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90 disabled:bg-opacity-70 disabled:cursor-not-allowed light-sweep-button"
        >
          {saving ? (
            <>
              <span className="animate-spin mr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
              Salvando...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(`/funcionarios/${employeeId}`)}
            className="p-2 bg-soft-ivory text-steel-gray rounded-md hover:bg-opacity-90"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-boska text-white">Editar Funcionário</h1>
        </div>
      </div>

      {/* Formulário com o novo FormCard */}
      <FormCard
        title="Informações do Funcionário"
        actions={renderActionButtons()}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna 1: Informações Pessoais */}
            <div className="space-y-4">
              <h2 className="text-lg font-clash text-steel-gray border-b border-gray-200 pb-2 mb-4">
                Informações Pessoais
              </h2>
              
              {/* Image upload component */}
              <div className="mb-8">
                <h3 className="text-center font-clash text-steel-gray mb-4">Foto do Perfil</h3>
                <ImageUpload
                  initialImage={employee?.imageUrl}
                  onImageChange={(file) => setImageFile(file)}
                  className="mx-auto"
                />
              </div>
              
              <Input
                label="Nome Completo"
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={handleInputChange}
                error={formErrors.name}
                required
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                error={formErrors.email}
                required
              />
              
              <Input
                label="CPF"
                name="cpf"
                type="text"
                value={formData.cpf || ''}
                onChange={handleInputChange}
                error={formErrors.cpf}
                placeholder="000.000.000-00"
                required
              />
              
              <Input
                label="Telefone"
                name="phone"
                type="text"
                value={formData.phone || ''}
                onChange={handleInputChange}
                error={formErrors.phone}
                placeholder="(00) 00000-0000"
                required
              />
              
              <Input
                label="Data de Nascimento"
                name="birthday"
                type="date"
                value={formData.birthday || ''}
                onChange={handleInputChange}
                error={formErrors.birthday}
              />
            </div>
            
            {/* Coluna 2: Informações Profissionais */}
            <div className="space-y-4">
              <h2 className="text-lg font-clash text-steel-gray border-b border-gray-200 pb-2 mb-4">
                Informações Profissionais
              </h2>
              
              <Input
                label="Salário"
                name="salary"
                type="number"
                value={formData.salary?.toString() || ''}
                onChange={handleInputChange}
                error={formErrors.salary}
                required
              />
              
              <Input
                label="Horário de Trabalho"
                name="workHours"
                type="text"
                value={formData.workHours || ''}
                onChange={handleInputChange}
                error={formErrors.workHours}
                placeholder="Ex: Seg-Sex 08:00-17:00"
                required
              />
              
              <div className="mb-4 font-clash">
                <div className="label-container">
                  <label className="text-steel-gray font-medium">Função</label>
                </div>
                <select
                  name="role"
                  value={formData.role || 'USER'}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 focus:outline-none border-b-2 border-light-yellow bg-transparent"
                >
                  <option value="USER">Usuário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                {formErrors.role && (
                  <span className="text-red-500 text-sm mt-1 block">{formErrors.role}</span>
                )}
              </div>
              
              {/* Endereço */}
              <h2 className="text-lg font-clash text-steel-gray border-b border-gray-200 pb-2 mb-4">
                Endereço
              </h2>
              
              <Input
                label="Rua"
                name="street"
                type="text"
                value={formData.street || ''}
                onChange={handleInputChange}
                error={formErrors.street}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Número"
                  name="number"
                  type="text"
                  value={formData.number || ''}
                  onChange={handleInputChange}
                  error={formErrors.number}
                  required
                />
                
                <Input
                  label="Complemento"
                  name="complement"
                  type="text"
                  value={formData.complement || ''}
                  onChange={handleInputChange}
                  error={formErrors.complement}
                />
              </div>
              
              <Input
                label="CEP"
                name="zipCode"
                type="text"
                value={formData.zipCode || ''}
                onChange={handleInputChange}
                error={formErrors.zipCode}
                placeholder="00000-000"
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Cidade"
                  name="city"
                  type="text"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  error={formErrors.city}
                  required
                />
                
                <Input
                  label="Estado"
                  name="state"
                  type="text"
                  value={formData.state || ''}
                  onChange={handleInputChange}
                  error={formErrors.state}
                  required
                />
              </div>
            </div>
          </div>
        </form>
      </FormCard>
    </div>
  )
}

export default EditEmployeePage