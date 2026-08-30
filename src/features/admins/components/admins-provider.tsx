import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Admin } from '../api'

type AdminsDialogType = 'add' | 'edit' | 'delete'

type AdminsContextType = {
  open: AdminsDialogType | null
  setOpen: (str: AdminsDialogType | null) => void
  currentRow: Admin | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Admin | null>>
}

const AdminsContext = React.createContext<AdminsContextType | null>(null)

export function AdminsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<AdminsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Admin | null>(null)

  return (
    <AdminsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AdminsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdmins = () => {
  const usersContext = React.useContext(AdminsContext)

  if (!usersContext) {
    throw new Error('useAdmins has to be used within <AdminsContext>')
  }

  return usersContext
}
