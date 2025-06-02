import { Label } from '@/components/ui/label'
import { ReactNode } from 'react'

interface ApplicationInfoSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function ApplicationInfoSection({ 
  title, 
  children, 
  className = '' 
}: ApplicationInfoSectionProps) {
  return (
    <div className={`space-y-4 border rounded-lg p-4 ${className}`}>
      <h3 className="font-semibold text-lg">{title}</h3>
      {children}
    </div>
  )
}

interface InfoFieldProps {
  label: string
  value: string | ReactNode
  className?: string
}

export function InfoField({ label, value, className = '' }: InfoFieldProps) {
  return (
    <div className={className}>
      <Label className="text-muted-foreground">{label}</Label>
      <div className="mt-1">{value}</div>
    </div>
  )
}