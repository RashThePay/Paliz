import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Layout } from '../components/Layout'
import { StatusBadge } from '../components/StatusBadge'
import { ArrowRight, Edit, Trash2, Check, X } from 'lucide-react'

export function TransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { transactions, updateTransaction, deleteTransaction, addTransactionUpdate } = useStore()
  
  const [transaction, setTransaction] = useState(transactions.find(t => t.id === id))
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    goods_delivered: transaction?.goods_delivered || false,
    payment_received: transaction?.payment_received || false,
    amount_received: transaction?.amount_received || 0,
    description: transaction?.description || ''
  })

  useEffect(() => {
    const found = transactions.find(t => t.id === id)
    setTransaction(found)
    if (found) {
      setEditData({
        goods_delivered: found.goods_delivered,
        payment_received: found.payment_received,
        amount_received: found.amount_received,
        description: found.description || ''
      })
    }
  }, [id, transactions])

  if (!transaction) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">معامله یافت نشد</p>
        </div>
      </Layout>
    )
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num)
  }

  const handleSave = async () => {
    await updateTransaction(transaction.id, editData)
    
    // ثبت تغییرات
    if (editData.goods_delivered !== transaction.goods_delivered) {
      await addTransactionUpdate(
        transaction.id,
        editData.goods_delivered ? 'goods_delivered' : 'goods_not_delivered',
        editData.goods_delivered ? 'کالا تحویل داده شد' : 'تحویل کالا لغو شد'
      )
    }
    if (editData.payment_received !== transaction.payment_received) {
      await addTransactionUpdate(
        transaction.id,
        editData.payment_received ? 'payment_received' : 'payment_not_received',
        editData.payment_received ? 'پول دریافت شد' : 'دریافت پول لغو شد'
      )
    }
    
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این معامله را حذف کنید؟')) {
      await deleteTransaction(transaction.id)
      navigate('/')
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pb-20">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowRight size={20} />
              <span>بازگشت</span>
            </button>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {transaction.customer?.name}
              </h1>
              <p className="text-gray-600">{transaction.transaction_date}</p>
            </div>
            <StatusBadge transaction={transaction} />
          </div>
        </div>

        {/* اطلاعات معامله */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">اطلاعات معامله</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">نوع معامله:</span>
              <span className="font-semibold">
                {transaction.transaction_type === 'sell' ? '📤 فروش' : '📥 خرید'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">مقدار:</span>
              <span className="font-semibold">
                {formatNumber(transaction.amount)} {transaction.currency}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">نرخ:</span>
              <span className="font-semibold">{formatNumber(transaction.rate)} تومان</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">مبلغ کل:</span>
              <span className="font-bold text-blue-600">
                {formatNumber(transaction.total_value || 0)} تومان
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">مبلغ دریافتی:</span>
              <span className="font-semibold text-green-600">
                {formatNumber(transaction.amount_received)} تومان
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-600">مانده:</span>
              <span className={`font-bold ${transaction.amount_remaining! > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatNumber(transaction.amount_remaining || 0)} تومان
              </span>
            </div>
          </div>
        </div>

        {/* وضعیت */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">وضعیت معامله</h2>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={editData.goods_delivered}
                onChange={(e) => setEditData({ ...editData, goods_delivered: e.target.checked })}
                disabled={!isEditing}
                className="w-5 h-5 rounded text-blue-600"
              />
              <span className={editData.goods_delivered ? 'text-green-600 font-semibold' : 'text-gray-700'}>
                کالا تحویل داده شده
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={editData.payment_received}
                onChange={(e) => setEditData({ ...editData, payment_received: e.target.checked })}
                disabled={!isEditing}
                className="w-5 h-5 rounded text-blue-600"
              />
              <span className={editData.payment_received ? 'text-green-600 font-semibold' : 'text-gray-700'}>
                پول دریافت شده
              </span>
            </label>
          </div>

          {isEditing && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مبلغ دریافتی (تومان)
              </label>
              <input
                type="number"
                value={editData.amount_received}
                onChange={(e) => setEditData({ ...editData, amount_received: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* توضیحات */}
        {(transaction.description || isEditing) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">توضیحات</h2>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={4}
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {transaction.description || 'بدون توضیحات'}
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}