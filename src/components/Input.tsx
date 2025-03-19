import React, { InputHTMLAttributes, forwardRef, useState } from 'react';

/**
 * Propriedades do componente Input
 * @extends InputHTMLAttributes<HTMLInputElement>
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label do campo */
  label: string;
  /** Mensagem de erro (opcional) */
  error?: string;
  /** Tipo de input (default: text) */
  type?: string;
}

/**
 * Componente de Input reutilizável com efeito neon
 * Apresenta um campo de input com label e mensagem de erro opcional
 * Modificado para tratar campos numéricos de forma consistente
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type = 'text', ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    // Handler para quando o input recebe foco
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (rest.onFocus) {
        rest.onFocus(e);
      }
    };
    
    // Handler para quando o input perde foco
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (rest.onBlur) {
        rest.onBlur(e);
      }
    };
    
    // Handler para teclas pressionadas - previne submissão com Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Previne a submissão do formulário quando Enter é pressionado
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      
      // Se houver um handler personalizado de onKeyDown, chama-o depois de previnir o comportamento padrão
      if (rest.onKeyDown) {
        rest.onKeyDown(e);
      }
    };

    // Para campos numéricos, usamos type="text" com validação manual para evitar problemas
    const inputType = type === 'number' ? 'text' : type;
    
    // Handler para filtragem de entrada em campos numéricos
    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      if (type === 'number') {
        const input = e.currentTarget;
        const oldValue = input.value;
        
        // Permite apenas números e ponto decimal
        const sanitizedValue = oldValue.replace(/[^\d.]/g, '');
        
        // Garantir que há apenas um ponto decimal
        const parts = sanitizedValue.split('.');
        const newValue = parts.length > 2 
          ? `${parts[0]}.${parts.slice(1).join('')}`
          : sanitizedValue;
          
        if (oldValue !== newValue) {
          input.value = newValue;
          
          // Dispara evento de change para atualizar o formData
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        }
      }
    };
    
    return (
      <div className='mb-4 font-clash'>
        {/* Label com box estilizado */}
        <div className="label-container">
          <label className='text-steel-gray font-medium'>{label}</label>
          {rest.required && <span className="text-red-500 ml-1">*</span>}
        </div>
        
        {/* Container do input com animação */}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            {...rest}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            className={`
              w-full py-2 px-3 focus:outline-none bg-transparent
              border-b-2 transition-all duration-300
              ${isFocused ? 'border-light-yellow' : 'border-gray-300'}
              ${error ? 'border-red-500' : ''}
              ${className || ''}
            `}
          />
          
          {/* Efeito de foco neon apenas na borda inferior */}
          {isFocused && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-light-yellow shadow-neon"></div>
          )}
        </div>
        
        {/* Mensagem de erro */}
        {error && (
          <span className='text-red-500 text-sm mt-1 block'>{error}</span>
        )}
      </div>
    );
  }
);

// Definir displayName para o componente
Input.displayName = 'Input';

export default Input;