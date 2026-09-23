import { type LinkProps } from '@tanstack/react-router'
import { type ServicePlan } from '@/config/access-control'

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
  roles?: string[]
  plans?: readonly ServicePlan[]
}

type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {})
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
  title?: string
  items: NavItem[]
  roles?: string[]
  plans?: readonly ServicePlan[]
}

type SidebarData = {
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
