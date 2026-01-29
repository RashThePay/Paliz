import { useEffect } from 'react'
import { useStore } from '../store/useStore'

interface CustomerSelectProps {
  value: string
  onChange: (customerId: string) => void
}

export function CustomerSelect({ value, onChange }: CustomerSelectProps) {
  const { customers, fetchCustomers } = useStore()

  useEffect(() => {
    fetchCustomers()
  }, [])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full *:bg-gray-900 px-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required
    >
      <option value="">انتخاب مشتری...</option>
      {customers.map((customer) => (
        <option key={customer.id} value={customer.id}>
          {customer.name}
        </option>
      ))}
    </select>
  )
}