import { useAuthStore } from '@/stores/auth-store'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import type { NavItem, NavGroup as NavGroupType } from './types'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { user } = useAuthStore((state) => state.auth)

  const userRoles = user?.role ? [user.role] : []

  const checkRole = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true
    return roles.some((r) => userRoles.includes(r))
  }

  const filteredNavGroups = sidebarData.navGroups
    .map((group) => {
      if (!checkRole(group.roles)) return null

      const filteredItems = group.items
        .map((item) => {
          if (!checkRole(item.roles)) return null

          if ('items' in item && item.items) {
            const filteredSubItems = item.items.filter((subItem) =>
              checkRole(subItem.roles)
            )
            if (filteredSubItems.length === 0) return null
            return { ...item, items: filteredSubItems } as NavItem
          }

          return item as NavItem
        })
        .filter((item): item is NavItem => item !== null)

      if (filteredItems.length === 0) return null
      return { ...group, items: filteredItems } as NavGroupType
    })
    .filter((group): group is NavGroupType => group !== null)

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props, index) => (
          <NavGroup key={index} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
