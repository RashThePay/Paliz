import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Layout } from '../components/Layout'
import { JalaliCalendar } from '../components/JalaliCalendar'
import { TransactionCard } from '../components/TransactionCard'
import { Calendar as CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { getTodayJalali, normalizeJalaliDate } from '../utils/dateHelpers'

export function Calendar() {
  const { transactions, fetchTransactions, loading } = useStore()
  const [selectedDate, setSelectedDate] = useState(getTodayJalali())

  useEffect(() => {
    fetchTransactions()
  }, [])

  // نرمال کردن تاریخ‌ها برای مقایسه
  const selectedTransactions = transactions.filter(t => {
    const normalized1 = normalizeJalaliDate(t.transaction_date)
    const normalized2 = normalizeJalaliDate(selectedDate)
    return normalized1 === normalized2
  })

  const transactionDates = [...new Set(transactions.map(t => normalizeJalaliDate(t.transaction_date)))]

  const dailyStats = {
    total: selectedTransactions.reduce((sum, t) => sum + (t.total_value || 0), 0),
    received: selectedTransactions.reduce((sum, t) => sum + t.amount_received, 0),
    remaining: selectedTransactions.reduce((sum, t) => sum + (t.amount_remaining || 0), 0),
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num))
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <CalendarIcon className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-100">تقویم معاملات</h1>
        </div>
        {/* تقویم */}
        <div className="mb-6">
          <JalaliCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            transactionDates={transactionDates}
          />
        </div>

        {/* آمار روز */}
        {selectedTransactions.length > 0 && (
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-3 mb-4">
            <div className="bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <CalendarIcon size={16} />
                <span className="text-xs">کل معاملات</span>
              </div>
              <p className="text-lg font-bold text-gray-100">
                {formatNumber(dailyStats.total)}
              </p>
              <p className="text-xs text-gray-400 mt-1">{selectedTransactions.length} معامله</p>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp size={16} />
                <span className="text-xs">دریافتی</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatNumber(dailyStats.received)}
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <TrendingDown size={16} />
                <span className="text-xs">مانده</span>
              </div>
              <p className="text-lg font-bold text-red-600">
                {formatNumber(dailyStats.remaining)}
              </p>
            </div>
          </div>
        )}

        {/* معاملات روز */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>معاملات روز</span>
            <span className="text-blue-600">{selectedDate}</span>
          </h2>

          {selectedTransactions.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <CalendarIcon className="mx-auto text-gray-200 mb-3" size={48} />
              <p className="text-gray-400">در این روز معامله‌ای ثبت نشده</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}