import { CheckCircle, Clock, XCircle } from 'lucide-react'
import type { Transaction } from '../types'

interface StatusBadgeProps {
  transaction: Transaction
}

export function StatusBadge({ transaction }: StatusBadgeProps) {
  const { goods_delivered, payment_received } = transaction

  if (goods_delivered && payment_received) {
    return (
      <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
        <CheckCircle size={16} />
        <span>تکمیل شده</span>
      </div>
    )
  }

  if (goods_delivered || payment_received) {
    return (
      <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm">
        <Clock size={16} />
        <span>در جریان</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm">
      <XCircle size={16} />
      <span>ناقص</span>
    </div>
  )
}