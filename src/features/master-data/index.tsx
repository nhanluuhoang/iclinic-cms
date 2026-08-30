import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { GetMasterDatas } from './api'
import { MasterDataDialogs } from './components/master-data-dialogs'
import { MasterDataPrimaryButtons } from './components/master-data-primary-buttons'
import { MasterDataProvider } from './components/master-data-provider'
import { MasterDataTable } from './components/master-data-table'

const routeApi = getRouteApi('/_authenticated/master-data/')

export function MasterData() {
  const search = routeApi.useSearch()

  const { data, isLoading } = useQuery({
    queryKey: ['master-data', search],
    queryFn: () =>
      GetMasterDatas({
        page: search.page ?? 0,
        sort: search.sort ?? '',
        key: search.key,
      }),
  })

  return (
    <MasterDataProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Master Data</h2>
            <p className='text-muted-foreground'>
              Manage your system master data and configurations here.
            </p>
          </div>
          <MasterDataPrimaryButtons />
        </div>
        <MasterDataTable
          data={data?.data ?? []}
          total={data?.pagination?.total ?? 0}
          isLoading={isLoading}
        />
      </Main>

      <MasterDataDialogs />
    </MasterDataProvider>
  )
}
