'use client';
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { routes } from '@/lib/links';

// Remembers where each movie page was opened from, so that the back link can return to
// the same scroll position and the poster or backdrop can morph between the two pages.

export type ArtworkKind = 'poster' | 'backdrop';

type Origin = {
  artwork: ArtworkKind;
  posterName: string;
  from: string;
  href: string;
  scrollY: number;
  filmographyScrollTop?: number;
};
type ScrollTarget = Pick<Origin, 'from' | 'scrollY' | 'filmographyScrollTop'>;

const FILMOGRAPHY_SCROLL_ID = 'filmography-scroll';

const MovieNavigationContext = createContext<{
  origins: Record<number, Origin>;
  remember: (movieId: number, posterName: string, artwork: ArtworkKind) => void;
  prepareReturn: (origin: Origin) => void;
}>({ origins: {}, remember: () => {}, prepareReturn: () => {} });

export const MovieNavigationProvider = ({ children }: { children: ReactNode }) => {
  const [origins, setOrigins] = useState<Record<number, Origin>>({});
  const pathname = usePathname();
  const scrollTarget = useRef<ScrollTarget | null>(null);

  // Restore scroll in the layout phase, before the view transition captures the new page.
  useLayoutEffect(() => {
    const target = scrollTarget.current;
    if (!target || pathname !== target.from) return;
    const filmography = document.getElementById(FILMOGRAPHY_SCROLL_ID);
    if (filmography && target.filmographyScrollTop !== undefined)
      filmography.scrollTop = target.filmographyScrollTop;
    window.scrollTo({ top: target.scrollY, behavior: 'instant' });
    scrollTarget.current = null;
  }, [pathname]);

  const remember = useCallback((movieId: number, posterName: string, artwork: ArtworkKind) => {
    // The hash is left out: scroll is restored explicitly, and a hash in the back link made
    // the router repeat it (`#movies#movies`).
    const { pathname: from, search } = window.location;
    const origin: Origin = {
      posterName,
      artwork,
      from,
      href: from + search,
      scrollY: window.scrollY,
      filmographyScrollTop: document.getElementById(FILMOGRAPHY_SCROLL_ID)?.scrollTop,
    };
    scrollTarget.current = { from: routes.movie(movieId), scrollY: 0 };
    setOrigins((previous) => ({ ...previous, [movieId]: origin }));
  }, []);

  const prepareReturn = useCallback((origin: Origin) => {
    scrollTarget.current = origin;
  }, []);

  const value = useMemo(
    () => ({ origins, remember, prepareReturn }),
    [origins, remember, prepareReturn],
  );
  return (
    <MovieNavigationContext.Provider value={value}>{children}</MovieNavigationContext.Provider>
  );
};

export const useMovieNavigation = () => useContext(MovieNavigationContext);

const backLabel = (from: string) => {
  if (from === routes.discover) return 'Back to your films';
  if (from === routes.watchlist) return 'Back to watchlist';
  if (from.startsWith('/person/')) return 'Back to profile';
  if (from.startsWith('/movie/')) return 'Back to film';
  return 'Back to discover';
};

export const BackToMovies = ({ movieId }: { movieId: number }) => {
  const { origins, prepareReturn } = useMovieNavigation();
  const origin = origins[movieId];
  if (!origin)
    return (
      <Link href={routes.home} className="back-link">
        <ArrowLeft size={16} />
        {backLabel(routes.home)}
      </Link>
    );
  // scroll={false} keeps both artwork snapshots for the transition; the provider
  // restores the previous scroll position itself.
  return (
    <Link
      href={origin.href}
      scroll={false}
      className="back-link"
      onNavigate={() => prepareReturn(origin)}
    >
      <ArrowLeft size={16} />
      {backLabel(origin.from)}
    </Link>
  );
};
