import type { Movie } from './types';

export const WATCHLIST_KEY = 'reel:watchlist:v1';
export const WATCHLIST_LIMIT = 500;

const isMovieLike = (item: unknown): item is Record<string, unknown> & Movie => {
  if (!item || typeof item !== 'object') return false;
  const value = item as Record<string, unknown>;
  return (
    Number.isSafeInteger(value.id) &&
    (value.id as number) > 0 &&
    typeof value.title === 'string' &&
    typeof value.release_date === 'string' &&
    typeof value.vote_average === 'number' &&
    Number.isFinite(value.vote_average) &&
    (typeof value.poster_path === 'string' || value.poster_path === null) &&
    Array.isArray(value.genre_ids)
  );
};

/**
 * Reads the stored watchlist defensively: storage can hold old, damaged or hand-edited data.
 * Invalid entries are dropped, duplicates removed and optional fields given safe defaults.
 */
export const parseWatchlist = (raw: string | null): Movie[] => {
  let data: unknown;
  try {
    data = JSON.parse(raw ?? '[]');
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const movies = new Map<number, Movie>();
  for (const item of data) {
    if (movies.size === WATCHLIST_LIMIT) break;
    if (!isMovieLike(item)) continue;
    movies.set(item.id, {
      id: item.id,
      title: item.title,
      original_language:
        typeof item.original_language === 'string' ? item.original_language : undefined,
      release_date: item.release_date,
      vote_average: Math.max(0, Math.min(10, item.vote_average)),
      vote_count:
        Number.isSafeInteger(item.vote_count) && item.vote_count >= 0 ? item.vote_count : 0,
      overview: typeof item.overview === 'string' ? item.overview : '',
      poster_path: item.poster_path,
      backdrop_path: typeof item.backdrop_path === 'string' ? item.backdrop_path : null,
      genre_ids: item.genre_ids.filter((id: unknown) => Number.isSafeInteger(id) && Number(id) > 0),
    });
  }
  return [...movies.values()];
};
