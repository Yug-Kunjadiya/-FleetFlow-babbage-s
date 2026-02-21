import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function getStatusColor(status) {
  const colors = {
    Available: 'bg-green-100 text-green-800',
    'On Trip': 'bg-blue-100 text-blue-800',
    'On Duty': 'bg-green-100 text-green-800',
    'In Shop': 'bg-yellow-100 text-yellow-800',
    Retired: 'bg-gray-100 text-gray-800',
    'Off Duty': 'bg-gray-100 text-gray-800',
    Suspended: 'bg-red-100 text-red-800',
    Draft: 'bg-gray-100 text-gray-800',
    Dispatched: 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
