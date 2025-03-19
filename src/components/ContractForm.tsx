'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Save, Trash2, Plus } from 'lucide-react';
import FormCard from './FormCard';
import Input from './Input';
import { 
  Contract, ContractStatus, CreateContractRequest, 
  PaymentMethod, DiscountType, UpdateContractRequest,
  CreateContractItem, CreatePayment
} from '../types';
import { contractApi } from '../services/contract-api';
import { Client } from '../types/client';
import { Event } from '../types/event';
import { Location } from '../types/location';
import { Product } from '../types/product';

interface ContractFormProps {
  initialData?: Contract;
  onSubmit?: (formData: CreateContractRequest | UpdateContractRequest) => Promise<void>;
  isEditing?: boolean;
  returnUrl: string;
  title: string;
  subtitle?: string;
}

/**
 * Componente reutilizável para formulário de contrato (usado tanto para criar quanto para editar)
 */
const ContractForm: React.FC<ContractFormProps> = ({
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para dados externos
  const [clients, setClients] = useState<Client[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Estado do formulário
  const [formData, setFormData] = useState<CreateContractRequest>({
    clientId: '',
    eventId: '',
    locationId: '',
    status: ContractStatus.ACTIVE,
    pickupDate: new Date().toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    needsAdjustment: false,
    items: [],
    payments: []
  });

  // Define os passos do formulário
  const steps = ['Informações Básicas', 'Produtos', 'Pagamento', 'Revisão'];

  // Efeito para carregar os dados
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Importações dinâmicas para evitar problemas de dependência circular
        const { clientsApi } = await import('../lib/clients-api');
        const { eventApi } = await import('../services/event-api');
        const { locationApi } = await import('@/services/location-api');
        const { productApi } = await import('@/services');
        
        // Carregar dados necessários para o formulário
        const [clientsData, eventsData, locationsData, productsData] = await Promise.all([
          clientsApi.getAll(),
          eventApi.getAll(),
          locationApi.getAll(),
          productApi.getAll()
        ]);
        
        setClients(clientsData);
        setEvents(eventsData);
        setLocations(locationsData);
        
        // Filtrar apenas produtos disponíveis, a menos que esteja editando
        // e o produto já esteja associado ao contrato
        if (isEditing && initialData) {
          const contractProductIds = initialData.items.map(item => item.productId);
          
          // Incluir produtos que já estão no contrato, independente do status
          setProducts(productsData.filter(p => 
            p.status === 'AVAILABLE' || contractProductIds.includes(p.id)
          ));
        } else {
          // Para novo contrato, apenas produtos disponíveis
          setProducts(productsData.filter(p => p.status === 'AVAILABLE'));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setErrors({ form: 'Erro ao carregar dados necessários. Tente novamente.' });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [isEditing, initialData]);

  // Efeito para preencher o formulário com dados existentes se estiver editando
  useEffect(() => {
    if (isEditing && initialData) {
      // Preparar os itens e pagamentos no formato correto
      const contractItems: CreateContractItem[] = initialData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitValue: item.unitValue
      }));
      
      const contractPayments: CreatePayment[] = initialData.payments.map(payment => ({
        method: payment.method,
        totalValue: payment.totalValue,
        discountType: payment.discountType,
        discountValue: payment.discountValue !== undefined ? payment.discountValue : undefined,
        finalValue: payment.finalValue,
        notes: payment.notes
      }));
      
      // Formatar datas no formato ISO para o input date
      const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      // Atualizar formData com os dados iniciais
      setFormData({
        clientId: initialData.clientId,
        eventId: initialData.eventId || '',
        locationId: initialData.locationId || '',
        status: initialData.status,
        fittingDate: formatDate(initialData.fittingDate),
        pickupDate: formatDate(initialData.pickupDate),
        returnDate: formatDate(initialData.returnDate),
        needsAdjustment: initialData.needsAdjustment,
        observations: initialData.observations,
        items: contractItems,
        payments: contractPayments
      });
    }
  }, [isEditing, initialData]);

  /**
   * Manipula mudanças nos campos de input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Para checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpa o erro quando o campo é modificado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Adiciona um novo item ao contrato
   */
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        quantity: 1,
        unitValue: 0
      }]
    }));
  };

  /**
   * Atualiza um item do contrato
   */
  const updateItem = (index: number, field: string, value: any) => {
    // Se o campo for productId, também atualize o preço unitário com o valor do produto
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      
      setFormData(prev => {
        const newItems = [...prev.items];
        newItems[index] = {
          ...newItems[index],
          [field]: value,
          unitValue: product ? product.rentalValue : 0
        };
        return { ...prev, items: newItems };
      });
    } else {
      setFormData(prev => {
        const newItems = [...prev.items];
        newItems[index] = {
          ...newItems[index],
          [field]: field === 'quantity' ? parseInt(value) : 
                   field === 'unitValue' ? parseFloat(value) : value
        };
        return { ...prev, items: newItems };
      });
    }
  };

  /**
   * Remove um item do contrato
   */
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  /**
   * Adiciona um novo pagamento ao contrato
   */
  const addPayment = () => {
    setFormData(prev => ({
      ...prev,
      payments: [...prev.payments, {
        method: PaymentMethod.PIX,
        totalValue: calculateItemsTotal(),
        discountType: undefined,
        discountValue: undefined,
        finalValue: calculateItemsTotal()
      }]
    }));
  };

  /**
   * Atualiza um pagamento do contrato
   */
  const updatePayment = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newPayments = [...prev.payments];
      
      if (field === 'discountType') {
        // Se o tipo de desconto for removido, também remova o valor de desconto
        if (!value) {
          newPayments[index] = {
            ...newPayments[index],
            discountType: undefined,
            discountValue: undefined
          };
        } else {
          newPayments[index] = {
            ...newPayments[index],
            [field]: value
          };
        }
      } else if (field === 'discountValue') {
        // Garanta que discountValue seja um número ou null, nunca undefined ou string vazia
        const numValue = value === '' || value === undefined ? null : Number(value);
        newPayments[index] = {
          ...newPayments[index],
          discountValue: numValue !== null ? numValue : undefined
        };
        
        // Recalcule o valor final se houver desconto
        const { totalValue, discountType } = newPayments[index];
        let finalValue = totalValue;
        
        if (discountType && numValue !== null) {
          if (discountType === DiscountType.PERCENTAGE) {
            finalValue = totalValue * (1 - (numValue / 100));
          } else {
            finalValue = totalValue - numValue;
          }
          // Garantir que o valor final não seja negativo
          finalValue = Math.max(0, finalValue);
          newPayments[index].finalValue = finalValue;
        }
      } else {
        // Para outros campos, convertemos para número se aplicável
        let processedValue = value;
        if (field === 'totalValue' || field === 'finalValue') {
          processedValue = Number(value);
          
          // Se estiver atualizando o valor total, também atualize o valor final 
          // se não houver desconto aplicado
          if (field === 'totalValue') {
            const payment = newPayments[index];
            if (!payment.discountType || payment.discountValue === null) {
              newPayments[index].finalValue = processedValue;
            } else {
              // Recalcule o desconto com o novo valor total
              let finalValue = processedValue;
              if (payment.discountType === DiscountType.PERCENTAGE && payment.discountValue !== null) {
                finalValue = processedValue * (1 - ((payment.discountValue ?? 0) / 100));
              } else if (payment.discountValue !== null) {
                finalValue = processedValue - (payment.discountValue ?? 0);
              }
              newPayments[index].finalValue = Math.max(0, finalValue);
            }
          }
        }
        
        newPayments[index] = {
          ...newPayments[index],
          [field]: processedValue
        };
      }
      
      return { ...prev, payments: newPayments };
    });
  };

  /**
   * Remove um pagamento do contrato
   */
  const removePayment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index)
    }));
  };

  /**
   * Calcula o total de itens do contrato
   */
  const calculateItemsTotal = (): number => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unitValue);
    }, 0);
  };

  /**
   * Calcula o total de pagamentos do contrato
   */
  const calculatePaymentsTotal = (): number => {
    return formData.payments.reduce((total, payment) => {
      return total + payment.finalValue;
    }, 0);
  };

  /**
   * Valida o passo atual do formulário
   */
  const validateCurrentStep = (): boolean => {
    let hasErrors = false;
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 0) {
      // Validar informações básicas
      if (!formData.clientId) {
        newErrors.clientId = 'Cliente é obrigatório';
        hasErrors = true;
      }
      
      // Validar datas
      if (!formData.pickupDate) {
        newErrors.pickupDate = 'Data de retirada é obrigatória';
        hasErrors = true;
      }
      
      if (!formData.returnDate) {
        newErrors.returnDate = 'Data de devolução é obrigatória';
        hasErrors = true;
      }
      
      // Validar que data de devolução é posterior à de retirada
      if (formData.pickupDate && formData.returnDate) {
        const pickupDate = new Date(formData.pickupDate);
        const returnDate = new Date(formData.returnDate);
        
        if (returnDate <= pickupDate) {
          newErrors.returnDate = 'Data de devolução deve ser posterior à data de retirada';
          hasErrors = true;
        }
      }
      
      // Validar que data de prova é anterior à de retirada
      if (formData.fittingDate && formData.pickupDate) {
        const fittingDate = new Date(formData.fittingDate);
        const pickupDate = new Date(formData.pickupDate);
        
        if (fittingDate > pickupDate) {
          newErrors.fittingDate = 'Data da prova deve ser anterior à data de retirada';
          hasErrors = true;
        }
      }
    } else if (currentStep === 1) {
      // Validar itens
      if (formData.items.length === 0) {
        newErrors.items = 'Adicione pelo menos um item ao contrato';
        hasErrors = true;
      } else {
        // Validar cada item
        formData.items.forEach((item, index) => {
          if (!item.productId) {
            newErrors[`items[${index}].productId`] = 'Selecione um produto';
            hasErrors = true;
          }
          
          if (item.quantity <= 0) {
            newErrors[`items[${index}].quantity`] = 'Quantidade deve ser maior que zero';
            hasErrors = true;
          }
          
          if (item.unitValue <= 0) {
            newErrors[`items[${index}].unitValue`] = 'Valor unitário deve ser maior que zero';
            hasErrors = true;
          }
        });
      }
    } else if (currentStep === 2) {
      // Validar pagamentos
      if (formData.payments.length === 0) {
        newErrors.payments = 'Adicione pelo menos uma forma de pagamento';
        hasErrors = true;
      } else {
        // Validar cada pagamento
        formData.payments.forEach((payment, index) => {
          if (!payment.method) {
            newErrors[`payments[${index}].method`] = 'Selecione um método de pagamento';
            hasErrors = true;
          }
          
          if (payment.totalValue <= 0) {
            newErrors[`payments[${index}].totalValue`] = 'Valor total deve ser maior que zero';
            hasErrors = true;
          }
          
          if (payment.finalValue <= 0) {
            newErrors[`payments[${index}].finalValue`] = 'Valor final deve ser maior que zero';
            hasErrors = true;
          }
          
          // Validar desconto
          if (payment.discountType && (payment.discountValue === undefined || payment.discountValue === null)) {
            newErrors[`payments[${index}].discountValue`] = 'Informe o valor do desconto';
            hasErrors = true;
          }
          
          if (!payment.discountType && payment.discountValue !== undefined && payment.discountValue !== null) {
            newErrors[`payments[${index}].discountType`] = 'Selecione o tipo de desconto';
            hasErrors = true;
          }
          
          // Validar percentual de desconto
          if (payment.discountType === DiscountType.PERCENTAGE && payment.discountValue !== undefined && 
              payment.discountValue !== null && (payment.discountValue < 0 || payment.discountValue > 100)) {
            newErrors[`payments[${index}].discountValue`] = 'Percentual deve estar entre 0 e 100';
            hasErrors = true;
          }
          
          // Validar valor fixo de desconto
          if (payment.discountType === DiscountType.FIXED && payment.discountValue !== undefined && 
              payment.discountValue !== null && payment.discountValue > payment.totalValue) {
            newErrors[`payments[${index}].discountValue`] = 'Desconto não pode ser maior que o valor total';
            hasErrors = true;
          }
        });
        
        // Verificar se não há diferença muito grande entre itens e pagamentos
        // Permite descontos razoáveis (até 50%)
        const itemsTotal = calculateItemsTotal();
        const paymentsTotal = calculatePaymentsTotal();
        
        // Se o total de pagamentos for significativamente maior que o total de itens (10% acima)
        if (paymentsTotal > itemsTotal * 1.1) {
          newErrors.paymentTotal = `Total de pagamentos (R$ ${paymentsTotal.toFixed(2)}) é muito maior que o total de itens (R$ ${itemsTotal.toFixed(2)})`;
          hasErrors = true;
        }
        
        // Se o total de pagamentos for muito menor que seria razoável com descontos
        // (50% do valor total seria o desconto máximo aceitável)
        if (paymentsTotal < itemsTotal * 0.5) {
          newErrors.paymentTotal = `Total de pagamentos (R$ ${paymentsTotal.toFixed(2)}) é muito menor que o total de itens (R$ ${itemsTotal.toFixed(2)})`;
          hasErrors = true;
        }
      }
    }
    
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
    // Só permite ir para passos anteriores ou se o passo atual for válido
    if (stepIndex < currentStep || validateCurrentStep()) {
      setCurrentStep(stepIndex);
    }
  };

  /**
   * Processa a submissão do formulário
   */
  const handleSubmit = async () => {
    // Validar todos os passos antes de enviar
    setCurrentStep(0);
    if (!validateCurrentStep()) return;
    
    setCurrentStep(1);
    if (!validateCurrentStep()) return;
    
    setCurrentStep(2);
    if (!validateCurrentStep()) return;
    
    // Voltar para o passo de revisão
    setCurrentStep(3);
    
    try {
      setLoading(true);
      
      // Preparar os dados para o envio
      const formattedData = {
        ...formData,
        // Garantir que todos os campos numéricos sejam números
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitValue: Number(item.unitValue)
        })),
        payments: formData.payments.map(payment => ({
          method: payment.method,
          totalValue: Number(payment.totalValue),
          finalValue: Number(payment.finalValue),
          // Garantir que discountType e discountValue sejam null quando não há desconto
          discountType: payment.discountType || undefined,
          discountValue: payment.discountValue !== undefined && payment.discountValue !== null 
            ? Number(payment.discountValue) 
            : undefined,
          notes: payment.notes || undefined
        }))
      };
      
      // Se tiver um callback de submissão personalizado, use-o
      if (onSubmit) {
        await onSubmit(formattedData);
      } else {
        // Caso contrário, use a API diretamente
        if (isEditing && initialData) {
          await contractApi.update(initialData.id, formattedData);
        } else {
          await contractApi.create(formattedData);
        }
      }
      
      // Navegar de volta à página de listagem
      router.push(returnUrl);
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      setErrors({ form: 'Erro ao salvar contrato. Verifique os dados e tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renderiza o conteúdo do passo de informações básicas
   */
  const renderBasicInfoStep = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Cliente *</label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Evento</label>
            <select
              name="eventId"
              value={formData.eventId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione um evento (opcional)</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Local</label>
            <select
              name="locationId"
              value={formData.locationId}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione um local (opcional)</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Data da Prova</label>
            <input
              type="date"
              name="fittingDate"
              value={formData.fittingDate || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {errors.fittingDate && (
              <p className="text-red-500 text-sm mt-1">{errors.fittingDate}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Data de Retirada *</label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            {errors.pickupDate && (
              <p className="text-red-500 text-sm mt-1">{errors.pickupDate}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Data de Devolução *</label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            {errors.returnDate && (
              <p className="text-red-500 text-sm mt-1">{errors.returnDate}</p>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="needsAdjustment"
                name="needsAdjustment"
                checked={formData.needsAdjustment || false}
                onChange={e => setFormData({...formData, needsAdjustment: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="needsAdjustment" className="text-sm text-gray-700">
                Necessita de Ajustes
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {Object.values(ContractStatus).map(status => (
                <option key={status} value={status}>
                  {contractApi.translateStatus(status)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Observações</label>
            <textarea
              name="observations"
              value={formData.observations || ''}
              onChange={e => setFormData({...formData, observations: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  };
  
  /**
   * Renderiza o conteúdo do passo de produtos
   */
  const renderProductsStep = () => {
    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-700">Itens do Contrato</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center px-3 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90"
          >
            <Plus size={16} className="mr-2" />
            Adicionar Item
          </button>
        </div>
        
        {errors.items && (
          <p className="text-red-500 text-sm mb-4">{errors.items}</p>
        )}
        
        {formData.items.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-md">
            <p className="text-gray-500">Nenhum item adicionado. Clique em "Adicionar Item" para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Produto *</label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Selecione um produto</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.code} (R$ {product.rentalValue.toFixed(2)})
                        </option>
                      ))}
                    </select>
                    {errors[`items[${index}].productId`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`items[${index}].productId`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Quantidade *</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                    {errors[`items[${index}].quantity`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`items[${index}].quantity`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Valor Unitário (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitValue}
                      onChange={(e) => updateItem(index, 'unitValue', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                    {errors[`items[${index}].unitValue`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`items[${index}].unitValue`]}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 text-right">
                  <span className="font-medium">
                    Total: R$ {(item.quantity * item.unitValue).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="mt-4 bg-gray-100 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total de Itens:</span>
                <span className="font-bold text-light-yellow">
                  R$ {calculateItemsTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Renderiza o conteúdo do passo de pagamento
   */
  const renderPaymentStep = () => {
    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-700">Pagamentos</h3>
          <button
            type="button"
            onClick={addPayment}
            className="flex items-center px-3 py-2 bg-light-yellow text-white rounded-md hover:bg-opacity-90"
          >
            <Plus size={16} className="mr-2" />
            Adicionar Pagamento
          </button>
        </div>
        
        {errors.payments && (
          <p className="text-red-500 text-sm mb-4">{errors.payments}</p>
        )}
        
        {errors.paymentTotal && (
          <div className="bg-red-50 p-3 rounded-md mb-4">
            <p className="text-red-500 text-sm">{errors.paymentTotal}</p>
          </div>
        )}
        
        <div className="mb-4 bg-blue-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-medium text-blue-700">Total de Itens:</span>
            <span className="font-bold text-blue-700">
              R$ {calculateItemsTotal().toFixed(2)}
            </span>
          </div>
        </div>
        
        {formData.payments.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-md">
            <p className="text-gray-500">Nenhum pagamento adicionado. Clique em "Adicionar Pagamento" para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.payments.map((payment, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Pagamento {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removePayment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Método de Pagamento *</label>
                    <select
                      value={payment.method}
                      onChange={(e) => updatePayment(index, 'method', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      {Object.values(PaymentMethod).map(method => (
                        <option key={method} value={method}>
                          {contractApi.translatePaymentMethod(method)}
                        </option>
                      ))}
                    </select>
                    {errors[`payments[${index}].method`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`payments[${index}].method`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Valor Total (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payment.totalValue}
                      onChange={(e) => updatePayment(index, 'totalValue', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                    {errors[`payments[${index}].totalValue`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`payments[${index}].totalValue`]}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Tipo de Desconto</label>
                    <select
                      value={payment.discountType || ''}
                      onChange={(e) => updatePayment(index, 'discountType', e.target.value || null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Sem desconto</option>
                      <option value={DiscountType.PERCENTAGE}>Percentual (%)</option>
                      <option value={DiscountType.FIXED}>Valor Fixo (R$)</option>
                    </select>
                    {errors[`payments[${index}].discountType`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`payments[${index}].discountType`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Valor do Desconto {payment.discountType === DiscountType.PERCENTAGE ? '(%)' : '(R$)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={!payment.discountType}
                      value={payment.discountValue !== undefined && payment.discountValue !== null ? payment.discountValue : ''}
                      onChange={(e) => updatePayment(index, 'discountValue', e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {errors[`payments[${index}].discountValue`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`payments[${index}].discountValue`]}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm text-gray-700 mb-2">Valor Final (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={payment.finalValue}
                    onChange={(e) => updatePayment(index, 'finalValue', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                  {errors[`payments[${index}].finalValue`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`payments[${index}].finalValue`]}</p>
                  )}
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm text-gray-700 mb-2">Observações</label>
                  <textarea
                    value={payment.notes || ''}
                    onChange={(e) => updatePayment(index, 'notes', e.target.value || null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            
            <div className="mt-4 bg-gray-100 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total de Pagamentos:</span>
                <span className={`font-bold ${
                  Math.abs(calculateItemsTotal() - calculatePaymentsTotal()) > 0.01 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  R$ {calculatePaymentsTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Renderiza o conteúdo do passo de revisão
   */
  const renderReviewStep = () => {
    // Buscar nome do cliente
    const client = clients.find(c => c.id === formData.clientId);
    const event = events.find(e => e.id === formData.eventId);
    const location = locations.find(l => l.id === formData.locationId);
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium">{client?.name || 'Não selecionado'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{contractApi.translateStatus(formData.status || '')}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Evento</p>
              <p className="font-medium">{event?.name || 'Não selecionado'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Local</p>
              <p className="font-medium">{location?.name || 'Não selecionado'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Data da Prova</p>
              <p className="font-medium">{formData.fittingDate || 'Não definida'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Data de Retirada</p>
              <p className="font-medium">{formData.pickupDate}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Data de Devolução</p>
              <p className="font-medium">{formData.returnDate}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Necessita de Ajustes</p>
              <p className="font-medium">{formData.needsAdjustment ? 'Sim' : 'Não'}</p>
            </div>
          </div>
          
          {formData.observations && (
            <div className="mt-3">
              <p className="text-sm text-gray-500">Observações</p>
              <p className="font-medium">{formData.observations}</p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Itens ({formData.items.length})</h3>
          
          {formData.items.length === 0 ? (
            <p className="text-gray-500">Nenhum item adicionado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Unit.
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const total = item.quantity * item.unitValue;
                    
                    return (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product?.name || 'Produto não encontrado'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          R$ {item.unitValue.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          R$ {total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      Total de Itens
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {calculateItemsTotal().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Pagamentos ({formData.payments.length})</h3>
          
          {formData.payments.length === 0 ? (
            <p className="text-gray-500">Nenhum pagamento adicionado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Desconto
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Final
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.payments.map((payment, index) => {
                    // Formatação do desconto
                    let discountInfo = 'Sem desconto';
                    if (payment.discountType && payment.discountValue !== undefined && payment.discountValue !== null) {
                      if (payment.discountType === DiscountType.PERCENTAGE) {
                        discountInfo = `${payment.discountValue}%`;
                      } else {
                        discountInfo = `R$ ${payment.discountValue.toFixed(2)}`;
                      }
                    }
                    
                    return (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contractApi.translatePaymentMethod(payment.method)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          R$ {payment.totalValue.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {discountInfo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          R$ {payment.finalValue.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      Total de Pagamentos
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-green-600">
                      R$ {calculatePaymentsTotal().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        
        {errors.form && (
          <div className="bg-red-50 p-4 rounded-md text-red-600">
            {errors.form}
          </div>
        )}
      </div>
    );
  };

  /**
   * Renderiza o conteúdo do passo atual
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderProductsStep();
      case 2:
        return renderPaymentStep();
      case 3:
        return renderReviewStep();
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
                    Atualizar Contrato
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Finalizar Contrato
                  </>
                )}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
  
  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-light-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">Carregando dados...</p>
        </div>
      </div>
    );
  }

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

      <FormCard
        title={subtitle || (isEditing ? "Editar Contrato" : "Novo Contrato")}
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        actions={renderActions()}
      >
        {renderStepContent()}
      </FormCard>
    </div>
  );
};

export default ContractForm;