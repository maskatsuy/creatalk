import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { categoryLabels } from '../constants'

export const formatDate = (date: string) => {
  return format(new Date(date), 'yyyy年MM月dd日 HH:mm', { locale: ja })
}

export const getCategoryLabel = (category: string) => {
  return categoryLabels[category] || category
}