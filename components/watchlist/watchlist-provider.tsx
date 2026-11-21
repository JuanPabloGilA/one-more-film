'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { parseWatchlist, WATCHLIST_KEY } from '@/lib/watchlist';
import type { Movie } from '@/lib/types';
import { toMovie } from '@/lib/movie';
const WatchlistContext = createContext<{
  movies: Movie[];
  ready: boolean;
  message: string;
  toggle: (movie: Movie) => void;
}>({ movies: [], ready: false, message: '', toggle: () => {} });
export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const read = () => {
      try {
        setMovies(parseWatchlist(localStorage.getItem(WATCHLIST_KEY)));
      } catch {
        setMessage('Browser storage is unavailable. Your watchlist will last for this visit.');
      }
    };
    read();
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === WATCHLIST_KEY || event.key === null) read();
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const toggle = (movie: Movie) => {
    const exists = movies.some((item) => item.id === movie.id);
    if (!exists && movies.length >= 500) {
      setMessage('Your watchlist is full. Remove a movie to add another.');
      return;
    }
    const next = exists
      ? movies.filter((item) => item.id !== movie.id)
      : [...movies, toMovie(movie)];
    setMovies(next);
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
      setMessage(`${movie.title} ${exists ? 'removed from' : 'added to'} your watchlist.`);
    } catch {
      setMessage('Saved for this visit. Browser storage is unavailable.');
    }
  };
  return (
    <WatchlistContext.Provider value={{ movies, ready, message, toggle }}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </WatchlistContext.Provider>
  );
};
export const useWatchlist = () => useContext(WatchlistContext);
