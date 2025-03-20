import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Calendar, Package, Users, FileText, AlertTriangle } from 'lucide-react';
import api from '../lib/api';

// Importação dos tipos necessários
import {
  Product, ProductStatus,
  Client,
  Contract, ContractStatus, Payment, PaymentMethod, DiscountType,
} from '../types';

// Interfaces para props dos componentes
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface AlertItemProps {
  title: string;
  date: string;
  type: string;
  color: string;
}

// Interface para dados do gráfico
interface ChartDataPoint {
  name: string;
  value: number;
}

// Interface para alertas
interface Alert {
  title: string;
  date: string;
  type: string;
  color: string;
}

// Componente de Card para estatísticas
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
    <div className={`p-3 rounded-full ${color} mr-4`}>
      {icon}
    </div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

// Componente de Alerta
const AlertItem: React.FC<AlertItemProps> = ({ title, date, type, color }) => (
  <div className={`border-l-4 ${color} bg-white p-3 rounded-r shadow-sm mb-2 flex justify-between items-center`}>
    <div>
      <h3 className="font-medium text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
    <div className="flex items-center">
      <span className="text-sm mr-2">{type}</span>
      <AlertTriangle size={16} />
    </div>
  </div>
);

// Funções auxiliares para formatação de data
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const formatMonthName = (month: number): string => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return monthNames[month];
};

const formatDayOfWeek = (date: Date): string => {
  const daysOfWeek = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];
  return daysOfWeek[date.getDay()];
};

const getCurrentDateFormatted = (): string => {
  const today = new Date();
  const dayName = formatDayOfWeek(today);
  const day = today.getDate();
  const month = formatMonthName(today.getMonth());
  const year = today.getFullYear();
  
  return `${dayName}, ${day} de ${month} de ${year}`;
};

// Customizando o renderizador do tooltip para formato correto
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
    
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
        <p className="text-sm text-gray-700">{formattedValue}</p>
      </div>
    );
  }

  return null;
};

// Componente principal do Dashboard
const Dashboard: React.FC = () => {
  // Estados para armazenar os dados
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterType, setFilterType] = useState<'day' | 'month'>('month');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Buscar dados da API
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        // Busca paralela dos dados para otimizar o tempo de carregamento
        const [productsResponse, clientsResponse, contractsResponse] = await Promise.all([
          api.get<Product[]>('/products'),
          api.get<Client[]>('/clients'),
          api.get<Contract[]>('/contracts')
        ]);
        
        const productsData = productsResponse.data || [];
        const clientsData = clientsResponse.data || [];
        const contractsData = contractsResponse.data || [];
        
        console.log('Dados carregados com sucesso:', {
          produtos: productsData.length,
          clientes: clientsData.length,
          contratos: contractsData.length
        });
        
        // Atualizar os estados com os dados da API
        setProducts(productsData);
        setClients(clientsData);
        setContracts(contractsData);
        
        // Filtrar contratos ativos
        const active = contractsData.filter(c => 
          c.status === ContractStatus.ACTIVE || 
          c.status === ContractStatus.IN_PROGRESS
        );
        setActiveContracts(active);
        
        // Calcular receita total
        calculateRevenue(contractsData, filterType);
        
        // Gerar alertas
        generateAlerts(contractsData, productsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Falha ao carregar dados do servidor. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [filterType]);
  
  // Calcular receita baseada no filtro selecionado
  const calculateRevenue = (contractsData: Contract[], filter: 'day' | 'month'): void => {
    let revenue = 0;
    const data: ChartDataPoint[] = [];
    
    if (filter === 'day') {
      // Agrupa os valores por dia do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      // Inicializa o array com todos os dias do mês
      for (let i = 1; i <= daysInMonth; i++) {
        data.push({
          name: `${i}`,
          value: 0
        });
      }
      
      // Soma os valores por dia
      contractsData.forEach(contract => {
        const contractDate = new Date(contract.createdAt);
        if (contractDate.getMonth() === currentMonth && contractDate.getFullYear() === currentYear) {
          const day = contractDate.getDate();
          const paymentTotal = contract.payments.reduce((sum, payment) => sum + payment.finalValue, 0);
          data[day - 1].value += paymentTotal;
          revenue += paymentTotal;
        }
      });
    } else {
      // Agrupa os valores por mês do ano atual
      const currentYear = new Date().getFullYear();
      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];
      
      // Inicializa o array com todos os meses
      for (let i = 0; i < 12; i++) {
        data.push({
          name: monthNames[i],
          value: 0
        });
      }
      
      // Soma os valores por mês
      contractsData.forEach(contract => {
        const contractDate = new Date(contract.createdAt);
        if (contractDate.getFullYear() === currentYear) {
          const month = contractDate.getMonth();
          const paymentTotal = contract.payments.reduce((sum, payment) => sum + payment.finalValue, 0);
          data[month].value += paymentTotal;
          revenue += paymentTotal;
        }
      });
    }
    
    setChartData(data);
    setTotalRevenue(revenue);
  };
  
  // Gerar alertas com base nos contratos e produtos
  const generateAlerts = (contractsData: Contract[], productsData: Product[]): void => {
    const alertsArray: Alert[] = [];
    const today = new Date();
    
    // Alerta para devolução próxima (próximos 3 dias)
    contractsData.forEach(contract => {
      if (contract.status === ContractStatus.ACTIVE || contract.status === ContractStatus.IN_PROGRESS) {
        const returnDate = new Date(contract.returnDate);
        const diffTime = returnDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= 3) {
          alertsArray.push({
            title: `Devolução: ${contract.client.name}`,
            date: formatDate(contract.returnDate),
            type: 'Devolução em breve',
            color: 'border-amber-500'
          });
        } else if (diffDays < 0) {
          alertsArray.push({
            title: `Atraso: ${contract.client.name}`,
            date: formatDate(contract.returnDate),
            type: 'Devolução atrasada',
            color: 'border-red-500'
          });
        }
      }
    });
    
    // Alerta para produtos em manutenção
    productsData.forEach(product => {
      if (product.status === ProductStatus.MAINTENANCE) {
        alertsArray.push({
          title: `Manutenção: ${product.name}`,
          date: 'Em andamento',
          type: 'Produto em conserto',
          color: 'border-purple-500'
        });
      }
    });
    
    // Alerta para produtos com baixo estoque (quantidade <= 2)
    productsData.forEach(product => {
      if (product.status === ProductStatus.AVAILABLE && product.quantity <= 2) {
        alertsArray.push({
          title: `Estoque baixo: ${product.name}`,
          date: `Restam ${product.quantity} unidade(s)`,
          type: 'Estoque crítico',
          color: 'border-yellow-500'
        });
      }
    });
    
    // Alerta para contratos que precisam de ajuste
    contractsData.forEach(contract => {
      if (contract.needsAdjustment && (contract.status === ContractStatus.ACTIVE || contract.status === ContractStatus.IN_PROGRESS)) {
        alertsArray.push({
          title: `Ajuste: ${contract.client.name}`,
          date: formatDate(contract.createdAt),
          type: 'Precisa de ajuste',
          color: 'border-blue-500'
        });
      }
    });
    
    // Ordenar alertas por prioridade (cor mais forte = maior prioridade)
    const priorityOrder: Record<string, number> = {
      'border-red-500': 1,
      'border-amber-500': 2,
      'border-yellow-500': 3,
      'border-purple-500': 4,
      'border-blue-500': 5
    };
    
    alertsArray.sort((a, b) => {
      return priorityOrder[a.color] - priorityOrder[b.color];
    });
    
    setAlerts(alertsArray);
  };
  
  // Formatter para o tooltip do gráfico
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Componente de carregamento
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-light-yellow border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white font-clash">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Componente de erro
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-red-600 text-xl font-bold mb-4">Erro ao carregar dados</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-light-yellow text-white py-2 px-4 rounded hover:bg-opacity-90 w-full"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-boska text-white">Dashboard</h1>
        
        <div className="flex items-center space-x-4">
          <span className="text-white font-medium">
            {getCurrentDateFormatted()}
          </span>
          
          <div className="bg-white rounded-md shadow-sm">
            <button 
              className={`px-3 py-1 rounded-l-md transition-colors ${filterType === 'day' ? 'bg-light-yellow text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setFilterType('day')}
            >
              Diário
            </button>
            <button 
              className={`px-3 py-1 rounded-r-md transition-colors ${filterType === 'month' ? 'bg-light-yellow text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setFilterType('month')}
            >
              Mensal
            </button>
          </div>
        </div>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard 
          title="Total de Produtos" 
          value={products.length} 
          icon={<Package size={20} className="text-white" />}
          color="bg-indigo-500"
        />
        <StatCard 
          title="Contratos Ativos" 
          value={activeContracts.length} 
          icon={<FileText size={20} className="text-white" />}
          color="bg-green-500"
        />
        <StatCard 
          title="Clientes" 
          value={clients.length} 
          icon={<Users size={20} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Receita Total" 
          value={formatCurrency(totalRevenue)} 
          icon={<Calendar size={20} className="text-white" />}
          color="bg-amber-500"
        />
      </div>
      
      {/* Gráfico e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow mb-4">
        {/* Gráfico */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            {filterType === 'day' ? 'Receita Diária' : 'Receita Mensal'}
          </h2>
          <div className="h-64 md:h-full">
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value: number) => `R$ ${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#f3aa60" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Tabela de contratos ativos */}
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Contratos em Andamento</h2>
          <div className="overflow-auto flex-grow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeContracts.slice(0, 7).map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contract.client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(contract.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${contract.status === ContractStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {contract.status === ContractStatus.ACTIVE ? 'Ativo' : 'Em Progresso'}
                      </span>
                    </td>
                  </tr>
                ))}
                {activeContracts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      Não há contratos ativos no momento
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Alertas */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
          <AlertTriangle size={20} className="mr-2 text-amber-500" />
          Alertas e Notificações
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alerts.slice(0, 6).map((alert, index) => (
            <AlertItem 
              key={index}
              title={alert.title}
              date={alert.date}
              type={alert.type}
              color={alert.color}
            />
          ))}
          {alerts.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-4">
              Não há alertas no momento
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;