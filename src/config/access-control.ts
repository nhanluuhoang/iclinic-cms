export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  DOCTOR: 'DOCTOR',
  ASSISTANT: 'ASSISTANT',
  PATIENT: 'PATIENT',
  USER: 'USER',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const TENANT_APPEARANCE_PLANS = ['PRO'] as const
export const TENANT_STAFF_PLANS = ['PLUS', 'PRO'] as const
export type ServicePlan = 'BASIC' | 'PLUS' | 'PRO'

export const STAFF_ROLES: UserRole[] = [
  USER_ROLES.TENANT_ADMIN,
  USER_ROLES.DOCTOR,
  USER_ROLES.ASSISTANT,
]

export const CLINICAL_ADMIN_ROLES: UserRole[] = [
  USER_ROLES.TENANT_ADMIN,
  USER_ROLES.DOCTOR,
]

export const PRESCRIBER_ROLES: UserRole[] = [
  USER_ROLES.TENANT_ADMIN,
  USER_ROLES.DOCTOR,
]

export const TENANT_ADMIN_ROLES: UserRole[] = [USER_ROLES.TENANT_ADMIN]
export const SUPER_ADMIN_ROLES: UserRole[] = [USER_ROLES.SUPER_ADMIN]

const routeRoles: Array<{
  path: string
  roles: UserRole[]
  plans?: readonly ServicePlan[]
}> = [
  {
    path: '/admins',
    roles: TENANT_ADMIN_ROLES,
    plans: TENANT_STAFF_PLANS,
  },
  {
    path: '/landing-config',
    roles: TENANT_ADMIN_ROLES,
    plans: TENANT_APPEARANCE_PLANS,
  },
  {
    path: '/posts',
    roles: TENANT_ADMIN_ROLES,
    plans: TENANT_APPEARANCE_PLANS,
  },
  { path: '/settings/tenant', roles: TENANT_ADMIN_ROLES },
  { path: '/master-data', roles: CLINICAL_ADMIN_ROLES },
  { path: '/clinic-days-off', roles: CLINICAL_ADMIN_ROLES },
  { path: '/prescription-templates', roles: CLINICAL_ADMIN_ROLES },
  { path: '/patients', roles: STAFF_ROLES },
  { path: '/medical-histories', roles: STAFF_ROLES },
  { path: '/medicines', roles: STAFF_ROLES },
  { path: '/inventory', roles: STAFF_ROLES },
  { path: '/dashboards', roles: CLINICAL_ADMIN_ROLES },
  { path: '/monthly-statistics', roles: CLINICAL_ADMIN_ROLES },
  { path: '/yearly-statistics', roles: CLINICAL_ADMIN_ROLES },
  { path: '/', roles: STAFF_ROLES },
]

export function hasAnyRole(
  role: string | undefined,
  allowedRoles?: readonly string[]
) {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!role) return false
  if (role === USER_ROLES.SUPER_ADMIN) return true
  return allowedRoles.includes(role)
}

export function canAccessPath(
  role: string | undefined,
  pathname: string,
  servicePlan?: ServicePlan
) {
  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const rule = routeRoles.find(
    ({ path }) =>
      normalizedPath === path ||
      (path !== '/' && normalizedPath.startsWith(`${path}/`))
  )

  if (!rule || !hasAnyRole(role, rule.roles)) return !rule
  return !rule.plans || (!!servicePlan && rule.plans.includes(servicePlan))
}
