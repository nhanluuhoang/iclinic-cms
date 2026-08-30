import { useQuery } from '@tanstack/react-query'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { GetPosts } from './api'
import { PostsDialogs } from './components/posts-dialogs'
import { PostsPrimaryButtons } from './components/posts-primary-buttons'
import PostsProvider from './components/posts-provider'
import { PostsTable } from './components/posts-table'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/_authenticated/posts/')

export default function Posts() {
  const search = route.useSearch()
  
  const { data, isLoading } = useQuery({
    queryKey: ['posts', search],
    queryFn: () => GetPosts({
      page: (search.page ?? 1) - 1,
      title: search.title,
      isPublic: search.isPublic,
    }),
  })

  return (
    <PostsProvider>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Posts</h2>
            <p className='text-muted-foreground'>
              Manage your posts here.
            </p>
          </div>
          <PostsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <PostsTable
            data={data?.data || []}
            total={data?.pagination?.total || 0}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <PostsDialogs />
    </PostsProvider>
  )
}
