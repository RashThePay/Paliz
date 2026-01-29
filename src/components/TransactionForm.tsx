import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { CustomerSelect } from './CustomerSelect'
import { X } from 'lucide-react'

export function TransactionForm() {
    const navigate = useNavigate()
    const { addTransaction, addCustomer, fetchCurrencies, currencies } = useStore()

    const [showNewCustomer, setShowNewCustomer] = useState(false)
    const [newCustomerName, setNewCustomerName] = useState('')
    const [newCustomerPhone, setNewCustomerPhone] = useState('')
    const [loadingCustomer, setLoadingCustomer] = useState(false)
    const [loadingTransaction, setLoadingTransaction] = useState(false)
    const [showNewCurrency, setShowNewCurrency] = useState(false)
    const [newCurrencyName, setNewCurrencyName] = useState('')
    const [newCurrencySymbol, setNewCurrencySymbol] = useState('')

    useEffect(() => {
        fetchCurrencies()
    }, [fetchCurrencies])
    const [formData, setFormData] = useState<{
    customer_id: string;
    transaction_date: string;
    transaction_type: "sell" | "buy" | "manual" | "loan";
    transaction_status: "incomplete" | "conditional" | "completed";
    amount: string;
    currency: string;
    rate: string;
    total?: string;
    goods_delivered: boolean;
    payment_received: boolean;
    description: string;
}>({
        customer_id: '',
        transaction_date: new Date().toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '/'),
        transaction_type: 'sell' as 'buy' | 'sell' | 'manual' | 'loan',
        transaction_status: 'incomplete' as 'incomplete' | 'conditional' | 'completed',
        amount: '',
        currency: 'دلار',
        rate: '',
        total: undefined,
        goods_delivered: false,
        payment_received: false,
        description: ''
    })

    // Simple handlers - just update the field
    const handleAmountChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            amount: value
        }))
    }

    const handleRateChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            rate: value
        }))
    }

    const handleTotalChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            total: value
        }))
    }

    // Calculate missing field: if 2 fields are filled, calculate the 3rd
    const getCalculatedValues = () => {
        const amount = parseFloat(formData.amount) || 0
        const rate = parseFloat(formData.rate) || 0
        const total = parseFloat(formData.total || "0") || 0

        const amountFilled = formData.amount !== ''
        const rateFilled = formData.rate !== ''
        const totalFilled = formData.total !== ''

        // Count how many fields are filled
        const filledCount = [amountFilled, rateFilled, totalFilled].filter(Boolean).length

        // Only calculate if exactly 2 fields are filled
        if (filledCount === 2) {
            if (!amountFilled) {
                // Calculate amount from rate * total
                return { amount: rate > 0 ? (total / rate).toString() : '', rate: formData.rate, total: formData.total }
            } else if (!rateFilled) {
                // Calculate rate from total / amount
                return { amount: formData.amount, rate: amount > 0 ? (total / amount).toString() : '', total: formData.total }
            } else if (!totalFilled) {
                // Calculate total from amount * rate
                return { amount: formData.amount, rate: formData.rate, total: (amount * rate).toString() }
            }
        }

        // Return original values if not exactly 2 fields filled
        return { amount: formData.amount, rate: formData.rate, total: formData.total }
    }

    const displayValues = getCalculatedValues()

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!newCustomerName.trim()) {
            alert('لطفا نام مشتری را وارد کنید')
            return
        }

        setLoadingCustomer(true)
        try {
            const newCustomer = await addCustomer({
                name: newCustomerName,
                phone: newCustomerPhone
            })

            if (newCustomer) {
                setFormData({ ...formData, customer_id: newCustomer.id })
                setNewCustomerName('')
                setNewCustomerPhone('')
                setShowNewCustomer(false)
            } else {
                alert('خطا در ایجاد مشتری')
            }
        } finally {
            setLoadingCustomer(false)
        }
    }

    const handleAddCurrency = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!newCurrencyName.trim()) {
            alert('لطفا نام ارز را وارد کنید')
            return
        }

        try {
            const newCurrency = await useStore.getState().addCurrency({
                name: newCurrencyName,
                symbol: newCurrencySymbol || newCurrencyName
            })

            if (newCurrency) {
                setFormData({ ...formData, currency: newCurrency.name })
                setNewCurrencyName('')
                setNewCurrencySymbol('')
                setShowNewCurrency(false)
                fetchCurrencies()
            }
        } catch {
            alert('خطا در ایجاد ارز')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.customer_id) {
            alert('لطفا مشتری را انتخاب کنید')
            return
        }

        // اگر status = conditional است، rate نباید خالی باشد یا میتواند null باشد
        if (formData.transaction_status === 'conditional' && formData.rate) {
            alert('برای معاملات شرطی، نرخ قابل تنظیم نیست')
            return
        }
        delete formData.total
        setLoadingTransaction(true)
        try {
            await addTransaction({
                ...formData,
                amount: parseFloat(formData.amount),
                rate: formData.transaction_status === 'conditional' ? null : parseFloat(formData.rate),
                amount_received: 0
            })

            navigate('/')
        } finally {
            setLoadingTransaction(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-100">معامله جدید</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-gray-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* مشتری */}
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
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
                            <div className="space-y-2 p-4 border border-blue-800 rounded-lg bg-blue-900">
                                <input
                                    type="text"
                                    placeholder="نام مشتری"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    className="w-full px-4 py-2 border border-blue-700 rounded-lg"
                                    disabled={loadingCustomer}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="شماره تماس (اختیاری)"
                                    value={newCustomerPhone}
                                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-blue-700 rounded-lg"
                                    disabled={loadingCustomer}
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAddCustomer}
                                        disabled={loadingCustomer}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                    >
                                        {loadingCustomer ? 'در حال ذخیره...' : 'ثبت مشتری'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCustomer(false)}
                                        disabled={loadingCustomer}
                                        className="px-6 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                    >
                                        انصراف
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* تاریخ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            تاریخ
                        </label>
                        <input
                            type="text"
                            value={formData.transaction_date}
                            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                            placeholder="1404/11/05"
                            className="w-full px-4 py-2 border border-gray-700 rounded-lg"
                            required
                        />
                    </div>

                    {/* نوع معامله */}
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            نوع معامله
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {['sell', 'buy', 'manual', 'loan'].map((type) => (
                                <label key={type} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value={type}
                                        checked={formData.transaction_type === type}
                                        onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value as any })}
                                        className="text-blue-600"
                                    />
                                    <span>{type === 'sell' ? 'فروش' : type === 'buy' ? 'خرید' : type === 'manual' ? 'دستی' : 'قرض'}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* وضعیت معامله */}
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            وضعیت معامله
                        </label>
                        <div className="flex gap-3">
                            {['incomplete', 'conditional', 'completed'].map((status) => (
                                <label key={status} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        value={status}
                                        checked={formData.transaction_status === status}
                                        onChange={(e) => setFormData({ ...formData, transaction_status: e.target.value as any })}
                                        className="text-green-600"
                                    />
                                    <span>{status === 'incomplete' ? 'تکمیل‌نشده' : status === 'conditional' ? 'شرطی' : 'تکمیل شده'}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* مبلغ و نرخ و کل */}
                    <div className="space-y-3">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* مقدار */}
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-2">
                                    مقدار ({formData.currency})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={displayValues.amount}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white"
                                    placeholder="مقدار"
                                />
                            </div>

                            {/* نرخ */}
                            {formData.transaction_status !== 'conditional' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-2">
                                        نرخ (تومان)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={displayValues.rate}
                                        onChange={(e) => handleRateChange(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white"
                                        placeholder="نرخ"
                                    />
                                </div>
                            )}

                            {/* کل */}
                            {formData.transaction_status !== 'conditional' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-2">
                                        کل (تومان)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={displayValues.total}
                                        onChange={(e) => handleTotalChange(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white"
                                        placeholder="کل"
                                    />
                                </div>
                            )}
                        </div>

                        {/* خلاصه محاسبات */}
                        {displayValues.amount && displayValues.rate && formData.transaction_status !== 'conditional' && (
                            <div className="bg-blue-900/30 border border-blue-800 p-3 rounded-lg" style={{backgroundColor:(parseFloat(displayValues.amount) * parseFloat(displayValues.rate) == parseFloat(displayValues.total || "0")) ? 'unset': 'rgba(255,0,0,0.1)'}}>
                                <div className="text-sm text-blue-200">
                                    <span className="font-semibold">{new Intl.NumberFormat('fa-IR').format(parseFloat(displayValues.amount))}</span> {formData.currency} ×{' '}
                                    <span className="font-semibold">{new Intl.NumberFormat('fa-IR').format(parseFloat(displayValues.rate) || 0)}</span> تومان = {' '}
                                    <span className="font-bold text-blue-300">
                                        {new Intl.NumberFormat('fa-IR').format(parseFloat(displayValues.total || "0") || 0)}
                                    </span> تومان
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ارز */}
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            ارز
                        </label>
                        {!showNewCurrency ? (
                            <div>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white"
                                >
                                    {currencies.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.name} ({c.symbol})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowNewCurrency(true)}
                                    className="text-xs text-blue-400 mt-1 hover:text-blue-300"
                                >
                                    + ارز جدید
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="نام ارز"
                                    value={newCurrencyName}
                                    onChange={(e) => setNewCurrencyName(e.target.value)}
                                    className="w-full px-4 py-2 border border-blue-700 rounded-lg"
                                />
                                <input
                                    type="text"
                                    placeholder="نماد ارز"
                                    value={newCurrencySymbol}
                                    onChange={(e) => setNewCurrencySymbol(e.target.value)}
                                    className="w-full px-4 py-2 border border-blue-700 rounded-lg"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAddCurrency}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700"
                                    >
                                        ثبت
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCurrency(false)}
                                        className="px-4 bg-gray-800 text-gray-200 py-2 rounded text-sm font-semibold hover:bg-gray-700"
                                    >
                                        انصراف
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {formData.transaction_status === 'conditional' && (
                        <div className="bg-orange-800 p-3 rounded-lg text-sm text-orange-100">
                            ⚠️ برای معاملات شرطی، نرخ تعریف نشده است
                        </div>
                    )}

                    {/* وضعیت */}
                    {formData.transaction_status !== 'conditional' && (
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
                    )}

                    {/* توضیحات */}
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                            توضیحات
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-700 rounded-lg"
                            rows={3}
                            placeholder="توضیحات اضافی..."
                        />
                    </div>

                    {/* دکمه‌ها */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loadingTransaction || !formData.customer_id}
                            className="flex-1 bg-blue-600 text-gray-900 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                            {loadingTransaction ? 'در حال ذخیره...' : 'ذخیره معامله'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            disabled={loadingTransaction}
                            className="px-6 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                            انصراف
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}