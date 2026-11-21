import { HORROR_GENRE_ID, isKnownGenre } from './genres';
import { TMDB_MAX_PAGE } from './params';
import type { Movie } from './types';

export const ERAS = ['any', 'recent', 'classic'] as const;
export const LENGTHS = ['any', 'short', 'long'] as const;
export const MAX_GENRES = 3;
export const RECENT_YEARS = 5;
export const CLASSIC_BEFORE_YEAR = 2000;
export const SHORT_MAX_MINUTES = 100;
export const LONG_MIN_MINUTES = 120;
// Discovery is limited to English-language films; search and trending are not.
const DISCOVERY_LANGUAGE = 'en';
const MIN_VOTE_COUNT = 50;

export type Era = (typeof ERAS)[number];
export type Length = (typeof LENGTHS)[number];
export type DiscoveryPreferences = { genres: number[]; era: Era; length: Length };
export type DiscoverySession = {
  preferences: DiscoveryPreferences;
  movies: Movie[];
  page: number;
  totalPages: number;
  active: number;
  demo: boolean;
};

export const defaultPreferences: DiscoveryPreferences = { genres: [], era: 'any', length: 'any' };
export const INVALID_PREFERENCES_MESSAGE = 'Please choose valid preferences and try again.';

const isOneOf = <T extends string>(options: readonly T[], value: string): value is T =>
  (options as readonly string[]).includes(value);

/** Validates `/api/discover` query parameters; returns null when any value is out of range. */
export const readDiscoveryQuery = (query: URLSearchParams) => {
  const rawGenres = query.get('genres');
  const genres = rawGenres ? [...new Set(rawGenres.split(',').map(Number))] : [];
  const era = query.get('era') || 'any';
  const length = query.get('length') || 'any';
  const page = Number(query.get('page') || 1);
  const valid =
    genres.length <= MAX_GENRES &&
    genres.every((id) => Number.isInteger(id) && isKnownGenre(id)) &&
    isOneOf(ERAS, era) &&
    isOneOf(LENGTHS, length) &&
    Number.isInteger(page) &&
    page >= 1 &&
    page <= TMDB_MAX_PAGE;
  return valid ? { preferences: { genres, era, length } as DiscoveryPreferences, page } : null;
};

export const discoveryQuery = (preferences: DiscoveryPreferences, page = 1) =>
  new URLSearchParams({
    genres: preferences.genres.join(','),
    era: preferences.era,
    length: preferences.length,
    page: String(page),
  });

export const samePreferences = (a: DiscoveryPreferences, b: DiscoveryPreferences) =>
  discoveryQuery(a).toString() === discoveryQuery(b).toString();

// Mixed-genre films must not introduce horror into an explicitly different mood.
export const excludesHorror = (preferences: DiscoveryPreferences) =>
  preferences.genres.length > 0 && !preferences.genres.includes(HORROR_GENRE_ID);

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const CLASSIC_CUTOFF = `${CLASSIC_BEFORE_YEAR}-01-01`;
const LAST_CLASSIC_DAY = `${CLASSIC_BEFORE_YEAR - 1}-12-31`;

export const recentReleaseCutoff = (now: Date) => {
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - RECENT_YEARS);
  return isoDate(cutoff);
};

export const matchesRuntime = (runtime: number | null | undefined, length: Length) => {
  if (length === 'any') return true;
  if (!runtime) return false;
  return length === 'short' ? runtime <= SHORT_MAX_MINUTES : runtime >= LONG_MIN_MINUTES;
};

/**
 * Re-checks TMDB discover results locally: TMDB treats some filters loosely (for example
 * hybrid genres), and the demo catalogue has no server-side filtering at all.
 */
export const matchesDiscovery = (
  movie: Movie,
  preferences: DiscoveryPreferences,
  now = new Date(),
) => {
  const { genres, era } = preferences;
  const released = movie.release_date;
  if (movie.original_language !== DISCOVERY_LANGUAGE) return false;
  if (genres.length && !movie.genre_ids.some((id) => genres.includes(id))) return false;
  if (excludesHorror(preferences) && movie.genre_ids.includes(HORROR_GENRE_ID)) return false;
  if (!released || released > isoDate(now)) return false;
  if (era === 'classic' && released >= CLASSIC_CUTOFF) return false;
  if (era === 'recent' && released < recentReleaseCutoff(now)) return false;
  return true;
};

export const tmdbDiscoveryParams = (
  preferences: DiscoveryPreferences,
  page: number,
  now = new Date(),
): Record<string, string> => {
  const { genres, era, length } = preferences;
  return {
    page: String(page),
    include_adult: 'false',
    include_video: 'false',
    with_original_language: DISCOVERY_LANGUAGE,
    sort_by: 'popularity.desc',
    'vote_count.gte': String(MIN_VOTE_COUNT),
    'with_runtime.gte': length === 'long' ? String(LONG_MIN_MINUTES) : '1',
    'primary_release_date.lte': era === 'classic' ? LAST_CLASSIC_DAY : isoDate(now),
    ...(genres.length ? { with_genres: genres.join('|') } : {}),
    ...(excludesHorror(preferences) ? { without_genres: String(HORROR_GENRE_ID) } : {}),
    ...(era === 'recent' ? { 'primary_release_date.gte': recentReleaseCutoff(now) } : {}),
    ...(length === 'short' ? { 'with_runtime.lte': String(SHORT_MAX_MINUTES) } : {}),
  };
};
