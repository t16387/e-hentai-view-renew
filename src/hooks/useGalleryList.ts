import { axios } from '@/apis'
import { GalleriesPage } from '@/interface/gallery'
import { useSWRInfinite } from 'swr'

export interface UseGalleryListOptions {
  f_search?: string
  mode: 'index' | 'popular' | 'favorites' | 'watched'
  favcat?: string
  page?: number
}
export default function useGalleryList<T extends HTMLElement = HTMLDivElement>(
  options: UseGalleryListOptions
) {
  const { mode, f_search, favcat, page = 0 } = options
  const { data, error, size, setSize } = useSWRInfinite<GalleriesPage['list']>(
    (index) => {
      switch (mode) {
        case 'index':
          return `/api/gallery?page=${page + index}&f_search=${f_search}`
        case 'popular':
          return '/api/popular'
        case 'favorites':
          return `/api/favorites?page=${page + index}&favcat=${favcat}`
        case 'watched':
          return `/api/watched?page=${page + index}`
      }
    },
    async (url: string) => {
      const res = await axios.get<GalleriesPage>(url)
      if (res.data.error) throw res.data.message
      return res.data.list
    }
  )

  const dataSource = data ? data.flat(1) : []
  const isLoadingInitialData = !data && !error
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = !isLoadingInitialData && dataSource.length === 0
  const isReachingEnd =
    isEmpty ||
    mode === 'popular' ||
    (data && data[data.length - 1].length < (mode === 'favorites' ? 50 : 25))
  // const isRefreshing = isValidating && data && data.length === size

  return {
    dataSource,
    isEmpty,
    isReachingEnd,
    isLoadingInitialData,
    isLoadingMore,
    error,
  }
}
