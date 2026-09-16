import {
  CLINICAL_ADMIN_ROLES,
  STAFF_ROLES,
  SUPER_ADMIN_ROLES,
  TENANT_ADMIN_ROLES,
} from '@/config/access-control'
import {
  GalleryHorizontalEnd,
  LayoutDashboard,
  Users,
  Database,
  Pill,
  SquarePen,
  Warehouse,
  HeartPulse,
  ShieldCheck,
  Settings,
  ListOrdered,
  ClipboardList,
  CalendarRange,
  ChartColumn,
  History,
  PanelsTopLeft,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navGroups: [
    {
      title: 'Tổng quan',
      items: [
        {
          title: 'Thứ tự khám',
          url: '/',
          icon: ListOrdered,
          roles: STAFF_ROLES,
        },
        {
          title: 'Bệnh nhân',
          url: '/patients',
          icon: HeartPulse,
          roles: STAFF_ROLES,
        },
        {
          title: 'Lịch sử khám bệnh',
          url: '/medical-histories',
          icon: History,
          roles: STAFF_ROLES,
        },
      ],
    },
    {
      items: [
        {
          title: 'Nhân viên',
          url: '/admins',
          icon: Users,
          roles: SUPER_ADMIN_ROLES,
        },
      ],
    },
    {
      title: 'Quản lý thuốc',
      items: [
        {
          title: 'Danh mục thuốc',
          url: '/medicines',
          icon: Pill,
          roles: STAFF_ROLES,
        },
        {
          title: 'Kho thuốc',
          url: '/inventory',
          icon: Warehouse,
          roles: STAFF_ROLES,
        },
        {
          title: 'Mẫu đơn thuốc',
          url: '/prescription-templates',
          icon: ClipboardList,
          roles: CLINICAL_ADMIN_ROLES,
        },
      ],
    },
    {
      title: 'Thống kê',
      items: [
        {
          title: 'Thống kê ngày',
          url: '/dashboards',
          icon: LayoutDashboard,
          roles: STAFF_ROLES,
        },
        {
          title: 'Thống kê tháng',
          url: '/monthly-statistics',
          icon: CalendarRange,
          roles: STAFF_ROLES,
        },
        {
          title: 'Thống kê năm',
          url: '/yearly-statistics',
          icon: ChartColumn,
          roles: STAFF_ROLES,
        },
      ],
    },
    {
      title: 'Cài đặt',
      items: [
        {
          title: 'Giao diện',
          icon: ShieldCheck,
          items: [
            {
              title: 'Landing page',
              url: '/landing-config',
              icon: PanelsTopLeft,
              roles: TENANT_ADMIN_ROLES,
            },
            {
              title: 'Banners',
              url: '/banners',
              icon: GalleryHorizontalEnd,
              roles: TENANT_ADMIN_ROLES,
            },
            {
              title: 'Bài viết',
              url: '/posts',
              icon: SquarePen,
              roles: TENANT_ADMIN_ROLES,
            },
          ],
        },
        {
          title: 'Cài đặt',
          icon: Settings,
          items: [
            {
              title: 'Master Data',
              url: '/master-data',
              icon: Database,
              roles: CLINICAL_ADMIN_ROLES,
            },
          ],
        },
      ],
    },
  ],
}
