import { Link } from '@tanstack/react-router'
import { BookOpen, PackageOpen } from 'lucide-react'
import useDialogState from '@/hooks/use-dialog-state'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const user = useAuthStore((state) => state.auth.user)
  const displayName = user?.fullName?.trim() || user?.userName || 'Tài khoản'
  const email = user?.email?.trim() || null
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>{displayName}</p>
              {email && (
                <p className='text-xs leading-none text-muted-foreground'>
                  {email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>Hồ sơ cá nhân</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className='text-xs text-muted-foreground'>
            Hướng dẫn sử dụng
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() =>
                window.dispatchEvent(
                  new CustomEvent('iclinic:start-tour', {
                    detail: 'patient-workflow',
                  })
                )
              }
            >
              <BookOpen />
              Quy trình khám bệnh
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                window.dispatchEvent(
                  new CustomEvent('iclinic:start-tour', {
                    detail: 'inventory-workflow',
                  })
                )
              }
            >
              <PackageOpen />
              Quy trình quản lý kho
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
