import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { AuthResponse, LoginCredentials } from '../types'

/**
 * Configuração da instância axios para a API
 */
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 seconds timeout
})

/**
 * Interceptor para adicionar token de autenticação em todas as requisições
 */
api.interceptors.request.use(
  (config) => {
    // Adiciona o token de autenticação se disponível
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Add global error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Response Error:', error)
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear authentication data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    
    // Format error message for better debugging
    const errorMessage = error.response?.data?.message || error.message
    const statusCode = error.response?.status
    const enhancedError = new Error(`API Error ${statusCode}: ${errorMessage}`)
    
    return Promise.reject(enhancedError)
  }
)

/**
 * API de autenticação
 */
export const authApi = {
  /**
   * Realiza login
   * @param credentials - Credenciais de login (email e password)
   * @returns Resposta da API com dados do funcionário e token
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', credentials.email)
      const response: AxiosResponse<AuthResponse> = await api.post<AuthResponse>(
        '/auth/login',
        credentials
      )
      
      // Salva os dados do usuário e token no localStorage
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.employee))
        console.log('Login successful, token saved')
      }
      
      return response.data
    } catch (error) {
      // Trata erros específicos da API
      console.error('Login error:', error)
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>
        throw new Error(
          axiosError.response?.data?.message || 'Erro ao realizar login'
        )
      }
      
      throw error
    }
  },
  
  /**
   * Realiza logout
   */
  logout: (): void => {
    if (typeof window !== 'undefined') {
      console.log('Logging out, clearing auth data')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redireciona para a página de login
      window.location.href = '/login'
    }
  },
  
  /**
   * Verifica se o usuário está autenticado
   * @returns true se o usuário estiver autenticado
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    
    const token = localStorage.getItem('token')
    const isAuth = !!token
    console.log('Authentication check:', isAuth ? 'Authenticated' : 'Not authenticated')
    return isAuth
  },
  
  /**
   * Obtém os dados do usuário autenticado
   * @returns Dados do usuário ou null se não estiver autenticado
   */
  getUser: () => {
    if (typeof window === 'undefined') return null
    
    const userString = localStorage.getItem('user')
    
    if (userString) {
      try {
        return JSON.parse(userString)
      } catch (error) {
        console.error('Error parsing user data:', error)
        return null
      }
    }
    
    return null
  }
}

export default api