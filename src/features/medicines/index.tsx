import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { MedicinesDialogs } from './components/medicines-dialogs'
import { MedicinesExcelActions } from './components/medicines-excel-actions'
import {
  MedicinesProvider,
  useMedicines,
} from './components/medicines-provider'
import { MedicinesTable } from './components/medicines-table'

function MedicinesContent() {
  const { setOpen } = useMedicines()

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Danh mục thuốc
            </h2>
            <p className='text-muted-foreground'>
              Quản lý thông tin thuốc dùng trong kho và khi kê toa.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <MedicinesExcelActions />
            <Button onClick={() => setOpen('medicine-create')}>
              Thêm danh mục
              <Plus className='size-4' />
            </Button>
          </div>
        </div>

        <MedicinesTable />
      </Main>

      <MedicinesDialogs />
    </>
  )
}

export function Medicines() {
  return (
    <MedicinesProvider>
      <MedicinesContent />
    </MedicinesProvider>
  )
}
