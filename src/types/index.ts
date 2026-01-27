export interface Customer {
  id: string
  name: string
  phone?: string
  notes?: string
  created_at: string
  user_id: string
}

export interface Transaction {
  id: string
  user_id: string
  customer_id: string
  transaction_date: string
  transaction_type: 'buy' | 'sell'
  amount: number
  currency: string
  rate: number
  total_value?: number
  goods_delivered: boolean
  payment_received: boolean
  amount_received: number
  amount_remaining?: number
  description?: string
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface TransactionUpdate {
  id: string
  transaction_id: string
  update_type: string
  description?: string
  created_at: string
}

export type TransactionStatus = 'complete' | 'partial' | 'pending' | 'cancelled'