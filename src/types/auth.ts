/**
 * Tipos relacionados à autenticação
 */

/**
 * Credenciais de login
 * @property {string} email - Email do funcionário
 * @property {string} password - CPF do funcionário (usado como senha)
 */
export interface LoginCredentials {
    email: string
    password: string
  }
  
  /**
   * Resposta da API de autenticação
   * @property {object} employee - Dados do funcionário
   * @property {string} access_token - Token JWT para autenticação
   */
  export interface AuthResponse {
    employee: {
      id: string
      name: string
      email: string
    }
    access_token: string
  }
  
  /**
   * Estado de autenticação
   * @property {boolean} isAuthenticated - Se o usuário está autenticado
   * @property {object|null} user - Dados do usuário autenticado
   * @property {boolean} loading - Se está carregando
   * @property {string|null} error - Mensagem de erro, se houver
   */
  export interface AuthState {
    isAuthenticated: boolean
    user: {
      id: string
      name: string
      email: string
    } | null
    loading: boolean
    error: string | null
  }