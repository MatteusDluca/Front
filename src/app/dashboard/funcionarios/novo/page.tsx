'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, ArrowRight } from 'lucide-react'
import FormCard from '../../../../components/FormCard'
import Input from '../../../../components/Input'
import ImageUpload from '../../../../components/ImageUpload'
import { employeeService } from '../../../../services/employeeService'
import { CreateEmployeeRequest, Role } from '../../../../types/employee'
import { z } from 'zod'

// Schemas de validação para cada etapa
const personalInfoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  // Removed password field as CPF will be used as password
})

const jobInfoSchema = z.object({
  salary: z.number().min(1, 'Salário é obrigatório'),
  workHours: z.string().min(1, 'Horário de trabalho é obrigatório'),
  birthday: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']),
})

const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  zipCode: z.string().min(8, 'CEP é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
})

// Componente principal
const NewEmployeePage = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Estado para o arquivo de imagem
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  // Estado do formulário - removed password field
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    salary: 0,
    workHours: '',
    birthday: '',
    role: 'USER',
    street: '',
    number: '',
    zipCode: '',
    city: '',
    state: '',
  })

  // Definição dos passos
  const steps = ['Informações Pessoais', 'Informações Profissionais', 'Endereço']

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

  // Validação do passo atual
  const validateCurrentStep = (): boolean => {
    try {
      switch (currentStep) {
        case 0:
          personalInfoSchema.parse(formData)
          break
        case 1:
          jobInfoSchema.parse(formData)
          break
        case 2:
          addressSchema.parse(formData)
          break
      }
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

  // Avança para o próximo passo
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  // Retorna ao passo anterior
  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  // Alterna para um passo específico
  const handleStepClick = (stepIndex: number) => {
    // Só permite ir para passos anteriores ou se o passo atual for válido
    if (stepIndex < currentStep || validateCurrentStep()) {
      setCurrentStep(stepIndex)
    }
  }

  // Envia o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valida o passo final
    if (!validateCurrentStep()) {
      return
    }
    
    setLoading(true)
    
    try {
      // Adiciona o CPF como senha
      const employeeData = {
        ...formData,
        password: formData.cpf, // Using CPF as password
      }
      
      // Criar funcionário primeiro
      const employee = await employeeService.create(employeeData)
      
      // Se tivermos um arquivo de imagem, fazer upload
      if (imageFile && employee.id) {
        await employeeService.uploadImage(employee.id, imageFile)
      }
      
      router.push('/funcionarios')
    } catch (error: any) {
      // Trata os erros da API
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      } else {
        alert('Erro ao cadastrar funcionário')
      }
    } finally {
      setLoading(false)
    }
  }

  // Renderiza o conteúdo com base no passo atual
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            {/* Componente de upload de imagem */}
            <div className="mb-8">
              <h3 className="font-clash text-steel-gray mb-4 text-center">Foto do Perfil</h3>
              <ImageUpload
                onImageChange={(file) => setImageFile(file)}
                className="mx-auto"
              />
            </div>
            
            <Input
              label="Nome Completo"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              error={formErrors.name}
              required
            />
            
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
              required
            />
            
            <Input
              label="CPF"
              name="cpf"
              type="text"
              value={formData.cpf}
              onChange={handleInputChange}
              error={formErrors.cpf}
              placeholder="000.000.000-00"
              required
            />
            
            <Input
              label="Telefone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleInputChange}
              error={formErrors.phone}
              placeholder="(00) 00000-0000"
              required
            />
            
            {/* Note about CPF being used as password */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>Nota:</strong> O CPF será utilizado como senha inicial do funcionário.
              </p>
            </div>
          </div>
        )
      
      case 1:
        return (
          <div className="space-y-4">
            <Input
              label="Salário"
              name="salary"
              type="number"
              value={formData.salary.toString()}
              onChange={handleInputChange}
              error={formErrors.salary}
              required
            />
            
            <Input
              label="Horário de Trabalho"
              name="workHours"
              type="text"
              value={formData.workHours}
              onChange={handleInputChange}
              error={formErrors.workHours}
              placeholder="Ex: Seg-Sex 08:00-17:00"
              required
            />
            
            <Input
              label="Data de Nascimento"
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleInputChange}
              error={formErrors.birthday}
            />
            
            <div className="mb-4 font-clash">
              <div className="label-container">
                <label className="text-steel-gray font-medium">Função</label>
              </div>
              <select
                name="role"
                value={formData.role}
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
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <Input
              label="Rua"
              name="street"
              type="text"
              value={formData.street}
              onChange={handleInputChange}
              error={formErrors.street}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Número"
                name="number"
                type="text"
                value={formData.number}
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
              value={formData.zipCode}
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
                value={formData.city}
                onChange={handleInputChange}
                error={formErrors.city}
                required
              />
              
              <Input
                label="Estado"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleInputChange}
                error={formErrors.state}
                required
              />
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  // Renderiza o formulário com os botões de ação
  const renderActionButtons = () => {
    return (
      <div className="flex justify-between">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handlePreviousStep}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <ArrowLeft size={18} className="mr-2" />
            Anterior
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push('/funcionarios')}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <ArrowLeft size={18} className="mr-2" />
            Cancelar
          </button>
        )}

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="flex items-center px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90 light-sweep-button"
          >
            Próximo
            <ArrowRight size={18} className="ml-2" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90 disabled:bg-opacity-70 disabled:cursor-not-allowed light-sweep-button"
          >
            {loading ? (
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
                Salvar
              </>
            )}
          </button>
        )}
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
            className="p-2 bg-soft-ivory text-steel-gray rounded-md hover:bg-opacity-90"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-boska text-white">Novo Funcionário</h1>
        </div>
      </div>

      {/* Formulário com o novo FormCard */}
      <FormCard
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        actions={renderActionButtons()}
      >
        <form onSubmit={handleSubmit}>
          {renderStepContent()}
        </form>
      </FormCard>
    </div>
  )
}

export default NewEmployeePage