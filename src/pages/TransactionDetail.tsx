import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Layout } from '../components/Layout'
import { StatusBadge } from '../components/StatusBadge'
import { PaymentsList } from '../components/PaymentsList'
import { ArrowRight, Edit, Trash2, Check, X } from 'lucide-react'

export function TransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { transactions, updateTransaction, deleteTransaction, addTransactionUpdate } = useStore()
  
  const [transaction, setTransaction] = useState(transactions.find(t => t.id === id))
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    transaction_status: transaction?.transaction_status || 'incomplete',
    goods_delivered: transaction?.goods_delivered || false,
    payment_received: transaction?.payment_received || false,
    description: transaction?.description || ''
  })

  useEffect(() => {
    const found = transactions.find(t => t.id === id)
    setTransaction(found)
    if (found) {
      setEditData({
        transaction_status: found.transaction_status || 'incomplete',
        goods_delivered: found.goods_delivered,
        payment_received: found.payment_received,
        description: found.description || ''
      })
    }
  }, [id, transactions])

  if (!transaction) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-400">معامله یافت نشد</p>
        </div>
      </Layout>
    )
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num)
  }

  const handleSave = async () => {
    await updateTransaction(transaction.id, editData)
    
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
        <div className="bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-300 hover:text-gray-100"
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
                    className="p-2 text-gray-300 hover:bg-gray-900 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-100 mb-2">
                {transaction.customer?.name}
              </h1>
              <p className="text-gray-300">{transaction.transaction_date}</p>
            </div>
            <StatusBadge transaction={transaction} />
          </div>
        </div>

        {/* اطلاعات معامله */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">اطلاعات معامله</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-300">نوع معامله:</span>
              <span className="font-semibold">
                {transaction.transaction_type === 'sell' ? '📤 فروش' : 
                 transaction.transaction_type === 'buy' ? '📥 خرید' :
                 transaction.transaction_type === 'manual' ? '🖊️ دستی' : 
                 transaction.transaction_type === 'loan' ? '🔄 قرض' : transaction.transaction_type}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-300">مقدار:</span>
              <span className="font-semibold">
                {formatNumber(transaction.amount)} {transaction.currency}
              </span>
            </div>

            {transaction.rate !== null && transaction.rate !== undefined && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-300">نرخ:</span>
                <span className="font-semibold">{formatNumber(transaction.rate)} تومان</span>
              </div>
            )}

            {transaction.rate !== null && transaction.rate !== undefined && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-300">مبلغ کل:</span>
                <span className="font-bold text-blue-600">
                  {formatNumber(transaction.total_value || 0)} تومان
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-300">مبلغ دریافتی:</span>
              <span className="font-semibold text-green-600">
                {formatNumber(transaction.amount_received)} تومان
              </span>
            </div>

            {transaction.rate !== null && transaction.rate !== undefined && (
              <div className="flex justify-between py-2">
                <span className="text-gray-300">مانده:</span>
                <span className={`font-bold ${transaction.amount_remaining! > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatNumber(transaction.amount_remaining || 0)} تومان
                </span>
              </div>
            )}
          </div>
        </div>

        {/* پرداخت‌ها - جدید */}
        <div className="mb-4">
          <PaymentsList
            transactionId={transaction.id}
            payments={transaction.payments || []}
            totalAmount={transaction.total_value || 0}
          />
        </div>

        {/* وضعیت معامله */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">وضعیت معامله</h2>
          
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  وضعیت
                </label>
                <select
                  value={editData.transaction_status}
                  onChange={(e) => setEditData({ ...editData, transaction_status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white"
                >
                  <option value="incomplete">ناقص</option>
                  <option value="conditional">شرطی</option>
                  <option value="completed">تکمیل شده</option>
                </select>
              </div>
              
              {editData.transaction_status !== 'conditional' && (
                <>
                  <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <input
                      type="checkbox"
                      checked={editData.goods_delivered}
                      onChange={(e) => setEditData({ ...editData, goods_delivered: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600"
                    />
                    <span>کالا تحویل داده شده</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <input
                      type="checkbox"
                      checked={editData.payment_received}
                      onChange={(e) => setEditData({ ...editData, payment_received: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600"
                    />
                    <span>پول دریافت شده</span>
                  </label>
                </>
              )}

              {editData.transaction_status === 'conditional' && (
                <div className="bg-orange-800 p-3 rounded-lg text-sm text-orange-100">
                  ⚠️ برای معاملات شرطی، نرخ و مانده قابل محاسبه نیست
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-300">وضعیت:</span>
                <StatusBadge transaction={transaction} />
              </div>
              
              {transaction.transaction_status !== 'conditional' && (
                <>
                  <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <input
                      type="checkbox"
                      checked={transaction.goods_delivered}
                      disabled
                      className="w-5 h-5 rounded text-blue-600"
                    />
                    <span className={transaction.goods_delivered ? 'text-green-600 font-semibold' : 'text-gray-200'}>
                      کالا تحویل داده شده
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <input
                      type="checkbox"
                      checked={transaction.payment_received}
                      disabled
                      className="w-5 h-5 rounded text-blue-600"
                    />
                    <span className={transaction.payment_received ? 'text-green-600 font-semibold' : 'text-gray-200'}>
                      پول دریافت شده
                    </span>
                  </label>
                </>
              )}

              {transaction.transaction_status === 'conditional' && (
                <div className="bg-purple-800 p-3 rounded-lg text-sm text-purple-100">
                  ℹ️ این معامله شرطی است
                </div>
              )}
            </div>
          )}
        </div>

        {/* توضیحات */}
        {(transaction.description || isEditing) && (
          <div className="bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">توضیحات</h2>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg"
                rows={4}
              />
            ) : (
              <p className="text-gray-200 whitespace-pre-wrap">
                {transaction.description || 'بدون توضیحات'}
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}