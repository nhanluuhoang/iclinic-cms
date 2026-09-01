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
          title: 'Quản lý thuốc',
          icon: Warehouse,
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
          ],
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
      items: [
        {
          title: 'Thống kê',
          url: '/dashboards',
          icon: LayoutDashboard,
        },
      ],
    },
    {
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
