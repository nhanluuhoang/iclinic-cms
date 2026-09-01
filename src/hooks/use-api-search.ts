import { useSearch } from '@tanstack/react-router'
import { useDebounce } from './use-debounce'

export function useApiSearch(delay = 300) {
  const search = useSearch({ strict: false })
  const value = typeof search.filter === 'string' ? search.filter : ''
  return useDebounce(value, delay)
}
