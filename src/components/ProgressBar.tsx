import React, { useEffect, useState } from 'react'

interface ProgressBarProps {
  steps: string[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
}

/**
 * Componente de barra de progresso para formulários multi-etapas
 * Com animação de água fluindo entre os passos
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ 
  steps, 
  currentStep, 
  onStepClick 
}) => {
  const [previousStep, setPreviousStep] = useState(0);
  const [isFlowing, setIsFlowing] = useState(false);
  
  // Detecta mudanças de etapa para acionar animação
  useEffect(() => {
    if (currentStep !== previousStep) {
      setIsFlowing(true);
      
      // Tempo suficiente para a animação de fluxo completar
      const timer = setTimeout(() => {
        setIsFlowing(false);
        setPreviousStep(currentStep);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, previousStep]);

  // Verifica se um passo está ativo ou completo
  const isStepActive = (stepIndex: number): boolean => {
    return stepIndex === currentStep;
  }
  
  const isStepCompleted = (stepIndex: number): boolean => {
    return stepIndex < currentStep;
  }
  
  // Verifica se um passo é clicável
  const isStepClickable = (stepIndex: number): boolean => {
    return !!onStepClick && stepIndex <= currentStep;
  }

  return (
    <div className="w-full mb-12 pt-4">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const active = isStepActive(index);
          const completed = isStepCompleted(index);
          const clickable = isStepClickable(index);
          
          return (
            <React.Fragment key={index}>
              {/* Step Container */}
              <div className="relative">
                {/* Step Square */}
                <div 
                  className={`
                    progress-step relative flex items-center justify-center
                    border-2 transform rotate-45
                    ${active || completed ? 'border-light-yellow' : 'border-gray-300'}
                    ${clickable ? 'cursor-pointer' : ''}
                    overflow-hidden
                  `}
                  onClick={() => clickable && onStepClick?.(index)}
                >
                  {/* Water Fill Animation */}
                  <div 
                    className={`
                      absolute bottom-0 left-0 w-full bg-peach-cream
                      ${(active || completed) ? 'h-full' : 'h-0'}
                      transition-all duration-1000
                    `}
                    style={{
                      animation: active ? 'fillWater 1s ease-out forwards' : 'none',
                      height: completed ? '100%' : '0%',
                      transitionDelay: `${index * 0.3}s`
                    }}
                  ></div>
                  
                  {/* Step Content */}
                  <div className="relative z-10 transform -rotate-45">
                    {completed ? (
                      <svg 
                        className="w-6 h-6 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    ) : (
                      <span className={`text-lg font-medium ${active || completed ? 'text-white' : 'text-gray-500'}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Step Label */}
                <span 
                  className={`
                    absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap
                    font-clash
                    ${active ? 'font-bold text-light-yellow' : 'text-steel-gray'}
                  `}
                >
                  {step}
                </span>
              </div>

              {/* Connector - Water Pipe */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-1 relative">
                  <div className="absolute inset-0 border-b-2 border-gray-300"></div>
                  
                  {/* Flowing Water Animation */}
                  <div
                    className={`
                      absolute inset-y-0 left-0 border-b-2 border-light-yellow
                      transition-all duration-1000
                    `}
                    style={{
                      width: completed || (active && isFlowing && index < currentStep) ? '100%' : 
                             (previousStep > index) ? '100%' : '0%',
                      animation: isFlowing && currentStep > index && previousStep <= index ? 
                                 'flowWater 1.5s ease-out forwards' : 'none',
                      transitionDelay: `${index * 0.3}s`
                    }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  )
}

export default ProgressBar