import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ClipboardCheck, PackagePlus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { GetStats } from './api'
import { BatchesTab } from './components/batches-tab'
import { InventoryDialogs } from './components/inventory-dialogs'
import {
  InventoryProvider,
  useInventory,
} from './components/inventory-provider'
import { InventoryStats } from './components/inventory-stats'
import { MedicinesTab } from './components/medicines-tab'
import { ReceiptsTab } from './components/receipts-tab'
import { StockTab } from './components/stock-tab'
import { StockTakesTab } from './components/stocktakes-tab'
import { inventoryTabs, type InventoryTab } from './data/data'

const routeApi = getRouteApi('/_authenticated/inventory/')

function TabBar({ active }: { active: InventoryTab }) {
  const navigate = routeApi.useNavigate()

  return (
    <div
      role='tablist'
      className='inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-muted p-[3px] text-muted-foreground'
    >
      {inventoryTabs.map((tab) => {
        const isActive = tab.value === active
        return (
          <button
            key={tab.value}
            role='tab'
            type='button'
            aria-selected={isActive}
            onClick={() =>
              navigate({ search: { tab: tab.value }, replace: true })
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
              'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
              isActive
                ? 'bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30'
                : 'hover:text-foreground'
            )}
          >
            <tab.icon className='size-4' />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

function PrimaryButtons({ tab }: { tab: InventoryTab }) {
  const { setOpen } = useInventory()

  if (tab === 'medicines') {
    return (
      <Button onClick={() => setOpen('medicine-create')}>
        Thêm thuốc
        <Plus className='size-4' />
      </Button>
    )
  }

  if (tab === 'stocktakes') {
    return (
      <Button onClick={() => setOpen('stocktake-create')}>
        Kiểm kê
        <ClipboardCheck className='size-4' />
      </Button>
    )
  }

  return (
    <Button onClick={() => setOpen('receipt-create')}>
      <PackagePlus className='size-4' />
      Nhập hàng
    </Button>
  )
}

function InventoryContent() {
  const { tab = 'stock' } = routeApi.useSearch()

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['inventory', 'stats'],
    queryFn: GetStats,
  })

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
            <h2 className='text-2xl font-bold tracking-tight'>Kho thuốc</h2>
            <p className='text-muted-foreground'>
              Quản lý tồn kho theo từng đợt nhập hàng và theo dõi hạn sử dụng
              của từng lô.
            </p>
          </div>
          <PrimaryButtons tab={tab} />
        </div>

        <InventoryStats stats={stats} isLoading={loadingStats} />

        <TabBar active={tab} />

        {tab === 'stock' && <StockTab />}
        {tab === 'batches' && <BatchesTab />}
        {tab === 'receipts' && <ReceiptsTab />}
        {tab === 'stocktakes' && <StockTakesTab />}
        {tab === 'medicines' && <MedicinesTab />}
      </Main>

      <InventoryDialogs />
    </>
  )
}

export function Inventory() {
  return (
    <InventoryProvider>
      <InventoryContent />
    </InventoryProvider>
  )
}
