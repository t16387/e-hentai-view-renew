import { loadMorePage } from '@/apis'
import LoadMedia from '@/components/LoadMedia'
import useInViewportWithDistance from '@/hooks/useInViewportWithDistance'
import { PageListProps } from '@/interface/gallery'
import { Button, Card, CardActionArea, Grid, Typography } from '@mui/material'
import { Theme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { Skeleton } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useSWRInfinite } from 'swr'
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    // Remove maxHeight and minHeight, let inline style control size
    cover: {
      margin: theme.spacing(0, 'auto'), // Keep horizontal centering
    },

    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: 'repeat(4, 1fr)',
      },
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
    },

    speedDial: {
      position: 'fixed',
      right: 16,
      bottom: 16,
      zIndex: theme.zIndex.speedDial - 2,
    },
    btn: { margin: theme.spacing(1, 0) },
  })
)
const PageList: React.FC<Omit<PageListProps, 'filecount'>> = ({
  url,
  initialData,
}) => {
  const [inView, ref] = useInViewportWithDistance<HTMLButtonElement>(600)
  const [t] = useTranslation()
  const classes = useStyles()
  const router = useRouter()
  const handleOpen = (k?: number) => {
    console.log('handleOpen called with index:', k); // Log the index received
    console.log('Base URL prop:', url); // Log the base URL
    if (k !== undefined) { // Check if k is defined (it should be the index i)
      const targetPath = url + '/read?current=' + k;
      const targetAs = '/[gid]/[token]/read?current=' + k;
      console.log('Navigating to path:', targetPath); // Log the target path
      console.log('Navigating as:', targetAs); // Log the 'as' path
      router.push(
        targetAs, // Use the 'as' path for browser history
        targetPath // Use the actual path for Next.js routing
      );
    } else {
      // This case shouldn't happen when clicking a specific thumbnail
      console.log('handleOpen called without index, navigating to base read page');
      router.push('/[gid]/[token]/read', url + '/read');
    }
  };

  const { data, error, size, setSize } = useSWRInfinite(
    (offset) => `/api/gallery${url}/${offset}`,
    async (url: string) => {
      if (url.endsWith('0')) return initialData
      return await loadMorePage(url)
    }
  )

  const dataSource = data ? data.flat(1) : []
  const isLoadingInitialData = !data && !error
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = !isLoadingInitialData && dataSource.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1].length < 20)

  useEffect(() => {
    if (inView && !isLoadingMore && !isReachingEnd) setSize((t) => t + 1)
  }, [inView, isLoadingMore, isReachingEnd, setSize])

  return (
    <>
      <Grid container className={classes.container} spacing={2}>
        {dataSource.map((o, i) => ( // Removed the wrapping braces and console.log
            <Grid item key={o.url} container wrap="nowrap" direction="column">
              <Grid item xs>
                <Card>
                <CardActionArea onClick={() => handleOpen(i)}>
                  {/* Replace LoadMedia with a div using background styles */}
                  <div
                    className={classes.cover} // Apply centering class
                    style={{
                      width: o.style.width ? `${o.style.width}px` : 'auto',
                      height: o.style.height ? `${o.style.height}px` : 'auto',
                      backgroundImage: o.style.backgroundUrl ? `url(${o.style.backgroundUrl})` : 'none',
                      // Calculate backgroundPosition dynamically: -((index % 20) * width)px 0px
                      backgroundPosition: o.style.width ? `-${(i % 20) * o.style.width}px 0px` : '0 0',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'auto', // Ensure the sprite isn't scaled
                    }}
                  />
                </CardActionArea>
              </Card>
            </Grid>
              <Typography align="center">{i + 1}</Typography>
            </Grid>
        ))}
        {isLoadingMore &&
          new Array(20).fill(0).map((_, k) => (
            <Grid item key={k}>
              <Card>
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  className={classes.cover}
                  height={150}
                />
              </Card>
            </Grid>
          ))}
      </Grid>
      <Button
        ref={ref}
        fullWidth
        disabled={isLoadingMore || isReachingEnd}
        className={classes.btn}
      >
        {isReachingEnd
          ? t('ReachEnd')
          : isLoadingMore
          ? t('Loading') + '...'
          : t('More')}
      </Button>
    </>
  )
}

export default PageList
