import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Patient } from '../api'

type PatientsDialogType = 'create' | 'update' | 'delete'

type PatientsContextType = {
  open: PatientsDialogType | null
  setOpen: (str: PatientsDialogType | null) => void
  currentRow: Patient | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Patient | null>>
}

const PatientsContext = React.createContext<PatientsContextType | null>(null)

export function PatientsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PatientsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Patient | null>(null)

  return (
    <PatientsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PatientsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePatients = () => {
  const context = React.useContext(PatientsContext)

  if (!context) {
    throw new Error('usePatients has to be used within <PatientsContext>')
  }

  return context
}
