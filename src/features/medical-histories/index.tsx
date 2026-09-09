import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { getToday } from '@/features/dashboard/utils'
import { getMedicalHistoryList } from './api'
import { MedicalHistoriesTable } from './components/medical-histories-table'

const route = getRouteApi('/_authenticated/medical-histories/')

export function MedicalHistories() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const date = search.date || getToday()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['medical-histories', search, date],
    queryFn: () =>
      getMedicalHistoryList({
        patientName: search.patientName || undefined,
        doctorName: search.doctorName || undefined,
        date,
        page: search.page ?? 1,
        limit: search.pageSize ?? 10,
      }),
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
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Lịch sử khám bệnh
          </h2>
          <p className='text-muted-foreground'>
            Quản lý lịch sử của tất cả bệnh nhân khám bệnh.
          </p>
        </div>

        {isError && (
          <p className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
            Không thể tải lịch sử khám bệnh. Vui lòng thử lại.
          </p>
        )}

        <MedicalHistoriesTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          date={date}
          search={search}
          navigate={navigate}
          isLoading={isLoading}
        />
      </Main>
    </>
  )
}
