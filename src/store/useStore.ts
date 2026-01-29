import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Transaction, Customer, Payment, Currency, CurrencyStatistics, Balance } from '../types'

interface Store {
  user: any | null
  transactions: Transaction[]
  customers: Customer[]
  currencies: Currency[]
  balances: Balance[]
  loading: boolean
  
  setUser: (user: any) => void
  fetchTransactions: () => Promise<void>
  fetchCustomers: () => Promise<void>
  fetchCurrencies: () => Promise<void>
  fetchBalances: () => Promise<void>
  addTransaction: (transaction: Partial<Transaction>) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addCustomer: (customer: Partial<Customer>) => Promise<Customer | null>
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  
  // Currency functions
  addCurrency: (currency: Partial<Currency>) => Promise<Currency | null>
  updateCurrency: (id: string, updates: Partial<Currency>) => Promise<void>
  deleteCurrency: (id: string) => Promise<void>
  getCurrencyStatistics: () => Promise<CurrencyStatistics[]>
  
  // Balance functions
  upsertBalance: (currencyId: string, amount: number) => Promise<void>
  getBalance: (currencyId: string) => Balance | undefined
  
  // Payment functions
  addPayment: (payment: Partial<Payment>) => Promise<void>
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>
  deletePayment: (id: string) => Promise<void>
  fetchPayments: (transactionId: string) => Promise<Payment[]>
  
  // Transaction updates
  addTransactionUpdate: (transactionId: string, updateType: string, description?: string) => Promise<void>
}

export const useStore = create<Store>((set, get) => ({
  user: null,
  transactions: [],
  customers: [],
  currencies: [],
  balances: [],
  loading: false,

  setUser: (user) => set({ user }),

  fetchTransactions: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        customer:customers(*),
        payments(*)
      `)
      .order('transaction_date', { ascending: false })
    
    if (!error && data) {
      set({ transactions: data })
    }
    set({ loading: false })
  },

  fetchCustomers: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name')
    
    if (!error && data) {
      set({ customers: data })
    }
  },

  fetchCurrencies: async () => {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .order('name')
    
    if (!error && data) {
      set({ currencies: data })
    }
  },

  fetchBalances: async () => {
    const { data, error } = await supabase
      .from('balances')
      .select(`
        *,
        currency:currencies(*)
      `)
      .order('updated_at', { ascending: false })
    
    if (!error && data) {
      set({ balances: data })
    }
  },

  addTransaction: async (transaction) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: user.id, transaction_status: 'incomplete' }])
    
    if (!error) {
      get().fetchTransactions()
    }
  },

  updateTransaction: async (id, updates) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      get().fetchTransactions()
    }
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (!error) {
      get().fetchTransactions()
    }
  },

  addCustomer: async (customer) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...customer, user_id: user.id }])
      .select()
      .single()
    
    if (!error && data) {
      get().fetchCustomers()
      return data
    }
    
    return null
  },

  updateCustomer: async (id, updates) => {
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      get().fetchCustomers()
    }
  },

  deleteCustomer: async (id) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    
    if (!error) {
      get().fetchCustomers()
    }
  },

  // Currency functions
  addCurrency: async (currency) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('currencies')
      .insert([{ ...currency, user_id: user.id }])
      .select()
      .single()
    
    if (!error && data) {
      get().fetchCurrencies()
      return data
    }
    
    return null
  },

  updateCurrency: async (id, updates) => {
    const { error } = await supabase
      .from('currencies')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      get().fetchCurrencies()
    }
  },

  deleteCurrency: async (id) => {
    const { error } = await supabase
      .from('currencies')
      .delete()
      .eq('id', id)
    
    if (!error) {
      get().fetchCurrencies()
    }
  },

  getCurrencyStatistics: async () => {
    const { data } = await supabase
      .from('currency_statistics')
      .select('*')
      .order('total_amount', { ascending: false })
    
    return data || []
  },

  // Balance functions
  upsertBalance: async (currencyId, amount) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('balances')
      .upsert(
        [{ user_id: user.id, currency_id: currencyId, amount }],
        { onConflict: 'user_id,currency_id' }
      )
    
    if (!error) {
      get().fetchBalances()
    }
  },

  getBalance: (currencyId) => {
    return get().balances.find(b => b.currency_id === currencyId)
  },

  // Payment functions
  addPayment: async (payment) => {
    const { error } = await supabase
      .from('payments')
      .insert([payment])
    
    if (!error) {
      get().fetchTransactions()
    }
  },

  updatePayment: async (id, updates) => {
    const { error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      get().fetchTransactions()
    }
  },

  deletePayment: async (id) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
    
    if (!error) {
      get().fetchTransactions()
    }
  },

  fetchPayments: async (transactionId) => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('payment_date', { ascending: false })
    
    return data || []
  },

  // Transaction updates
  addTransactionUpdate: async (transactionId, updateType, description) => {
    await supabase
      .from('transaction_updates')
      .insert([{
        transaction_id: transactionId,
        update_type: updateType,
        description
      }])
  }
}))