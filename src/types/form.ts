/**
 * Tipo genérico para erros de formulário
 * @template T - Tipo do formulário
 * @property {string} [key] - Mensagem de erro para cada campo
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>

/**
 * Estado base para formulários
 * @template T - Tipo dos dados do formulário
 * @property {T} data - Dados do formulário
 * @property {FormErrors<T>} errors - Erros do formulário
 * @property {boolean} isSubmitting - Se o formulário está sendo enviado
 */
export interface FormState<T> {
  data: T
  errors: FormErrors<T>
  isSubmitting: boolean
}