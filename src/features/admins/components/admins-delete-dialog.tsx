'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Admin } from '@/features/admins/api'

type AdminDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Admin
}

export function AdminsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AdminDeleteDialogProps) {
  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value.trim() !== currentRow.email) return

    onOpenChange(false)
    showSubmittedData(currentRow, 'Đã xóa quản trị viên:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.email}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Xóa quản trị viên
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Bạn có chắc muốn xóa{' '}
            <span className='font-bold'>{currentRow.email}</span>?
            <br />
            Thao tác này sẽ xóa vĩnh viễn quản trị viên có vai trò{' '}
            <span className='font-bold'>
              {currentRow.isSuperAdmin ? 'Quản trị hệ thống' : 'Quản trị viên'}
            </span>{' '}
            khỏi hệ thống và không thể hoàn tác.
          </p>

          <Label className='my-2'>
            Email:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Nhập email để xác nhận xóa.'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Cảnh báo!</AlertTitle>
            <AlertDescription>
              Hãy kiểm tra kỹ, thao tác này không thể hoàn tác.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
