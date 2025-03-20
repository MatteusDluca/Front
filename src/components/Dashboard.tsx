import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Calendar, Package, Users, FileText, AlertTriangle } from 'lucide-react';

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

// Dados de exemplo para simulação das APIs
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Vestido Longo Azul',
    code: 'VL001',
    status: ProductStatus.AVAILABLE,
    size: 'M',
    quantity: 5,
    rentalValue: 150.00,
    createdAt: '2025-03-10T14:30:00Z',
    updatedAt: '2025-03-10T14:30:00Z'
  },
  {
    id: '2',
    name: 'Terno Preto',
    code: 'TP001',
    status: ProductStatus.RENTED,
    size: '42',
    quantity: 3,
    rentalValue: 200.00,
    createdAt: '2025-03-12T10:15:00Z',
    updatedAt: '2025-03-12T10:15:00Z'
  },
  {
    id: '3',
    name: 'Vestido de Noiva',
    code: 'VN001',
    status: ProductStatus.MAINTENANCE,
    size: 'P',
    quantity: 1,
    rentalValue: 500.00,
    createdAt: '2025-03-05T09:45:00Z',
    updatedAt: '2025-03-15T16:20:00Z'
  },
  {
    id: '4',
    name: 'Smoking',
    code: 'SM001',
    status: ProductStatus.AVAILABLE,
    size: '44',
    quantity: 2,
    rentalValue: 250.00,
    createdAt: '2025-03-08T11:30:00Z',
    updatedAt: '2025-03-08T11:30:00Z'
  }
];

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria@exemplo.com',
    phone: '(85) 99988-7766',
    cpfCnpj: '123.456.789-00',
    createdAt: '2025-02-15T10:30:00Z',
    updatedAt: '2025-02-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'João Pereira',
    email: 'joao@exemplo.com',
    phone: '(85) 98877-6655',
    cpfCnpj: '987.654.321-00',
    createdAt: '2025-02-20T14:45:00Z',
    updatedAt: '2025-02-20T14:45:00Z'
  },
  {
    id: '3',
    name: 'Ana Santos',
    email: 'ana@exemplo.com',
    phone: '(85) 97766-5544',
    cpfCnpj: '456.789.123-00',
    createdAt: '2025-03-05T09:15:00Z',
    updatedAt: '2025-03-05T09:15:00Z'
  }
];

const MOCK_CONTRACTS: Contract[] = [
  {
    id: '1',
    clientId: '1',
    client: MOCK_CLIENTS[0],
    status: ContractStatus.ACTIVE,
    pickupDate: '2025-03-18T10:00:00Z',
    returnDate: '2025-03-25T10:00:00Z',
    needsAdjustment: false,
    createdAt: '2025-03-15T14:30:00Z',
    updatedAt: '2025-03-15T14:30:00Z',
    items: [
      {
        id: '1',
        contractId: '1',
        productId: '1',
        product: {
          id: '1',
          name: 'Vestido Longo Azul',
          code: 'VL001',
          rentalValue: 150.00
        },
        quantity: 1,
        unitValue: 150.00,
        createdAt: '2025-03-15T14:30:00Z',
        updatedAt: '2025-03-15T14:30:00Z'
      }
    ],
    payments: [
      {
        id: '1',
        contractId: '1',
        method: PaymentMethod.PIX,
        totalValue: 150.00,
        finalValue: 150.00,
        createdAt: '2025-03-15T14:30:00Z',
        updatedAt: '2025-03-15T14:30:00Z'
      }
    ]
  },
  {
    id: '2',
    clientId: '2',
    client: MOCK_CLIENTS[1],
    status: ContractStatus.IN_PROGRESS,
    pickupDate: '2025-03-17T15:00:00Z',
    returnDate: '2025-03-20T15:00:00Z',
    needsAdjustment: true,
    createdAt: '2025-03-16T11:45:00Z',
    updatedAt: '2025-03-16T11:45:00Z',
    items: [
      {
        id: '2',
        contractId: '2',
        productId: '2',
        product: {
          id: '2',
          name: 'Terno Preto',
          code: 'TP001',
          rentalValue: 200.00
        },
        quantity: 1,
        unitValue: 200.00,
        createdAt: '2025-03-16T11:45:00Z',
        updatedAt: '2025-03-16T11:45:00Z'
      }
    ],
    payments: [
      {
        id: '2',
        contractId: '2',
        method: PaymentMethod.CREDIT_CARD,
        totalValue: 200.00,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        finalValue: 180.00,
        createdAt: '2025-03-16T11:45:00Z',
        updatedAt: '2025-03-16T11:45:00Z'
      }
    ]
  },
  {
    id: '3',
    clientId: '3',
    client: MOCK_CLIENTS[2],
    status: ContractStatus.COMPLETED,
    pickupDate: '2025-03-10T09:00:00Z',
    returnDate: '2025-03-15T09:00:00Z',
    needsAdjustment: false,
    createdAt: '2025-03-08T16:20:00Z',
    updatedAt: '2025-03-15T10:30:00Z',
    items: [
      {
        id: '3',
        contractId: '3',
        productId: '4',
        product: {
          id: '4',
          name: 'Smoking',
          code: 'SM001',
          rentalValue: 250.00
        },
        quantity: 1,
        unitValue: 250.00,
        createdAt: '2025-03-08T16:20:00Z',
        updatedAt: '2025-03-08T16:20:00Z'
      }
    ],
    payments: [
      {
        id: '3',
        contractId: '3',
        method: PaymentMethod.CASH,
        totalValue: 250.00,
        discountType: DiscountType.FIXED,
        discountValue: 50,
        finalValue: 200.00,
        createdAt: '2025-03-08T16:20:00Z',
        updatedAt: '2025-03-08T16:20:00Z'
      }
    ]
  }
];

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
  
  // Buscar dados iniciais
  useEffect(() => {
    // Simulação de chamadas de API
    const loadData = async (): Promise<void> => {
      try {
        // Simulação de atraso na rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProducts(MOCK_PRODUCTS);
        setClients(MOCK_CLIENTS);
        setContracts(MOCK_CONTRACTS);
        
        // Filtrar contratos ativos
        const active = MOCK_CONTRACTS.filter(c => 
          c.status === ContractStatus.ACTIVE || 
          c.status === ContractStatus.IN_PROGRESS
        );
        setActiveContracts(active);
        
        // Calcular receita total
        calculateRevenue(MOCK_CONTRACTS, filterType);
        
        // Gerar alertas
        generateAlerts(MOCK_CONTRACTS, MOCK_PRODUCTS);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    loadData();
  }, [filterType]);
  
  // Calcular receita baseada no filtro selecionado
  const calculateRevenue = (contractsData: Contract[], filter: 'day' | 'month'): void => {
    let revenue = 0;
    const today = new Date();
    const data: ChartDataPoint[] = [];
    
    if (filter === 'day') {
      // Agrupa os valores por dia do mês atual
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
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
      const currentYear = today.getFullYear();
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
      <div className="grid grid-cols-4 gap-4 mb-4">
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
      <div className="grid grid-cols-2 gap-4 flex-grow mb-4">
        {/* Gráfico */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            {filterType === 'day' ? 'Receita Diária' : 'Receita Mensal'}
          </h2>
          <div className="h-full">
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
        <div className="grid grid-cols-2 gap-3">
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