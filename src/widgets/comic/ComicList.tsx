import {
  EVENT_JUMP_PAGE,
  EVENT_LOAD_MORE_PAGE,
  EVENT_TOGGLE_CONTROLS,
} from '@/constant'
import useComicData from '@/hooks/useComicData'
import useEventManager from '@/hooks/useEventListenerEnhance'
import { Theme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { useEventListener, useMount } from 'ahooks'
import React, { useEffect, useRef } from 'react'
import { mutate } from 'swr'
import ComicControls from './ComicControls'
import ComicItem from './ComicItem'
import ComicStatus from './ComicStatus'
import {
  ComicListDataSourceProps,
  computedCurrentTarget,
  computedFullHeight,
  computedTargetHeight,
  pageSize,
} from './utils'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 1280,
      backgroundColor: 'black',
      minHeight: '100vh',
      position: 'relative',
      margin: theme.spacing(0, 'auto'),
      userSelect: 'none',
    },
    virtualItem: {
      position: 'absolute',
      transition: 'transform 0.3s ease',
      width: '100%',
      maxWidth: 1280,
    },
  })
)

const ComicList: React.FC<{ comicUrl: string; defaultCurrent: number }> = ({
  comicUrl,
  defaultCurrent,
}) => {
  const comicPagesKey = `${comicUrl}/read`
  const classes = useStyles()
  const { data } = useComicData(comicUrl)
  const dataRef = useRef(data)
  dataRef.current = data

  const jumpPage$ = useEventManager(EVENT_JUMP_PAGE)
  const toggleControls$ = useEventManager(EVENT_TOGGLE_CONTROLS)
  const loadMorePage$ = useEventManager(EVENT_LOAD_MORE_PAGE)

  useMount(() => {
    if (defaultCurrent === -1) {
      document.scrollingElement!.scrollTop = computedTargetHeight(
        data!.current,
        data!.list
      )
    } else {
      document.scrollingElement!.scrollTop = computedTargetHeight(
        defaultCurrent,
        data!.list
      )
      mutate(comicPagesKey, (data: ComicListDataSourceProps) => ({
        ...data,
        current: defaultCurrent,
      }))
    }
  })

  useEffect(() => {
    return jumpPage$.subscribe((pageIndex: number) => {
      if (!dataRef.current) return
      if (dataRef.current.current !== pageIndex) {
        document.scrollingElement!.scrollTop = computedTargetHeight(
          pageIndex,
          dataRef.current.list
        )
        mutate(comicPagesKey, (data: ComicListDataSourceProps) => ({
          ...data,
          current: pageIndex,
        }))
      }
    })
  }, [comicPagesKey, jumpPage$])

  useEventListener('scroll', () => {
    if (document.scrollingElement && dataRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = document.scrollingElement
      const threshold = window.innerHeight * 1.5 // Load when 1.5 screens away from bottom

      mutate(comicPagesKey, (data: ComicListDataSourceProps) => {
        if (!data) return // Should not happen, but safety check

        // Update current page based on scroll position
        const current = computedCurrentTarget(data.list, scrollTop)
        let updatedData = data
        if (current !== data.current) {
          updatedData = { ...data, current }
        }

        // Check if we need to load more pages
        const currentPageIndex = Math.floor(current / pageSize)
        const nextPageIndexToLoad = currentPageIndex + 1
        const totalPageCount = Math.ceil(data.total / pageSize)

        if (
          nextPageIndexToLoad < totalPageCount &&
          scrollTop + clientHeight >= scrollHeight - threshold
        ) {
          // Use dataRef to avoid stale closure issues if needed, though mutate should provide latest
          loadMorePage$.emit(nextPageIndexToLoad)
        }

        return updatedData === data ? undefined : updatedData // Avoid unnecessary re-renders if nothing changed
      })
    }
  })

  if (!data || data.total === 0) return null

  return (
    <>
      <div
        className={classes.root}
        onClick={() => toggleControls$.emit()}
        style={{
          minHeight: computedFullHeight(data.list),
          position: 'relative',
        }}
      >
        {data.list.map((o, k) => {
          return (
            <div
              key={k}
              className={classes.virtualItem}
              style={{
                transform: `translateY(${computedTargetHeight(
                  k,
                  data.list
                )}px)`,
              }}
            >
              <ComicItem
                index={k}
                thumb={o?.thumb}
                url={o?.url}
                aspectratio={o?.aspectratio}
                comicPagesKey={comicPagesKey}
              />
            </div>
          )
        })}
      </div>
      <ComicStatus total={data.total} current={data.current} />
      <ComicControls total={data.total} current={data.current} />
    </>
  )
}

export default ComicList
