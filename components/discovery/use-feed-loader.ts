'use client';
import { useEffect, useRef, useState } from 'react';
import { samePreferences } from '@/lib/discovery';
import { useDiscovery } from './discovery-provider';
import { requestFilms } from './request-films';

// Start loading the next batch while this many films are still ahead.
const PREFETCH_DISTANCE = 3;

/**
 * Appends the next batch of films to the discovery session. A batch that adds no films
 * leaves the cursor for the "Load more" button instead of requesting page after page.
 */
export const useFeedLoader = () => {
  const { session, setSession } = useDiscovery();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef<AbortController | null>(null);
  const hasMore = !!session && session.page < session.totalPages;

  useEffect(() => () => inFlight.current?.abort(), []);

  const loadMore = async () => {
    if (!session || !hasMore || inFlight.current) return;
    const request = new AbortController();
    inFlight.current = request;
    setLoading(true);
    setError('');
    try {
      const data = await requestFilms(
        session.preferences,
        session.page + 1,
        request.signal,
        new Set(session.movies.map((movie) => movie.id)),
      );
      setSession((previous) => {
        // The user may have changed preferences while this batch was loading.
        if (!previous || !samePreferences(previous.preferences, session.preferences))
          return previous;
        const seen = new Set(previous.movies.map((movie) => movie.id));
        return {
          ...previous,
          movies: [...previous.movies, ...data.results.filter((movie) => !seen.has(movie.id))],
          page: data.page,
          totalPages: data.total_pages,
        };
      });
    } catch (reason) {
      if (!request.signal.aborted)
        setError(reason instanceof Error ? reason.message : 'Could not load more films.');
    } finally {
      inFlight.current = null;
      if (!request.signal.aborted) setLoading(false);
    }
  };

  /** Called as each film comes into view; starts the next batch a few films early. */
  const loadMoreNear = (index: number) => {
    if (session && index >= session.movies.length - PREFETCH_DISTANCE) void loadMore();
  };

  return { loadMore, loadMoreNear, loading, error, hasMore };
};
