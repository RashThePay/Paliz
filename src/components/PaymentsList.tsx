import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Trash2 } from 'lucide-react'
import { PaymentMethodLabels } from '../types'
import type { Payment } from '../types'

interface PaymentsListProps {
  transactionId: string
  payments: Payment[]
  totalAmount: number
}

export function PaymentsList({ transactionId, payments, totalAmount }: PaymentsListProps) {
  const { addPayment, deletePayment } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'cash' as 'cash' | 'card_to_card' | 'pos',
    payment_date: new Date().toLocaleDateString('fa-IR'),
    description: ''
  })

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num)
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = totalAmount - totalPaid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await addPayment({
      transaction_id: transactionId,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method,
      payment_date: formData.payment_date,
      description: formData.description
    })

    setFormData({
      amount: '',
      payment_method: 'cash',
      payment_date: new Date().toLocaleDateString('fa-IR'),
      description: ''
    })
    setShowForm(false)
  }

  const handleDelete = async (paymentId: string) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این پرداخت را حذف کنید؟')) {
      await deletePayment(paymentId)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">پرداخت‌ها</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
        >
          <Plus size={16} />
          <span>افزودن پرداخت</span>
        </button>
      </div>

      {/* خلاصه */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-900 rounded-lg">
        <div>
          <p className="text-xs text-gray-300">کل مبلغ</p>
          <p className="font-semibold text-sm">{formatNumber(totalAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-green-600">پرداخت شده</p>
          <p className="font-semibold text-sm text-green-600">{formatNumber(totalPaid)}</p>
        </div>
        <div>
          <p className="text-xs text-red-600">مانده</p>
          <p className="font-semibold text-sm text-red-600">{formatNumber(remaining)}</p>
        </div>
      </div>

      {/* فرم افزودن پرداخت */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border border-blue-700 rounded-lg bg-blue-950">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                مبلغ (تومان)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-700 rounded-lg"
                required
                placeholder={`حداکثر: ${formatNumber(remaining)}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                روش پرداخت
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                className="w-full *:bg-blue-900 px-3 py-2 border border-gray-700 rounded-lg"
              >
                <option value="cash">{PaymentMethodLabels.cash}</option>
                <option value="card_to_card">{PaymentMethodLabels.card_to_card}</option>
                <option value="pos">{PaymentMethodLabels.pos}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                تاریخ
              </label>
              <input
                type="text"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-700 rounded-lg"
                placeholder="1404/11/05"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                توضیحات (اختیاری)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-700 rounded-lg"
                placeholder="مثال: واریز به حساب مهرجو"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-gray-900 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                ثبت پرداخت
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 bg-gray-800 text-gray-200 py-2 rounded-lg text-sm"
              >
                انصراف
              </button>
            </div>
          </div>
        </form>
      )}

      {/* لیست پرداخت‌ها */}
      <div className="space-y-2">
        {payments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">هیچ پرداختی ثبت نشده</p>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="flex justify-between items-center p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {payment.payment_method === 'cash' && '💵'}
                  {payment.payment_method === 'card_to_card' && '💳'}
                  {payment.payment_method === 'pos' && '📱'}
                </div>
                <div>
                  <p className="font-semibold text-gray-100">
                    {formatNumber(payment.amount)} تومان
                  </p>
                  <p className="text-xs text-gray-300">
                    {PaymentMethodLabels[payment.payment_method]} • {payment.payment_date}
                  </p>
                  {payment.description && (
                    <p className="text-xs text-gray-400 mt-1">{payment.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(payment.id)}
                className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}