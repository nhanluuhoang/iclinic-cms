import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Banner } from '../api'

type BannersDialogType = 'create' | 'update' | 'delete'

type BannersContextType = {
  open: BannersDialogType | null
  setOpen: (str: BannersDialogType | null) => void
  currentRow: Banner | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Banner | null>>
}

const BannersContext = React.createContext<BannersContextType | null>(null)

export function BannersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<BannersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Banner | null>(null)

  return (
    <BannersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </BannersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBanners = () => {
  const bannersContext = React.useContext(BannersContext)

  if (!bannersContext) {
    throw new Error('useBanners has to be used within <BannersContext>')
  }

  return bannersContext
}
