import { axios } from '@/lib/axios'

export interface PostParams {
  title?: string
  isPublic?: boolean
  page: number
  limit?: number
}

export interface Post {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  thumbnailUrl: string | null
  readTime: number
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  postImages?: Array<{
    imageId: string
    image: { id: string; fileName: string }
  }>
}

export interface PostDtoRequest {
  title: string
  category: string
  excerpt: string
  content: string
  thumbnailUrl?: string
  readTime: number
  isPublished: boolean
}

export interface PostsResponse {
  data: Post[]
  total: number
  page: number
  limit: number
}

const CreatePost = (data: PostDtoRequest): Promise<Post> =>
  axios.post('/posts', data)

const GetPosts = (params: PostParams): Promise<PostsResponse> =>
  axios.get('/posts', {
    params: {
      page: params.page,
      limit: params.limit ?? 10,
      search: params.title,
      isPublished: params.isPublic,
    },
  })

const UpdatePost = (id: string, data: PostDtoRequest): Promise<Post> =>
  axios.patch(`/posts/${id}`, data)

const DeletePost = (id: string): Promise<void> => axios.delete(`/posts/${id}`)

export { CreatePost, GetPosts, UpdatePost, DeletePost }
