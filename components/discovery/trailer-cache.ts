import { fetchJson } from '@/lib/fetch-json';
import type { Trailer } from '@/lib/types';

// Trailers are looked up as the feed scrolls; keep recent answers (including "no trailer")
// so scrolling back does not refetch. Map keeps insertion order, so the first key is the oldest.
const MAX_ENTRIES = 100;
const cache = new Map<number, Trailer | null>();

export const hasCachedTrailer = (movieId: number) => cache.has(movieId);
export const cachedTrailer = (movieId: number) => cache.get(movieId);

export const fetchTrailer = async (movieId: number, signal: AbortSignal) => {
  const { trailer } = await fetchJson<{ trailer: Trailer | null }>(
    `/api/movie/${movieId}/trailer`,
    'Could not load the trailer.',
    { signal },
  );
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
  cache.set(movieId, trailer);
  return trailer;
};
