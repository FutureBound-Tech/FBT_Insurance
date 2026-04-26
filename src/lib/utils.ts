import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const m = today.getMonth() - dateOfBirth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) age--
  return age
}

export function getLeadStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    interested: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-purple-100 text-purple-800',
    follow_up: 'bg-orange-100 text-orange-800',
    converted: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getLeadStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: 'New Lead',
    interested: 'Interested',
    in_progress: 'In Progress',
    follow_up: 'Follow Up',
    converted: 'Converted',
    lost: 'Lost',
  }
  return labels[status] || status
}

export function getLeadScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}
