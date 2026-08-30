import React, { createContext, useContext, useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Post } from '../api'

type PostsDialogType = 'create' | 'update' | 'delete'

interface PostsContextType {
  open: PostsDialogType | null
  setOpen: (str: PostsDialogType | null) => void
  currentRow: Post | undefined
  setCurrentRow: React.Dispatch<React.SetStateAction<Post | undefined>>
}

const PostsContext = createContext<PostsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function PostsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<PostsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Post | undefined>(undefined)

  return (
    <PostsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PostsContext.Provider>
  )
}

export const usePosts = () => {
  const context = useContext(PostsContext)
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider')
  }
  return context
}
