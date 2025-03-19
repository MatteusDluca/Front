/**
 * Funções auxiliares para manipulação de tokens JWT
 */

/**
 * Decodifica um token JWT para obter seu payload
 * @param token - Token JWT
 * @returns Payload decodificado ou null se o token for inválido
 */
export const decodeJWT = (token: string): any | null => {
    try {
      // Dividir o token em suas partes (header, payload, signature)
      const base64Payload = token.split('.')[1]
      
      // Decodificar e parsear o payload
      const payload = JSON.parse(atob(base64Payload))
      
      return payload
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error)
      return null
    }
  }
  
  /**
   * Verifica se um token JWT está expirado
   * @param token - Token JWT
   * @returns true se o token estiver expirado, false caso contrário
   */
  export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token)
    
    if (!payload || !payload.exp) {
      return true
    }
    
    // O campo 'exp' do JWT contém o timestamp de expiração em segundos
    const expirationTime = payload.exp * 1000 // Converter para milissegundos
    const currentTime = Date.now()
    
    return currentTime > expirationTime
  }