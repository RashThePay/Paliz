import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Transaction, Customer } from '../types'

interface Store {
    user: any | null
    transactions: Transaction[]
    customers: Customer[]
    loading: boolean

    setUser: (user: any) => void
    fetchTransactions: () => Promise<void>
    fetchCustomers: () => Promise<void>
    addTransaction: (transaction: Partial<Transaction>) => Promise<void>
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
    deleteTransaction: (id: string) => Promise<void>
    addCustomer: (customer: Partial<Customer>) => Promise<any>
    addTransactionUpdate: (transactionId: string, updateType: string, description?: string) => Promise<void>
}

export const useStore = create<Store>((set, get) => ({
    user: null,
    transactions: [],
    customers: [],
    loading: false,

    setUser: (user) => set({ user }),

    fetchTransactions: async () => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('transactions')
            .select(`
        *,
        customer:customers(*)
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

    addTransaction: async (transaction) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('transactions')
            .insert([{ ...transaction, user_id: user.id }])

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
            .select() // این خط اضافه شد

        if (!error && data) {
            get().fetchCustomers()
            return data // برگرداندن data
        }

        return null
    },

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