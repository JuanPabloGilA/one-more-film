import { discoveryQuery, type DiscoveryPreferences } from '@/lib/discovery';
import type { MovieList } from '@/lib/types';

export const requestFilms = async (
  preferences: DiscoveryPreferences,
  page: number,
  signal: AbortSignal,
  seen = new Set<number>(),
  fetcher: typeof fetch = fetch,
): Promise<MovieList> => {
  // Skip sparse or duplicate-only pages, but bound each interaction to three requests.
  // The returned page remains TMDB's cursor so a manual retry can continue from there.
  for (let attempt = 0; ; attempt++) {
    signal.throwIfAborted();
    const response = await fetcher(`/api/discover?${discoveryQuery(preferences, page)}`, {
      signal,
    });
    const data = await response.json();
    signal.throwIfAborted();
    if (!response.ok) throw new Error(data.error || 'Could not load films. Please try again.');
    const result: MovieList = data;
    const ids = new Set(seen);
    const results = result.results.filter((movie) => {
      if (ids.has(movie.id)) return false;
      ids.add(movie.id);
      return true;
    });
    const total_pages = Math.min(500, result.total_pages);
    if (results.length || page >= total_pages || attempt === 2)
      return { ...result, results, page, total_pages };
    page++;
  }
};
