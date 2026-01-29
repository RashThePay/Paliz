export interface Customer {
  id: string
  name: string
  phone?: string
  notes?: string
  created_at: string
  user_id: string
}

export interface Payment {
  id: string
  transaction_id: string
  amount: number
  payment_method: 'cash' | 'card_to_card' | 'pos'
  payment_date: string
  description?: string
  created_at: string
}

export interface Currency {
  id: string
  user_id: string
  name: string
  symbol: string
  created_at: string
}

export interface Balance {
  id: string
  user_id: string
  currency_id: string
  amount: number
  created_at: string
  updated_at: string
  currency?: Currency
}

export interface CurrencyStatistics {
  id: string
  user_id: string
  currency_id: string
  total_transactions: number
  total_amount: number
  total_received: number
  total_remaining: number
  last_updated: string
}

export interface Transaction {
  id: string
  user_id: string
  customer_id: string
  transaction_date: string
  transaction_type: 'buy' | 'sell' | 'manual' | 'loan'
  transaction_status: 'incomplete' | 'conditional' | 'completed'
  amount: number
  currency: string
  rate?: number | null
  total_value?: number
  goods_delivered: boolean
  payment_received: boolean
  amount_received: number
  amount_remaining?: number
  description?: string
  created_at: string
  updated_at: string
  customer?: Customer
  payments?: Payment[]
}

export interface TransactionUpdate {
  id: string
  transaction_id: string
  update_type: string
  description?: string
  created_at: string
}

export type TransactionStatus = 'incomplete' | 'conditional' | 'completed'

export const PaymentMethodLabels = {
  cash: '💵 نقد',
  card_to_card: '💳 کارت به کارت',
  pos: '📱 کارتخوان'
}