import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { TransactionCard } from '../components/TransactionCard'
import { Layout } from '../components/Layout'
import { Search, Filter, TrendingUp, TrendingDown, DollarSign, Wallet, AlertCircle } from 'lucide-react'

export function Dashboard() {
  const { transactions, balances, fetchTransactions, fetchBalances, fetchCurrencies, loading } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'conditional' | 'incomplete'>('all')

  useEffect(() => {
    fetchTransactions()
    fetchBalances()
    fetchCurrencies()
  }, [])

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter !== 'all') {
      return t.transaction_status === statusFilter
    }

    return true
  })

  // محاسبات آماری
  const stats = {
    total: transactions.reduce((sum, t) => sum + (t.total_value || 0), 0),
    received: transactions.reduce((sum, t) => sum + t.amount_received, 0),
    remaining: transactions.reduce((sum, t) => sum + (t.amount_remaining || 0), 0),
    completedCount: transactions.filter(t => t.transaction_status === 'completed').length,
    conditionalCount: transactions.filter(t => t.transaction_status === 'conditional').length,
    incompleteCount: transactions.filter(t => t.transaction_status === 'incomplete').length,
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num))
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* آمار کلی */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <DollarSign size={20} />
            <span className="text-sm">کل معاملات</span>
          </div>
          <p className="text-lg font-bold text-gray-100">
            {formatNumber(stats.total)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{transactions.length} معامله</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm">دریافتی</span>
          </div>
          <p className="text-lg font-bold text-green-500">
            {formatNumber(stats.received)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{stats.completedCount} تکمیل شده</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <TrendingDown size={20} />
            <span className="text-sm">مانده</span>
          </div>
          <p className="text-lg font-bold text-red-500">
            {formatNumber(stats.remaining)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{stats.incompleteCount} ناقص</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Filter size={20} />
            <span className="text-sm">وضعیت</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm  *:bg-gray-900 border border-gray-700 rounded px-2 py-1 w-full"
          >
            <option value="all">همه</option>
            <option value="completed">✓ تکمیل شده</option>
            <option value="conditional">⚠ شرطی</option>
            <option value="incomplete">✗ ناقص</option>
          </select>
        </div>
      </div>

      {/* جستجو */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input
            type="text"
            placeholder="جستجو در معاملات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* وضعیت‌های معامله */}
      {stats.conditionalCount > 0 && (
        <div className="mb-4 bg-orange-900/20 border border-orange-800 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={18} className="text-orange-500 mt-0.5 shrink-0" />
          <div className="text-sm text-orange-100">
            <strong>{stats.conditionalCount}</strong> معامله شرطی در انتظار اطلاعات بیشتر است
          </div>
        </div>
      )}

      {/* لیست معاملات */}
      <div className="pb-20">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">هیچ معامله‌ای یافت نشد</p>
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