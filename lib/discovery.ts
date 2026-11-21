import { GENRES, type Movie } from './types';

export type DiscoveryPreferences = {
  genres: number[];
  era: 'any' | 'recent' | 'classic';
  length: 'any' | 'short' | 'long';
};
export type DiscoverySession = {
  preferences: DiscoveryPreferences;
  movies: Movie[];
  page: number;
  totalPages: number;
  active: number;
  demo: boolean;
};
export const defaultPreferences: DiscoveryPreferences = { genres: [], era: 'any', length: 'any' };
export const readDiscoveryQuery = (query: URLSearchParams) => {
  const rawGenres = query.get('genres') || '';
  const genres = rawGenres ? [...new Set(rawGenres.split(',').map(Number))] : [];
  const era = query.get('era') || 'any';
  const length = query.get('length') || 'any';
  const page = Number(query.get('page') || 1);
  if (
    genres.length > 3 ||
    genres.some((id) => !Number.isInteger(id) || !GENRES[id]) ||
    !['any', 'recent', 'classic'].includes(era) ||
    !['any', 'short', 'long'].includes(length) ||
    !Number.isInteger(page) ||
    page < 1 ||
    page > 500
  ) {
    throw new Error('Please choose valid preferences and try again.');
  }
  return { preferences: { genres, era, length } as DiscoveryPreferences, page };
};
export const discoveryQuery = (preferences: DiscoveryPreferences, page = 1) =>
  new URLSearchParams({
    genres: preferences.genres.join(','),
    era: preferences.era,
    length: preferences.length,
    page: String(page),
  });

// Mixed-genre films must not introduce horror into an explicitly different mood.
export const excludesHorror = (preferences: DiscoveryPreferences) =>
  preferences.genres.length > 0 && !preferences.genres.includes(27);

export const recentReleaseCutoff = (now: Date) => {
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 5);
  return cutoff.toISOString().slice(0, 10);
};

export const matchesDiscovery = (
  movie: Movie,
  preferences: DiscoveryPreferences,
  now = new Date(),
) => {
  if (movie.original_language !== 'en') return false;
  if (preferences.genres.length && !movie.genre_ids.some((id) => preferences.genres.includes(id)))
    return false;
  if (excludesHorror(preferences) && movie.genre_ids.includes(27)) return false;
  if (!movie.release_date || movie.release_date > now.toISOString().slice(0, 10)) return false;
  if (preferences.era === 'classic' && movie.release_date >= '2000-01-01') return false;
  if (preferences.era === 'recent' && movie.release_date < recentReleaseCutoff(now)) return false;
  return true;
};

export const tmdbDiscoveryParams = (
  preferences: DiscoveryPreferences,
  page: number,
  now = new Date(),
) => ({
  page: String(page),
  include_adult: 'false',
  include_video: 'false',
  with_original_language: 'en',
  sort_by: 'popularity.desc',
  'vote_count.gte': '50',
  'with_runtime.gte': preferences.length === 'long' ? '120' : '1',
  'primary_release_date.lte':
    preferences.era === 'classic' ? '1999-12-31' : now.toISOString().slice(0, 10),
  ...(preferences.genres.length ? { with_genres: preferences.genres.join('|') } : {}),
  ...(excludesHorror(preferences) ? { without_genres: '27' } : {}),
  ...(preferences.era === 'recent' ? { 'primary_release_date.gte': recentReleaseCutoff(now) } : {}),
  ...(preferences.length === 'short' ? { 'with_runtime.lte': '100' } : {}),
});
