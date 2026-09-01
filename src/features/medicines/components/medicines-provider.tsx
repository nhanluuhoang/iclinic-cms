import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Medicine } from '../api'

type MedicinesDialogType =
  | 'medicine-create'
  | 'medicine-update'
  | 'medicine-delete'

type MedicinesContextType = {
  open: MedicinesDialogType | null
  setOpen: (value: MedicinesDialogType | null) => void
  currentMedicine: Medicine | null
  setCurrentMedicine: React.Dispatch<React.SetStateAction<Medicine | null>>
}

const MedicinesContext = React.createContext<MedicinesContextType | null>(null)

export function MedicinesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<MedicinesDialogType>(null)
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null)

  return (
    <MedicinesContext
      value={{ open, setOpen, currentMedicine, setCurrentMedicine }}
    >
      {children}
    </MedicinesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMedicines = () => {
  const context = React.useContext(MedicinesContext)
  if (!context) {
    throw new Error('useMedicines has to be used within <MedicinesProvider>')
  }
  return context
}
