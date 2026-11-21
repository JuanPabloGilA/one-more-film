import { GENRES } from './genres';
import type { Movie } from './types';

// Filters for the home page catalogue. They only rearrange the page TMDB returned,
// so they live in the URL (`?genre=&sort=`) and never trigger a new request.

export const SORTS = ['trending', 'rating', 'newest'] as const;
export type Sort = (typeof SORTS)[number];
export const ALL_GENRES = 0;
export const QUICK_GENRES = [28, 18, 35, 878];

export type CatalogueFilters = { genre: number; sort: Sort };

/** Genres present on this page, alphabetically. */
export const availableGenres = (movies: Movie[]) =>
  [...new Set(movies.flatMap((movie) => movie.genre_ids))]
    .filter((id) => id in GENRES)
    .sort((a, b) => GENRES[a].localeCompare(GENRES[b]));

export const readCatalogueFilters = (
  params: URLSearchParams,
  genres: number[],
): CatalogueFilters => {
  const genre = Number(params.get('genre'));
  const sort = params.get('sort');
  return {
    genre: genres.includes(genre) ? genre : ALL_GENRES,
    sort: SORTS.find((option) => option === sort) ?? 'trending',
  };
};

const comparators: Record<Sort, ((a: Movie, b: Movie) => number) | null> = {
  trending: null, // keep TMDB's order (popularity or search relevance)
  rating: (a, b) => b.vote_average - a.vote_average,
  newest: (a, b) => b.release_date.localeCompare(a.release_date),
};

export const applyCatalogueFilters = (movies: Movie[], { genre, sort }: CatalogueFilters) => {
  const filtered = genre ? movies.filter((movie) => movie.genre_ids.includes(genre)) : [...movies];
  const compare = comparators[sort];
  return compare ? filtered.sort(compare) : filtered;
};
