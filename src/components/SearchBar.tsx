import message from '@/components/message';
import useFocus from '@/hooks/useFocus';
import {
  Button,
  Container,
  Grid,
  InputBase,
  IconButton,
  Collapse,
  Checkbox,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import { alpha, Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList'; // Import filter icon
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { HtmlHTMLAttributes, useEffect, useState, FormEvent } from 'react';
const useStyles = makeStyles((theme: Theme) => {
  const light = theme.palette.mode === 'light';
  const greyColor = light ? theme.palette.grey['700'] : theme.palette.common.white;

  return createStyles({
    root: { position: 'relative', overflow: 'visible' }, // Allow overflow for collapse

    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },

    searchRoot: {
      flexGrow: 1, // Allow input to take available space
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(greyColor, 0.15),
      '&:hover': {
        backgroundColor: alpha(greyColor, 0.25),
      },
      // marginRight: theme.spacing(1), // Removed margin, buttons are now outside
      transition: theme.transitions.create('width'),
      display: 'flex', // Ensure icon and input are aligned
      alignItems: 'center',
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      // position: 'absolute', // Removed absolute positioning
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'inherit',
    },
    inputRoot: {
      color: 'inherit',
      flexGrow: 1, // Allow input to take space
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: theme.spacing(1), // Adjusted padding
      width: '100%', // Ensure input takes full width within its container
    },
    filterButton: {
      // Style for the filter icon button
      marginLeft: theme.spacing(1),
    },
    advancedSearchSection: {
      // Style for the collapsible section - Simplified as requested
      marginTop: theme.spacing(2),
      padding: theme.spacing(2),
      // border: `1px solid ${theme.palette.divider}`, // Removed
      // borderRadius: theme.shape.borderRadius, // Removed
      // backgroundColor: alpha(greyColor, 0.10), // Removed
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    pageRangeInput: {
      width: '80px', // Adjust width as needed
      margin: theme.spacing(0, 1),
    },
    searchButtonContainer: {
      marginTop: theme.spacing(2),
      textAlign: 'right',
    },
  });
});

// Add onSearchSubmit to props
interface SearchBarProps extends Omit<HtmlHTMLAttributes<HTMLDivElement>, 'onSearch'> { // Omit default onSearch if exists
  resultPagePath?: string;
  onSearchSubmit?: (searchTerm: string, queryParams: URLSearchParams) => void; // Callback for history
}

// Define state for advanced search options
interface AdvancedSearchState {
  expunged: boolean;
  torrent: boolean;
  pageStart: string;
  pageEnd: string;
  minRating: number;
  disableLangFilter: boolean;
  disableUploaderFilter: boolean;
  disableTagFilter: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ resultPagePath = '/', ...props }) => {
  const classes = useStyles();
  const router = useRouter();
  const initialSearch = decodeURIComponent((router.query.f_search as string) || '');
  const [search, setSearch] = useState(initialSearch);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedSearchState>({
    expunged: router.query.f_sh === 'on',
    torrent: router.query.f_sto === 'on',
    pageStart: (router.query.f_spf as string) || '',
    pageEnd: (router.query.f_spt as string) || '',
    minRating: parseInt(router.query.f_srdd as string, 10) || 0, // Default to 0 if not present or invalid
    disableLangFilter: router.query.f_sfl === 'on',
    disableUploaderFilter: router.query.f_sfu === 'on',
    disableTagFilter: router.query.f_sft === 'on',
  });

  const [isFocus, ref] = useFocus<HTMLInputElement>();
  const [t] = useTranslation();

  // Update search state if router query changes (e.g., back navigation)
  useEffect(() => {
    setSearch(initialSearch);
    // Also update advanced options based on query params
    setAdvancedOptions({
      expunged: router.query.f_sh === 'on',
      torrent: router.query.f_sto === 'on',
      pageStart: (router.query.f_spf as string) || '',
      pageEnd: (router.query.f_spt as string) || '',
      minRating: parseInt(router.query.f_srdd as string, 10) || 0,
      disableLangFilter: router.query.f_sfl === 'on',
      disableUploaderFilter: router.query.f_sfu === 'on',
      disableTagFilter: router.query.f_sft === 'on',
    });
    // Optionally open advanced search if relevant params exist
    if (Object.keys(router.query).some(key => key.startsWith('f_s'))) {
        setIsAdvancedSearchOpen(true);
    }

  }, [router.query]);

  const handleAdvancedChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setAdvancedOptions(prev => ({
      ...prev,
      [name as string]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRatingChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAdvancedOptions(prev => ({
      ...prev,
      minRating: event.target.value as number,
    }));
  };


  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();

    // Validation: Basic search needs term length > 2 if advanced is closed
    if (!isAdvancedSearchOpen && search.trim().length > 0 && search.trim().length < 3) {
      return message.error(t('Search.Short'), 1500);
    }

    const queryParams = new URLSearchParams();
    const searchTerm = search.trim();

    // Always include basic search term if present
    if (searchTerm) {
      queryParams.set('f_search', searchTerm);
    }

    let hasAdvancedOptions = false;
    if (isAdvancedSearchOpen) {
      // Only add advsearch=1 if any advanced option is actually set
      const advancedSet = [
        advancedOptions.expunged, advancedOptions.torrent,
        advancedOptions.pageStart, advancedOptions.pageEnd,
        advancedOptions.minRating > 0, advancedOptions.disableLangFilter,
        advancedOptions.disableUploaderFilter, advancedOptions.disableTagFilter
      ].some(Boolean); // Check if at least one advanced option is active

      if (advancedSet) {
        queryParams.set('advsearch', '1');
        hasAdvancedOptions = true;
        if (advancedOptions.expunged) queryParams.set('f_sh', 'on');
        if (advancedOptions.torrent) queryParams.set('f_sto', 'on');
        if (advancedOptions.pageStart) queryParams.set('f_spf', advancedOptions.pageStart);
        if (advancedOptions.pageEnd) queryParams.set('f_spt', advancedOptions.pageEnd);
        if (advancedOptions.minRating > 0) queryParams.set('f_srdd', advancedOptions.minRating.toString());
        if (advancedOptions.disableLangFilter) queryParams.set('f_sfl', 'on');
        if (advancedOptions.disableUploaderFilter) queryParams.set('f_sfu', 'on');
        if (advancedOptions.disableTagFilter) queryParams.set('f_sft', 'on');
      }
    }

    // Ensure there's at least f_search or one active advanced param before navigating
    if (searchTerm || hasAdvancedOptions) {
        const targetPath = resultPagePath.endsWith('/') ? resultPagePath : `${resultPagePath}/`;
        const fullQueryString = queryParams.toString();

        // Call the callback if provided, before navigating
        if (props.onSearchSubmit) {
          props.onSearchSubmit(searchTerm, queryParams);
        }

        router.push(`${targetPath}?${fullQueryString}`, undefined, {
            shallow: true, // Use shallow routing if appropriate for the target page
        });
    } else {
        // Handle case where advanced is open but no options selected and no search term
        message.info(t('Search.NoCriteria'), 1500);
    }
  };

  // Destructure onSearchSubmit from props to avoid passing it down to DOM element
  const { onSearchSubmit, ...restProps } = props;

  return (
    // Pass restProps (excluding onSearchSubmit) to the Container
    <Container maxWidth="md" disableGutters {...restProps}>
      <form onSubmit={handleSearch}>
        <Grid container direction="column" className={classes.root}>
          {/* Search Input and Buttons Row */}
          <Grid item xs={12} className={classes.searchContainer}>
            {/* Input field takes remaining space */}
            <div className={classes.searchRoot}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder={t('Search') + '...'}
                value={search}
                inputRef={ref}
                onChange={(e) => setSearch(e.target.value)}
                type="search"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': t('Search') }}
                // Trigger search on Enter key press in input
                onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(e as any); }}
              />
            </div>
            {/* Search Button */}
            <Button
              variant="contained"
              color="primary"
              type="submit" // Connects to the form's onSubmit
              sx={{ ml: 1 }} // Margin left from input
            >
              {t('Search')}
            </Button>
            {/* Filter Button */}
            <IconButton
              className={classes.filterButton} // Keep class if specific styles needed
              onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
              aria-label={t('Advanced Search')}
              size="large"
              sx={{ ml: 0.5 }} // Small margin left from search button
            >
              <FilterListIcon />
            </IconButton>
          </Grid>

          {/* Collapsible Advanced Search Section */}
          <Grid item xs={12}>
             {/* Added timeout and unmountOnExit for smoother transition */}
            <Collapse in={isAdvancedSearchOpen} timeout="auto" unmountOnExit>
              <Box className={classes.advancedSearchSection}>
                 {/* Group 1: Expunged & Torrent */}
                 <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 }, mb: 2 }}>
                    <FormControlLabel
                      control={<Checkbox checked={advancedOptions.expunged} onChange={handleAdvancedChange} name="expunged" size="small" />}
                      label={t('Browse Expunged Galleries')}
                      sx={{ mr: { sm: 2 } }} // Add margin between items on larger screens
                    />
                    <FormControlLabel
                      control={<Checkbox checked={advancedOptions.torrent} onChange={handleAdvancedChange} name="torrent" size="small" />}
                      label={t('Require Gallery Torrent')}
                    />
                 </Box>

                 {/* Group 2: Page Range & Rating */}
                 <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 2, mb: 2 }}>
                    <Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}> {/* Wrap page range on small screens */}
                      <Typography variant="body2">{t('Pages Between')}:</Typography>
                      <TextField
                        name="pageStart"
                        value={advancedOptions.pageStart}
                        onChange={handleAdvancedChange}
                        type="number"
                        size="small"
                        variant="outlined"
                        className={classes.pageRangeInput} // Keep class for specific width if needed
                        inputProps={{ min: 0, style: { textAlign: 'center' } }} // Center text
                      />
                      <Typography variant="body2">{t('and')}</Typography>
                      <TextField
                        name="pageEnd"
                        value={advancedOptions.pageEnd}
                        onChange={handleAdvancedChange}
                        type="number"
                        size="small"
                        variant="outlined"
                        className={classes.pageRangeInput} // Keep class for specific width if needed
                        inputProps={{ min: 0, style: { textAlign: 'center' } }} // Center text
                      />
                    </Box>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 150, flexShrink: 0 }}> {/* Adjust width */}
                      <InputLabel>{t('Minimum Rating')}</InputLabel>
                      <Select
                        name="minRating"
                        value={advancedOptions.minRating}
                        onChange={handleRatingChange as any}
                        label={t('Minimum Rating')}
                      >
                        <MenuItem value={0}>{t('Any Rating')}</MenuItem> {/* Match HTML text */}
                        <MenuItem value={2}>2 {t('Stars')}</MenuItem>
                        <MenuItem value={3}>3 {t('Stars')}</MenuItem>
                        <MenuItem value={4}>4 {t('Stars')}</MenuItem>
                        <MenuItem value={5}>5 {t('Stars')}</MenuItem>
                      </Select>
                    </FormControl>
                 </Box>

                 {/* Group 3: Disable Filters */}
                 <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>{t('Disable Default Filters')}:</Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 } }}>
                      <FormControlLabel
                        control={<Checkbox checked={advancedOptions.disableLangFilter} onChange={handleAdvancedChange} name="disableLangFilter" size="small" />}
                        label={t('Language')}
                        sx={{ mr: { sm: 2 } }}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={advancedOptions.disableUploaderFilter} onChange={handleAdvancedChange} name="disableUploaderFilter" size="small" />}
                        label={t('Uploader')}
                        sx={{ mr: { sm: 2 } }}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={advancedOptions.disableTagFilter} onChange={handleAdvancedChange} name="disableTagFilter" size="small" />}
                        label={t('Tags')}
                      />
                    </Box>
                 </Box>
                 {/* Add Cancel Button */}
                 <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="text" // Use text variant for less emphasis
                      onClick={() => setIsAdvancedSearchOpen(false)}
                    >
                      {t('Cancel')}
                    </Button>
                    {/* The main Search button is outside the Collapse now */}
                 </Box>
              </Box>
            </Collapse>
          </Grid>

          {/* Search Button is now moved inline with the input */}
        </Grid>
      </form>
    </Container>
  );
};

export default SearchBar;
