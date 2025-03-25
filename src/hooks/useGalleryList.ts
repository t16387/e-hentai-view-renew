import { axios } from '@/apis';
import { GalleriesPage } from '@/interface/gallery';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export interface UseGalleryListOptions {
  f_search?: string;
  mode: 'index' | 'popular' | 'favorites' | 'watched';
  favcat?: string;
}

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
  const { mode, f_search, favcat } = options;
  const router = useRouter();
  const [data, setData] = useState<GalleryListResponse>({ list: [], total: 0, prevurl: '', nexturl: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let url = "";
				console.log("f_search", f_search);
				console.log("router.query", router.query);
        switch (mode) {
          case "index":
            url = `/api/gallery?${router.query.next || router.query.prev ? "" : "page=0&" }f_search=${f_search ? encodeURIComponent(f_search) : ""}${router.query.next ? `&next=${router.query.next || ""}` : ""}${router.query.prev ? `&prev=${router.query.prev || ""}` : ""}`;
            break;
          case "popular":
            url = "/api/popular";
            break;
          case "favorites":
            url = `/api/favorites?favcat=${favcat}`;
            break;
          case "watched":
            url = "/api/watched";
            break;
          default:
            throw new Error("Invalid mode");
        }
				console.log("url", url);
        const res = await axios.get<GalleryListResponse>(url);
        setData(res.data);
      } catch (e: any) {
        setError(e.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mode, f_search, favcat, router.query.next, router.query.prev]);

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
