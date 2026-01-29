import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import type { Transaction } from '../types'

interface StatusBadgeProps {
  transaction: Transaction
}

export function StatusBadge({ transaction }: StatusBadgeProps) {
  const status = transaction.transaction_status || 'incomplete'

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-1 text-white bg-green-600/30 px-3 py-1 rounded-full text-sm">
        <CheckCircle size={16} />
        <span>تکمیل‌شده</span>
      </div>
    )
  }

  if (status === 'conditional') {
    return (
      <div className="flex items-center gap-1 text-white bg-purple-600/30 px-3 py-1 rounded-full text-sm">
        <AlertCircle size={16} />
        <span>شرطی</span>
      </div>
    )
  }

  if (status === 'incomplete') {
    return (
      <div className="flex items-center gap-1 text-white bg-red-600/30 px-3 py-1 rounded-full text-sm">
        <XCircle size={16} />
        <span>تکمیل‌نشده</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-white bg-gray-600/30 px-3 py-1 rounded-full text-sm">
      <Clock size={16} />
      <span>نامشخص</span>
    </div>
  )
}