import { axios } from '@/apis';
import { GalleriesPage } from '@/interface/gallery';
import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useRouter } from 'next/router';
import { stringify } from 'qs'; // Use qs for robust query string generation

export interface UseGalleryListOptions {
  // f_search is now derived from router.query, so remove it from options if it's always meant to sync
  mode: 'index' | 'popular' | 'favorites' | 'watched' | 'result'; // Added 'result' mode maybe? Or handle index/result similarly
  favcat?: string;
}

// Helper function to create a stable query string representation for dependencies
const createStableQueryString = (query: NodeJS.Dict<string | string[]>) => {
  // Filter out irrelevant params if needed, sort keys for stability
  const relevantKeys = Object.keys(query).filter(key => !key.startsWith('_') /* add other filters if necessary */).sort();
  const stableQuery: Record<string, any> = {};
  relevantKeys.forEach(key => {
    stableQuery[key] = query[key];
  });
  return stringify(stableQuery); // Use qs.stringify
};
interface GalleryListResponse {
  list: GalleriesPage['list'];
  total: number;
  prevurl: string;
  nexturl: string;
  error?: string;
}

export default function useGalleryList<T extends HTMLElement = HTMLDivElement>(
  options: UseGalleryListOptions
) {
  const { mode, favcat } = options; // Removed f_search from options destructuring
  const router = useRouter();
  const [data, setData] = useState<GalleryListResponse>({ list: [], total: 0, prevurl: '', nexturl: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a stable string representation of the relevant query parameters
  const queryStringForEffect = useMemo(() => createStableQueryString(router.query), [router.query]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      // Construct query string directly from router.query using qs
      const currentQueryString = stringify(router.query);
      console.log("Current Query Params:", router.query);
      console.log("Stringified Query:", currentQueryString);

      try {
        let url = "";
        switch (mode) {
          case "index": // Assuming 'index' mode should use the full query
          case "result": // Handle 'result' page similarly if needed, or merge logic
            // Pass the entire query string to the backend
            url = `/api/gallery?${currentQueryString}`;
            break;
          case "popular":
            // Popular likely doesn't use query params in the same way
            url = "/api/popular";
            break;
          case "favorites":
            // Favorites might use specific params like favcat, but could also support search within favorites?
            // For now, keep it simple:
            url = `/api/favorites?favcat=${favcat || ''}${currentQueryString ? '&' + currentQueryString : ''}`; // Example: Allow search within favs
            // Or simpler: url = `/api/favorites?favcat=${favcat || ''}`;
            break;
          case "watched":
            // Watched likely doesn't use query params
            url = "/api/watched";
            break;
          default:
            console.error("Invalid mode provided to useGalleryList:", mode);
            throw new Error("Invalid mode");
        }
        console.log("Fetching URL:", url);
        const res = await axios.get<GalleryListResponse>(url);
        setData(res.data);
      } catch (e: any) {
        console.error("Error fetching gallery list:", e);
        setError(e.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if mode is valid
    if (mode) {
        fetchData();
    } else {
        // Handle case where mode might be initially undefined or invalid
        setData({ list: [], total: 0, prevurl: '', nexturl: '' });
        setError("Mode not specified");
    }
  // Use the stable query string representation in the dependency array
  }, [mode, favcat, queryStringForEffect]);

  const dataSource = data.list;
  const isEmpty = dataSource.length === 0 && !isLoading;
  const isReachingEnd = mode === "popular" || (dataSource.length < (mode === "favorites" ? 50 : 25));

  return {
    dataSource,
    isEmpty,
    isReachingEnd,
    isLoading,
    error,
    prevurl: data.prevurl,
    nexturl: data.nexturl,
  };
}
