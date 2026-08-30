import { SUPER_ADMIN } from '@/config/enum'
import {
  GalleryHorizontalEnd,
  LayoutDashboard,
  ListTodo,
  Users,
  Database,
  SquarePen,
  Warehouse,
  HeartPulse,
  ClipboardPlus,
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
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Admins',
          url: '/admins',
          icon: Users,
          roles: [SUPER_ADMIN],
        },
        {
          title: 'Bệnh nhân',
          url: '/patients',
          icon: HeartPulse,
        },
        {
          title: 'Hàng đợi khám',
          url: '/examination-queue',
          icon: ListOrdered,
        },
        {
          title: 'Kê toa thuốc',
          url: '/prescriptions',
          icon: ClipboardPlus,
        },
        {
          title: 'Kho thuốc',
          url: '/inventory',
          icon: Warehouse,
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
