// src/types/contract.ts

export enum ContractStatus {
    ACTIVE = 'ACTIVE',
    CANCELED = 'CANCELED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
  }
  
  export enum PaymentMethod {
    PIX = 'PIX',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    CASH = 'CASH'
  }
  
  export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED'
  }
  
  export interface ContractItem {
    id: string;
    contractId: string;
    productId: string;
    product: {
      id: string;
      name: string;
      code: string;
      imageUrl?: string;
      rentalValue: number;
    };
    quantity: number;
    unitValue: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Payment {
    id: string;
    contractId: string;
    method: PaymentMethod;
    totalValue: number;
    discountType?: DiscountType;
    discountValue?: number;
    finalValue: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Contract {
    id: string;
    clientId: string;
    client: {
      id: string;
      name: string;
      email: string;
      phone: string;
      cpfCnpj: string;
      imageUrl?: string;
      address?: any;
    };
    eventId?: string;
    event?: {
      id: string;
      name: string;
      date?: string;
      time?: string;
    };
    locationId?: string;
    location?: {
      id: string;
      name: string;
      address?: any;
    };
    status: ContractStatus;
    fittingDate?: string;
    pickupDate: string;
    returnDate: string;
    needsAdjustment: boolean;
    observations?: string;
    items: ContractItem[];
    payments: Payment[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreateContractItem {
    productId: string;
    quantity: number;
    unitValue: number;
  }
  
  export interface CreatePayment {
    method: PaymentMethod;
    totalValue: number;
    discountType?: DiscountType;
    discountValue?: number;
    finalValue: number;
    notes?: string;
  }
  
  export interface CreateContractRequest {
    clientId: string;
    eventId?: string;
    locationId?: string;
    status?: ContractStatus;
    fittingDate?: string;
    pickupDate: string;
    returnDate: string;
    needsAdjustment?: boolean;
    observations?: string;
    items: CreateContractItem[];
    payments: CreatePayment[];
  }
  
  export interface UpdateContractRequest extends Partial<CreateContractRequest> {}
  
  export interface ContractFilters {
    search?: string;
    status?: ContractStatus[];
    startDate?: string;
    endDate?: string;
    clientId?: string;
    eventId?: string;
  }