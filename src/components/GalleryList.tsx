import useGalleryList, { UseGalleryListOptions } from '@/hooks/useGalleryList';
import GalleryCard, { LoadingCard } from '@/components/GalleryCard';
import { Box, Button, Grid, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useTranslation } from 'next-i18next';
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { PropsWithChildren } from 'react';

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
);

export interface GalleryListProps extends UseGalleryListOptions {}
const GalleryList: React.FC<GalleryListProps> = (props) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const router = useRouter();

  const {
    dataSource,
    isEmpty,
    isReachingEnd,
    isLoading,
    error,
    prevurl,
    nexturl,
  } = useGalleryList(props);

  console.log('nexturl:', nexturl);

  const handleNextPage = useCallback(() => {
    if (nexturl) {
      const url = new URL(nexturl);
      const next = url.searchParams.get('next');
      const f_search = router.query.f_search || props.f_search || "";
      router.push({
        pathname: '/',
        query: { f_search: f_search, next: next },
      });
    }
  }, [nexturl, router, router.query.next]);

  console.log('prevurl:', nexturl);
  const handlePrevPage = useCallback(() => {
    if (prevurl) {
      const url = new URL(prevurl);
      const next = url.searchParams.get('next');
      const f_search = router.query.f_search || props.f_search || "";
      router.push({
        pathname: '/',
        query: { f_search: f_search, next: next },
      });
    }
  }, [nexturl, router, router.query.next]);

  if (isEmpty)
    return (
      <Box>
        <Typography variant="subtitle2" align="center" gutterBottom>
          {t('Search.NoThisFound')}
        </Typography>
      </Box>
    );

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
        {isLoading &&
          Array(25)
            .fill(0)
            .map((_, k) => <LoadingCard key={k} />)}
      </Grid>
      <Box display="flex" justifyContent="space-between" className={classes.btn}>
        <Button
          disabled={!prevurl}
          onClick={handlePrevPage}
        >
          {t('Previous Page')}
        </Button>
        <Button
          disabled={!nexturl}
          onClick={handleNextPage}
        >
          {t('Next Page')}
        </Button>
      </Box>
    </>
  );
};

export default GalleryList;
