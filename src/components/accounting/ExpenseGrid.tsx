'use client'

import FilteredTransactionGrid from './FilteredTransactionGrid'
import { TransactionRow } from '@/types/components'

interface ExpenseGridProps {
  onAddTransaction?: () => void
  onEditTransaction?: (transaction: TransactionRow) => void
  onViewReceipt?: (transaction: TransactionRow) => void
}

export default function ExpenseGrid({
  onAddTransaction,
  onEditTransaction,
  onViewReceipt
}: ExpenseGridProps) {
  // The FilteredTransactionGrid handles all the logic
  // These props are kept for backward compatibility but not used
  // The new grid uses inline editing and modal-based adding

  return <FilteredTransactionGrid filterType="expense" />
}