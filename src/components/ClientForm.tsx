'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Save } from 'lucide-react';
import FormCard from './FormCard';
import Input from './Input';
import ImageUpload from './ImageUpload';
import { CreateClientRequest, UpdateClientRequest, Client } from '../types/client';
import { FormErrors } from '../types/form';

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSubmit: (formData: CreateClientRequest | UpdateClientRequest, imageFile: File | null) => Promise<void>;
  isEditing?: boolean;
  returnUrl: string;
  title: string;
  subtitle?: string;
}

/**
 * Componente reutilizável para formulário de cliente (usado tanto para criar quanto para editar)
 */
const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
  returnUrl,
  title,
  subtitle
}) => {
  const router = useRouter();
  
  // Estados do formulário
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors<CreateClientRequest>>({});

  // Define os passos do formulário
  const steps = ['Informações Básicas', 'Endereço', 'Medidas'];

  // Dados do formulário inicializados com valores padrão ou dados existentes
  const [formData, setFormData] = useState<CreateClientRequest | UpdateClientRequest>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    cpfCnpj: initialData?.cpfCnpj || '',
    instagram: initialData?.instagram || '',
    street: initialData?.address?.street?.name || '',
    number: initialData?.address?.number || '',
    complement: initialData?.address?.complement || '',
    zipCode: initialData?.address?.zipCode || '',
    city: initialData?.address?.city?.name || '',
    state: initialData?.address?.city?.state?.name || '',
    shoulder: initialData?.measurements?.shoulder,
    bust: initialData?.measurements?.bust,
    shoulderToWaistLength: initialData?.measurements?.shoulderToWaistLength,
    shoulderToCosLength: initialData?.measurements?.shoulderToCosLength,
    tqcLength: initialData?.measurements?.tqcLength,
    waist: initialData?.measurements?.waist,
    cos: initialData?.measurements?.cos,
    hip: initialData?.measurements?.hip,
    shortSkirtLength: initialData?.measurements?.shortSkirtLength,
    longSkirtLength: initialData?.measurements?.longSkirtLength,
    shortLength: initialData?.measurements?.shortLength,
    pantsLength: initialData?.measurements?.pantsLength,
    dressLength: initialData?.measurements?.dressLength,
    sleeveLength: initialData?.measurements?.sleeveLength,
    wrist: initialData?.measurements?.wrist,
    frontMeasure: initialData?.measurements?.frontMeasure,
    shoulderToShoulderWidth: initialData?.measurements?.shoulderToShoulderWidth,
  });

  /**
   * Manipula mudanças nos campos de input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Identificar os campos de medidas usando uma verificação por nome
    const isMeasurementField = [
      'shoulder', 'bust', 'shoulderToWaistLength', 'shoulderToCosLength',
      'tqcLength', 'waist', 'cos', 'hip', 'shortSkirtLength', 'longSkirtLength',
      'shortLength', 'pantsLength', 'dressLength', 'sleeveLength', 'wrist',
      'frontMeasure', 'shoulderToShoulderWidth'
    ].includes(name);

    if (isMeasurementField) {
      // Para campos de medidas (todos tratados como texto)
      if (value === '') {
        // Campo vazio = undefined
        setFormData(prev => ({
          ...prev,
          [name]: undefined
        }));
      } else {
        // Validar se é um número válido
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setFormData(prev => ({
            ...prev,
            [name]: numValue
          }));
        }
      }
    } else if (name === 'cpfCnpj') {
      // Para CPF/CNPJ - aplica a formatação
      let formattedValue = value.replace(/\D/g, '');
      
      if (formattedValue.length <= 11) {
        // Formata como CPF
        if (formattedValue.length > 9) {
          formattedValue = formattedValue.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, '$1.$2.$3-$4');
        } else if (formattedValue.length > 6) {
          formattedValue = formattedValue.replace(/^(\d{3})(\d{3})(\d{0,3})$/, '$1.$2.$3');
        } else if (formattedValue.length > 3) {
          formattedValue = formattedValue.replace(/^(\d{3})(\d{0,3})$/, '$1.$2');
        }
      } else {
        // Formata como CNPJ
        if (formattedValue.length > 12) {
          formattedValue = formattedValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})$/, '$1.$2.$3/$4-$5');
        } else if (formattedValue.length > 8) {
          formattedValue = formattedValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})$/, '$1.$2.$3/$4');
        } else if (formattedValue.length > 5) {
          formattedValue = formattedValue.replace(/^(\d{2})(\d{3})(\d{0,3})$/, '$1.$2.$3');
        } else if (formattedValue.length > 2) {
          formattedValue = formattedValue.replace(/^(\d{2})(\d{0,3})$/, '$1.$2');
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else if (name === 'phone') {
      // Para telefone - aplica a formatação
      let formattedValue = value.replace(/\D/g, '');
      
      if (formattedValue.length > 10) {
        formattedValue = formattedValue.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (formattedValue.length > 6) {
        formattedValue = formattedValue.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
      } else if (formattedValue.length > 2) {
        formattedValue = formattedValue.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else if (name === 'zipCode') {
      // Para CEP - aplica a formatação
      let formattedValue = value.replace(/\D/g, '');
      
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      // Para outros campos
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpa o erro quando o campo é modificado
    if (errors[name as keyof CreateClientRequest]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof CreateClientRequest];
        return newErrors;
      });
    }
  };

  /**
   * Manipula a seleção de imagem
   */
  const handleImageChange = (file: File | null) => {
    setImageFile(file);
  };

  /**
   * Valida o passo atual do formulário
   */
  const validateCurrentStep = (): boolean => {
    let hasErrors = false;
    const newErrors: FormErrors<CreateClientRequest> = {};
    
    if (currentStep === 0) {
      // Validar informações básicas
      if (!formData.name) {
        newErrors.name = 'Nome é obrigatório';
        hasErrors = true;
      }
      
      if (!formData.email) {
        newErrors.email = 'E-mail é obrigatório';
        hasErrors = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'E-mail inválido';
        hasErrors = true;
      }
      
      if (!formData.phone) {
        newErrors.phone = 'Telefone é obrigatório';
        hasErrors = true;
      } else if (formData.phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Telefone inválido';
        hasErrors = true;
      }
      
      if (!formData.cpfCnpj) {
        newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório';
        hasErrors = true;
      } else {
        const cleaned = formData.cpfCnpj.replace(/\D/g, '');
        if (cleaned.length !== 11 && cleaned.length !== 14) {
          newErrors.cpfCnpj = 'CPF/CNPJ inválido';
          hasErrors = true;
        }
      }
    } else if (currentStep === 1) {
      // Validar endereço
      if (!formData.street) {
        newErrors.street = 'Rua é obrigatória';
        hasErrors = true;
      }
      
      if (!formData.number) {
        newErrors.number = 'Número é obrigatório';
        hasErrors = true;
      }
      
      if (!formData.zipCode) {
        newErrors.zipCode = 'CEP é obrigatório';
        hasErrors = true;
      } else if (formData.zipCode.replace(/\D/g, '').length !== 8) {
        newErrors.zipCode = 'CEP inválido';
        hasErrors = true;
      }
      
      if (!formData.city) {
        newErrors.city = 'Cidade é obrigatória';
        hasErrors = true;
      }
      
      if (!formData.state) {
        newErrors.state = 'Estado é obrigatório';
        hasErrors = true;
      }
    }
    // Medidas são opcionais, não precisamos validar
    
    setErrors(newErrors);
    return !hasErrors;
  };

  /**
   * Avança para o próximo passo
   */
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  /**
   * Volta para o passo anterior
   */
  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  /**
   * Navega diretamente para um passo específico
   */
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  /**
   * Previne a submissão quando o usuário pressiona Enter
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Opcionalmente avançar para o próximo passo ao pressionar Enter
      if (currentStep < steps.length - 1) {
        handleNextStep();
      }
    }
  };

  /**
   * Processa a submissão do formulário
   */
  const handleSubmit = async () => {
    // Validar passo atual
    if (!validateCurrentStep()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Enviar dados para o callback passado como prop
      await onSubmit(formData, imageFile);
      
      // Navegar de volta à página de listagem
      router.push(returnUrl);
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      
      // Tratar erros de validação da API, se necessário
      if (error instanceof Error) {
        // Exibir mensagem de erro ou atualizar estado de erros
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renderiza o conteúdo do passo atual
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Nome Completo"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                error={errors.name}
                required
              />
              
              <Input
                label="E-mail"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                error={errors.email}
                required
              />
              
              <Input
                label="Telefone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                error={errors.phone}
                placeholder="(99) 99999-9999"
                required
              />
              
              <Input
                label="CPF/CNPJ"
                name="cpfCnpj"
                value={formData.cpfCnpj || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                error={errors.cpfCnpj}
                placeholder="123.456.789-01 ou 12.345.678/0001-90"
                required
              />
              
              <Input
                label="Instagram"
                name="instagram"
                value={formData.instagram || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                error={errors.instagram}
                placeholder="@usuário"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-clash mb-2">Foto do Cliente</label>
              <ImageUpload
                initialImage={initialData?.imageUrl}
                onImageChange={handleImageChange}
                className="mb-4"
              />
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Rua"
                name="street"
                value={formData.street || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                error={errors.street}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Número"
                  name="number"
                  value={formData.number || ''}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  error={errors.number}
                  required
                />
                
                <Input
                  label="Complemento"
                  name="complement"
                  value={formData.complement || ''}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  error={errors.complement}
                />
              </div>
              
              <Input
                label="CEP"
                name="zipCode"
                value={formData.zipCode || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                error={errors.zipCode}
                placeholder="12345-678"
                required
              />
            </div>
            
            <div>
              <Input
                label="Cidade"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                error={errors.city}
                required
              />
              
              <Input
                label="Estado"
                name="state"
                value={formData.state || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                error={errors.state}
                required
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Ombro (cm)"
              name="shoulder"
              type="text" 
              value={formData.shoulder !== undefined ? String(formData.shoulder) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.shoulder}
            />
            
            <Input
              label="Busto (cm)"
              name="bust"
              type="text"
              value={formData.bust !== undefined ? String(formData.bust) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.bust}
            />
            
            <Input
              label="Ombro até cintura (cm)"
              name="shoulderToWaistLength"
              type="text"
              value={formData.shoulderToWaistLength !== undefined ? String(formData.shoulderToWaistLength) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.shoulderToWaistLength}
            />
            
            <Input
              label="Ombro até cos (cm)"
              name="shoulderToCosLength"
              type="text"
              value={formData.shoulderToCosLength !== undefined ? String(formData.shoulderToCosLength) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.shoulderToCosLength}
            />
            
            <Input
              label="Comprimento T.Q.C. (cm)"
              name="tqcLength"
              type="text"
              value={formData.tqcLength !== undefined ? String(formData.tqcLength) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.tqcLength}
            />
            
            <Input
              label="Cintura (cm)"
              name="waist"
              type="text"
              value={formData.waist !== undefined ? String(formData.waist) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.waist}
            />
            
            <Input
              label="Cos (cm)"
              name="cos"
              type="text"
              value={formData.cos !== undefined ? String(formData.cos) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.cos}
            />
            
            <Input
              label="Quadril (cm)"
              name="hip"
              type="text"
              value={formData.hip !== undefined ? String(formData.hip) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.hip}
            />
            
            <Input
              label="Saia Curta (cm)"
              name="shortSkirtLength"
              type="text"
              value={formData.shortSkirtLength !== undefined ? String(formData.shortSkirtLength) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.shortSkirtLength}
            />
            
            <Input
              label="Saia Longa (cm)"
              name="longSkirtLength"
              type="text"
              value={formData.longSkirtLength !== undefined ? String(formData.longSkirtLength) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.longSkirtLength}
            />
            
            <Input
              label="Comprimento Short (cm)"
              name="shortLength"
              type="text"
              value={formData.shortLength !== undefined ? String(formData.shortLength) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.shortLength}
            />
            
            <Input
              label="Comprimento Calça (cm)"
              name="pantsLength"
              type="text"
              value={formData.pantsLength !== undefined ? String(formData.pantsLength) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.pantsLength}
            />
            
            <Input
              label="Comprimento Vestido (cm)"
              name="dressLength"
              type="text"
              value={formData.dressLength !== undefined ? String(formData.dressLength) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.dressLength}
            />
            
            <Input
              label="Comprimento Manga (cm)"
              name="sleeveLength"
              type="text"
              value={formData.sleeveLength !== undefined ? String(formData.sleeveLength) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.sleeveLength}
            />
            
            <Input
              label="Punho (cm)"
              name="wrist"
              type="text"
              value={formData.wrist !== undefined ? String(formData.wrist) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.wrist}
            />
            
            <Input
              label="Medida Frente (cm)"
              name="frontMeasure"
              type="text"
              value={formData.frontMeasure !== undefined ? String(formData.frontMeasure) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.frontMeasure}
            />
            
            <Input
              label="Ombro a Ombro (cm)"
              name="shoulderToShoulderWidth"
              type="text"
              value={formData.shoulderToShoulderWidth !== undefined ? String(formData.shoulderToShoulderWidth) : ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              error={errors.shoulderToShoulderWidth}
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  /**
   * Renderiza os botões de ação
   */
  const renderActions = () => (
    <div className="flex justify-between">
      <button
        type="button"
        onClick={() => router.push(returnUrl)}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
      >
        <ArrowLeft size={16} className="mr-2" />
        Cancelar
      </button>
      
      <div className="flex space-x-3">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handlePreviousStep}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
            disabled={loading}
          >
            <ArrowLeft size={16} className="mr-2" />
            Anterior
          </button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90 light-sweep-button flex items-center"
            disabled={loading}
          >
            Próximo
            <ArrowRight size={16} className="ml-2" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90 light-sweep-button flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              <>
                {isEditing ? (
                  <>
                    <Save size={16} className="mr-2" />
                    Salvar Alterações
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Finalizar Cadastro
                  </>
                )}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push(returnUrl)}
          className="p-2 bg-soft-ivory text-steel-gray rounded-md hover:bg-opacity-90 mr-3"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-boska text-white">{title}</h1>
      </div>

      <div onKeyDown={handleKeyDown}>
        <FormCard
          title={isEditing ? "Editar Informações do Cliente" : "Cadastro de Novo Cliente"}
          subtitle={subtitle || "Preencha as informações do cliente"}
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          actions={renderActions()}
        >
          {renderStepContent()}
        </FormCard>
      </div>
    </div>
  );
};

export default ClientForm;