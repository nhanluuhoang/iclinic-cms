import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
// import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { GetAdmins } from './api'
import { AdminsDialogs } from './components/admins-dialogs'
import { AdminsPrimaryButtons } from './components/admins-primary-buttons'
import { AdminsProvider } from './components/admins-provider'
import { AdminsTable } from './components/admins-table'

const route = getRouteApi('/_authenticated/admins/')

type AdminsSearch = {
  page: number
  pageSize: number
  fullName: string
  phone: string
  gender: string
  sort: string
}

export function Admins() {
  const search = route.useSearch() as unknown as AdminsSearch
  const navigate = route.useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () =>
      GetAdmins({
        fullName: search.fullName || '',
        page: search.page || 1,
        pageSize: search.pageSize || 10,
      }),
  })

  return (
    <AdminsProvider>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          {/* <LanguageSwitcher /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Nhân viên</h2>
            <p className='text-muted-foreground'>
              Quản lý tài khoản bác sĩ và trợ lý của phòng khám.
            </p>
          </div>
          <AdminsPrimaryButtons />
        </div>
        <AdminsTable
          data={data?.data || []}
          total={data?.total || 0}
          search={search}
          navigate={navigate}
          isLoading={isLoading}
        />
      </Main>

      <AdminsDialogs />
    </AdminsProvider>
  )
}
