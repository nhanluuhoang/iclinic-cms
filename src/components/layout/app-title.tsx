import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '../ui/button'

export function AppTitle() {
  const { t } = useTranslation()
  const { setOpenMobile, state } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='gap-0 py-0 hover:bg-transparent active:bg-transparent'
          asChild
        >
          <div>
            <Link
              to='/admins'
              onClick={() => setOpenMobile(false)}
              className={cn(
                'grid flex-1 text-start text-sm leading-tight',
                state === 'collapsed' && 'hidden'
              )}
            >
              <span className='truncate font-bold'>{t('auth.appName')}</span>
              <span className='truncate text-xs'>{t('auth.appDescription')}</span>
            </Link>
            <ToggleSidebar />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function ToggleSidebar({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, state } = useSidebar()

  return (
    <Button
      data-sidebar='trigger'
      data-slot='sidebar-trigger'
      variant='ghost'
      size='icon'
      className={cn(
        'aspect-square size-8 max-md:scale-125',
        state === 'expanded' ? 'max-md:block md:hidden' : '',
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <X className='md:hidden' />
      <Menu className={cn('max-md:hidden', state === 'expanded' && 'hidden')} />
      <span className='sr-only'>Toggle Sidebar</span>
    </Button>
  )
}
