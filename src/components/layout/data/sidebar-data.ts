import { SUPER_ADMIN } from '@/config/enum'
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
        },
        {
          title: 'Bệnh nhân',
          url: '/patients',
          icon: HeartPulse,
        },
        {
          title: 'Lịch sử khám bệnh',
          url: '/medical-histories',
          icon: History,
        },
      ],
    },
    {
      items: [
        {
          title: 'Nhân viên',
          url: '/admins',
          icon: Users,
          roles: [SUPER_ADMIN],
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
        },
        {
          title: 'Kho thuốc',
          url: '/inventory',
          icon: Warehouse,
        },
        {
          title: 'Mẫu đơn thuốc',
          url: '/prescription-templates',
          icon: ClipboardList,
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
        },
        {
          title: 'Thống kê tháng',
          url: '/monthly-statistics',
          icon: CalendarRange,
        },
        {
          title: 'Thống kê năm',
          url: '/yearly-statistics',
          icon: ChartColumn,
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
              title: 'Banners',
              url: '/banners',
              icon: GalleryHorizontalEnd,
            },
            {
              title: 'Bài viết',
              url: '/posts',
              icon: SquarePen,
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
            },
          ],
        },
      ],
    },
  ],
}
