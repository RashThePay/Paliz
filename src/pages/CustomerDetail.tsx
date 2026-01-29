import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Layout } from '../components/Layout'
import { ArrowRight, Edit, Trash2, Check, X, Phone, FileText, Download } from 'lucide-react'
import { TransactionCard } from '../components/TransactionCard'
import html2pdf from 'html2pdf.js'

export function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { customers, transactions, fetchCustomers, fetchTransactions, updateCustomer, deleteCustomer } = useStore()
  
  const [customer, setCustomer] = useState(customers.find(c => c.id === id))
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    notes: customer?.notes || ''
  })

  useEffect(() => {
    fetchCustomers()
    fetchTransactions()
  }, [])

  useEffect(() => {
    const found = customers.find(c => c.id === id)
    setCustomer(found)
    if (found) {
      setEditData({
        name: found.name,
        phone: found.phone || '',
        notes: found.notes || ''
      })
    }
  }, [id, customers])

  if (!customer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-400">مشتری یافت نشد</p>
        </div>
      </Layout>
    )
  }

  const customerTransactions = transactions.filter(t => t.customer_id === customer.id)
  const stats = {
    total: customerTransactions.reduce((sum, t) => sum + (t.total_value || 0), 0),
    received: customerTransactions.reduce((sum, t) => sum + t.amount_received, 0),
    remaining: customerTransactions.reduce((sum, t) => sum + (t.amount_remaining || 0), 0),
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num))
  }

  const handleSave = async () => {
    await updateCustomer(customer.id, editData)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (customerTransactions.length > 0) {
      alert('نمی‌توانید مشتری با معاملات موجود را حذف کنید')
      return
    }
    
    if (confirm('آیا مطمئن هستید که می‌خواهید این مشتری را حذف کنید؟')) {
      await deleteCustomer(customer.id)
      navigate('/customers')
    }
  }

  const handleExportPDF = () => {
    // Create HTML content for PDF
    const htmlContent = document.createElement('div')
    htmlContent.style.cssText = 'direction: rtl; font-family: Vazirmatn, sans-serif; padding: 20px; background: white; color: #333;'
    
    const now = new Date().toLocaleDateString('fa-IR')
    
    let html = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px; color: #333;">گزارش مشتری</h1>
      </div>
      
      <div style="margin-bottom: 15px; border-bottom: 2px solid #ddd; padding-bottom: 10px;">
        <p style="margin: 5px 0; font-size: 14px;"><strong>نام:</strong> ${customer.name}</p>
        ${customer.phone ? `<p style="margin: 5px 0; font-size: 14px;"><strong>تماس:</strong> ${customer.phone}</p>` : ''}
        ${customer.notes ? `<p style="margin: 5px 0; font-size: 12px;"><strong>یادداشت:</strong> ${customer.notes}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-left: 3px solid #0066cc;">
        <p style="margin: 3px 0; font-size: 13px;"><strong>کل معاملات:</strong> ${formatNumber(stats.total)} تومان</p>
        <p style="margin: 3px 0; font-size: 13px;"><strong>دریافتی:</strong> <span style="color: green;">${formatNumber(stats.received)} تومان</span></p>
        <p style="margin: 3px 0; font-size: 13px;"><strong>مانده:</strong> <span style="color: red;">${formatNumber(stats.remaining)} تومان</span></p>
      </div>
      
      <h2 style="font-size: 16px; margin: 15px 0 10px 0; border-bottom: 2px solid #333; padding-bottom: 5px;">معاملات</h2>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f0f0f0; border-bottom: 2px solid #333;">
            <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">ردیف</th>
            <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">تاریخ</th>
            <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">نوع</th>
            <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">مقدار</th>
            <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">ارز</th>
            <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">وضعیت</th>
            ${customerTransactions.some(t => t.rate !== null && t.rate !== undefined) ? '<th style="padding: 8px; text-align: right; border: 1px solid #ddd;">نرخ</th>' : ''}
            <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">دریافتی</th>
          </tr>
        </thead>
        <tbody>
    `
    
    customerTransactions.forEach((transaction, index) => {
      const typeLabel = transaction.transaction_type === 'sell' ? 'فروش' :
                       transaction.transaction_type === 'buy' ? 'خرید' :
                       transaction.transaction_type === 'manual' ? 'دستی' :
                       transaction.transaction_type === 'loan' ? 'قرض' : transaction.transaction_type
      
      const statusLabel = transaction.transaction_status === 'completed' ? '✓ تکمیل' :
                         transaction.transaction_status === 'conditional' ? '⚠ شرطی' : '✗ ناقص'
      
      const rateCell = transaction.rate !== null && transaction.rate !== undefined 
        ? `<td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatNumber(transaction.rate)}</td>`
        : ''
      
      html += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${index + 1}</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${transaction.transaction_date}</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${typeLabel}</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatNumber(transaction.amount)}</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${transaction.currency}</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${statusLabel}</td>
          ${rateCell}
          <td style="padding: 8px; text-align: right; border: 1px solid #ddd; color: green;">${formatNumber(transaction.amount_received)}</td>
        </tr>
      `
    })
    
    html += `
        </tbody>
      </table>
      
      <div style="font-size: 10px; color: #666; text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd;">
        <p>تاریخ صادور: ${now}</p>
      </div>
    `
    
    htmlContent.innerHTML = html
    
    const options = {
      margin: 10,
      filename: `${customer.name}-گزارش.pdf`,
      image: { type: 'jpeg' as "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait' as 'portrait', unit: 'mm', format: 'a4' }
    }
    
    html2pdf().set(options).from(htmlContent).save()
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pb-20">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-2 text-gray-300 hover:text-gray-100"
            >
              <ArrowRight size={20} />
              <span>بازگشت</span>
            </button>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleExportPDF}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="دانلود PDF"
                  >
                    <Download size={20} />
                  </button>
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

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">نام</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">شماره تماس</label>
                <input
                  type="text"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">یادداشت</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-100 mb-2">{customer.name}</h1>
              {customer.phone && (
                <div className="flex items-center gap-2 text-gray-300 mb-2">
                  <Phone size={16} />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.notes && (
                <div className="flex items-start gap-2 text-gray-300 bg-gray-900 p-3 rounded-lg">
                  <FileText size={16} className="mt-0.5" />
                  <p className="text-sm">{customer.notes}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* آمار */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-300 mb-1">کل معاملات</p>
            <p className="text-lg font-bold text-gray-100">{formatNumber(stats.total)}</p>
            <p className="text-xs text-gray-400">{customerTransactions.length} معامله</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-xs text-green-600 mb-1">دریافتی</p>
            <p className="text-lg font-bold text-green-600">{formatNumber(stats.received)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-xs text-red-600 mb-1">مانده</p>
            <p className="text-lg font-bold text-red-600">{formatNumber(stats.remaining)}</p>
          </div>
        </div>

        {/* لیست معاملات */}
        <div>
          <h2 className="text-lg font-semibold mb-3">معاملات</h2>
          {customerTransactions.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
              هیچ معامله‌ای ثبت نشده
            </div>
          ) : (
            customerTransactions.map(transaction => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}