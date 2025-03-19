export interface Address {
  id: string
  street: {
    id: string
    name: string
  }
  number: string
  complement?: string
  zipCode: string
  city: {
    id: string
    name: string
    state: {
      id: string
      name: string
      uf: string
    }
  }
  createdAt?: string
  updatedAt?: string
}

export type Role = 'ADMIN' | 'USER'

export interface Employee {
  id: string
  name: string
  email: string
  cpf: string
  salary: number
  phone: string
  birthday?: string
  workHours: string
  role: Role
  imageUrl?: string
  address?: Address
  createdAt?: string
  updatedAt?: string
}

export interface CreateEmployeeRequest {
  name: string
  email: string
  cpf: string
  salary: number
  phone: string
  birthday?: string
  workHours: string
  role?: Role
  imageUrl?: string
  street: string
  number: string
  complement?: string
  zipCode: string
  city: string
  state: string
}

export interface UpdateEmployeeRequest {
  name?: string
  email?: string
  cpf?: string
  salary?: number
  phone?: string
  birthday?: string
  workHours?: string
  role?: Role
  imageUrl?: string
  street?: string
  number?: string
  complement?: string
  zipCode?: string
  city?: string
  state?: string
}

export interface EmployeeResponse {
  id: string
  name: string
  email: string
  cpf: string
  salary: number
  phone: string
  birthday?: string
  workHours: string
  role: Role
  imageUrl?: string
  address?: Address
  createdAt: string
  updatedAt: string
}

export interface EmployeeListResponse {
  data: EmployeeResponse[]
  total: number
  page: number
  limit: number
}

export interface EmployeeFilters {
  search?: string
  page?: number
  limit?: number
}