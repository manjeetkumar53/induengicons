'use client'

import FilteredTransactionGrid from './FilteredTransactionGrid'

interface IncomeGridProps {
  onAddTransaction?: () => void
  onEditTransaction?: (transaction: any) => void
  onViewReceipt?: (transaction: any) => void
}

export default function IncomeGrid({
  onAddTransaction,
  onEditTransaction,
  onViewReceipt
}: IncomeGridProps) {
  // The FilteredTransactionGrid handles all the logic
  // These props are kept for backward compatibility but not used
  // The new grid uses inline editing and modal-based adding

  return <FilteredTransactionGrid filterType="income" />
}