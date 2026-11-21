import type { Movie } from './types';
export const WATCHLIST_KEY = 'reel:watchlist:v1';
export const parseWatchlist = (raw: string | null): Movie[] => {
  try {
    const data: unknown = JSON.parse(raw ?? '[]');
    if (!Array.isArray(data)) return [];
    const unique = new Map<number, Movie>();
    for (const item of data) {
      if (
        item &&
        Number.isSafeInteger(item.id) &&
        item.id > 0 &&
        typeof item.title === 'string' &&
        typeof item.release_date === 'string' &&
        typeof item.vote_average === 'number' &&
        Number.isFinite(item.vote_average) &&
        (typeof item.poster_path === 'string' || item.poster_path === null) &&
        Array.isArray(item.genre_ids)
      ) {
        unique.set(item.id, {
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
          genre_ids: item.genre_ids.filter(
            (id: unknown) => Number.isSafeInteger(id) && Number(id) > 0,
          ),
        });
        if (unique.size === 500) break;
      }
    }
    return [...unique.values()];
  } catch {
    return [];
  }
};
