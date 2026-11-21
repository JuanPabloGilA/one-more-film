import { cache } from 'react';
import { demoDetail, demoMovies, demoPage } from './demo';
import { matchesDiscovery, matchesRuntime, tmdbDiscoveryParams } from './discovery';
import type { DiscoveryPreferences } from './discovery';
import { toMovie } from './movie';
import { isValidId, normalizeQuery } from './params';
import { selectTrailer } from './trailer';
import type { Movie, MovieDetails, MovieList, PersonDetails, Trailer, Video } from './types';

// Server-only TMDB client. Every loader answers from the sample catalogue in demo mode.

const TMDB_API = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT_MS = 8000;
const REVALIDATE_SECONDS = 300;

export class TmdbError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

const notFound = (what: 'movie' | 'person') =>
  new TmdbError(`This ${what} could not be found.`, 404);

export const isDemoMode = () =>
  !process.env.TMDB_READ_ACCESS_TOKEN && process.env.TMDB_DEMO_MODE === 'true';

export const tmdbRequest = async <T>(
  path: string,
  params: Record<string, string> = {},
  fetcher: typeof fetch = fetch,
): Promise<T> => {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token)
    throw new TmdbError(
      'Movie data is not connected yet. Please configure the TMDB access token.',
      503,
    );
  const url = new URL(`${TMDB_API}/${path}`);
  url.search = new URLSearchParams({ language: 'en-US', ...params }).toString();
  let response: Response;
  try {
    response = await fetcher(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    throw new TmdbError('The movie service is taking too long to respond. Please try again.');
  }
  // Upstream bodies are never forwarded: they can contain diagnostics meant for TMDB clients.
  if (response.status === 404) throw notFound('movie');
  if (response.status === 429)
    throw new TmdbError('The movie service is busy. Please try again in a moment.', 429);
  if (!response.ok) throw new TmdbError('We could not load movie data. Please try again shortly.');
  return response.json() as Promise<T>;
};

/** Search results when there is a query, otherwise today's or this week's trending films. */
export const getMovies = async (
  options: { query?: string; period?: 'day' | 'week'; page?: number } = {},
): Promise<MovieList> => {
  const query = normalizeQuery(options.query);
  const page = options.page ?? 1;
  if (isDemoMode()) {
    const needle = query.toLowerCase();
    const matches = demoMovies.filter((movie) => movie.title.toLowerCase().includes(needle));
    return demoPage(matches, page);
  }
  const path = query ? 'search/movie' : `trending/movie/${options.period ?? 'day'}`;
  const data = await tmdbRequest<MovieList>(path, {
    page: String(page),
    ...(query ? { query, include_adult: 'false' } : {}),
  });
  return { ...data, results: data.results.map(toMovie), demo: false };
};

export const discoverMovies = async (
  preferences: DiscoveryPreferences,
  page: number,
  now = new Date(),
): Promise<MovieList> => {
  const matches = (movie: Movie) => matchesDiscovery(movie, preferences, now);
  if (isDemoMode()) {
    const results = demoMovies.filter(
      (movie) =>
        matches(movie) && matchesRuntime(demoDetail(movie.id)?.runtime, preferences.length),
    );
    return demoPage(results, page);
  }
  const data = await tmdbRequest<MovieList>(
    'discover/movie',
    tmdbDiscoveryParams(preferences, page, now),
  );
  return { ...data, results: data.results.filter(matches).map(toMovie), demo: false };
};

// cache() shares one lookup between generateMetadata and the page during a request.
export const getMovie = cache(async (id: number): Promise<MovieDetails> => {
  if (!isValidId(id)) throw notFound('movie');
  if (isDemoMode()) {
    const movie = demoDetail(id);
    if (!movie) throw notFound('movie');
    return movie;
  }
  const data = await tmdbRequest<MovieDetails>(`movie/${id}`, {
    append_to_response: 'credits,videos,recommendations,keywords',
  });
  return {
    ...data,
    genre_ids: data.genres.map((genre) => genre.id),
    recommendations: { results: data.recommendations.results.map(toMovie) },
    demo: false,
  };
});

export const getPerson = cache(async (id: number): Promise<PersonDetails> => {
  // The sample catalogue has no people.
  if (!isValidId(id) || isDemoMode()) throw notFound('person');
  return tmdbRequest<PersonDetails>(`person/${id}`, { append_to_response: 'movie_credits' });
});

export const getTrailer = async (id: number): Promise<Trailer | null> => {
  if (!isValidId(id)) throw notFound('movie');
  const videos = isDemoMode()
    ? (demoDetail(id)?.videos.results ?? [])
    : (await tmdbRequest<{ results: Video[] }>(`movie/${id}/videos`)).results;
  const trailer = selectTrailer(videos);
  return trailer && { key: trailer.key, name: trailer.name };
};
