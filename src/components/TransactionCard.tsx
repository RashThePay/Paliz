import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'
import { ChevronLeft } from 'lucide-react'
import type { Transaction } from '../types'

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num)
  }

  const getTransactionIcon = () => {
    return transaction.transaction_type === 'sell' ? '📤' : '📥'
  }

  return (
    <Link
      to={`/transaction/${transaction.id}`}
      className="block bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition mb-3"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTransactionIcon()}</span>
          <div>
            <h3 className="font-semibold text-gray-100">
              {transaction.customer?.name || 'بدون نام'}
            </h3>
            <p className="text-sm text-gray-400">{transaction.transaction_date}</p>
          </div>
        </div>
        <StatusBadge transaction={transaction} />
      </div>

      <div className="flex justify-between items-center text-sm">
        <div>
          <span className="text-gray-300">مقدار: </span>
          <span className="font-semibold">
            {formatNumber(transaction.amount)} {transaction.currency}
          </span>
        </div>
        <div>
          <span className="text-gray-300">نرخ: </span>
          <span className="font-semibold">{transaction.rate ? formatNumber(transaction.rate) : "؟"}</span>
        </div>
      </div>

      <div className="mt-2 flex justify-between items-center">
        <div className="text-sm">
          <span className="text-gray-300">کل: </span>
          <span className="font-bold text-blue-600">
            {formatNumber(transaction.total_value || 0)} تومان
          </span>
        </div>
        {transaction.amount_remaining! > 0 && (
          <div className="text-sm text-red-500">
            مانده: {formatNumber(transaction.amount_remaining!)} تومان
          </div>
        )}
      </div>

      {transaction.description && (
        <p className="mt-2 text-sm text-gray-300 line-clamp-1">
          {transaction.description}
        </p>
      )}

      <div className="mt-3 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={transaction.goods_delivered}
            readOnly
            className="rounded"
          />
          <span className="text-gray-300">تحویل کالا</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={transaction.payment_received}
            readOnly
            className="rounded"
          />
          <span className="text-gray-300">دریافت پول</span>
        </div>
      </div>

      <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
    </Link>
  )
}