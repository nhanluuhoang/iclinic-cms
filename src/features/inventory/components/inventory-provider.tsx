import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Medicine, type StockBatch } from '../api'

type InventoryDialogType =
  | 'receipt-create'
  | 'stocktake-create'
  | 'medicine-create'
  | 'medicine-update'
  | 'medicine-delete'
  | 'batch-dispose'

type InventoryContextType = {
  open: InventoryDialogType | null
  setOpen: (str: InventoryDialogType | null) => void
  currentMedicine: Medicine | null
  setCurrentMedicine: React.Dispatch<React.SetStateAction<Medicine | null>>
  currentBatch: StockBatch | null
  setCurrentBatch: React.Dispatch<React.SetStateAction<StockBatch | null>>
}

const InventoryContext = React.createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<InventoryDialogType>(null)
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null)
  const [currentBatch, setCurrentBatch] = useState<StockBatch | null>(null)

  return (
    <InventoryContext
      value={{
        open,
        setOpen,
        currentMedicine,
        setCurrentMedicine,
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
