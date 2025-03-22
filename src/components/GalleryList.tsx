import useGalleryList, { UseGalleryListOptions } from '@/hooks/useGalleryList'
import GalleryCard, { LoadingCard } from '@/components/GalleryCard'
import { Box, Button, Grid, Typography } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { useTranslation } from 'next-i18next'
import React, { useState, useCallback, useEffect } from 'react'
export const useStyles = makeStyles((theme) =>
  createStyles({
    searchButton: { marginLeft: theme.spacing(1) },
    title: { fontSize: '10pt', height: 36, overflow: 'hidden' },
    card: { margin: theme.spacing(0, 'auto') },
    btn: { margin: theme.spacing(1, 0) },
    container: {
      display: 'grid',
      paddingTop: 16,
      gridTemplateColumns: 'repeat(5, 1fr)',
      [theme.breakpoints.up(1000)]: {
        gridTemplateColumns: 'repeat(4, 1fr)',
      },
      [theme.breakpoints.between(750, 1000)]: {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
      [theme.breakpoints.between('xs', 750)]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'repeat(1, 1fr)',
      },
    },
  })
)

export interface GalleryListProps extends UseGalleryListOptions {}
const GalleryList: React.FC<GalleryListProps> = (props) => {
  const classes = useStyles()
  const [t] = useTranslation()
  const [page, setPage] = useState(0)

  const {
    dataSource,
    isEmpty,
    isLoadingMore,
    isReachingEnd,
    error,
  } = useGalleryList({ ...props, page })

  const handleNextPage = useCallback(() => {
    setPage((prevPage) => prevPage + 1)
  }, [setPage])

  const handlePrevPage = useCallback(() => {
    setPage((prevPage) => Math.max(prevPage - 1, 0))
  }, [setPage])

  useEffect(() => {
    // Reset page to 0 when the mode or f_search changes
    setPage(0)
  }, [props.mode, props.f_search, setPage])

  if (isEmpty)
    return (
      <Box>
        <Typography variant="subtitle2" align="center" gutterBottom>
          {t('Search.NoThisFound')}
        </Typography>
      </Box>
    )

  return (
    <>
      <Grid
        container
        wrap="wrap"
        justifyContent="flex-start"
        className={classes.container}
        spacing={2}
      >
        {dataSource.map((o, i) => (
          <Grid item xs key={o.gid} data-index={i}>
            <GalleryCard record={o} />
          </Grid>
        ))}
        {isLoadingMore &&
          Array(25)
            .fill(0)
            .map((_, k) => <LoadingCard key={k} />)}
      </Grid>
      <Box display="flex" justifyContent="space-between" className={classes.btn}>
        <Button
          disabled={page === 0}
          onClick={handlePrevPage}
        >
          {t('Previous Page')}
        </Button>
        <Button
          disabled={isReachingEnd}
          onClick={handleNextPage}
        >
          {t('Next Page')}
        </Button>
      </Box>
    </>
  )
}

export default GalleryList
