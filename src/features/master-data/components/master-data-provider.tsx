import React, { createContext, useContext, useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { MasterData } from '../api'

type MasterDataDialogType = 'create' | 'update' | 'delete'

interface MasterDataContextType {
  open: MasterDataDialogType | null
  setOpen: (str: MasterDataDialogType | null) => void
  currentRow: MasterData | null
  setCurrentRow: React.Dispatch<React.SetStateAction<MasterData | null>>
}

const MasterDataContext = createContext<MasterDataContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export function MasterDataProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<MasterDataDialogType>(null)
  const [currentRow, setCurrentRow] = useState<MasterData | null>(null)

  return (
    <MasterDataContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </MasterDataContext.Provider>
  )
}

export const useMasterData = () => {
  const context = useContext(MasterDataContext)
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider')
  }
  return context
}
