import { Outlet } from '@tanstack/react-router'
import { Building2, LockKeyhole, UserCog } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Separator } from '@/components/ui/separator'
// import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { SidebarNav } from '@/features/settings/components/sidebar-nav'

const accountNavItems = [
  {
    title: 'Hồ sơ cá nhân',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Đổi mật khẩu',
    href: '/settings/change-password',
    icon: <LockKeyhole size={18} />,
  },
]

export function Settings() {
  const role = useAuthStore((state) => state.auth.user?.role)
  const sidebarNavItems = [
    ...accountNavItems,
    ...(role === 'TENANT_ADMIN'
      ? [
          {
            title: 'Thông tin phòng khám',
            href: '/settings/tenant',
            icon: <Building2 size={18} />,
          },
        ]
      : []),
  ]

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          {/* <LanguageSwitcher /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Cài đặt tài khoản
          </h1>
          <p className='text-muted-foreground'>
            Quản lý thông tin cá nhân và bảo mật tài khoản.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
