import { axios } from '@/lib/axios'

export interface PostParams {
  title?: string
  isPublic?: boolean
  page: number
}

export interface PostImage {
  id: string
  fileName: string
}

export interface PostImageRelation {
  postId: string
  imageId: string
  image: PostImage
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  isPublic: boolean
  thumbnail: string
  createdAt: string
  postImages: PostImageRelation[]
}

export interface PostDtoRequest {
  title: string
  content: string
  isPublic: boolean
  thumbnail: string
  imageIds?: string[]
}

export interface PostResponse {
  data: Post
}

export interface PostsResponse {
  status: boolean
  data: Post[]
  pagination: {
    total: number
  }
}

const CreatePost = (data: PostDtoRequest): Promise<void> => {
  return axios.post('/post', data)
}

const GetPosts = (params?: PostParams): Promise<PostsResponse> => {
  return axios.get('/post', { params })
}

const GetPost = (id: string): Promise<PostResponse> => {
  return axios.get(`/post/${id}`)
}

const UpdatePost = (id: string, data: PostDtoRequest): Promise<void> => {
  return axios.patch(`/post/${id}`, data)
}

const DeletePost = (id: string): Promise<void> => {
  return axios.delete(`/post/${id}`)
}

const UploadFile = (file: File): Promise<{ status: boolean; data: PostImage }> => {
  const formData = new FormData()
  formData.append('image', file)
  return axios.post('/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export { CreatePost, GetPosts, GetPost, UpdatePost, DeletePost, UploadFile }
