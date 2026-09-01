import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type StockBatch } from '../api'

type InventoryDialogType =
  | 'receipt-create'
  | 'stocktake-create'
  | 'issue-create'
  | 'batch-dispose'

type InventoryContextType = {
  open: InventoryDialogType | null
  setOpen: (str: InventoryDialogType | null) => void
  currentBatch: StockBatch | null
  setCurrentBatch: React.Dispatch<React.SetStateAction<StockBatch | null>>
}

const InventoryContext = React.createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<InventoryDialogType>(null)
  const [currentBatch, setCurrentBatch] = useState<StockBatch | null>(null)

  return (
    <InventoryContext
      value={{
        open,
        setOpen,
        currentBatch,
        setCurrentBatch,
      }}
    >
      {children}
    </InventoryContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useInventory = () => {
  const context = React.useContext(InventoryContext)

  if (!context) {
    throw new Error('useInventory has to be used within <InventoryContext>')
  }

  return context
}
