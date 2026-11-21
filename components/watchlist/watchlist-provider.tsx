'use client';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { toMovie } from '@/lib/movie';
import type { Movie } from '@/lib/types';
import { parseWatchlist, WATCHLIST_LIMIT } from '@/lib/watchlist';
import {
  getServerSnapshot,
  getSnapshot,
  getStorageAvailable,
  subscribe,
  writeWatchlist,
} from './watchlist-store';

type Watchlist = {
  movies: Movie[];
  /** False until the browser's copy has been read, to avoid flashing an empty list. */
  ready: boolean;
  storageAvailable: boolean;
  isSaved: (movieId: number) => boolean;
  toggle: (movie: Movie) => void;
};

const WatchlistContext = createContext<Watchlist>({
  movies: [],
  ready: false,
  storageAvailable: true,
  isSaved: () => false,
  toggle: () => {},
});

const toggleMessage = (title: string, removed: boolean, persisted: boolean) => {
  if (!persisted) return 'Saved for this visit. Browser storage is unavailable.';
  return `${title} ${removed ? 'removed from' : 'added to'} your watchlist.`;
};

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const storageAvailable = useSyncExternalStore(subscribe, getStorageAvailable, () => true);
  const [announcement, setAnnouncement] = useState('');
  const movies = useMemo(() => parseWatchlist(raw ?? null), [raw]);

  const toggle = useCallback((movie: Movie) => {
    // Read the latest list rather than a render's copy, so rapid clicks never lose an update.
    const current = parseWatchlist(getSnapshot());
    const saved = current.some((item) => item.id === movie.id);
    if (!saved && current.length >= WATCHLIST_LIMIT) {
      setAnnouncement('Your watchlist is full. Remove a movie to add another.');
      return;
    }
    const next = saved
      ? current.filter((item) => item.id !== movie.id)
      : [...current, toMovie(movie)];
    const persisted = writeWatchlist(JSON.stringify(next));
    setAnnouncement(toggleMessage(movie.title, saved, persisted));
  }, []);

  const value = useMemo(() => {
    const savedIds = new Set(movies.map((movie) => movie.id));
    return {
      movies,
      ready: raw !== undefined,
      storageAvailable,
      isSaved: (movieId: number) => savedIds.has(movieId),
      toggle,
    };
  }, [movies, raw, storageAvailable, toggle]);

  return (
    <WatchlistContext.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);
