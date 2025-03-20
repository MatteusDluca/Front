'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, FileText, Edit, Trash2, User, Calendar, 
  MapPin, Package, CreditCard, Clock, AlertTriangle 
} from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { Contract } from '@/types';
import { contractApi } from '@/services/contract-api';
import FormCard from '@/components/FormCard';

/**
 * Página de detalhes do contrato
 */
export default function ContractDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const data = await contractApi.getById(contractId);
        setContract(data);
      } catch (err) {
        console.error('Erro ao carregar contrato:', err);
        showNotification('error', 'Erro ao carregar dados do contrato.');
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContract();
    }
  }, [contractId, showNotification]);

  /**
   * Gera PDF do contrato
   */
  const handleGeneratePdf = async () => {
    if (!contract) return;
    
    try {
      const pdfUrl = await contractApi.generateContractPdf(contract.id);
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('Erro ao gerar PDF do contrato:', err);
      showNotification('error', 'Não foi possível gerar o PDF do contrato.');
    }
  };

  /**
   * Exclui o contrato
   */
  const handleDeleteContract = async () => {
    if (!contract) return;
    
    if (window.confirm(`Deseja realmente excluir o contrato do cliente ${contract.client.name}?`)) {
      try {
        await contractApi.delete(contract.id);
        showNotification('success', 'Contrato excluído com sucesso!');
        router.push('/contratos');
      } catch (err) {
        console.error('Erro ao excluir contrato:', err);
        showNotification('error', 'Não foi possível excluir o contrato.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-light-yellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">Carregando dados do contrato...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        <p>Contrato não encontrado.</p>
        <div className="mt-4">
          <button
            onClick={() => router.push('/contratos')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/contratos')}
            className="p-2 bg-soft-ivory text-steel-gray rounded-md hover:bg-opacity-90"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-boska text-white">Detalhes do Contrato</h1>
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
            onClick={() => router.push(`/contratos/editar/${contract.id}`)}
            className="flex items-center px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
          >
            <Edit size={18} className="mr-2" />
            Editar
          </button>
          
          <button
            onClick={handleDeleteContract}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 size={18} className="mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Status do Contrato */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-clash text-steel-gray mr-3">
              Contrato #{contract.id.substring(0, 8)}
            </h2>
            
            {/* Status com cores baseadas no tipo */}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
              contract.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
              contract.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {contractApi.translateStatus(contract.status)}
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            Criado em: {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Cliente e local */}
        <div className="lg:col-span-1">
          {/* Informações do Cliente */}
          <FormCard title="Cliente">
            <div className="flex items-center mb-4">
              <User size={20} className="text-light-yellow mr-2" />
              <h3 className="text-lg font-clash text-steel-gray">Informações do Cliente</h3>
            </div>
            
            <div className="flex items-center mb-4">
              {contract.client.imageUrl ? (
                <img
                  src={contract.client.imageUrl}
                  alt={contract.client.name}
                  className="w-12 h-12 rounded-full mr-3 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-light-yellow flex items-center justify-center text-white mr-3">
                  {contract.client.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="font-medium">{contract.client.name}</h4>
                <p className="text-sm text-gray-500">{contract.client.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">CPF/CNPJ</p>
                <p className="font-medium">{contract.client.cpfCnpj}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{contract.client.phone}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => router.push(`/clientes/${contract.client.id}`)}
                className="w-full px-3 py-2 bg-light-yellow bg-opacity-10 text-light-yellow rounded-md hover:bg-opacity-20"
              >
                Ver detalhes do cliente
              </button>
            </div>
          </FormCard>
          
          {/* Informações do Evento e Local */}
          {(contract.event || contract.location) && (
            <FormCard title="Evento e Local" className="mt-6">
              {contract.event && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Calendar size={20} className="text-light-yellow mr-2" />
                    <h3 className="text-lg font-clash text-steel-gray">Evento</h3>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">{contract.event.name}</h4>
                    {contract.event.date && (
                      <p className="text-sm text-gray-500">
                        Data: {contract.event.date}
                        {contract.event.time && ` às ${contract.event.time}`}
                      </p>
                    )}
                    <button
                      onClick={() => contract.event?.id && router.push(`/eventos-locais/${contract.event.id}`)}
                      className="text-light-yellow text-sm mt-2 hover:underline"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              )}
              
              {contract.location && (
                <div>
                  <div className="flex items-center mb-2">
                    <MapPin size={20} className="text-light-yellow mr-2" />
                    <h3 className="text-lg font-clash text-steel-gray">Local</h3>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">{contract.location.name}</h4>
                    {contract.location.address && (
                      <p className="text-sm text-gray-500">
                        {contract.location.address.street.name}, {contract.location.address.number}
                        {contract.location.address.city && `, ${contract.location.address.city.name}`}
                      </p>
                    )}
                    <button
                      onClick={() => contract.location?.id && router.push(`/eventos-locais/${contract.location.id}`)}
                      className="text-light-yellow text-sm mt-2 hover:underline"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              )}
            </FormCard>
          )}
        </div>
        
        {/* Coluna 2-3: Detalhes do contrato, itens e pagamentos */}
        <div className="lg:col-span-2">
          {/* Datas e Informações do Contrato */}
          <FormCard title="Informações do Contrato">
            <div className="flex items-center mb-4">
              <Clock size={20} className="text-light-yellow mr-2" />
              <h3 className="text-lg font-clash text-steel-gray">Datas e Prazos</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {contract.fittingDate && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Prova</p>
                  <p className="font-medium">
                    {new Date(contract.fittingDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Retirada</p>
                <p className="font-medium">
                  {new Date(contract.pickupDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Devolução</p>
                <p className="font-medium">
                  {new Date(contract.returnDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            {contract.needsAdjustment && (
              <div className="flex items-center mb-4 p-3 bg-yellow-50 rounded-md">
                <AlertTriangle size={20} className="text-yellow-600 mr-2" />
                <span className="text-yellow-700">Este contrato necessita de ajustes</span>
              </div>
            )}
            
            {contract.observations && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Observações:</p>
                <p className="p-3 bg-gray-50 rounded-md">{contract.observations}</p>
              </div>
            )}
            
            {/* Itens do Contrato */}
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <Package size={20} className="text-light-yellow mr-2" />
                <h3 className="text-lg font-clash text-steel-gray">Itens Alugados</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qtd
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Unit.
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contract.items.map((item) => {
                      const itemTotal = item.quantity * item.unitValue;
                      
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              {item.product?.imageUrl ? (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-10 h-10 object-cover rounded-md mr-3"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center text-gray-500">
                                  <Package size={16} />
                                </div>
                              )}
                              {item.product?.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.product?.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            R$ {item.unitValue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            R$ {itemTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        Total de Itens
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R$ {contract.items.reduce((total, item) => total + (item.quantity * item.unitValue), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Informações de Pagamento */}
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <CreditCard size={20} className="text-light-yellow mr-2" />
                <h3 className="text-lg font-clash text-steel-gray">Pagamentos</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Desconto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Final
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contract.payments.map((payment) => {
                      // Formatar informação de desconto
                      let discountInfo = 'Sem desconto';
                      if (payment.discountType && payment.discountValue) {
                        if (payment.discountType === 'PERCENTAGE') {
                          discountInfo = `${payment.discountValue}%`;
                        } else {
                          discountInfo = `R$ ${payment.discountValue.toFixed(2)}`;
                        }
                      }
                      
                      return (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contractApi.translatePaymentMethod(payment.method)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            R$ {payment.totalValue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {discountInfo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            R$ {payment.finalValue.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        Total Pago
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        R$ {contractApi.calculateTotal(contract).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </FormCard>
        </div>
      </div>
    </div>
  );
}