import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { GetPatients } from './api'
import { PatientsDialogs } from './components/patients-dialogs'
import { PatientsPrimaryButtons } from './components/patients-primary-buttons'
import { PatientsProvider } from './components/patients-provider'
import { PatientsTable } from './components/patients-table'

const route = getRouteApi('/_authenticated/patients/')

export function Patients() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['patients', search],
    queryFn: () =>
      GetPatients({
        page: search.page ?? 1,
        pageSize: search.pageSize ?? 10,
        // Rỗng thì để undefined chứ không gửi '': axios bỏ hẳn param undefined,
        // còn '' vẫn thành `?gender=` và backend có thể hiểu là đang lọc.
        fullName: search.fullName || undefined,
        phone: search.phone || undefined,
        gender: search.gender || undefined,
        sort: search.sort || undefined,
      }),
  })

  return (
    <PatientsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Bệnh nhân</h2>
            <p className='text-muted-foreground'>
              Quản lý danh sách bệnh nhân và tài khoản đăng nhập của họ.
            </p>
          </div>
          <PatientsPrimaryButtons />
        </div>

        <PatientsTable
          data={data?.data ?? []}
          total={data?.pagination?.total ?? 0}
          search={search}
          navigate={navigate}
          isLoading={isLoading}
        />
      </Main>

      <PatientsDialogs />
    </PatientsProvider>
  )
}
