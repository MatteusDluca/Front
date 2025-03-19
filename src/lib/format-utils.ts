/**
 * Funções utilitárias para formatação de dados
 */

/**
 * Formata um valor monetário em reais
 * @param value Valor a ser formatado
 * @param symbol Símbolo da moeda (padrão: R$)
 * @returns String formatada (ex: R$ 1.234,56)
 */
export const formatCurrency = (value: number, symbol = 'R$'): string => {
    return `${symbol} ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  
  /**
   * Formata uma data para exibição
   * @param dateString String de data (ISO ou outro formato válido)
   * @param format Formato desejado ('short', 'long', 'time', 'datetime')
   * @returns Data formatada conforme o formato escolhido
   */
  export const formatDate = (
    dateString: string | Date,
    format: 'short' | 'long' | 'time' | 'datetime' = 'short'
  ): string => {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString('pt-BR') // 01/01/2023
      case 'long':
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }) // 01 de janeiro de 2023
      case 'time':
        return date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }) // 14:30
      case 'datetime':
        return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}` // 01/01/2023, 14:30
      default:
        return date.toLocaleDateString('pt-BR')
    }
  }
  
  /**
   * Formata um CPF para exibição
   * @param cpf CPF sem formatação
   * @returns CPF formatado (xxx.xxx.xxx-xx)
   */
  export const formatCpf = (cpf: string): string => {
    if (!cpf) return ''
    
    // Remove caracteres não numéricos
    const cleaned = cpf.replace(/\D/g, '')
    
    // Verifica se tem 11 dígitos
    if (cleaned.length !== 11) return cpf
    
    // Formata como CPF
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  
  /**
   * Formata um CNPJ para exibição
   * @param cnpj CNPJ sem formatação
   * @returns CNPJ formatado (xx.xxx.xxx/xxxx-xx)
   */
  export const formatCnpj = (cnpj: string): string => {
    if (!cnpj) return ''
    
    // Remove caracteres não numéricos
    const cleaned = cnpj.replace(/\D/g, '')
    
    // Verifica se tem 14 dígitos
    if (cleaned.length !== 14) return cnpj
    
    // Formata como CNPJ
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  
  /**
   * Formata um CPF ou CNPJ para exibição
   * @param document CPF ou CNPJ sem formatação
   * @returns Documento formatado
   */
  export const formatCpfCnpj = (document: string): string => {
    if (!document) return ''
    
    // Remove caracteres não numéricos
    const cleaned = document.replace(/\D/g, '')
    
    // Verifica o tamanho para determinar se é CPF ou CNPJ
    if (cleaned.length === 11) {
      return formatCpf(cleaned)
    } else if (cleaned.length === 14) {
      return formatCnpj(cleaned)
    }
    
    // Retorna o valor original se não for CPF nem CNPJ
    return document
  }
  
  /**
   * Formata um número de telefone para exibição
   * @param phone Número de telefone sem formatação
   * @returns Telefone formatado
   */
  export const formatPhone = (phone: string): string => {
    if (!phone) return ''
    
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    
    // Formata o número conforme o padrão brasileiro
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    
    // Retorna o valor original se não conseguir formatar
    return phone
  }
  
  /**
   * Formata um CEP para exibição
   * @param zipCode CEP sem formatação
   * @returns CEP formatado (xxxxx-xxx)
   */
  export const formatZipCode = (zipCode: string): string => {
    if (!zipCode) return ''
    
    // Remove caracteres não numéricos
    const cleaned = zipCode.replace(/\D/g, '')
    
    // Verifica se tem 8 dígitos
    if (cleaned.length !== 8) return zipCode
    
    // Formata como CEP
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
  }
  
  /**
   * Trunca um texto para um tamanho máximo
   * @param text Texto a ser truncado
   * @param maxLength Tamanho máximo (padrão: 100)
   * @returns Texto truncado com reticências
   */
  export const truncateText = (text: string, maxLength = 100): string => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    
    return `${text.substring(0, maxLength)}...`
  }
  
  /**
   * Normaliza um texto removendo acentos
   * @param text Texto a ser normalizado
   * @returns Texto sem acentos
   */
  export const normalizeText = (text: string): string => {
    if (!text) return ''
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }
  
  /**
   * Formata um número para exibição
   * @param value Valor numérico
   * @param digits Número de casas decimais (padrão: 2)
   * @returns Número formatado
   */
  export const formatNumber = (value: number, digits = 2): string => {
    if (value === undefined || value === null) return ''
    
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  }
  
  /**
   * Formata uma medida para exibição
   * @param value Valor da medida
   * @param unit Unidade de medida (padrão: cm)
   * @returns Medida formatada
   */
  export const formatMeasurement = (value?: number, unit = 'cm'): string => {
    if (value === undefined || value === null) {
      return 'N/A'
    }
    return `${formatNumber(value, 1)} ${unit}`
  }
  
  /**
   * Obtém a idade a partir de uma data de nascimento
   * @param birthdate Data de nascimento
   * @returns Idade em anos
   */
  export const getAge = (birthdate: string | Date): number => {
    if (!birthdate) return 0
    
    const today = new Date()
    const birthDate = new Date(birthdate)
    
    if (isNaN(birthDate.getTime())) {
      return 0
    }
    
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }