import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { GetBanners } from './api'
import { BannersDialogs } from './components/banners-dialogs'
import { BannersPrimaryButtons } from './components/banners-primary-buttons'
import { BannersProvider } from './components/banners-provider'
import { BannersTable } from './components/banners-table'

const routeApi = getRouteApi('/_authenticated/banners/')

export function Banners() {
  const search = routeApi.useSearch()

  const { data, isLoading } = useQuery({
    queryKey: ['banners', search],
    queryFn: () =>
      GetBanners({
        page: search.page ?? 0,
        sort: search.sort ?? '',
        isPublic: search.isPublic,
      }),
  })

  return (
    <BannersProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Banners</h2>
            <p className='text-muted-foreground'>
              Manage your promotional banners here.
            </p>
          </div>
          <BannersPrimaryButtons />
        </div>
        <BannersTable
          data={data?.data ?? []}
          total={data?.pagination?.total ?? 0}
          isLoading={isLoading}
        />
      </Main>

      <BannersDialogs />
    </BannersProvider>
  )
}
