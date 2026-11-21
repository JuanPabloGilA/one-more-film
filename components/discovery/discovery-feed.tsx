'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, SlidersHorizontal, Star, X } from 'lucide-react';
import { discoveryQuery } from '@/lib/discovery';
import { requestFilms } from './request-films';
import { GENRES, year } from '@/lib/types';
import { useDiscovery } from './discovery-provider';
import { FeedTrailer } from './feed-trailer';
import { MovieLink } from '@/components/movies/movie-link';
import { SaveButton } from '@/components/watchlist/save-button';

export const DiscoveryFeed = ({ onEdit }: { onEdit: () => void }) => {
  const { session, setSession } = useDiscovery();
  const viewport = useRef<HTMLDivElement>(null);
  const initialIndex = useRef(session?.active ?? 0);
  const visibleIndex = useRef(initialIndex.current);
  const lock = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [endVisible, setEndVisible] = useState(false);
  const [warmedMovie, setWarmedMovie] = useState<number | null>(null);
  const onWarm = useCallback((movieId: number) => setWarmedMovie(movieId), []);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const loadMore = useCallback(async () => {
    const current = sessionRef.current;
    if (!current || lock.current || current.page >= current.totalPages) return;
    lock.current = true;
    setLoading(true);
    setError('');
    const request = new AbortController();
    controller.current = request;
    try {
      const data = await requestFilms(
        current.preferences,
        current.page + 1,
        request.signal,
        new Set(current.movies.map((movie) => movie.id)),
      );
      setSession((previous) => {
        if (
          !previous ||
          request.signal.aborted ||
          discoveryQuery(previous.preferences).toString() !==
            discoveryQuery(current.preferences).toString()
        )
          return previous;
        const seen = new Set(previous.movies.map((movie) => movie.id));
        return {
          ...previous,
          movies: [...previous.movies, ...data.results.filter((movie) => !seen.has(movie.id))],
          page: data.page,
          totalPages: data.total_pages,
        };
      });
    } catch (error) {
      if (!request.signal.aborted)
        setError(error instanceof Error ? error.message : 'Could not load more films.');
    } finally {
      lock.current = false;
      if (!request.signal.aborted) setLoading(false);
    }
  }, [setSession]);
  useEffect(() => () => controller.current?.abort(), []);
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    let height = element.clientHeight;
    element.scrollTop = initialIndex.current * height;
    element.focus({ preventScroll: true });
    // Keep the current film and its iframe when rotating the phone.
    const resize = new ResizeObserver(() => {
      if (element.clientHeight === height) return;
      height = element.clientHeight;
      element.scrollTo({ top: visibleIndex.current * height, behavior: 'instant' });
    });
    resize.observe(element);
    return () => resize.disconnect();
  }, []);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            const current = sessionRef.current;
            if (!current) return;
            visibleIndex.current = index;
            setEndVisible(index === current.movies.length);
            if (index < current.movies.length)
              setSession((previous) => (previous ? { ...previous, active: index } : previous));
          }
      },
      { root: element, threshold: 0.6 },
    );
    element.querySelectorAll('[data-index]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [session?.movies.length, setSession]);
  useEffect(() => {
    const current = sessionRef.current;
    if (current && current.active >= current.movies.length - 3) void loadMore();
    // Empty batches leave the cursor available to the Load more button instead of
    // automatically requesting hundreds of pages with no new recommendations.
  }, [session?.active, session?.movies.length, loadMore]);
  if (!session) return null;
  const move = (direction: number) => {
    const element = viewport.current;
    if (!element) return;
    const index = Math.round(element.scrollTop / element.clientHeight);
    const next = Math.max(0, Math.min(session.movies.length, index + direction));
    element.scrollTo({
      top: next * element.clientHeight,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };
  return (
    <main id="main-content" className="film-discovery--feed">
      <div className="feed-topbar">
        <button
          type="button"
          className="feed-home"
          onClick={onEdit}
          aria-label="Back to preferences"
        >
          <X size={20} />
        </button>
        <div>
          <strong>For you</strong>
          <span>{session.demo ? 'Sample collection' : 'Trailers picked for you.'}</span>
        </div>
        <button className="feed-preferences" onClick={onEdit}>
          <SlidersHorizontal size={16} />
          <span>Preferences</span>
        </button>
      </div>
      <div
        className="film-feed"
        ref={viewport}
        tabIndex={0}
        aria-label="Recommended films. Scroll or use up and down arrow keys."
        onKeyDown={(event) => {
          if (
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            (event.target as HTMLElement).closest('input,select,textarea')
          )
            return;
          if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp'].includes(event.key)) {
            event.preventDefault();
            move(['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1);
          }
        }}
      >
        {session.movies.map((movie, index) => (
          <article
            className="feed-film"
            data-index={index}
            key={movie.id}
            aria-label={`${index + 1}. ${movie.title}`}
            inert={index !== session.active || endVisible}
          >
            {(index === session.active || index === session.active + 1) && (
              <FeedTrailer
                movieId={movie.id}
                title={movie.title}
                active={index === session.active && !endVisible}
                prepare={!endVisible && warmedMovie === session.movies[session.active]?.id}
                onWarm={onWarm}
              />
            )}
            <div className="feed-copy">
              <div className="feed-meta">
                <span>{year(movie.release_date)}</span>
                <span>
                  {movie.genre_ids
                    .slice(0, 2)
                    .map((id) => GENRES[id])
                    .filter(Boolean)
                    .join(' / ')}
                </span>
                <span>
                  <Star size={14} />
                  {movie.vote_count ? movie.vote_average.toFixed(1) : 'New'}
                </span>
              </div>
              <h1>{movie.title}</h1>
              <div className="feed-actions">
                <MovieLink movieId={movie.id} className="button button-primary">
                  Film details
                  <ArrowRight size={18} />
                </MovieLink>
                <SaveButton movie={movie} />
              </div>
            </div>
          </article>
        ))}
        <section
          className="feed-end"
          data-index={session.movies.length}
          aria-label="More recommendations"
          inert={!endVisible}
        >
          <span className="eyebrow">One more film?</span>
          <h2>
            {loading
              ? 'Finding a few more…'
              : error
                ? 'A brief intermission.'
                : session.page < session.totalPages
                  ? 'Keep discovering.'
                  : 'That’s this selection.'}
          </h2>
          <p>
            {error ||
              (session.page < session.totalPages
                ? 'More films based on your preferences.'
                : 'Change your preferences for a different set of films.')}
          </p>
          {session.page < session.totalPages && (
            <button
              className="button button-primary"
              onClick={() => void loadMore()}
              disabled={loading}
            >
              {loading ? 'Loading…' : error ? 'Try again' : 'Load more films'}
              <ArrowDown size={18} />
            </button>
          )}
          <button className="button button-secondary" onClick={onEdit}>
            Change preferences
          </button>
        </section>
      </div>
      <div className="feed-bottom">
        <span aria-live="polite">
          {endVisible
            ? 'Your selection'
            : `${String(session.active + 1).padStart(2, '0')} / ${session.movies.length}`}
        </span>
        <span className="feed-scroll-hint">
          Scroll to discover <ArrowDown size={14} />
        </span>
        <div>
          <button
            className="feed-arrow"
            aria-label="Previous film"
            disabled={!session.active && !endVisible}
            onClick={() => move(-1)}
          >
            <ArrowUp size={20} />
          </button>
          <button
            className="feed-arrow"
            aria-label="Next film"
            disabled={endVisible}
            onClick={() => move(1)}
          >
            <ArrowDown size={20} />
          </button>
        </div>
      </div>
      {error && !endVisible && (
        <div className="feed-load-error" role="status">
          More films couldn’t load. <button onClick={() => void loadMore()}>Retry</button>
        </div>
      )}
    </main>
  );
};
