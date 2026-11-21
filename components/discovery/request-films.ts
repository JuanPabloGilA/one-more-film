import { discoveryQuery, type DiscoveryPreferences } from '@/lib/discovery';
import { fetchJson } from '@/lib/fetch-json';
import { TMDB_MAX_PAGE } from '@/lib/params';
import type { MovieList } from '@/lib/types';

// Discovery results are filtered after TMDB pages them, so a page can come back empty.
const MAX_ATTEMPTS = 3;

/**
 * Loads the next page with at least one unseen film, skipping sparse or duplicate-only pages
 * but making at most three requests per interaction. The returned `page` is TMDB's cursor,
 * so a manual retry continues from where this call stopped.
 */
export const requestFilms = async (
  preferences: DiscoveryPreferences,
  firstPage: number,
  signal: AbortSignal,
  seen = new Set<number>(),
  fetcher: typeof fetch = fetch,
): Promise<MovieList> => {
  let page = firstPage;
  for (let attempt = 1; ; attempt++) {
    signal.throwIfAborted();
    const data = await fetchJson<MovieList>(
      `/api/discover?${discoveryQuery(preferences, page)}`,
      'Could not load films. Please try again.',
      { signal },
      fetcher,
    );
    signal.throwIfAborted();
    const ids = new Set(seen);
    const results = data.results.filter((movie) => {
      if (ids.has(movie.id)) return false;
      ids.add(movie.id);
      return true;
    });
    const totalPages = Math.min(TMDB_MAX_PAGE, data.total_pages);
    if (results.length || page >= totalPages || attempt === MAX_ATTEMPTS)
      return { ...data, results, page, total_pages: totalPages };
    page++;
  }
};
