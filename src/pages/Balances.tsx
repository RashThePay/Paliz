import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Layout } from '../components/Layout'
import { Edit, Check, X } from 'lucide-react'

export function Balances() {
  const { currencies, balances, fetchCurrencies, fetchBalances, upsertBalance } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCurrencies()
    fetchBalances()
  }, [fetchCurrencies, fetchBalances])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num * 100) / 100)
  }

  const getBalance = (currencyId: string) => {
    const balance = balances.find(b => b.currency_id === currencyId)
    return balance?.amount || 0
  }

  const handleEdit = (currencyId: string) => {
    const currentBalance = getBalance(currencyId)
    setEditingId(currencyId)
    setEditValues({ [currencyId]: currentBalance.toString() })
  }

  const handleSave = async (currencyId: string) => {
    const value = parseFloat(editValues[currencyId] || '0')
    if (!isNaN(value)) {
      await upsertBalance(currencyId, value)
      setEditingId(null)
      setEditValues({})
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">موجودی‌های ارزی</h1>
          <p className="text-gray-400 text-sm">
            موجودی فعلی برای هر ارز را مشاهده و ویرایش کنید
          </p>
        </div>

        {/* Balances List */}
        <div className="space-y-3">
          {currencies.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
              <p>هیچ ارزی تعریف نشده</p>
              <p className="text-sm mt-2">برای شروع ابتدا ارز جدید اضافه کنید</p>
            </div>
          ) : (
            currencies.map((currency) => {
              const currentBalance = getBalance(currency.id)
              const isEditing = editingId === currency.id

              return (
                <div
                  key={currency.id}
                  className="bg-gray-800 rounded-lg shadow-sm p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-100">
                          {currency.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          نماد: {currency.symbol}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editValues[currency.id] || ''}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              [currency.id]: e.target.value
                            })
                          }
                          className="w-32 px-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white text-right"
                          placeholder="0"
                          autoFocus
                        />
                        <span className="text-sm text-gray-300 min-w-max">
                          {currency.symbol}
                        </span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-400">
                          {formatNumber(currentBalance)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {currency.symbol}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(currency.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="ذخیره"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 text-gray-300 hover:bg-gray-900 rounded-lg transition"
                            title="انصراف"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(currency.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="ویرایش"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}
