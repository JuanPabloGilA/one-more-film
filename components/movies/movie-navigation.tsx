'use client';
import {
  createContext,
  useContext,
  useState,
  useRef,
  useLayoutEffect,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export type ArtworkKind = 'poster' | 'backdrop';

type Origin = {
  artwork: ArtworkKind;
  posterName: string;
  from: string;
  href: string;
  scrollY: number;
  filmographyScrollTop?: number;
};
type Preferences = { genre: number; sort: string };
const MovieNavigationContext = createContext<{
  origins: Record<number, Origin>;
  remember: (movieId: number, posterName: string, artwork: ArtworkKind) => void;
  prepareReturn: (origin: Origin) => void;
  preferences: Record<string, Preferences>;
  savePreferences: (key: string, preferences: Preferences) => void;
}>({
  origins: {},
  remember: () => {},
  prepareReturn: () => {},
  preferences: {},
  savePreferences: () => {},
});

export const MovieNavigationProvider = ({ children }: { children: ReactNode }) => {
  const [origins, setOrigins] = useState<Record<number, Origin>>({});
  const pathname = usePathname();
  const returnTarget = useRef<Pick<Origin, 'from' | 'scrollY' | 'filmographyScrollTop'> | null>(
    null,
  );
  const [preferences, setPreferences] = useState<Record<string, Preferences>>({});
  const prepareReturn = (origin: Origin) => {
    returnTarget.current = origin;
  };
  const savePreferences = (key: string, value: Preferences) =>
    setPreferences((previous) => ({ ...previous, [key]: value }));
  useLayoutEffect(() => {
    const target = returnTarget.current;
    if (target && pathname === target.from) {
      const filmography = document.getElementById('filmography-scroll');
      if (filmography && target.filmographyScrollTop !== undefined)
        filmography.scrollTop = target.filmographyScrollTop;
      window.scrollTo({ top: target.scrollY, behavior: 'instant' });
      returnTarget.current = null;
    }
  }, [pathname]);
  const remember = (movieId: number, posterName: string, artwork: ArtworkKind) => {
    const from = window.location.pathname;
    const href = from + window.location.search + window.location.hash;
    const scrollY = window.scrollY;
    const filmographyScrollTop = document.getElementById('filmography-scroll')?.scrollTop;
    returnTarget.current = { from: `/movie/${movieId}`, scrollY: 0 };
    setOrigins((previous) => ({
      ...previous,
      [movieId]: { posterName, artwork, from, href, scrollY, filmographyScrollTop },
    }));
  };
  return (
    <MovieNavigationContext.Provider
      value={{ origins, remember, prepareReturn, preferences, savePreferences }}
    >
      {children}
    </MovieNavigationContext.Provider>
  );
};
export const useMovieNavigation = () => useContext(MovieNavigationContext);

export const BackToMovies = ({ movieId }: { movieId: number }) => {
  const { origins, prepareReturn } = useMovieNavigation();
  const origin = origins[movieId];
  if (!origin)
    return (
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        Back to discover
      </Link>
    );
  const label =
    origin.from === '/discover'
      ? 'Back to your films'
      : origin.from === '/watchlist'
        ? 'Back to watchlist'
        : origin.from.startsWith('/person/')
          ? 'Back to profile'
          : origin.from.startsWith('/movie/')
            ? 'Back to film'
            : 'Back to discover';
  // An explicit route transition keeps both poster snapshots available. Restore
  // the catalogue position in the commit before the new snapshot is captured.
  return (
    <Link
      href={origin.href}
      scroll={false}
      className="back-link"
      onNavigate={() => prepareReturn(origin)}
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
};
