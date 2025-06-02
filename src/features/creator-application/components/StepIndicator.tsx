interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: '基本情報' },
    { number: 2, label: '活動内容' },
    { number: 3, label: '確認' }
  ]

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= step.number ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              <span className="text-sm font-semibold">{step.number}</span>
            </div>
            <span className={`text-sm ${currentStep >= step.number ? 'font-medium' : 'text-gray-600'}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  )
}