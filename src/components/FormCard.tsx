import React, { ReactNode } from 'react'
import ProgressBar from './ProgressBar'

interface FormCardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  steps?: string[]
  currentStep?: number
  onStepClick?: (stepIndex: number) => void
  actions?: ReactNode
  className?: string
}

/**
 * Componente FormCard para uniformizar a exibição dos formulários do sistema
 */
const FormCard: React.FC<FormCardProps> = ({
  children,
  title,
  subtitle,
  steps,
  currentStep = 0,
  onStepClick,
  actions,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl overflow-hidden ${className}`}>
      {title && (
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-clash text-steel-gray">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      {steps && steps.length > 0 && (
        <div className="px-6 pt-6">
          <ProgressBar 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={onStepClick}
          />
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
      
      {actions && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {actions}
        </div>
      )}
    </div>
  )
}

export default FormCard