import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { TransactionCard } from '../components/TransactionCard'
import { Layout } from '../components/Layout'
import { Search, Filter, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export function Dashboard() {
  const { transactions, fetchTransactions, loading } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'partial' | 'pending'>('all')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    if (statusFilter === 'complete') {
      return t.goods_delivered && t.payment_received
    } else if (statusFilter === 'partial') {
      return (t.goods_delivered || t.payment_received) && !(t.goods_delivered && t.payment_received)
    } else if (statusFilter === 'pending') {
      return !t.goods_delivered && !t.payment_received
    }
    
    return true
  })

  // محاسبات آماری
  const stats = {
    total: transactions.reduce((sum, t) => sum + (t.total_value || 0), 0),
    received: transactions.reduce((sum, t) => sum + t.amount_received, 0),
    remaining: transactions.reduce((sum, t) => sum + (t.amount_remaining || 0), 0),
    completeCount: transactions.filter(t => t.goods_delivered && t.payment_received).length,
    pendingCount: transactions.filter(t => !t.goods_delivered || !t.payment_received).length,
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
      {/* آمار کلی */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <DollarSign size={20} />
            <span className="text-sm">کل معاملات</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {formatNumber(stats.total)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{transactions.length} معامله</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm">دریافتی</span>
          </div>
          <p className="text-lg font-bold text-green-600">
            {formatNumber(stats.received)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.completeCount} تکمیل شده</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <TrendingDown size={20} />
            <span className="text-sm">مانده</span>
          </div>
          <p className="text-lg font-bold text-red-600">
            {formatNumber(stats.remaining)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.pendingCount} ناقص</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Filter size={20} />
            <span className="text-sm">وضعیت</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1 w-full"
          >
            <option value="all">همه</option>
            <option value="complete">تکمیل شده</option>
            <option value="partial">در جریان</option>
            <option value="pending">ناقص</option>
          </select>
        </div>
      </div>

      {/* جستجو */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="جستجو در معاملات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* لیست معاملات */}
      <div className="pb-20">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">هیچ معامله‌ای یافت نشد</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))
        )}
      </div>
    </Layout>
  )
}