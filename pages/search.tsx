import { LOCAL_SEARCH_HISTORY } from '@/constant';
import useEnhanceLocalStorageState from '@/hooks/useEnhanceLocalStorageState';
import SearchBar from '@/components/SearchBar'; // Import the SearchBar component
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  IconButton, // Keep IconButton for history clear
  Toolbar, // Keep Toolbar for spacing below AppBar
  Box, // Use Box for layout
  AppBar, // Add AppBar back
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Keep CloseIcon for history
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import back arrow
import HistoryIcon from '@mui/icons-material/History';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import React from 'react'; // Removed useState, useRef

// Removed useStyles as they are no longer needed for the input part

const Search = () => {
  const [t] = useTranslation();
  const router = useRouter();
  const [searchHistories, setSearchHistories] = useEnhanceLocalStorageState<string[]>(
    LOCAL_SEARCH_HISTORY,
    []
  );

  // History saving logic needs to be triggered differently now, perhaps within SearchBar or on navigation?
  // For now, let's keep the history display and removal logic.
  // The SearchBar component itself handles the navigation to the result page.
  // We only need handleGoResult for clicking on history items.

  const handleGoResult = (f_search: string) => {
    // Basic history click navigation - assumes history only stores f_search
    // TODO: Consider if history should store the full URL including advanced params
    try {
      if (f_search.includes('exhentai.org/g/')) {
        const res = f_search.split('/');
        const gIndex = res.findIndex((v) => v === 'g');
        const gid = res[gIndex + 1];
        const token = res[gIndex + 2];
        if (gid && token) {
          return router.push('/[gid]/[token]', `/${gid}/${token}`); // Use push for history navigation
        }
      }
    } catch (error) {
      console.error('Error parsing gallery URL from history:', error);
    }
    // Navigate to result page with the basic search term from history
    // Use push for history navigation, ensure it's not shallow if we want a full page interaction
    router.push('/result?f_search=' + encodeURIComponent(f_search));
  };

  // Re-enable function to add search term to history
  const addSearchToHistory = (searchTerm: string) => {
    // Only add non-empty search terms to history
    if (searchTerm && searchTerm.trim().length > 0) {
      setSearchHistories(
        // Add new term, remove duplicates, limit to 50 entries
        [searchTerm.trim(), ...searchHistories.filter((v) => v !== searchTerm.trim())].slice(0, 50)
      );
    }
    // Note: We are only saving the f_search term, not the advanced parameters.
    // Saving the full query might require storing objects or complex strings.
  };

  return (
    // Increased padding top to prevent overlap with potentially taller AppBar + SearchBar
    <Box sx={{ pt: '80px' }}>
      {/* Render the SearchBar component */}
      <AppBar position="fixed" elevation={1}>
         {/* Keep Toolbar for structure if needed, or simplify */}
         <Toolbar>
            {/* Back Button - Navigate back in history */}
            <IconButton onClick={() => router.back()} edge="start" size="large" aria-label={t('Back to Previous Page')}>
              <ArrowBackIcon />
            </IconButton>
            {/* Pass the history saving function to the SearchBar */}
            <SearchBar
              resultPagePath="/result"
              style={{ width: '100%' }}
              onSearchSubmit={(searchTerm) => addSearchToHistory(searchTerm)} // Pass the callback
            />
         </Toolbar>
      </AppBar>
      {/* List of search histories */}
      <List>
        {searchHistories && searchHistories.map((o, k) => (
          <ListItem button key={k} onClick={() => handleGoResult(o)}>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary={o} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => {
                  searchHistories.splice(k, 1)
                  setSearchHistories([...searchHistories])
                }}
                size="large"
              >
                <CloseIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Search;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}
