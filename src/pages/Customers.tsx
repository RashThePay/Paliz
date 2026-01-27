import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Layout } from '../components/Layout'
import { Search, UserPlus, Phone, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Customers() {
  const { customers, fetchCustomers, transactions, fetchTransactions } = useStore()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCustomers()
    fetchTransactions()
  }, [])

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  )

  const getCustomerStats = (customerId: string) => {
    const customerTransactions = transactions.filter(t => t.customer_id === customerId)
    const total = customerTransactions.reduce((sum, t) => sum + (t.total_value || 0), 0)
    const remaining = customerTransactions.reduce((sum, t) => sum + (t.amount_remaining || 0), 0)
    return { count: customerTransactions.length, total, remaining }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num))
  }

  return (
    <Layout>
      <div className="pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">مشتریان</h1>
          <Link
            to="/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <UserPlus size={20} />
            <span>مشتری جدید</span>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="جستجو مشتری..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">هیچ مشتری‌ای یافت نشد</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => {
              const stats = getCustomerStats(customer.id)
              return (
                <div key={customer.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{customer.name}</h3>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Phone size={14} />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-600">{stats.count} معامله</div>
                      {stats.remaining > 0 && (
                        <div className="text-sm text-red-600 font-semibold">
                          مانده: {formatNumber(stats.remaining)}
                        </div>
                      )}
                    </div>
                  </div>

                  {customer.notes && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <FileText size={14} className="mt-0.5" />
                      <p className="line-clamp-2">{customer.notes}</p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                    <div>
                      <span className="text-gray-600">کل معاملات: </span>
                      <span className="font-semibold">{formatNumber(stats.total)} تومان</span>
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