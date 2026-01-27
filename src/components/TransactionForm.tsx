import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { CustomerSelect } from './CustomerSelect'
import { X } from 'lucide-react'

export function TransactionForm() {
  const navigate = useNavigate()
  const { addTransaction, addCustomer } = useStore()
  
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')

  const [formData, setFormData] = useState({
    customer_id: '',
    transaction_date: new Date().toLocaleDateString('fa-IR'),
    transaction_type: 'sell' as 'buy' | 'sell',
    amount: '',
    currency: 'دلار',
    rate: '',
    goods_delivered: false,
    payment_received: false,
    amount_received: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let customerId = formData.customer_id

    // اگر مشتری جدید اضافه شده
    if (showNewCustomer && newCustomerName) {
      const { data } = await addCustomer({
        name: newCustomerName,
        phone: newCustomerPhone
      })
      if (data) {
        customerId = data[0].id
      }
    }

    await addTransaction({
      ...formData,
      customer_id: customerId,
      amount: parseFloat(formData.amount),
      rate: parseFloat(formData.rate),
      amount_received: parseFloat(formData.amount_received || '0')
    })

    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">معامله جدید</h2>
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* مشتری */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مشتری
            </label>
            {!showNewCustomer ? (
              <div className="space-y-2">
                <CustomerSelect
                  value={formData.customer_id}
                  onChange={(id) => setFormData({ ...formData, customer_id: id })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + افزودن مشتری جدید
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <input
                  type="text"
                  placeholder="نام مشتری"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="شماره تماس (اختیاری)"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(false)}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  انصراف
                </button>
              </div>
            )}
          </div>

          {/* تاریخ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ
            </label>
            <input
              type="text"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              placeholder="1404/11/05"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* نوع معامله */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع معامله
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="sell"
                  checked={formData.transaction_type === 'sell'}
                  onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value as 'sell' })}
                  className="text-blue-600"
                />
                <span>فروش</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="buy"
                  checked={formData.transaction_type === 'buy'}
                  onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value as 'buy' })}
                  className="text-blue-600"
                />
                <span>خرید</span>
              </label>
            </div>
          </div>

          {/* مبلغ و واحد */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مبلغ
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                واحد
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>

          {/* نرخ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نرخ (تومان)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* مبلغ کل */}
          {formData.amount && formData.rate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <span className="text-sm text-gray-600">مبلغ کل: </span>
              <span className="text-lg font-bold text-blue-600">
                {new Intl.NumberFormat('fa-IR').format(
                  parseFloat(formData.amount) * parseFloat(formData.rate)
                )} تومان
              </span>
            </div>
          )}

          {/* مبلغ دریافتی */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مبلغ دریافتی (تومان)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount_received}
              onChange={(e) => setFormData({ ...formData, amount_received: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="0"
            />
          </div>

          {/* وضعیت */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.goods_delivered}
                onChange={(e) => setFormData({ ...formData, goods_delivered: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className="text-sm">کالا تحویل داده شده</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.payment_received}
                onChange={(e) => setFormData({ ...formData, payment_received: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span className="text-sm">پول دریافت شده</span>
            </label>
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              توضیحات
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="توضیحات اضافی..."
            />
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              ذخیره معامله
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}